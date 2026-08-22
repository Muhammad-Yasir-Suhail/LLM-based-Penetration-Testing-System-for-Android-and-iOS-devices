import { CorrelatedIssue } from "@/types";

export const initialCorrelatedIssues: CorrelatedIssue[] = [
  {
    id: "corr-1",
    title: "Hardcoded Cryptographic Master Key in Application Bytecode",
    severity: "Critical",
    confidence: 98,
    affectedComponent: "com.acme.banking.auth.AuthManager",
    applicationName: "Acme Banking Mobile",
    category: "Hardcoded Secrets / Cryptography",
    description: "SentinelX correlation engine identified identical static cryptographic constants reported independently across three security analyzers (MobSF regex pattern scan, JADX AST decompiler, and SentinelX Static Analyzer). These 3 separate tool findings represent one singular systemic vulnerability.",
    unifiedRemediation: "Eradicate the static AES constant `4c7865396d3238613437623930313233` from source control. Generate dynamic 256-bit AES-GCM keys on first app launch using the hardware-backed Android KeyStore provider with biometric user authentication requirements.",
    evidenceTree: [
      {
        engine: "MobSF",
        findingTitle: "High Entropy Hardcoded String Detected",
        rawEvidence: `Rule ID: mobsf_crypto_entropy_hex
Pattern: [0-9a-fA-F]{32}
Matched String: "4c7865396d3238613437623930313233" (Entropy: 3.92)
File: smali/com/acme/banking/auth/AuthManager.smali`,
        confidence: 88,
        filePath: "app/src/main/java/com/acme/banking/auth/AuthManager.kt",
        line: 48
      },
      {
        engine: "JADX",
        findingTitle: "SecretKeySpec Initialized with Static Byte Array",
        rawEvidence: `Decompiled Line 50:
SecretKeySpec secretKey = new SecretKeySpec("4c7865396d3238613437623930313233".getBytes(), "AES");
Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
cipher.init(1, secretKey);`,
        confidence: 96,
        filePath: "app/src/main/java/com/acme/banking/auth/AuthManager.kt",
        line: 50
      },
      {
        engine: "SentinelX Static Core",
        findingTitle: "CWE-798 Hardcoded Encryption Key in Auth Flow",
        rawEvidence: `AST DataFlow Analysis:
Source: Constant Literal "4c786539..."
Sink: javax.crypto.spec.SecretKeySpec.<init>(byte[], String)
Reachability Path: AuthManager.kt:48 -> AuthManager.kt:50 -> UserDatabaseHelper.kt:34`,
        confidence: 99,
        filePath: "app/src/main/java/com/acme/banking/auth/AuthManager.kt",
        line: 48
      },
      {
        engine: "Frida",
        findingTitle: "Runtime Dynamic Key Interception",
        rawEvidence: `Hook: javax.crypto.Cipher.init(int opmode, java.security.Key key)
Captured Key Algorithm: AES
Captured Key Hex: 4c7865396d3238613437623930313233
Invoking Thread: [main] at com.acme.banking.auth.AuthManager.getCipher()`,
        confidence: 100,
        filePath: "Runtime Memory Hook: TEE Emulation",
        line: 52
      }
    ]
  },
  {
    id: "corr-2",
    title: "Unprotected Inter-Process Communication & Deep Link Injection",
    severity: "High",
    confidence: 94,
    affectedComponent: "com.acme.banking.ui.TransactionConfirmationActivity",
    applicationName: "Acme Banking Mobile",
    category: "Platform Configuration / IPC",
    description: "Apktool manifest extraction and Frida dynamic intent fuzzing both discovered that `TransactionConfirmationActivity` is exposed to all applications on the device without requiring signature permissions, allowing malicious background apps to simulate fund transfers.",
    unifiedRemediation: "Set `android:exported=\"false\"` in `AndroidManifest.xml` or guard the activity with a custom permission `com.acme.banking.permission.INTERNAL_TRANSACT` having `protectionLevel=\"signature\"`.",
    evidenceTree: [
      {
        engine: "Apktool",
        findingTitle: "AndroidManifest Exported Activity Flag",
        rawEvidence: `<activity android:name="com.acme.banking.ui.TransactionConfirmationActivity" android:exported="true">
    <intent-filter>
        <action android:name="com.acme.banking.action.CONFIRM_TRANSFER" />
        <category android:name="android.intent.category.DEFAULT" />
    </intent-filter>
</activity>`,
        confidence: 95,
        filePath: "app/src/main/AndroidManifest.xml",
        line: 74
      },
      {
        engine: "Frida",
        findingTitle: "IPC Intent Fuzzing Successful",
        rawEvidence: `Executed: adb shell am start -n com.acme.banking.mobile/.ui.TransactionConfirmationActivity -e amount "500.00" -e recipient "attacker_iban"
Result: Activity spawned in foreground without prompting biometric challenge.`,
        confidence: 92,
        filePath: "Dynamic Runtime Probe",
        line: 1
      },
      {
        engine: "SentinelX Static Core",
        findingTitle: "Intent Extra Extraction without Sanitization",
        rawEvidence: `Method: onCreate(savedInstanceState: Bundle?)
Data Flow: getIntent().getStringExtra("amount") parsed directly into BigInteger without token verification.`,
        confidence: 95,
        filePath: "app/src/main/java/com/acme/banking/ui/TransactionConfirmationActivity.kt",
        line: 32
      }
    ]
  },
  {
    id: "corr-3",
    title: "Live Production Payment Gateway API Secret in Merchant App",
    severity: "Critical",
    confidence: 99,
    affectedComponent: "com.shopsphere.payment.StripeConfig",
    applicationName: "ShopSphere Buyer APK",
    category: "Hardcoded Secrets",
    description: "JADX decompilation and MobSF string matching both flagged a live payment processing secret token embedded in `StripeConfig.kt`. Live keys allow complete administrative control of the merchant account.",
    unifiedRemediation: "Immediately roll the compromised Stripe API key in the developer console. Replace all client-side private API key references with ephemeral `client_secret` tokens generated on the merchant backend server.",
    evidenceTree: [
      {
        engine: "MobSF",
        findingTitle: "Stripe Live Secret Key Regex Match",
        rawEvidence: `Pattern: sk_live_[0-9a-zA-Z]{24}
Matched Value: "sk_live_51Mz0...99xY"
Location: com.shopsphere.payment.StripeConfig`,
        confidence: 99,
        filePath: "app/src/main/java/com/shopsphere/payment/StripeConfig.kt",
        line: 19
      },
      {
        engine: "JADX",
        findingTitle: "Decompiled Static Merchant Config",
        rawEvidence: `public final class StripeConfig {
    public static final String STRIPE_KEY = "sk_live_51Mz0...99xY";
}`,
        confidence: 100,
        filePath: "app/src/main/java/com/shopsphere/payment/StripeConfig.kt",
        line: 19
      }
    ]
  }
];
