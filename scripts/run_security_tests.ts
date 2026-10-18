/**
 * VulnScope Security Engine Verification & Acceptance Test Suite
 * Automated executable validation for FYP Mid Evaluation 01.
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { validateApkBuffer } from '../src/lib/security/apkValidator';
import { defaultToolRegistry, ToolRegistry } from '../src/lib/security/toolRegistry';
import { AgentController } from '../src/lib/security/agentController';
import {
  saveSession,
  getSession,
  listSessions,
  isValidSessionId,
  resolveSessionPath
} from '../src/lib/security/sessionStore';
import {
  isValidStorageKey,
  resolveUploadPath,
  lockStorageKey,
  unlockStorageKey,
  isStorageKeyLocked,
  pruneExpiredUploads,
  UPLOAD_DIR,
  ensureUploadDir
} from '../src/lib/security/storageManager';
import { AnalysisSession } from '../src/types/agent';

const FIXTURES_DIR = path.resolve(process.cwd(), 'fixtures');

interface TestResult {
  requirement: string;
  testName: string;
  passed: boolean;
  durationMs: number;
  details: string;
}

const testResults: TestResult[] = [];

async function runTest(
  requirement: string,
  testName: string,
  fn: () => Promise<void> | void
) {
  const start = Date.now();
  process.stdout.write(`  [TEST] ${requirement}: ${testName} ... `);
  try {
    await fn();
    const durationMs = Date.now() - start;
    testResults.push({
      requirement,
      testName,
      passed: true,
      durationMs,
      details: 'Passed with all assertions verified.'
    });
    console.log(`PASSED (${durationMs}ms)`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    testResults.push({
      requirement,
      testName,
      passed: false,
      durationMs,
      details: err.message
    });
    console.log(`FAILED (${durationMs}ms)`);
    console.error(`         Error: ${err.message}`);
  }
}

async function main() {
  console.log('\n============================================================');
  console.log('  VULNSCOPE VERIFICATION & ACCEPTANCE TEST SUITE');
  console.log('  Testing Real Agentic Security Core & Tool Execution');
  console.log('============================================================\n');

  const vulnerableApkPath = path.join(FIXTURES_DIR, 'vulnerable_bank.apk');
  const hardenedApkPath = path.join(FIXTURES_DIR, 'hardened_app.apk');
  const corruptApkPath = path.join(FIXTURES_DIR, 'corrupt_archive.apk');
  const missingManifestApkPath = path.join(FIXTURES_DIR, 'missing_manifest.apk');

  const vulnerableBuffer = fs.readFileSync(vulnerableApkPath);
  const hardenedBuffer = fs.readFileSync(hardenedApkPath);
  const corruptBuffer = fs.readFileSync(corruptApkPath);
  const missingManifestBuffer = fs.readFileSync(missingManifestApkPath);

  // 1. FR-01: Valid APK Intake & Validation
  await runTest('FR-01', 'Valid Authorized APK intake, checksum calculation, and metadata extraction', () => {
    const res = validateApkBuffer(vulnerableBuffer, 'vulnerable_bank.apk');
    assert.strictEqual(res.isValid, true, 'Validation must succeed for valid APK');
    if (res.isValid) {
      assert.strictEqual(res.metadata.fileName, 'vulnerable_bank.apk');
      assert.strictEqual(res.metadata.hasManifest, true);
      assert.strictEqual(res.metadata.hasDex, true);
      assert.strictEqual(res.metadata.sha256.length, 64, 'SHA-256 must be 64 hex characters');
      assert.ok(res.metadata.totalZipEntries >= 2, 'Must have at least 2 zip entries');
    }
  });

  // 2. FR-01 (Negative): Corrupt Archive Rejection
  await runTest('FR-01', 'Reject corrupt / non-ZIP archive with explicit error code', () => {
    const res = validateApkBuffer(corruptBuffer, 'corrupt_archive.apk');
    assert.strictEqual(res.isValid, false, 'Corrupt archive must be rejected');
    if (!res.isValid) {
      assert.strictEqual(res.errorCode, 'INVALID_FORMAT');
      assert.ok(res.errorMessage.includes('ZIP'), 'Error message must cite ZIP header failure');
    }
  });

  // 3. FR-01 (Negative): Missing AndroidManifest.xml Rejection
  await runTest('FR-01', 'Reject ZIP archive lacking required AndroidManifest.xml', () => {
    const res = validateApkBuffer(missingManifestBuffer, 'missing_manifest.apk');
    assert.strictEqual(res.isValid, false, 'Archive lacking manifest must be rejected');
    if (!res.isValid) {
      assert.strictEqual(res.errorCode, 'MISSING_MANIFEST');
      assert.ok(res.errorMessage.includes('AndroidManifest.xml'));
    }
  });

  // 4. FR-02: Allowlist Tool Registry Execution
  await runTest('FR-02', 'Enforce registered action allowlist and verify execution handler output', async () => {
    const registry = defaultToolRegistry;
    const actions = registry.getAllRegisteredActions();
    assert.ok(actions.length >= 6, 'Registry must contain at least 6 security actions');

    const validateAction = registry.getAction('ACTION_VALIDATE_PACKAGE');
    assert.ok(validateAction, 'ACTION_VALIDATE_PACKAGE must be registered');
    assert.strictEqual(validateAction?.supported, true);

    const valRes = validateApkBuffer(vulnerableBuffer, 'vulnerable_bank.apk');
    const out = await validateAction!.handler({}, {
      sessionId: 'TEST-SES-001',
      apkBuffer: vulnerableBuffer,
      validationResult: valRes
    });

    assert.strictEqual(out.status, 'SUCCESS');
    assert.ok(out.observation.includes('Validated APK'));
    assert.strictEqual(out.output.hasManifest, true);
  });

  // 5. FR-05: Reject Unsupported Actions
  await runTest('FR-05', 'Controller rejects unregistered / arbitrary shell action at security boundary', async () => {
    const controller = new AgentController();
    const customRegistry = new ToolRegistry();
    const isSupported = customRegistry.isActionSupported('EXEC_ARBITRARY_SHELL');
    assert.strictEqual(isSupported, false, 'Unregistered action must return supported=false');

    const session = await controller.runAnalysis(vulnerableBuffer, {
      sessionId: 'TEST-BOUNDARY-01',
      fileName: 'vulnerable_bank.apk'
    });

    const hasArbitraryExecution = session.executionTrace.some((t) => t.actionId === 'EXEC_ARBITRARY_SHELL');
    assert.strictEqual(hasArbitraryExecution, false, 'Arbitrary actions must never execute');
  });

  // 6. FR-03 & Security: Session ID Allowlist and Path Traversal Prevention (Objective 1)
  await runTest('FR-03', 'Reject path traversal, absolute paths, and malformed session IDs with containment checks', async () => {
    // Valid session ID
    assert.strictEqual(isValidSessionId('VS-SES-123_valid'), true);
    assert.ok(resolveSessionPath('VS-SES-123_valid').endsWith('.json'));

    // Traversal attempts
    const maliciousIds = [
      '../test',
      '../../etc/passwd',
      '..\\..\\windows\\system32',
      '/etc/shadow',
      'C:\\Windows\\System32\\cmd.exe',
      'session%2e%2e%2f',
      'session\x00null',
      'session id with spaces',
      '',
      'a'.repeat(65) // exceeds 64 chars
    ];

    for (const badId of maliciousIds) {
      assert.strictEqual(isValidSessionId(badId), false, `Must reject malformed ID: ${badId}`);
      assert.throws(() => resolveSessionPath(badId), /Invalid session identifier format|Path traversal/, `Must throw on bad ID: ${badId}`);
      const session = await getSession(badId);
      assert.strictEqual(session, null, `getSession must return null for bad ID: ${badId}`);
    }
  });

  // 7. FR-04: Genuine Observation-Driven Adaptive Decision Loop (Objective 4)
  let vulnerableSession: AnalysisSession;
  await runTest('FR-04', 'Observation-driven adaptive decision loop discovers real vulnerabilities and branches dynamically', async () => {
    const controller = new AgentController({ maxSteps: 8 });
    vulnerableSession = await controller.runAnalysis(vulnerableBuffer, {
      sessionId: 'TEST-VULN-RUN-01',
      fileName: 'vulnerable_bank.apk'
    });

    assert.strictEqual(vulnerableSession.status, 'Completed');
    assert.ok(vulnerableSession.totalActionsExecuted >= 5, 'Must execute at least 5 bounded steps');
    assert.ok(vulnerableSession.findings.length > 0, 'Must discover real findings on vulnerable test app');

    // Check observation-driven branching:
    // In vulnerable_bank.apk, manifest declares usesCleartextTraffic=true.
    // The adaptive planner must have prioritized ACTION_INSPECT_NETWORK_CONFIG immediately at step 3!
    const step3 = vulnerableSession.executionTrace[2];
    assert.ok(step3, 'Step 3 must exist');
    assert.strictEqual(step3.actionId, 'ACTION_INSPECT_NETWORK_CONFIG', 'Step 3 must dynamically prioritize network inspection due to cleartext observation');
    assert.ok(step3.decisionRationale.includes('Cleartext') || step3.decisionRationale.includes('cleartext'));

    // Verify finding breakdown
    const criticals = vulnerableSession.findings.filter((f) => f.severity === 'Critical');
    const highs = vulnerableSession.findings.filter((f) => f.severity === 'High');
    assert.ok(criticals.length >= 1, 'Must detect hardcoded Google/AWS credentials as Critical');
    assert.ok(highs.length >= 2, 'Must detect debuggable and cleartext/crypto issues as High');
  });

  // 8. FR-06: Accurate Evidence & Verification State Differentiation (Objective 2)
  await runTest('FR-06', 'Findings accurately differentiate Verified vulnerabilities from Detected static indicators', () => {
    assert.ok(vulnerableSession.findings.length > 0);

    // Verify that every finding has valid schema, CWE, OWASP mapping
    for (const finding of vulnerableSession.findings) {
      assert.ok(finding.stableId.startsWith('VS-') || finding.stableId.startsWith('VC-'), 'Finding must have stable ID starting with VS-');
      assert.ok(finding.title.length > 5, 'Finding must have descriptive title');
      assert.ok(finding.evidence.length > 0, 'Finding must have concrete technical evidence');
      assert.ok(finding.location.length > 0, 'Finding must cite file / location');
      assert.ok(
        ['Verified', 'Detected', 'Suspected', 'Inconclusive'].includes(finding.verificationStatus),
        `Verification status must be valid: got ${finding.verificationStatus}`
      );
      assert.ok(finding.remediation.length > 10, 'Finding must include actionable remediation');
      assert.ok(finding.cwe.startsWith('CWE-'), 'Finding must have valid CWE mapping');
      assert.ok(finding.owaspCategory.startsWith('MASVS-'), 'Finding must map to OWASP MASVS');
    }

    // 1. Sensitive permissions alone must NOT be 'Verified' vulnerabilities; they must be 'Detected'
    const permissionFindings = vulnerableSession.findings.filter((f) => f.category === 'Privilege Declaration');
    assert.ok(permissionFindings.length > 0, 'Should detect sensitive permissions in vulnerable app');
    for (const pf of permissionFindings) {
      assert.strictEqual(pf.verificationStatus, 'Detected', 'Sensitive permissions must be labeled Detected, not Verified');
      assert.strictEqual(pf.confidence, 'Suspected');
    }

    // 2. Confirmed dangerous build configurations (debuggable, cleartext) must be 'Verified'
    const debugFinding = vulnerableSession.findings.find((f) => f.cwe === 'CWE-215');
    assert.ok(debugFinding, 'Must detect debuggable flag');
    assert.strictEqual(debugFinding?.verificationStatus, 'Verified');

    const cleartextFinding = vulnerableSession.findings.find((f) => f.cwe === 'CWE-319' && f.location.includes('AndroidManifest.xml'));
    assert.ok(cleartextFinding, 'Must detect manifest cleartext traffic flag');
    assert.strictEqual(cleartextFinding?.verificationStatus, 'Verified');

    // 3. High-entropy credentials (Google/AWS) must be 'Verified'
    const keyFinding = vulnerableSession.findings.find((f) => f.cwe === 'CWE-798');
    assert.ok(keyFinding, 'Must detect hardcoded credentials');
    assert.strictEqual(keyFinding?.verificationStatus, 'Verified');

    // 4. Weak crypto references (DES/RC4 string occurrences) must be 'Detected' static indicators
    const cryptoFinding = vulnerableSession.findings.find((f) => f.cwe === 'CWE-327');
    if (cryptoFinding) {
      assert.strictEqual(cryptoFinding.verificationStatus, 'Detected', 'Obsolete cipher string pool references must be labeled Detected');
    }
  });

  // 9. Positive vs. Negative Case: Hardened APK Evaluation & Adaptive Branching (Objective 4)
  await runTest('FR-04', 'Hardened APK produces zero false-positive critical findings and rating A', async () => {
    const controller = new AgentController({ maxSteps: 8 });
    const hardenedSession = await controller.runAnalysis(hardenedBuffer, {
      sessionId: 'TEST-HARDENED-RUN-01',
      fileName: 'hardened_app.apk'
    });

    assert.strictEqual(hardenedSession.status, 'Completed');
    const criticals = hardenedSession.findings.filter((f) => f.severity === 'Critical');
    assert.strictEqual(criticals.length, 0, 'Hardened app must have 0 Critical findings');
    assert.strictEqual(hardenedSession.summary.securityPostureRating, 'A', 'Hardened app must receive Posture Rating A');

    // In hardened_app, usesCleartextTraffic is false.
    // Notice that Step 3 does NOT execute ACTION_INSPECT_NETWORK_CONFIG, but proceeds to components/permissions!
    const step3 = hardenedSession.executionTrace[2];
    assert.notStrictEqual(step3?.actionId, 'ACTION_INSPECT_NETWORK_CONFIG', 'Hardened app must not prioritize network config before components');
  });

  // 10. FR-03 & Persistence: Session Storage
  await runTest('FR-03', 'Persist analysis session to local storage and retrieve by ID', async () => {
    await saveSession(vulnerableSession);
    const loaded = await getSession(vulnerableSession.sessionId);
    assert.ok(loaded, 'Saved session must be retrievable by ID');
    assert.strictEqual(loaded?.sessionId, vulnerableSession.sessionId);
    assert.strictEqual(loaded?.findings.length, vulnerableSession.findings.length);

    const all = await listSessions();
    const foundInList = all.some((s) => s.sessionId === vulnerableSession.sessionId);
    assert.strictEqual(foundInList, true, 'Session must appear in session list');
  });

  // 11. FR-07: Safe APK Storage Hygiene & Retention Management (Objective 5)
  await runTest('FR-07', 'Enforce APK storage key allowlist, active file locking, and retention pruning', () => {
    ensureUploadDir();

    // 1. Storage key validation
    assert.strictEqual(isValidStorageKey('1234567890abcdef_test_app.apk'), true);
    assert.strictEqual(isValidStorageKey('../../etc/passwd'), false);
    assert.strictEqual(isValidStorageKey('bad_key'), false);

    // 2. Traversal rejection in storage path resolution
    assert.throws(() => resolveUploadPath('../../etc/passwd'), /Invalid storage key format/);

    // 3. Active key locking
    const testKey = '1234567890abcdef_sample_bank.apk';
    assert.strictEqual(isStorageKeyLocked(testKey), false);
    lockStorageKey(testKey);
    assert.strictEqual(isStorageKeyLocked(testKey), true);
    unlockStorageKey(testKey);
    assert.strictEqual(isStorageKeyLocked(testKey), false);

    // 4. Retention pruning simulation
    const dummyOldFile = 'abcdef1234567890_dummy_expired.apk';
    const dummyPath = path.join(UPLOAD_DIR, dummyOldFile);
    fs.writeFileSync(dummyPath, Buffer.from('PK\x03\x04dummy'));

    // Set file time to 48 hours ago
    const twoDaysAgo = (Date.now() - 48 * 3600 * 1000) / 1000;
    fs.utimesSync(dummyPath, twoDaysAgo, twoDaysAgo);

    // When locked, it must NOT be pruned
    lockStorageKey(dummyOldFile);
    const lockedPrune = pruneExpiredUploads({ maxAgeMs: 24 * 3600 * 1000 });
    assert.strictEqual(fs.existsSync(dummyPath), true, 'Locked expired file must be preserved');
    unlockStorageKey(dummyOldFile);

    // When unlocked, it must be pruned
    const unlockedPrune = pruneExpiredUploads({ maxAgeMs: 24 * 3600 * 1000 });
    assert.strictEqual(fs.existsSync(dummyPath), false, 'Unlocked expired file must be pruned');
    assert.ok(unlockedPrune.prunedCount >= 1, 'Pruned count must be at least 1');
  });

  // Summary
  console.log('\n============================================================');
  console.log('  TEST EXECUTION SUMMARY');
  console.log('============================================================');
  const total = testResults.length;
  const passed = testResults.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log(`  Total Requirements Tested: ${total}`);
  console.log(`  Passed:                   ${passed}`);
  console.log(`  Failed:                   ${failed}`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});
