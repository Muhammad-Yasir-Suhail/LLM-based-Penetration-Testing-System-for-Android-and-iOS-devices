import { Finding, FindingSeverity } from "@/types";

export interface CopilotResponse {
  message: string;
  cards?: {
    title: string;
    severity?: FindingSeverity;
    cwe?: string;
    impact: string;
    recommendedAction: string;
    codeSnippet?: string;
  }[];
  quickActions?: string[];
  suggestedFollowups: string[];
}

export function generateCopilotResponse(query: string, currentFindings: Finding[]): CopilotResponse {
  const q = query.toLowerCase();

  if (q.includes('critical') || q.includes('urgent') || q.includes('fix first')) {
    const criticals = currentFindings.filter(f => f.severity === 'Critical');
    return {
      message: `I analyzed your active workspace findings. You currently have **${criticals.length} Critical vulnerability issues** that expose application secrets and authentication tokens. These must be remediated before production rollout:`,
      cards: criticals.slice(0, 3).map(f => ({
        title: f.title,
        severity: f.severity,
        cwe: f.cwe,
        impact: f.impact,
        recommendedAction: f.remediation,
        codeSnippet: f.technicalEvidence,
      })),
      suggestedFollowups: [
        'Generate patch script for Hardcoded Secrets',
        'Explain CVSS vector for critical findings',
        'Which vulnerabilities are remotely exploitable?'
      ]
    };
  }

  if (q.includes('cwe-926') || q.includes('exported activity') || q.includes('component')) {
    return {
      message: `### Deep Dive: CWE-926 (Improper Export of Android Application Components)

**CWE-926** occurs when an Android component (\`<activity>\`, \`<service>\`, or \`<receiver>\`) is declared with \`android:exported="true"\` without requiring custom permissions.

#### Exploitation Mechanism:
1. Malicious apps installed on the same device can trigger \`startActivity(intent)\` directly targeting the unexported activity.
2. If the exported activity handles deep links or internal account states without authentication checks, an attacker can bypass login gates and trigger unauthorized transactions.`,
      cards: [
        {
          title: 'Remediation Pattern for Android Components',
          severity: 'High',
          cwe: 'CWE-926',
          impact: 'Unauthenticated intent invocation, UI redressing, sensitive data leakage via extras.',
          recommendedAction: 'Set android:exported="false" for internal activities, or define android:permission="com.acme.banking.permission.INTERNAL_ACCESS" with protectionLevel="signature".',
          codeSnippet: `<!-- VULNERABLE -->
<activity android:name=".ui.TransactionConfirmationActivity"
          android:exported="true" />

<!-- SECURE REMEDIATION -->
<activity android:name=".ui.TransactionConfirmationActivity"
          android:exported="false" />`
        }
      ],
      suggestedFollowups: [
        'How does MobSF detect exported components?',
        'Can Frida hook this exported activity?',
        'Generate a verification unit test'
      ]
    };
  }

  if (q.includes('remediation') || q.includes('plan') || q.includes('roadmap')) {
    return {
      message: `### Recommended 3-Phase Security Remediation Plan

Based on the correlated findings across your Android and iOS applications, here is the prioritized mitigation roadmap:

1. **Sprint 1 (Immediate / P0 - 48 hours)**
   - Remove hardcoded cryptographic AES keys and JWT signing secrets from \`AuthManager.kt\`. Migrate to **Android KeyStore** / **iOS Keychain**.
   - Seal exported Android components lacking signature permissions in \`AndroidManifest.xml\`.

2. **Sprint 2 (High Priority - 1 Week)**
   - Disable cleartext HTTP traffic across all network security configs.
   - Enforce Certificate Pinning (TrustKit / NetworkSecurityConfig) for \`api.acme-banking.com\`.

3. **Sprint 3 (Medium Priority - 2 Weeks)**
   - Disable \`setJavaScriptEnabled(true)\` in WebViews handling external untrusted URLs.
   - Strip debuggable flags and sensitive PII logging from release builds.`,
      cards: [
        {
          title: 'Immediate Hotfix: Android KeyStore Secret Migration',
          severity: 'Critical',
          cwe: 'CWE-798',
          impact: 'Total compromise of user authentication tokens if decompiled via JADX.',
          recommendedAction: 'Instantiate AndroidKeyStore provider and generate AES-GCM 256 keys hardware-backed by TEE/SE.'
        }
      ],
      suggestedFollowups: [
        'Export this plan as PDF Executive Report',
        'Assign open findings to mobile team leads',
        'Simulate verification scan on v4.2.2'
      ]
    };
  }

  if (q.includes('score') || q.includes('posture') || q.includes('how secure')) {
    return {
      message: `### Workspace Security Posture Analysis

SentinelX evaluates your overall workspace security score using multi-engine weighted risk modeling:

- **Current Security Score**: **78 / 100 (Good)** (+8.4% improvement over 30 days)
- **Attack Surface Index**: 64% bounded exposure
- **Key Risk Drivers**:
  - 4 Critical issues across **Acme Banking** & **ShopSphere**
  - 17 High issues in TLS configuration & exported components
  - 3 Third-party dependencies with known CVEs (OkHttp 3.12, Alamofire 4.9)

*Remediating the 2 critical cryptographic findings will immediately raise your workspace score to 86/100 (Excellent).*`,
      cards: [
        {
          title: 'Score Projection & Optimization',
          impact: 'Current score: 78/100. Target score post-Sprint 1: 86/100.',
          recommendedAction: 'Resolve F-1042 (Hardcoded AES Key) and F-1043 (Exported Activity) to gain +8 points instantly.'
        }
      ],
      suggestedFollowups: [
        'Show finding correlation between MobSF and JADX',
        'Which applications have lowest scores?',
        'Show attack surface relationship map'
      ]
    };
  }

  if (q.includes('exploitable') || q.includes('attack vector') || q.includes('dast')) {
    return {
      message: `### Exploitability Assessment (SAST + DAST Correlation)

SentinelX correlated static AST decompilation with dynamic Frida runtime probes to identify **2 actively exploitable attack vectors**:

1. **Unprotected Deep Link Hijacking (\`acme://transfer\`)**:
   - Exploitable by any malicious app on device via \`ACTION_VIEW\` intents.
   - Attackers can pre-fill destination IBAN and amount parameters without user interaction confirmation.

2. **Plaintext SQLite Token Storage**:
   - On rooted or backup-enabled devices, \`user_session.db\` is extractable via \`adb backup\`.
   - Exposed token gives 30-day unauthorized API access.`,
      cards: [
        {
          title: 'Deep Link Hijacking POC',
          severity: 'Critical',
          cwe: 'CWE-939',
          impact: 'Unauthorized fund transfer initiation via inter-process communication.',
          recommendedAction: 'Validate intent calling package identity and require biometric re-authentication prior to state change.'
        }
      ],
      suggestedFollowups: [
        'Show Deep Link nodes in Attack Surface Graph',
        'How to implement biometric step-up authentication',
        'Explain OWASP MASVS-PLATFORM-1'
      ]
    };
  }

  // Default response with high contextual security intelligence
  return {
    message: `### SentinelX Security Copilot Analysis

I analyzed your query across all 8 mobile projects, 15 applications, and 50+ correlated findings in the workspace.

Here is what you need to know:
- **Mobile Architecture**: Cross-platform Android (Kotlin) and iOS (Swift) applications are mapped against **OWASP MASVS v2.0** and **CWE Top 25**.
- **Engine Correlation**: Findings from MobSF, JADX, Apktool, and Frida have been normalized and deduplicated.
- **Actionable Step**: Review the **Attack Surface Graph** or **Findings Correlation** tabs for interactive multi-engine evidence trees.`,
    cards: [
      {
        title: 'Top Recommended Security Action',
        severity: 'High',
        cwe: 'OWASP MASVS-STORAGE-1',
        impact: 'Sensitive configuration parameters and authentication tokens at risk of extraction.',
        recommendedAction: 'Enforce hardware-backed encryption for all local mobile datastores and databases.'
      }
    ],
    suggestedFollowups: [
      'Analyze critical findings in Acme Banking',
      'Explain CWE-926 in simple words',
      'Generate a remediation plan',
      'Summarize this application\'s security posture'
    ]
  };
}
