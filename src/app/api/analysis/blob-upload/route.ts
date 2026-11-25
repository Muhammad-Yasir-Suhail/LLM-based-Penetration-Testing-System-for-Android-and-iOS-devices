import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getMaxApkBytes, isBlobUploadEnabled } from '@/lib/security/uploadConfig';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Issues short-lived client tokens so the browser can upload an APK straight to Vercel Blob,
 * bypassing the ~4.5 MB request-body limit of serverless functions.
 * Requires a Vercel Blob store connected to the project (BLOB_READ_WRITE_TOKEN).
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!isBlobUploadEnabled()) {
    return NextResponse.json(
      { error: 'Large uploads are not configured: connect a Vercel Blob store to this project.' },
      { status: 501 }
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.toLowerCase().endsWith('.apk')) {
          throw new Error('Only .apk packages can be uploaded.');
        }
        return {
          allowedContentTypes: [
            'application/vnd.android.package-archive',
            'application/octet-stream',
            'application/zip',
            'application/x-zip-compressed'
          ],
          maximumSizeInBytes: getMaxApkBytes(),
          addRandomSuffix: true
        };
      },
      // Analysis is started by the client right after the upload; nothing to record here.
      onUploadCompleted: async () => {}
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload authorization failed' },
      { status: 400 }
    );
  }
}
