import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getFixtureBuffer } from '@/lib/security/fixturesLoader';

export async function GET() {
  const availableFixtures = [
    {
      id: 'vulnerable_bank',
      name: 'VulnScope Insecure Bank Benchmark APK',
      fileName: 'vulnerable_bank.apk',
      description:
        'Authorized test fixture with deliberate vulnerabilities: debuggable=true, cleartext HTTP enabled, exported unprotected components, hardcoded Google Cloud & AWS credentials in Dalvik bytecode, and broken crypto ciphers.',
      type: 'vulnerable',
      expectedFindings: '8+ (Critical credentials, High debug/cleartext/IPC, Medium permissions)'
    },
    {
      id: 'hardened_app',
      name: 'VulnScope Hardened Secure Benchmark APK',
      fileName: 'hardened_app.apk',
      description:
        'Authorized test fixture adhering to Android security best practices: debuggable=false, cleartext disabled, no unprotected exported components, zero hardcoded credentials, TLS enforced.',
      type: 'hardened',
      expectedFindings: '0 Critical / High (Security Posture Rating A)'
    }
  ];

  const enriched = availableFixtures.map((f) => {
    let exists = true;
    let sizeBytes = 0;
    let sha256 = '';

    try {
      const fixture = getFixtureBuffer(f.id);
      sizeBytes = fixture.buffer.length;
      sha256 = crypto.createHash('sha256').update(fixture.buffer).digest('hex');
    } catch {
      exists = false;
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
