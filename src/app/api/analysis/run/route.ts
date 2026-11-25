import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { AgentController } from '@/lib/security/agentController';
import { saveSession } from '@/lib/security/sessionStore';
import {
  isValidStorageKey,
  resolveUploadPath,
  lockStorageKey,
  unlockStorageKey,
  ensureUploadDir,
  ensureApkArchiveDir,
  archivedApkName,
  UPLOAD_DIR,
  APK_ARCHIVE_DIR
} from '@/lib/security/storageManager';
import { getFixtureBuffer } from '@/lib/security/fixturesLoader';
import {
  getBlobAccess,
  getBlobReadHeaders,
  getMaxApkBytes,
  isTrustedBlobUrl,
  isVercel
} from '@/lib/security/uploadConfig';
import { fileSource, httpSource, validateApkSource, formatSize } from '@/lib/security/streamingApk';
import type { ApkValidationResult } from '@/lib/security/apkValidator';
import type { StoredApk } from '@/types/agent';

// Multi-GB APKs need time to stream and hash. 300s is the maximum on Vercel Hobby (Pro allows up to 800s).
export const runtime = 'nodejs';
export const maxDuration = 300;

const tooLarge = () =>
  NextResponse.json(
    { success: false, error: `APK exceeds the ${formatSize(getMaxApkBytes())} limit.` },
    { status: 413 }
  );

/**
 * Starts an analysis. Every uploaded APK is KEPT COMPLETE (byte for byte) for later processing,
 * whatever the current pipeline reads; the session records where (`session.storedApk`).
 *
 * Accepted inputs:
 *  - application/octet-stream body (+ x-file-name header): any size up to the limit, streamed to disk
 *  - JSON { blobUrl, pathname, fileName }: uploads that went browser -> Vercel Blob (kept in Blob)
 *  - JSON { fixtureId } / { storageKey }: built-in benchmarks and pre-uploaded files
 *  - multipart/form-data with "file": small uploads (kept for compatibility)
 */
