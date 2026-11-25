import os from 'node:os';

/**
 * Upload limits and storage locations that differ between local and Vercel deployments.
 *
 * Vercel serverless functions reject request bodies above ~4.5 MB, and their filesystem is
 * read-only except for the OS temp directory. Large APKs therefore go browser -> Vercel Blob
 * directly (when a Blob store is connected), and the server fetches them from there.
 */

/** Absolute maximum APK size accepted anywhere (defaults to 4 GB, env-configurable). */
export function getMaxApkBytes(): number {
  const n = Number(process.env.MAX_APK_SIZE_BYTES);
  return Number.isFinite(n) && n > 0 ? n : 4 * 1024 * 1024 * 1024;
}

/**
 * Access mode of the Vercel Blob store. Must match how the store was created.
 * Private is the default: uploaded apps are kept permanently and must not be publicly downloadable.
 */
export function getBlobAccess(): 'private' | 'public' {
  return process.env.BLOB_ACCESS === 'public' ? 'public' : 'private';
}

/** Read-auth headers for fetching from the Blob store (only ever sent to *.blob.vercel-storage.com). */
export function getBlobReadHeaders(): Record<string, string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  return getBlobAccess() === 'private' && token ? { authorization: `Bearer ${token}` } : {};
}

export const isVercel = (): boolean => Boolean(process.env.VERCEL);

/** Largest file that can be posted straight to an API route. */
export function getDirectUploadLimitBytes(): number {
  // Stay safely under Vercel's 4.5 MB body limit (multipart adds a little overhead).
  return isVercel() ? Math.floor(4.2 * 1024 * 1024) : getMaxApkBytes();
}

/** Whether browser-to-Blob uploads are available (a Vercel Blob store is connected). */
export function isBlobUploadEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** A writable base directory: the project folder locally, the temp directory on Vercel. */
export function getWritableBaseDir(): string {
  return isVercel() ? os.tmpdir() : process.cwd();
}

/** Only URLs served by Vercel Blob may be fetched by the analysis route (prevents SSRF). */
export function isTrustedBlobUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' && /\.blob\.vercel-storage\.com$/i.test(u.hostname);
  } catch {
    return false;
  }
}
