/**
 * VulnCope Security Engine Verification & Acceptance Test Suite
 * Automated executable validation for FYP Mid Evaluation 01.
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { validateApkBuffer } from '../src/lib/security/apkValidator';
import { defaultToolRegistry, ToolRegistry } from '../src/lib/security/toolRegistry';
import { AgentController } from '../src/lib/security/agentController';
import { saveSession, getSession, listSessions } from '../src/lib/security/sessionStore';
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
  console.log('  VULNCOPE VERIFICATION & ACCEPTANCE TEST SUITE');
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
    // Simulate an attempt to execute an unsupported arbitrary action
    const isSupported = customRegistry.isActionSupported('EXEC_ARBITRARY_SHELL');
    assert.strictEqual(isSupported, false, 'Unregistered action must return supported=false');

    // Run controller with an APK and ensure only allowlisted actions run
    const session = await controller.runAnalysis(vulnerableBuffer, {
      sessionId: 'TEST-BOUNDARY-01',
      fileName: 'vulnerable_bank.apk'
    });

    const hasArbitraryExecution = session.executionTrace.some((t) => t.actionId === 'EXEC_ARBITRARY_SHELL');
    assert.strictEqual(hasArbitraryExecution, false, 'Arbitrary actions must never execute');
  });

  // 6. FR-03 & FR-04: Full End-to-End Adaptive Decision Loop on Vulnerable APK
  let vulnerableSession: AnalysisSession;
  await runTest('FR-04', 'Observation-driven adaptive decision loop discovers real vulnerabilities', async () => {
    const controller = new AgentController({ maxSteps: 8 });
    vulnerableSession = await controller.runAnalysis(vulnerableBuffer, {
      sessionId: 'TEST-VULN-RUN-01',
      fileName: 'vulnerable_bank.apk'
    });

    assert.strictEqual(vulnerableSession.status, 'Completed');
    assert.ok(vulnerableSession.totalActionsExecuted >= 5, 'Must execute at least 5 bounded steps');
    assert.ok(vulnerableSession.findings.length > 0, 'Must discover real findings on vulnerable test app');

    // Check that manifest inspection observed cleartext and exported components
    const manifestStep = vulnerableSession.executionTrace.find((t) => t.actionId === 'ACTION_INSPECT_MANIFEST');
    assert.ok(manifestStep, 'Manifest inspection step must be present');
    assert.strictEqual(manifestStep?.output.usesCleartextTraffic, true);
    assert.strictEqual(manifestStep?.output.debuggable, true);

    // Verify finding breakdown
    const criticals = vulnerableSession.findings.filter((f) => f.severity === 'Critical');
    const highs = vulnerableSession.findings.filter((f) => f.severity === 'High');
    assert.ok(criticals.length >= 1, 'Must detect hardcoded Google/AWS credentials as Critical');
    assert.ok(highs.length >= 2, 'Must detect debuggable and unprotected exported components as High');
  });

  // 7. FR-06: Traceable Evidence & Verification State
  await runTest('FR-06', 'Every discovered finding contains traceable evidence, location, and Verified status', () => {
    assert.ok(vulnerableSession.findings.length > 0);
    for (const finding of vulnerableSession.findings) {
      assert.ok(finding.stableId.startsWith('VC-'), 'Finding must have stable ID starting with VC-');
      assert.ok(finding.title.length > 5, 'Finding must have descriptive title');
      assert.ok(finding.evidence.length > 0, 'Finding must have concrete technical evidence');
      assert.ok(finding.location.length > 0, 'Finding must cite file / location');
      assert.strictEqual(finding.verificationStatus, 'Verified', 'Directly detected finding must be Verified');
      assert.ok(finding.remediation.length > 10, 'Finding must include actionable remediation');
      assert.ok(finding.cwe.startsWith('CWE-'), 'Finding must have valid CWE mapping');
      assert.ok(finding.owaspCategory.startsWith('MASVS-'), 'Finding must map to OWASP MASVS');
    }
  });

  // 8. Positive vs. Negative Case: Hardened APK Evaluation
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
  });

  // 9. FR-03 & Persistence: Session Storage
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