export async function POST(req: NextRequest) {
  let body: any = undefined;
  let tempFile: string | null = null;

  try {
    let apkBuffer: Buffer | null = null;
    let validation: ApkValidationResult | undefined;
    let storedApk: StoredApk | undefined;
    let fileName = 'target.apk';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/octet-stream')) {
      // Streamed upload: written to disk chunk by chunk and fingerprinted on the way, never held in memory.
      fileName = decodeURIComponent(req.headers.get('x-file-name') || 'target.apk');
      const declared = Number(req.headers.get('content-length') || 0);
      if (declared > getMaxApkBytes()) return tooLarge();
      if (!req.body) {
        return NextResponse.json({ success: false, error: 'No APK package provided for analysis.' }, { status: 400 });
      }

      ensureUploadDir();
      tempFile = path.join(UPLOAD_DIR, `stream_${crypto.randomBytes(8).toString('hex')}.part`);
      const out = fs.createWriteStream(tempFile);
      const hash = crypto.createHash('sha256');
      let written = 0;
      const reader = req.body.getReader();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          written += value.byteLength;
          if (written > getMaxApkBytes()) {
            await reader.cancel();
            out.destroy();
            return tooLarge();
          }
          hash.update(value);
          if (!out.write(value)) await new Promise<void>((r) => out.once('drain', () => r()));
        }
      } finally {
        await new Promise<void>((r) => out.end(() => r()));
      }
      if (written === 0) {
        return NextResponse.json({ success: false, error: 'Uploaded file is empty (0 bytes).' }, { status: 400 });
      }

      // Keep the complete file permanently, named by its SHA-256.
      const sha256 = hash.digest('hex');
      ensureApkArchiveDir();
      const name = archivedApkName(sha256, fileName);
      const finalPath = path.join(APK_ARCHIVE_DIR, name);
      await fs.promises.rename(tempFile, finalPath);
      tempFile = null;
      storedApk = {
        location: 'local',
        durable: !isVercel(),
        pathname: name,
        path: finalPath,
        originalFileName: fileName,
        sizeBytes: written,
        sha256,
        storedAt: new Date().toISOString()
      };

      validation = await validateApkSource(fileSource(finalPath), fileName, getMaxApkBytes());
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (file) {
        fileName = file.name;
        if (file.size > getMaxApkBytes()) return tooLarge();
        apkBuffer = Buffer.from(await file.arrayBuffer());

        // Keep the complete file permanently.
        const sha256 = crypto.createHash('sha256').update(apkBuffer).digest('hex');
        ensureApkArchiveDir();
        const name = archivedApkName(sha256, fileName);
        const finalPath = path.join(APK_ARCHIVE_DIR, name);
        await fs.promises.writeFile(finalPath, apkBuffer);
        storedApk = {
          location: 'local',
          durable: !isVercel(),
          pathname: name,
          path: finalPath,
          originalFileName: fileName,
          sizeBytes: apkBuffer.length,
          sha256,
          storedAt: new Date().toISOString()
        };
      }
    } else {
      body = await req.json();

      if (body.blobUrl) {
        // Upload that went browser -> Vercel Blob. It STAYS in Blob (durable); we only read from it.
        if (!isTrustedBlobUrl(body.blobUrl)) {
          return NextResponse.json({ success: false, error: 'Untrusted upload location.' }, { status: 400 });
        }
        fileName = typeof body.fileName === 'string' && body.fileName ? body.fileName : 'target.apk';
        const src = await httpSource(body.blobUrl, getBlobReadHeaders());
        if (src.size > getMaxApkBytes()) return tooLarge();
        validation = await validateApkSource(src, fileName, getMaxApkBytes());
        storedApk = {
          location: 'vercel-blob',
          durable: true,
          url: body.blobUrl,
          pathname: typeof body.pathname === 'string' && body.pathname ? body.pathname : new URL(body.blobUrl).pathname.slice(1),
          access: getBlobAccess(),
          originalFileName: fileName,
          sizeBytes: src.size,
          sha256: validation.isValid ? validation.metadata.sha256 : '',
          storedAt: new Date().toISOString()
        };
      } else if (body.fixtureId) {
        const fixture = getFixtureBuffer(body.fixtureId);
        apkBuffer = fixture.buffer;
        fileName = fixture.fileName;
      } else if (body.storageKey) {
        if (!isValidStorageKey(body.storageKey)) {
          return NextResponse.json({ success: false, error: 'Invalid storage key format' }, { status: 400 });
        }
        try {
          const filePath = resolveUploadPath(body.storageKey);
          if (!fs.existsSync(filePath)) {
            return NextResponse.json({ success: false, error: 'Uploaded file expired or not found.' }, { status: 404 });
          }
          // Lock key during reading and analysis
          lockStorageKey(body.storageKey);
          const parts = body.storageKey.split('_');
          fileName = parts.slice(1).join('_') || body.storageKey;
          validation = await validateApkSource(fileSource(filePath), fileName, getMaxApkBytes());
        } catch {
          return NextResponse.json({ success: false, error: 'Path resolution error on storage key' }, { status: 400 });
        }
      }
    }

    if (!validation && (!apkBuffer || apkBuffer.length === 0)) {
      return NextResponse.json({ success: false, error: 'No APK package provided for analysis.' }, { status: 400 });
    }

    try {
      const controller = new AgentController();
      const session = await controller.runAnalysis(apkBuffer ?? Buffer.alloc(0), {
        fileName,
        validationResult: validation
      });
      if (storedApk) session.storedApk = storedApk;

      // Save session to persistence
      await saveSession(session);

      return NextResponse.json({ success: true, session });
    } finally {
      if (typeof body !== 'undefined' && body?.storageKey) {
        unlockStorageKey(body.storageKey);
      }
    }
  } catch (err: any) {
    console.error('[VulnScope API Run Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Execution error during security analysis' },
      { status: 500 }
    );
  } finally {
    // Only an incomplete stream (aborted, or over the size limit) leaves a temp file behind.
    if (tempFile) fs.promises.unlink(tempFile).catch(() => {});
  }
}
