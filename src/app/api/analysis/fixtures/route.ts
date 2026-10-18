import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export async function GET() {
  const fixturesDir = path.resolve(process.cwd(), 'fixtures');
  const availableFixtures = [
    {
      id: 'vulnerable_bank',
      name: 'VulnCope Insecure Bank Benchmark APK',
      fileName: 'vulnerable_bank.apk',
      description:
        'Authorized test fixture with deliberate vulnerabilities: debuggable=true, cleartext HTTP enabled, exported unprotected components, hardcoded Google Cloud & AWS credentials in Dalvik bytecode, and broken crypto ciphers.',
      type: 'vulnerable',
      expectedFindings: '8+ (Critical credentials, High debug/cleartext/IPC, Medium permissions)'
    },
    {
      id: 'hardened_app',
      name: 'VulnCope Hardened Secure Benchmark APK',
      fileName: 'hardened_app.apk',
      description:
        'Authorized test fixture adhering to Android security best practices: debuggable=false, cleartext disabled, no unprotected exported components, zero hardcoded credentials, TLS enforced.',
      type: 'hardened',
      expectedFindings: '0 Critical / High (Security Posture Rating A)'
    }
  ];

  const enriched = availableFixtures.map((f) => {
    const filePath = path.join(fixturesDir, f.fileName);
    let exists = false;
    let sizeBytes = 0;
    let sha256 = '';

    if (fs.existsSync(filePath)) {
      exists = true;
      const buf = fs.readFileSync(filePath);
      sizeBytes = buf.length;
      sha256 = crypto.createHash('sha256').update(buf).digest('hex');
    }

    return {
      ...f,
      exists,
      sizeBytes,
      sizeFormatted: `${(sizeBytes / 1024).toFixed(1)} KB`,
      sha256
    };
  });

  return NextResponse.json({
    success: true,
    fixtures: enriched
  });
}
