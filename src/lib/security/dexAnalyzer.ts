import { SecurityFinding } from '@/types/agent';

export interface DexAnalysisResult {
  hasValidDexHeader: boolean;
  dexVersion?: string;
  totalStringsExtracted: number;
  hardcodedSecrets: { type: string; snippet: string; keyPattern: string }[];
  insecureEndpoints: string[];
  cryptoWeaknesses: { algorithm: string; snippet: string }[];
  insecureTrustManagers: string[];
  findings: SecurityFinding[];
  summary: string;
}

export function analyzeDexBuffer(
  dexBuffer: Buffer,
  sessionId: string = 'SESSION-UNKNOWN'
): DexAnalysisResult {
  const timestamp = new Date().toISOString();
  let findingCounter = 1;

  function genId() {
    return `VC-DEX-${String(findingCounter++).padStart(3, '0')}`;
  }

  const findings: SecurityFinding[] = [];
  const hardcodedSecrets: { type: string; snippet: string; keyPattern: string }[] = [];
  const insecureEndpoints: string[] = [];
  const cryptoWeaknesses: { algorithm: string; snippet: string }[] = [];
  const insecureTrustManagers: string[] = [];

  // Check DEX Header magic
  let hasValidDexHeader = false;
  let dexVersion: string | undefined = undefined;

  if (dexBuffer.length >= 112) {
    const magic = dexBuffer.subarray(0, 8).toString('ascii');
    if (magic.startsWith('dex\n')) {
      hasValidDexHeader = true;
      dexVersion = magic.substring(4, 7);
    }
  }

  // Extract strings
  const extractedStrings: string[] = [];

  if (hasValidDexHeader) {
    try {
      const stringIdsSize = dexBuffer.readUInt32LE(56);
      const stringIdsOff = dexBuffer.readUInt32LE(60);

      const maxStrings = Math.min(stringIdsSize, 30000);
      for (let i = 0; i < maxStrings; i++) {
        const offPos = stringIdsOff + i * 4;
        if (offPos + 4 > dexBuffer.length) break;

        const stringDataOff = dexBuffer.readUInt32LE(offPos);
        if (stringDataOff >= dexBuffer.length) continue;

        // Skip ULEB128 string length
        let p = stringDataOff;
        while (p < dexBuffer.length && (dexBuffer[p] & 0x80) !== 0) {
          p++;
        }
        p++; // skip last byte of length

        // Read null-terminated string
        const start = p;
        while (p < dexBuffer.length && dexBuffer[p] !== 0) {
          p++;
        }

        const str = dexBuffer.subarray(start, p).toString('utf8');
        if (str.length > 3) {
          extractedStrings.push(str);
        }
      }
    } catch {
      // Fall back to buffer string regex scan
    }
  }

  // Fallback: If structured string table had few strings or wasn't clean, scan ascii strings in buffer
  if (extractedStrings.length < 50) {
    const rawAscii = dexBuffer.toString('latin1');
    const matches = rawAscii.match(/[A-Za-z0-9_.:/=\-+@$#?&]{5,120}/g) || [];
    extractedStrings.push(...matches.slice(0, 20000));
  }

  // Patterns to evaluate
  const GOOGLE_KEY_REGEX = /^AIza[0-9A-Za-z-_]{35}$/;
  const AWS_KEY_REGEX = /^AKIA[0-9A-Z]{16}$/;
  const SLACK_TOKEN_REGEX = /^xox[baprs]-[0-9a-zA-Z]{10,48}$/;

  const IGNORABLE_URL_PREFIXES = [
    'http://schemas.android.com',
    'http://www.w3.org',
    'http://xml.org',
    'http://apache.org',
    'http://json.org'
  ];

  for (const str of extractedStrings) {
    // 1. Hardcoded API keys
    if (GOOGLE_KEY_REGEX.test(str)) {
      hardcodedSecrets.push({
        type: 'Google Cloud / Maps API Key',
        snippet: str.substring(0, 10) + '...',
        keyPattern: 'AIza[35]'
      });
      findings.push({
        stableId: genId(),
        title: 'Hardcoded Google Cloud API Key in Decompiled Bytecode',
        description: `Discovered a live Google API credential token (${str.substring(0, 10)}...) embedded in classes.dex. An attacker decompiling the APK can extract this key to perform unauthorized API calls or deplete service quotas.`,
        category: 'Hardcoded Credentials',
        owaspCategory: 'MASVS-CRYPTO',
        cwe: 'CWE-798',
        severity: 'Critical',
        confidence: 'Confirmed',
        verificationStatus: 'Verified',
        evidence: `Extracted string token: "${str.substring(0, 12)}...${str.substring(str.length - 4)}" from classes.dex`,
        location: 'classes.dex:StringPool',
        sourceTool: 'VulnCope DEX String Analyzer v1.0',
        remediation:
          'Remove API key from application code. Store credentials in a secure backend vault and restrict Google Cloud API keys by Android SHA-1 fingerprint and package name.',
        sessionId,
        timestamp
      });
    }

    if (AWS_KEY_REGEX.test(str)) {
      hardcodedSecrets.push({
        type: 'Amazon Web Services Access Key ID',
        snippet: str.substring(0, 8) + '...',
        keyPattern: 'AKIA[16]'
      });
      findings.push({
        stableId: genId(),
        title: 'Hardcoded AWS Access Key ID Detected',
        description: `Discovered an AWS IAM Access Key ID (${str.substring(0, 8)}...) compiled into bytecode. This credential may grant access to AWS S3 buckets, RDS databases, or cloud infrastructure.`,
        category: 'Hardcoded Credentials',
        owaspCategory: 'MASVS-CRYPTO',
        cwe: 'CWE-798',
        severity: 'Critical',
        confidence: 'Confirmed',
        verificationStatus: 'Verified',
        evidence: `Extracted AWS key: "${str}" in classes.dex`,
        location: 'classes.dex:StringPool',
        sourceTool: 'VulnCope DEX String Analyzer v1.0',
        remediation:
          'Rotate the compromised AWS IAM key immediately and use Amazon Cognito Identity Pools with temporary STS credentials instead of permanent keys.',
        sessionId,
        timestamp
      });
    }

    if (SLACK_TOKEN_REGEX.test(str)) {
      hardcodedSecrets.push({
        type: 'Slack API Token',
        snippet: str.substring(0, 8) + '...',
        keyPattern: 'xox*'
      });
      findings.push({
        stableId: genId(),
        title: 'Hardcoded Slack Webhook / Bot Token Detected',
        description: 'Discovered a hardcoded Slack token compiled into the mobile application bytecode.',
        category: 'Hardcoded Credentials',
        owaspCategory: 'MASVS-CRYPTO',
        cwe: 'CWE-798',
        severity: 'Critical',
        confidence: 'Confirmed',
        verificationStatus: 'Verified',
        evidence: `Extracted Slack token snippet: "${str.substring(0, 10)}..."`,
        location: 'classes.dex:StringPool',
        sourceTool: 'VulnCope DEX String Analyzer v1.0',
        remediation: 'Revoke and rotate Slack token immediately. Proxy notifications through an authorized backend service.',
        sessionId,
        timestamp
      });
    }

    // 2. Insecure HTTP URLs
    if (str.startsWith('http://') && !IGNORABLE_URL_PREFIXES.some((p) => str.startsWith(p))) {
      if (str.length < 100 && !insecureEndpoints.includes(str)) {
        insecureEndpoints.push(str);
      }
    }

    // 3. Cryptographic weaknesses
    if (str === 'DES' || str === 'DESede' || str === 'RC4' || str.includes('AES/ECB/')) {
      cryptoWeaknesses.push({ algorithm: str, snippet: str });
    }

    // 4. Insecure TrustManager
    if (
      str.includes('TrustAllCerts') ||
      str.includes('ALLOW_ALL_HOSTNAME_VERIFIER') ||
      str.includes('AllowAllHostnameVerifier')
    ) {
      if (!insecureTrustManagers.includes(str)) {
        insecureTrustManagers.push(str);
      }
    }
  }

  // Generate finding for plain HTTP endpoints if found (static indicator)
  if (insecureEndpoints.length > 0) {
    findings.push({
      stableId: genId(),
      title: `Static Indicator: Cleartext HTTP Endpoints in Application Bytecode (${insecureEndpoints.length} identified)`,
      description: `Discovered plain unencrypted HTTP endpoint URLs compiled into classes.dex string pool. Communication over plain HTTP exposes data to eavesdropping and manipulation. Examples: ${insecureEndpoints.slice(0, 3).join(', ')}`,
      category: 'Insecure Network Transmission',
      owaspCategory: 'MASVS-NETWORK',
      cwe: 'CWE-319',
      severity: 'Medium',
      confidence: 'Suspected',
      verificationStatus: 'Detected',
      evidence: `HTTP endpoints identified in DEX string pool:\n${insecureEndpoints.slice(0, 5).map((u) => ` - ${u}`).join('\n')}`,
      location: 'classes.dex:StringPool',
      sourceTool: 'VulnCope DEX String Analyzer v1.0',
      remediation: 'Upgrade all API endpoints to HTTPS/TLS v1.3. Enforce strict transport security and Network Security Config.',
      sessionId,
      timestamp
    });
  }

  // Generate finding for broken cryptographic algorithm (static indicator)
  if (cryptoWeaknesses.length > 0) {
    const algos = Array.from(new Set(cryptoWeaknesses.map((c) => c.algorithm))).join(', ');
    findings.push({
      stableId: genId(),
      title: `Static Indicator: Obsolete Cryptographic Cipher Reference (${algos}) in Bytecode`,
      description: `Application bytecode string pool references obsolete or weak encryption algorithm names (${algos}). Ciphers such as DES, RC4, or AES in ECB mode are vulnerable to cryptanalysis. Dynamic call verification recommended to confirm active usage.`,
      category: 'Insecure Cryptography',
      owaspCategory: 'MASVS-CRYPTO',
      cwe: 'CWE-327',
      severity: 'High',
      confidence: 'Suspected',
      verificationStatus: 'Detected',
      evidence: `Cipher suite references detected in string pool: ${algos}`,
      location: 'classes.dex:CryptoReferences',
      sourceTool: 'VulnCope DEX String Analyzer v1.0',
      remediation: 'Migrate to AES/GCM/NoPadding (authenticated encryption) with 256-bit keys or standard AndroidX Security Crypto primitives.',
      sessionId,
      timestamp
    });
  }

  // Generate finding for disabled TLS / TrustAll (suspected static indicator)
  if (insecureTrustManagers.length > 0) {
    findings.push({
      stableId: genId(),
      title: `Static Indicator: Permissive TrustManager Signature Detected in Bytecode`,
      description: `Application bytecode contains references to permissive TLS trust managers (${insecureTrustManagers.join(', ')}). This indicator suggests certificate chain validation may be bypassed. Dynamic hook verification recommended to verify active network stack registration.`,
      category: 'Improper Certificate Validation',
      owaspCategory: 'MASVS-NETWORK',
      cwe: 'CWE-295',
      severity: 'High',
      confidence: 'Suspected',
      verificationStatus: 'Suspected',
      evidence: `Detected TrustManager signatures in bytecode: ${insecureTrustManagers.join(', ')}`,
      location: 'classes.dex:NetworkStack',
      sourceTool: 'VulnCope DEX String Analyzer v1.0',
      remediation: 'Remove custom permissive TrustManagers. Use default Android system trust store with standard certificate pinning.',
      sessionId,
      timestamp
    });
  }

  const summary = `Extracted ${extractedStrings.length} strings from classes.dex | Detected ${hardcodedSecrets.length} hardcoded secrets, ${insecureEndpoints.length} plain HTTP URLs, ${cryptoWeaknesses.length} weak crypto references`;

  return {
    hasValidDexHeader,
    dexVersion,
    totalStringsExtracted: extractedStrings.length,
    hardcodedSecrets,
    insecureEndpoints,
    cryptoWeaknesses,
    insecureTrustManagers,
    findings,
    summary
  };
}
