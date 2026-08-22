import { AttackSurfaceNode, AttackSurfaceEdge } from "@/types";

export const initialAttackSurfaceNodes: AttackSurfaceNode[] = [
  // Root Application
  {
    id: "node-app",
    name: "Acme Banking Mobile (v4.2.1)",
    type: "Application",
    risk: "High",
    exposure: "Exported / Public",
    details: "Primary Android package `com.acme.banking.mobile`. Attack surface index 68/100 with 14 exposed IPC interfaces.",
    relatedFindingsCount: 7,
    evidence: "Package targetSdkVersion: 34, compileSdkVersion: 34. Total classes: 1,428, Exported components: 8.",
    category: "component"
  },

  // Components - Activities
  {
    id: "node-act-1",
    name: "TransactionConfirmationActivity",
    type: "Activity",
    risk: "Critical",
    exposure: "Exported / Public",
    details: "Handles deep link transfers and final payment authorizations. Declared with `android:exported=\"true\"` and no signature permission.",
    relatedFindingsCount: 2,
    evidence: "Manifest declared action: `com.acme.banking.action.CONFIRM_TRANSFER`.",
    codeSnippet: `<activity android:name=".ui.TransactionConfirmationActivity"
          android:exported="true">
    <intent-filter>
        <action android:name="com.acme.banking.action.CONFIRM_TRANSFER" />
    </intent-filter>
</activity>`,
    category: "component",
    parentId: "node-app"
  },
  {
    id: "node-act-2",
    name: "SupportWebActivity (WebView)",
    type: "WebView",
    risk: "High",
    exposure: "Internal / Protected",
    details: "In-app support desk rendering remote web URLs with `addJavascriptInterface` enabled.",
    relatedFindingsCount: 1,
    evidence: "WebView settings allow JavaScript execution from dynamic remote intents.",
    codeSnippet: `webView.settings.javaScriptEnabled = true
webView.addJavascriptInterface(NativeBridge(this), "AcmeAndroidBridge")`,
    category: "component",
    parentId: "node-app"
  },
  {
    id: "node-act-3",
    name: "AuthLoginActivity",
    type: "Activity",
    risk: "Safe",
    exposure: "Exported / Public",
    details: "Main launcher activity receiving biometric authentication intents.",
    relatedFindingsCount: 0,
    evidence: "Standard android.intent.action.MAIN / android.intent.category.LAUNCHER.",
    category: "component",
    parentId: "node-app"
  },

  // Services & Content Providers
  {
    id: "node-srv-1",
    name: "TelemetrySyncService",
    type: "Service",
    risk: "Medium",
    exposure: "Exported / Public",
    details: "Background service synchronizing telemetry and diagnostic logs.",
    relatedFindingsCount: 1,
    evidence: "Exported service without permission requirement, accepts custom Parcelable commands.",
    category: "component",
    parentId: "node-app"
  },
  {
    id: "node-prov-1",
    name: "CustomerDocProvider",
    type: "Content Provider",
    risk: "High",
    exposure: "Exported / Public",
    details: "FileProvider sharing KYC document attachments with PDF viewers.",
    relatedFindingsCount: 1,
    evidence: "GrantUriPermissions flag enabled; root path /data/user/0/ shared.",
    category: "component",
    parentId: "node-app"
  },
  {
    id: "node-recv-1",
    name: "PushNotificationReceiver",
    type: "Broadcast Receiver",
    risk: "Low",
    exposure: "Protected by Signature",
    details: "FCM Push notification receiver validating cloud messaging signatures.",
    relatedFindingsCount: 0,
    evidence: "Protected by `com.google.android.c2dm.permission.SEND`.",
    category: "component",
    parentId: "node-app"
  },

  // Deep Links
  {
    id: "node-link-1",
    name: "acme://transfer/quick",
    type: "Deep Link",
    risk: "Critical",
    exposure: "Exported / Public",
    details: "Custom scheme URI triggering instantaneous peer-to-peer balance transfer without CSRF token.",
    relatedFindingsCount: 1,
    evidence: "Host: transfer, PathPrefix: /quick, Scheme: acme.",
    category: "component",
    parentId: "node-act-1"
  },

  // Permissions
  {
    id: "node-perm-1",
    name: "android.permission.USE_BIOMETRIC",
    type: "Permission",
    risk: "Safe",
    exposure: "Dynamic / Runtime",
    details: "Allows usage of BiometricPrompt for Face/Fingerprint authentication.",
    relatedFindingsCount: 0,
    evidence: "Declared in AndroidManifest.xml: `<uses-permission android:name=\"android.permission.USE_BIOMETRIC\"/>`",
    category: "permission",
    parentId: "node-app"
  },
  {
    id: "node-perm-2",
    name: "android.permission.READ_EXTERNAL_STORAGE",
    type: "Permission",
    risk: "High",
    exposure: "Dynamic / Runtime",
    details: "Legacy broad storage access permission granting access to shared SDCard documents.",
    relatedFindingsCount: 1,
    evidence: "Declared in Manifest. Should be migrated to Storage Access Framework (SAF).",
    category: "permission",
    parentId: "node-app"
  },

  // Network Endpoints
  {
    id: "node-net-1",
    name: "api.acme-banking.com:443",
    type: "Network Endpoint",
    risk: "Safe",
    exposure: "Exported / Public",
    details: "Production TLS 1.3 REST API gateway. Certificate pinning enabled via SPKI hashes.",
    relatedFindingsCount: 0,
    evidence: "Resolved to AWS CloudFront CDN. HSTS enforced with max-age=31536000.",
    category: "network",
    parentId: "node-app"
  },
  {
    id: "node-net-2",
    name: "staging-api.acme-banking.com:80",
    type: "Network Endpoint",
    risk: "Critical",
    exposure: "Exported / Public",
    details: "Unencrypted cleartext HTTP traffic allowed in NetworkSecurityConfig.",
    relatedFindingsCount: 1,
    evidence: "Explicit domain exemption: `cleartextTrafficPermitted=\"true\"`.",
    category: "network",
    parentId: "node-app"
  },

  // Cryptographic APIs & Local Storage
  {
    id: "node-crypto-1",
    name: "AuthManager.AES_KEY_STRING",
    type: "Cryptographic API",
    risk: "Critical",
    exposure: "Internal / Protected",
    details: "Hardcoded 256-bit symmetric key used in Cipher.getInstance(\"AES/CBC/PKCS5Padding\").",
    relatedFindingsCount: 1,
    evidence: "Bytecode constant in class `com.acme.banking.auth.AuthManager`.",
    codeSnippet: `private const val AES_KEY_STRING = "4c7865396d3238613437623930313233"`,
    category: "crypto",
    parentId: "node-app"
  },
  {
    id: "node-storage-1",
    name: "user_sessions.db (SQLite)",
    type: "Local Storage",
    risk: "High",
    exposure: "Internal / Protected",
    details: "Unencrypted Room database storing session bearer tokens in private sandbox.",
    relatedFindingsCount: 1,
    evidence: "File path: `/data/data/com.acme.banking.mobile/databases/user_sessions.db`",
    category: "storage",
    parentId: "node-app"
  },

  // Third-Party SDKs
  {
    id: "node-sdk-1",
    name: "OkHttp 3.12.0 (Vulnerable)",
    type: "Third-Party SDK",
    risk: "High",
    exposure: "Internal / Protected",
    details: "Outdated HTTP client vulnerable to CVE-2021-0341 hostname validation bypass.",
    relatedFindingsCount: 1,
    evidence: "Gradle dependency `com.squareup.okhttp3:okhttp:3.12.0`.",
    category: "sdk",
    parentId: "node-app"
  },
  {
    id: "node-sdk-2",
    name: "Firebase Analytics 21.5.0",
    type: "Third-Party SDK",
    risk: "Safe",
    exposure: "Internal / Protected",
    details: "Google mobile telemetry SDK with advertising ID collection disabled.",
    relatedFindingsCount: 0,
    evidence: "Up to date Google Play Services library.",
    category: "sdk",
    parentId: "node-app"
  }
];

export const initialAttackSurfaceEdges: AttackSurfaceEdge[] = [
  { id: "e1", source: "node-app", target: "node-act-1", relation: "declares activity" },
  { id: "e2", source: "node-app", target: "node-act-2", relation: "embeds webview" },
  { id: "e3", source: "node-app", target: "node-act-3", relation: "main entry" },
  { id: "e4", source: "node-app", target: "node-srv-1", relation: "hosts background service" },
  { id: "e5", source: "node-app", target: "node-prov-1", relation: "exposes file provider" },
  { id: "e6", source: "node-app", target: "node-recv-1", relation: "registers receiver" },
  { id: "e7", source: "node-act-1", target: "node-link-1", relation: "handles custom URI" },
  { id: "e8", source: "node-app", target: "node-perm-2", relation: "requests storage permission" },
  { id: "e9", source: "node-app", target: "node-net-2", relation: "dispatches HTTP request" },
  { id: "e10", source: "node-app", target: "node-crypto-1", relation: "invokes static cipher" },
  { id: "e11", source: "node-app", target: "node-storage-1", relation: "writes plaintext record" },
  { id: "e12", source: "node-app", target: "node-sdk-1", relation: "links third-party library" }
];
