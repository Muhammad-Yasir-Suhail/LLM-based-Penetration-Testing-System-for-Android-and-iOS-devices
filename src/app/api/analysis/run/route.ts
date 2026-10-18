import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { AgentController } from '@/lib/security/agentController';
import { saveSession } from '@/lib/security/sessionStore';
import {
  isValidStorageKey,
  resolveUploadPath,
  lockStorageKey,
  unlockStorageKey
} from '@/lib/security/storageManager';
import { getFixtureBuffer } from '@/lib/security/fixturesLoader';

export async function POST(req: NextRequest) {
  let body: any = undefined;
  try {
    let apkBuffer: Buffer | null = null;
    let fileName = 'target.apk';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (file) {
        fileName = file.name;
        const ab = await file.arrayBuffer();
        apkBuffer = Buffer.from(ab);
      }
    } else {
      body = await req.json();

      if (body.fixtureId) {
        const fixture = getFixtureBuffer(body.fixtureId);
        apkBuffer = fixture.buffer;
        fileName = fixture.fileName;
      } else if (body.storageKey) {
        if (!isValidStorageKey(body.storageKey)) {
          return NextResponse.json(
            { success: false, error: 'Invalid storage key format' },
            { status: 400 }
          );
        }

        try {
          const filePath = resolveUploadPath(body.storageKey);
          if (!fs.existsSync(filePath)) {
            return NextResponse.json(
              { success: false, error: 'Uploaded file expired or not found.' },
              { status: 404 }
            );
          }
          // Lock key during reading and analysis
          lockStorageKey(body.storageKey);
          apkBuffer = fs.readFileSync(filePath);
          const parts = body.storageKey.split('_');
          fileName = parts.slice(1).join('_') || body.storageKey;
        } catch {
          return NextResponse.json(
            { success: false, error: 'Path resolution error on storage key' },
            { status: 400 }
          );
        }
      }
    }

    if (!apkBuffer || apkBuffer.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No APK package provided for analysis.' },
        { status: 400 }
      );
    }

    try {
      const controller = new AgentController();
      const session = await controller.runAnalysis(apkBuffer, {
        fileName
      });

      // Save session to persistence
      await saveSession(session);

      return NextResponse.json({
        success: true,
        session
      });
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
  }
}
