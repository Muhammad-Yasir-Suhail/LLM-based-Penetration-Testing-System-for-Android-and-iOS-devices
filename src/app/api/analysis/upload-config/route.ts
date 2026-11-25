import { NextResponse } from 'next/server';
import {
  getBlobAccess,
  getDirectUploadLimitBytes,
  getMaxApkBytes,
  isBlobUploadEnabled,
  isVercel
} from '@/lib/security/uploadConfig';

export const dynamic = 'force-dynamic';

/**
 * Tells the upload screen how to send an APK:
 *  - "blob":   when a Blob store is connected, EVERY upload goes browser -> Vercel Blob and is kept there
 *  - "direct": otherwise the APK streams to /api/analysis/run and is kept on the server's disk
 */
export async function GET() {
  return NextResponse.json({
    maxBytes: getMaxApkBytes(),
    directLimitBytes: getDirectUploadLimitBytes(),
    blobEnabled: isBlobUploadEnabled(),
    blobAccess: getBlobAccess(),
    onVercel: isVercel()
  });
}
