import crypto from 'node:crypto';
import fs from 'node:fs';
import zlib from 'node:zlib';
import { ApkMetadata } from '@/types/agent';
import type { ApkValidationResult } from './apkValidator';

/**
 * Validates and unpacks an APK of ANY size (tested to multiple GB) without loading it into memory.
 *
 * An APK is a ZIP archive whose table of contents (the central directory) sits at the end of the file.
 * The analysers only need AndroidManifest.xml and classes*.dex, so we:
 *   1. read the last few KB to find the end-of-central-directory record (ZIP64 aware, needed above 4 GB),
 *   2. read the central directory to list every entry,
 *   3. read and inflate only the manifest and the dex entry, using byte ranges,
 *   4. stream the whole file once through SHA-256 / SHA-1 / MD5 in small chunks.
 * Memory stays roughly the size of the manifest + dex, whatever the APK's total size.
 */

export interface ByteSource {
  size: number;
  /** Bytes [start, end) */
  read(start: number, end: number): Promise<Buffer>;
  /** The whole file as a stream of chunks, for hashing. */
  stream(): AsyncIterable<Uint8Array>;
}

/** Largest single entry we will inflate in memory (a dex file is typically 5 to 60 MB). */
const MAX_ENTRY_BYTES = 512 * 1024 * 1024;

/* ------------------------------------------------------------------ */
/* Sources                                                             */
/* ------------------------------------------------------------------ */

export function fileSource(filePath: string): ByteSource {
  const size = fs.statSync(filePath).size;
  return {
    size,
    async read(start, end) {
      const len = Math.max(0, Math.min(end, size) - start);
      const buf = Buffer.alloc(len);
      const fd = await fs.promises.open(filePath, 'r');
      try {
        let off = 0;
        while (off < len) {
          const { bytesRead } = await fd.read(buf, off, len - off, start + off);
          if (bytesRead === 0) break;
          off += bytesRead;
        }
      } finally {
        await fd.close();
      }
      return buf;
    },
    stream() {
      return fs.createReadStream(filePath, { highWaterMark: 4 * 1024 * 1024 });
    }
  };
}

/**
 * A remote file that supports HTTP Range requests (Vercel Blob does).
 * `headers` carries read authorisation for private Blob stores.
 */
export async function httpSource(url: string, headers: Record<string, string> = {}): Promise<ByteSource> {
  const head = await fetch(url, { method: 'HEAD', headers, cache: 'no-store' });
  if (!head.ok) throw new Error(`Uploaded APK could not be reached (${head.status}).`);
  const size = Number(head.headers.get('content-length') || 0);
  if (!size) throw new Error('Uploaded APK reported no size.');

  return {
    size,
    async read(start, end) {
      const last = Math.min(end, size) - 1;
      if (last < start) return Buffer.alloc(0);
      const res = await fetch(url, { headers: { ...headers, Range: `bytes=${start}-${last}` }, cache: 'no-store' });
      if (res.status !== 206 && res.status !== 200) {
        throw new Error(`Range read failed (${res.status}).`);
      }
      const buf = Buffer.from(await res.arrayBuffer());
      // A server that ignores Range returns the whole file: slice it ourselves.
      return res.status === 200 ? buf.subarray(start, last + 1) : buf;
    },
    async *stream() {
      const res = await fetch(url, { headers, cache: 'no-store' });
      if (!res.ok || !res.body) throw new Error(`Uploaded APK could not be streamed (${res.status}).`);
      const reader = res.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) yield value;
      }
    }
  };
}

/* ------------------------------------------------------------------ */
/* ZIP central directory                                               */
/* ------------------------------------------------------------------ */

interface CentralEntry {
  name: string;
  method: number;
  compressedSize: number;
  uncompressedSize: number;
  localHeaderOffset: number;
}

const SIG_EOCD = 0x06054b50;
const SIG_ZIP64_LOCATOR = 0x07064b50;
const SIG_ZIP64_EOCD = 0x06064b50;
const SIG_CENTRAL = 0x02014b50;
const SIG_LOCAL = 0x04034b50;

