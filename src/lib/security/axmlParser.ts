/**
 * VulnScope Binary AndroidManifest.xml (AXML) Parser
 * Decodes Android compiled binary XML format into a structured DOM/JSON tree.
 */

export interface ParsedXmlAttribute {
  name: string;
  value: string;
  rawValue?: string;
  type: string;
  data: number;
}

export interface ParsedXmlElement {
  tag: string;
  attributes: Record<string, string>;
  attributeList: ParsedXmlAttribute[];
  children: ParsedXmlElement[];
  lineNumber?: number;
}

const CHUNK_AXML_HEADER = 0x00080003;
const CHUNK_STRING_POOL = 0x0001;
const CHUNK_RESOURCE_MAP = 0x0180;
const CHUNK_START_NAMESPACE = 0x0100;
const CHUNK_END_NAMESPACE = 0x0101;
const CHUNK_START_ELEMENT = 0x0102;
const CHUNK_END_ELEMENT = 0x0103;
const CHUNK_CDATA = 0x0104;

export class AxmlParser {
  private buffer: Buffer;
  private offset: number = 0;
  private stringPool: string[] = [];

  constructor(buffer: Buffer) {
    this.buffer = buffer;
  }

  public parse(): ParsedXmlElement {
    // Check if it's plaintext XML first
    const firstChars = this.buffer.subarray(0, 100).toString('utf8').trim();
    if (firstChars.startsWith('<?xml') || firstChars.startsWith('<manifest')) {
      return this.parsePlaintextXml(this.buffer.toString('utf8'));
    }

    // Binary XML format
    if (this.buffer.length < 8) {
      throw new Error('Invalid AXML file: buffer too small');
    }

    const magic = this.buffer.readUInt32LE(0);
    if (magic !== CHUNK_AXML_HEADER && (magic & 0xffff) !== 0x0003) {
      // Some tools produce AXML with slightly varied header chunks
      if (!firstChars.includes('manifest')) {
        throw new Error(`Invalid AXML magic bytes: 0x${magic.toString(16)}`);
      }
    }

    this.offset = 8;
    const rootNodes: ParsedXmlElement[] = [];
    const elementStack: ParsedXmlElement[] = [];

    while (this.offset < this.buffer.length) {
      if (this.offset + 8 > this.buffer.length) break;

      const chunkType = this.buffer.readUInt16LE(this.offset);
      const headerSize = this.buffer.readUInt16LE(this.offset + 2);
      const chunkSize = this.buffer.readUInt32LE(this.offset + 4);

      if (chunkSize <= 0 || this.offset + chunkSize > this.buffer.length + 8) {
        break;
      }

      const chunkStart = this.offset;

      if (chunkType === CHUNK_STRING_POOL) {
        this.parseStringPool(chunkStart, chunkSize);
      } else if (chunkType === CHUNK_RESOURCE_MAP) {
        // Resource map is optional, step through
      } else if (chunkType === CHUNK_START_ELEMENT) {
        const elem = this.parseStartElement(chunkStart);
        if (elementStack.length > 0) {
          elementStack[elementStack.length - 1].children.push(elem);
        } else {
          rootNodes.push(elem);
        }
        elementStack.push(elem);
      } else if (chunkType === CHUNK_END_ELEMENT) {
        if (elementStack.length > 0) {
          elementStack.pop();
        }
      }

      this.offset = chunkStart + chunkSize;
    }

    if (rootNodes.length === 0) {
      throw new Error('AXML parser found no root element in AndroidManifest.xml');
    }

    return rootNodes[0];
  }

  private parseStringPool(chunkStart: number, chunkSize: number) {
    const stringCount = this.buffer.readUInt32LE(chunkStart + 8);
    const flags = this.buffer.readUInt32LE(chunkStart + 16);
    const stringsStart = chunkStart + this.buffer.readUInt32LE(chunkStart + 20);
    const isUtf8 = (flags & 0x00000100) !== 0;

    const offsets: number[] = [];
    for (let i = 0; i < stringCount; i++) {
      const off = this.buffer.readUInt32LE(chunkStart + 28 + i * 4);
      offsets.push(off);
    }

    this.stringPool = [];
    for (let i = 0; i < stringCount; i++) {
      const strOffset = stringsStart + offsets[i];
      if (strOffset >= this.buffer.length) {
        this.stringPool.push('');
        continue;
      }

      if (isUtf8) {
        let p = strOffset;
        // Skip UTF-8 length bytes
        if ((this.buffer[p] & 0x80) !== 0) p += 2;
        else p += 1;
        let byteCount = this.buffer[p];
        if ((byteCount & 0x80) !== 0) {
          byteCount = ((byteCount & 0x7f) << 8) | this.buffer[p + 1];
          p += 2;
        } else {
          p += 1;
        }
        const strBytes = this.buffer.subarray(p, p + byteCount);
        this.stringPool.push(strBytes.toString('utf8'));
      } else {
        // UTF-16LE
        let p = strOffset;
        let charCount = this.buffer.readUInt16LE(p);
        p += 2;
        if ((charCount & 0x8000) !== 0) {
          charCount = ((charCount & 0x7fff) << 16) | this.buffer.readUInt16LE(p);
          p += 2;
        }
        const byteLen = charCount * 2;
        const strBytes = this.buffer.subarray(p, p + byteLen);
        this.stringPool.push(strBytes.toString('utf16le'));
      }
    }
  }

