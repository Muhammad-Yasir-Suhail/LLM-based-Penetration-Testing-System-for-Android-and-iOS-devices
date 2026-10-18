import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { AgentController } from '@/lib/security/agentController';
import { saveSession } from '@/lib/security/sessionStore';

const FIXTURES_DIR = path.resolve(process.cwd(), 'fixtures');
const UPLOAD_DIR = path.resolve(process.cwd(), 'storage', 'uploads');

export async function POST(req: NextRequest) {
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
      const body = await req.json();

      if (body.fixtureId) {
        const fixtureFileName =
          body.fixtureId === 'hardened_app' ? 'hardened_app.apk' : 'vulnerable_bank.apk';
        const fixturePath = path.join(FIXTURES_DIR, fixtureFileName);
        if (!fs.existsSync(fixturePath)) {
          return NextResponse.json(
            { success: false, error: `Test fixture not found: ${fixtureFileName}` },
            { status: 404 }
          );
        }
        apkBuffer = fs.readFileSync(fixturePath);
        fileName = fixtureFileName;
      } else if (body.storageKey) {
        // Sanitize storage key against path traversal
        const safeBaseName = path.basename(body.storageKey);
        const filePath = path.join(UPLOAD_DIR, safeBaseName);
        if (!fs.existsSync(filePath)) {
          return NextResponse.json(
            { success: false, error: 'Uploaded file expired or not found.' },
            { status: 404 }
          );
        }
        apkBuffer = fs.readFileSync(filePath);
        fileName = safeBaseName.split('_').slice(1).join('_') || safeBaseName;
      }
    }

    if (!apkBuffer || apkBuffer.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No APK package provided for analysis.' },
        { status: 400 }
      );
    }

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
  } catch (err: any) {
    console.error('[VulnCope API Run Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Execution error during security analysis' },
      { status: 500 }
    );
  }
}