const u64 = (b: Buffer, o: number) => Number(b.readBigUInt64LE(o));

async function readCentralDirectory(src: ByteSource): Promise<CentralEntry[]> {
  // The EOCD record is 22 bytes plus a comment of up to 65535 bytes, at the very end.
  const tailLen = Math.min(src.size, 22 + 65535 + 20);
  const tailStart = src.size - tailLen;
  const tail = await src.read(tailStart, src.size);

  let eocd = -1;
  for (let i = tail.length - 22; i >= 0; i--) {
    if (tail.readUInt32LE(i) === SIG_EOCD) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('ZIP end-of-central-directory record not found.');

  let totalEntries = tail.readUInt16LE(eocd + 10);
  let cdSize = tail.readUInt32LE(eocd + 12);
  let cdOffset = tail.readUInt32LE(eocd + 16);

  // ZIP64: archives over 4 GB (or over 65535 entries) keep the real values in a ZIP64 record.
  const locAt = eocd - 20;
  if (locAt >= 0 && tail.readUInt32LE(locAt) === SIG_ZIP64_LOCATOR) {
    const z64Offset = u64(tail, locAt + 8);
    const z64 = await src.read(z64Offset, z64Offset + 56);
    if (z64.readUInt32LE(0) !== SIG_ZIP64_EOCD) throw new Error('Corrupt ZIP64 end-of-central-directory record.');
    totalEntries = u64(z64, 32);
    cdSize = u64(z64, 40);
    cdOffset = u64(z64, 48);
  }

  if (cdOffset + cdSize > src.size) throw new Error('ZIP central directory points outside the file.');
  const cd = await src.read(cdOffset, cdOffset + cdSize);

  const entries: CentralEntry[] = [];
  let p = 0;
  for (let n = 0; n < totalEntries && p + 46 <= cd.length; n++) {
    if (cd.readUInt32LE(p) !== SIG_CENTRAL) throw new Error('Corrupt ZIP central directory entry.');
    const method = cd.readUInt16LE(p + 10);
    let compressedSize = cd.readUInt32LE(p + 20);
    let uncompressedSize = cd.readUInt32LE(p + 24);
    const nameLen = cd.readUInt16LE(p + 28);
    const extraLen = cd.readUInt16LE(p + 30);
    const commentLen = cd.readUInt16LE(p + 32);
    let localHeaderOffset = cd.readUInt32LE(p + 42);
    const name = cd.toString('utf8', p + 46, p + 46 + nameLen);

    // ZIP64 extended information extra field (id 0x0001) holds the real 64-bit values.
    let e = p + 46 + nameLen;
    const extraEnd = e + extraLen;
    while (e + 4 <= extraEnd) {
      const id = cd.readUInt16LE(e);
      const size = cd.readUInt16LE(e + 2);
      if (id === 0x0001) {
        let q = e + 4;
        if (uncompressedSize === 0xffffffff) { uncompressedSize = u64(cd, q); q += 8; }
        if (compressedSize === 0xffffffff) { compressedSize = u64(cd, q); q += 8; }
        if (localHeaderOffset === 0xffffffff) { localHeaderOffset = u64(cd, q); q += 8; }
      }
      e += 4 + size;
    }

    entries.push({ name, method, compressedSize, uncompressedSize, localHeaderOffset });
    p = extraEnd + commentLen;
  }
  return entries;
}

async function readEntry(src: ByteSource, entry: CentralEntry): Promise<Buffer> {
  if (entry.uncompressedSize > MAX_ENTRY_BYTES) {
    throw new Error(`${entry.name} is ${(entry.uncompressedSize / 1048576).toFixed(0)} MB, above the ${MAX_ENTRY_BYTES / 1048576} MB per-entry analysis limit.`);
  }
  const header = await src.read(entry.localHeaderOffset, entry.localHeaderOffset + 30);
  if (header.readUInt32LE(0) !== SIG_LOCAL) throw new Error(`Corrupt local header for ${entry.name}.`);
  const dataStart = entry.localHeaderOffset + 30 + header.readUInt16LE(26) + header.readUInt16LE(28);
  const raw = await src.read(dataStart, dataStart + entry.compressedSize);
  if (entry.method === 0) return raw;
  if (entry.method === 8) return zlib.inflateRawSync(raw, { maxOutputLength: MAX_ENTRY_BYTES });
  throw new Error(`Unsupported compression method ${entry.method} for ${entry.name}.`);
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

async function hashSource(src: ByteSource) {
  const sha256 = crypto.createHash('sha256');
  const sha1 = crypto.createHash('sha1');
  const md5 = crypto.createHash('md5');
  for await (const chunk of src.stream()) {
    sha256.update(chunk);
    sha1.update(chunk);
    md5.update(chunk);
  }
  return { sha256: sha256.digest('hex'), sha1: sha1.digest('hex'), md5: md5.digest('hex') };
}

export function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

/**
 * Same result shape as validateApkBuffer, so the agent and every analyser run unchanged.
 */
export async function validateApkSource(
  src: ByteSource,
  fileName: string,
  maxSizeBytes: number
): Promise<ApkValidationResult> {
  if (!src.size) {
    return { isValid: false, errorCode: 'EMPTY_FILE', errorMessage: 'Uploaded file is empty (0 bytes).' };
  }
  if (src.size > maxSizeBytes) {
    return {
      isValid: false,
      errorCode: 'FILE_TOO_LARGE',
      errorMessage: `File size (${formatSize(src.size)}) exceeds authorized limit of ${formatSize(maxSizeBytes)}.`
    };
  }

  const magic = await src.read(0, 4);
  if (magic.length < 4 || magic.readUInt32LE(0) !== SIG_LOCAL) {
    return {
      isValid: false,
      errorCode: 'INVALID_FORMAT',
      errorMessage: 'Invalid APK format: file does not contain standard ZIP archive header (PK\\x03\\x04).'
    };
  }

  // Hash the full file in parallel with reading the directory and the two entries we need.
  const hashing = hashSource(src);

  let entries: CentralEntry[];
  try {
    entries = await readCentralDirectory(src);
  } catch (err: any) {
    await hashing.catch(() => {});
    return { isValid: false, errorCode: 'CORRUPT_ARCHIVE', errorMessage: `Corrupt APK archive: ${err?.message || 'unreadable ZIP directory'}` };
  }
  if (!entries.length) {
    await hashing.catch(() => {});
    return { isValid: false, errorCode: 'CORRUPT_ARCHIVE', errorMessage: 'APK archive contains no directory entries.' };
  }

  const manifestEntry = entries.find((e) => e.name.toLowerCase() === 'androidmanifest.xml');
  if (!manifestEntry) {
    await hashing.catch(() => {});
    return { isValid: false, errorCode: 'MISSING_MANIFEST', errorMessage: 'Invalid Android package: missing required AndroidManifest.xml entry.' };
  }

  let manifestBuffer: Buffer;
  let dexBuffer: Buffer | undefined;
  const dexEntry = entries.find((e) => e.name === 'classes.dex') || entries.find((e) => e.name.endsWith('.dex'));
  try {
    manifestBuffer = await readEntry(src, manifestEntry);
    if (dexEntry) dexBuffer = await readEntry(src, dexEntry);
  } catch (err: any) {
    await hashing.catch(() => {});
    return { isValid: false, errorCode: 'CORRUPT_ARCHIVE', errorMessage: `Corrupt APK archive: ${err?.message || 'entry could not be read'}` };
  }
  if (!manifestBuffer.length) {
    await hashing.catch(() => {});
    return { isValid: false, errorCode: 'MISSING_MANIFEST', errorMessage: 'AndroidManifest.xml entry is empty.' };
  }

  const { sha256, sha1, md5 } = await hashing;

  const metadata: ApkMetadata = {
    fileName,
    fileSizeBytes: src.size,
    fileSizeFormatted: formatSize(src.size),
    sha256,
    sha1,
    md5,
    totalZipEntries: entries.length,
    hasManifest: true,
    hasDex: !!dexEntry,
    uploadedAt: new Date().toISOString()
  };

  return { isValid: true, metadata, manifestBuffer, dexBuffer };
}