  private parseStartElement(chunkStart: number): ParsedXmlElement {
    const lineNumber = this.buffer.readUInt32LE(chunkStart + 8);
    const nameIndex = this.buffer.readUInt32LE(chunkStart + 20);
    const attrStart = this.buffer.readUInt16LE(chunkStart + 24);
    const attrSize = this.buffer.readUInt16LE(chunkStart + 26);
    const attrCount = this.buffer.readUInt16LE(chunkStart + 28);

    const tagName = this.getString(nameIndex) || 'unknown';
    const attributes: Record<string, string> = {};
    const attributeList: ParsedXmlAttribute[] = [];

    const attrOffsetBase = chunkStart + attrStart;

    for (let i = 0; i < attrCount; i++) {
      const attrOffset = attrOffsetBase + i * attrSize;
      if (attrOffset + 20 > this.buffer.length) break;

      const attrNameIdx = this.buffer.readUInt32LE(attrOffset + 4);
      const attrRawValueIdx = this.buffer.readInt32LE(attrOffset + 8);
      const attrType = this.buffer.readUInt32LE(attrOffset + 12) >> 24;
      const attrData = this.buffer.readUInt32LE(attrOffset + 16);

      const attrName = this.getString(attrNameIdx) || `attr_${i}`;
      let value = '';

      // Type resolution:
      // 0x03 = string, 0x12 = boolean, 0x10 = int_dec, 0x11 = int_hex, 0x01 = reference
      if (attrType === 0x03) {
        value = this.getString(attrRawValueIdx) || '';
      } else if (attrType === 0x12) {
        value = attrData !== 0 ? 'true' : 'false';
      } else if (attrType === 0x10 || attrType === 0x11) {
        value = attrData.toString();
      } else if (attrType === 0x01) {
        value = `@0x${attrData.toString(16)}`;
      } else if (attrRawValueIdx >= 0) {
        value = this.getString(attrRawValueIdx) || attrData.toString();
      } else {
        value = attrData.toString();
      }

      attributes[attrName] = value;
      attributeList.push({
        name: attrName,
        value,
        rawValue: attrRawValueIdx >= 0 ? this.getString(attrRawValueIdx) : undefined,
        type: `0x${attrType.toString(16)}`,
        data: attrData
      });
    }

    return {
      tag: tagName,
      attributes,
      attributeList,
      children: [],
      lineNumber
    };
  }

  private getString(index: number): string {
    if (index >= 0 && index < this.stringPool.length) {
      return this.stringPool[index];
    }
    return '';
  }

  private parsePlaintextXml(xmlStr: string): ParsedXmlElement {
    // Basic regex-based XML tree extractor for plaintext fallback
    const manifestMatch = xmlStr.match(/<manifest\b([^>]*)>/i);
    const attributes: Record<string, string> = {};
    if (manifestMatch) {
      const attrRegex = /([a-zA-Z0-9_:-]+)\s*=\s*["']([^"']*)["']/g;
      let m;
      while ((m = attrRegex.exec(manifestMatch[1])) !== null) {
        const key = m[1].replace('android:', '');
        attributes[key] = m[2];
        attributes[m[1]] = m[2];
      }
    }

    const root: ParsedXmlElement = {
      tag: 'manifest',
      attributes,
      attributeList: Object.entries(attributes).map(([name, value]) => ({
        name,
        value,
        type: '0x03',
        data: 0
      })),
      children: [],
      lineNumber: 1
    };

    // Extract tags like uses-permission, application, activity, service, receiver, provider
    const tagRegex = /<([a-zA-Z0-9_:-]+)\b([^>]*?)(\/?>)/g;
    let match;
    while ((match = tagRegex.exec(xmlStr)) !== null) {
      const tag = match[1];
      if (tag === 'manifest' || tag.startsWith('?')) continue;
      const tagAttrs: Record<string, string> = {};
      const attrRegex = /([a-zA-Z0-9_:-]+)\s*=\s*["']([^"']*)["']/g;
      let am;
      while ((am = attrRegex.exec(match[2])) !== null) {
        const key = am[1].replace('android:', '');
        tagAttrs[key] = am[2];
        tagAttrs[am[1]] = am[2];
      }
      root.children.push({
        tag,
        attributes: tagAttrs,
        attributeList: Object.entries(tagAttrs).map(([name, value]) => ({
          name,
          value,
          type: '0x03',
          data: 0
        })),
        children: []
      });
    }

    return root;
  }
}
