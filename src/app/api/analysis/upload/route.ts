import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { validateApkBuffer } from '@/lib/security/apkValidator';
import {
  ensureUploadDir,
  resolveUploadPath,
  triggerMaintenanceIfNeeded
} from '@/lib/security/storageManager';

export async function POST(req: NextRequest) {
  try {
    // Trigger throttled retention maintenance asynchronously
    triggerMaintenanceIfNeeded();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided in form data' },
        { status: 400 }
      );
    }

    const fileName = file.name || 'target.apk';

    // Verify extension
    if (!fileName.toLowerCase().endsWith('.apk')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type: only .apk packages are supported.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate APK structure
    const validation = validateApkBuffer(buffer, fileName);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          errorCode: validation.errorCode,
          error: validation.errorMessage
        },
        { status: 422 }
      );
    }

    ensureUploadDir();
    const cleanFileName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const safeBaseName = `${validation.metadata.sha256.substring(0, 16)}_${cleanFileName}`;
    const safePath = resolveUploadPath(safeBaseName);

    fs.writeFileSync(safePath, buffer);

    return NextResponse.json({
      success: true,
      metadata: validation.metadata,
      storageKey: safeBaseName
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal upload error' },
      { status: 500 }
    );
  }
}
