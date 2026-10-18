import crypto from 'node:crypto';
import AdmZip from 'adm-zip';
import { ApkMetadata } from '@/types/agent';

export interface ValidationSuccess {
  isValid: true;
  metadata: ApkMetadata;
  zip: AdmZip;
  manifestBuffer: Buffer;
  dexBuffer?: Buffer;
}

export interface ValidationFailure {
  isValid: false;
  errorCode: 'CORRUPT_ARCHIVE' | 'MISSING_MANIFEST' | 'FILE_TOO_LARGE' | 'EMPTY_FILE' | 'INVALID_FORMAT';
  errorMessage: string;
}

export type ApkValidationResult = ValidationSuccess | ValidationFailure;

const DEFAULT_MAX_SIZE = 100 * 1024 * 1024; // 100 MB

export function validateApkBuffer(
  buffer: Buffer,
  fileName: string = 'target.apk',
  maxSizeBytes: number = DEFAULT_MAX_SIZE
): ApkValidationResult {
  if (!buffer || buffer.length === 0) {
    return {
      isValid: false,
      errorCode: 'EMPTY_FILE',
      errorMessage: 'Uploaded file is empty (0 bytes).'
    };
  }

  if (buffer.length > maxSizeBytes) {
    return {
      isValid: false,
      errorCode: 'FILE_TOO_LARGE',
      errorMessage: `File size (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds authorized limit of ${(maxSizeBytes / (1024 * 1024)).toFixed(0)} MB.`
    };
  }

  // Check PKZIP magic bytes (0x50, 0x4B, 0x03, 0x04)
  if (
    buffer.length < 4 ||
    buffer[0] !== 0x50 ||
    buffer[1] !== 0x4b ||
    buffer[2] !== 0x03 ||
    buffer[3] !== 0x04
  ) {
    return {
      isValid: false,
      errorCode: 'INVALID_FORMAT',
      errorMessage: 'Invalid APK format: file does not contain standard ZIP archive header (PK\\x03\\x04).'
    };
  }

  // Calculate cryptographic digests
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
  const sha1 = crypto.createHash('sha1').update(buffer).digest('hex');
  const md5 = crypto.createHash('md5').update(buffer).digest('hex');

  let zip: AdmZip;
  try {
    zip = new AdmZip(buffer);
  } catch (err: any) {
    return {
      isValid: false,
      errorCode: 'CORRUPT_ARCHIVE',
      errorMessage: `Corrupt APK archive: could not decompress ZIP directory. ${err?.message || ''}`
    };
  }

  const entries = zip.getEntries();
  if (!entries || entries.length === 0) {
    return {
      isValid: false,
      errorCode: 'CORRUPT_ARCHIVE',
      errorMessage: 'APK archive contains no directory entries.'
    };
  }

  // Verify AndroidManifest.xml exists
  const manifestEntry = entries.find(
    (e) => e.entryName === 'AndroidManifest.xml' || e.entryName.toLowerCase() === 'androidmanifest.xml'
  );

  if (!manifestEntry) {
    return {
      isValid: false,
      errorCode: 'MISSING_MANIFEST',
      errorMessage: 'Invalid Android package: missing required AndroidManifest.xml entry.'
    };
  }

  const manifestBuffer = manifestEntry.getData();
  if (!manifestBuffer || manifestBuffer.length === 0) {
    return {
      isValid: false,
      errorCode: 'MISSING_MANIFEST',
      errorMessage: 'AndroidManifest.xml entry is empty.'
    };
  }

  // Check for classes.dex
  const dexEntry = entries.find(
    (e) => e.entryName === 'classes.dex' || e.entryName.endsWith('.dex')
  );
  const dexBuffer = dexEntry ? dexEntry.getData() : undefined;

  const fileSizeFormatted =
    buffer.length > 1024 * 1024
      ? `${(buffer.length / (1024 * 1024)).toFixed(2)} MB`
      : `${(buffer.length / 1024).toFixed(1)} KB`;

  const metadata: ApkMetadata = {
    fileName,
    fileSizeBytes: buffer.length,
    fileSizeFormatted,
    sha256,
    sha1,
    md5,
    totalZipEntries: entries.length,
    hasManifest: true,
    hasDex: !!dexEntry,
    uploadedAt: new Date().toISOString()
  };

  return {
    isValid: true,
    metadata,
    zip,
    manifestBuffer,
    dexBuffer
  };
}
