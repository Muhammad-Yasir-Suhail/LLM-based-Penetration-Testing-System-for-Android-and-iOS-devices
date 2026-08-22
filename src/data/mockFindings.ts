import { Finding } from "@/types";

export const initialFindings: Finding[] = [
  {
    id: "f-101",
    findingNumber: "F-1042",
    title: "Hardcoded Cryptographic AES Master Key in Decompiled Source",
    severity: "Critical",
    status: "Open",
    applicationId: "app-1",
    applicationName: "Acme Banking Mobile",
    projectId: "proj-1",
    projectName: "Acme Banking",
    platform: "Android",
    category: "Hardcoded Secrets",
    cwe: "CWE-798",
    cvss: 8.8,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N",
    owaspCategory: "MASVS-CRYPTO",
    confidence: 98,
    detectedAt: "Today, 10:42 AM",
    assignedTo: "Alex Vance",
    assignedAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    affectedComponent: "com.acme.banking.auth.AuthManager",
    filePath: "app/src/main/java/com/acme/banking/auth/AuthManager.kt",
    lineNumber: 48,
    description: "A hardcoded 256-bit AES secret key constant was extracted in plaintext from the decompiled Dex/bytecode. This static key is utilized by the local token encryption routines, allowing any attacker who decompiles the APK using JADX to decrypt offline token caches.",
    impact: "Complete bypass of local encryption. Attackers can decrypt cached customer session credentials, bearer tokens, and account numbers stored in the SQLite database.",
    technicalEvidence: `private const val AES_KEY_STRING = "4c7865396d3238613437623930313233" // 256-bit Hex Key
fun getCipher(): Cipher {
    val secretKey = SecretKeySpec(AES_KEY_STRING.toByteArray(), "AES")
    val cipher = Cipher.getInstance("AES/CBC/PKCS5Padding")
    cipher.init(Cipher.ENCRYPT_MODE, secretKey, IvParameterSpec(ByteArray(16)))
    return cipher
}`,
    remediation: "Remove the static secret key string. Utilize the Android Keystore system with KeyGenParameterSpec to generate and store hardware-backed keys inside the TEE/StrongBox.",
    remediationDiff: {
      original: `// VULNERABLE: Hardcoded symmetric key
private const val AES_KEY_STRING = "4c7865396d3238613437623930313233"
val secretKey = SecretKeySpec(AES_KEY_STRING.toByteArray(), "AES")`,
      suggested: `// SECURE: Android Keystore Provider
val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
if (!keyStore.containsAlias("AcmeMasterKey")) {
    val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
    keyGenerator.init(
        KeyGenParameterSpec.Builder("AcmeMasterKey", KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setUserAuthenticationRequired(true)
            .build()
    )
    keyGenerator.generateKey()
}`
    },
    references: [
      { title: "OWASP MASVS-CRYPTO-1: Key Management", url: "https://mas.owasp.org/MASVS/04-MASVS-CRYPTO/" },
      { title: "CWE-798: Use of Hardcoded Credentials", url: "https://cwe.mitre.org/data/definitions/798.html" },
      { title: "Android Developers - Security with Keystore", url: "https://developer.android.com/privacy-and-security/keystore" }
    ],
    detectedBy: ["MobSF", "JADX", "SentinelX Static Core"],
    correlatedIssueId: "corr-1",
    exploitability: "Proof of Concept Available"
  },
  {
    id: "f-102",
    findingNumber: "F-1043",
    title: "Exported Activity Without Required Permission (CWE-926)",
    severity: "High",
    status: "Open",
    applicationId: "app-1",
    applicationName: "Acme Banking Mobile",
    projectId: "proj-1",
    projectName: "Acme Banking",
    platform: "Android",
    category: "Platform Configuration",
    cwe: "CWE-926",
    cvss: 7.5,
    cvssVector: "CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N",
    owaspCategory: "MASVS-PLATFORM",
    confidence: 94,
    detectedAt: "Today, 10:42 AM",
    assignedTo: "Sarah Jenkins",
    assignedAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
    affectedComponent: "com.acme.banking.ui.TransactionConfirmationActivity",
    filePath: "app/src/main/AndroidManifest.xml",
    lineNumber: 74,
    description: "The AndroidManifest.xml declares `TransactionConfirmationActivity` with `android:exported=\"true\"` but omits any enclosing permission restrictions. Third-party applications installed on the victim's device can dispatch direct implicit or explicit Intents to instantiate this activity.",
    impact: "Unauthorized invocation allows co-located malicious apps to trigger transaction confirmation flows or steal intent extras containing account details.",
    technicalEvidence: `<activity
    android:name="com.acme.banking.ui.TransactionConfirmationActivity"
    android:exported="true"
    android:theme="@style/Theme.Acme.Dialog">
    <intent-filter>
        <action android:name="com.acme.banking.action.CONFIRM_TRANSFER" />
        <category android:name="android.intent.category.DEFAULT" />
    </intent-filter>
</activity>`,
    remediation: "Set `android:exported=\"false\"` if the activity is meant purely for internal workflow. If external invocation is required, define a custom permission with `protectionLevel=\"signature\"`.",
    remediationDiff: {
      original: `<activity
    android:name="com.acme.banking.ui.TransactionConfirmationActivity"
    android:exported="true">`,
      suggested: `<activity
    android:name="com.acme.banking.ui.TransactionConfirmationActivity"
    android:exported="false"
    android:permission="com.acme.banking.permission.INTERNAL_TRANSACT">`
    },
    references: [
      { title: "CWE-926: Improper Export of Android Application Components", url: "https://cwe.mitre.org/data/definitions/926.html" },
      { title: "OWASP MASVS-PLATFORM-1: Inter-Process Communication", url: "https://mas.owasp.org/MASVS/06-MASVS-PLATFORM/" }
    ],
    detectedBy: ["Apktool", "MobSF"],
    correlatedIssueId: "corr-2",
    exploitability: "High"
  },
  {
    id: "f-103",
    findingNumber: "F-1044",
    title: "Cleartext HTTP Traffic Permitted via Network Security Config",
    severity: "High",
    status: "Open",
    applicationId: "app-1",
    applicationName: "Acme Banking Mobile",
    projectId: "proj-1",
    projectName: "Acme Banking",
    platform: "Android",
    category: "Network Security",
    cwe: "CWE-319",
    cvss: 7.4,
    cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:H/I:H/A:N",
    owaspCategory: "MASVS-NETWORK",
    confidence: 96,
    detectedAt: "Today, 10:42 AM",
    assignedTo: "David Kim",
    assignedAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    affectedComponent: "res/xml/network_security_config.xml",
    filePath: "app/src/main/res/xml/network_security_config.xml",
    lineNumber: 8,
    description: "The application's network security configuration allows unencrypted HTTP traffic to specific backend subdomains (`staging-api.acme-banking.com` and `telemetry.internal.net`), enabling Man-in-the-Middle (MitM) eavesdropping.",
    impact: "Network attackers on untrusted Wi-Fi can intercept and modify payload responses, inject malicious scripts, or capture authentication tokens.",
    technicalEvidence: `<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">staging-api.acme-banking.com</domain>
        <domain includeSubdomains="false">telemetry.internal.net</domain>
    </domain-config>
</network-security-config>`,
    remediation: "Set `cleartextTrafficPermitted=\"false\"` globally and enforce TLS 1.3 with Certificate Transparency pinning on all endpoints.",
    remediationDiff: {
      original: `<domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">staging-api.acme-banking.com</domain>
</domain-config>`,
      suggested: `<base-config cleartextTrafficPermitted="false">
    <trust-anchors>
        <certificates src="system" />
    </trust-anchors>
</base-config>`
    },
    references: [
      { title: "CWE-319: Cleartext Transmission of Sensitive Information", url: "https://cwe.mitre.org/data/definitions/319.html" },
      { title: "OWASP MASVS-NETWORK-1: TLS Best Practices", url: "https://mas.owasp.org/MASVS/05-MASVS-NETWORK/" }
    ],
    detectedBy: ["MobSF", "Burp Suite"],
    exploitability: "High"
  },
  {
    id: "f-104",
    findingNumber: "F-1045",
    title: "Unrestricted JavaScript Interface Enabled on Remote WebView",
    severity: "High",
    status: "Open",
    applicationId: "app-1",
    applicationName: "Acme Banking Mobile",
    projectId: "proj-1",
    projectName: "Acme Banking",
    platform: "Android",
    category: "Code Quality",
    cwe: "CWE-749",
    cvss: 7.2,
    cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:H/I:H/A:N",
    owaspCategory: "MASVS-CODE",
    confidence: 91,
    detectedAt: "Today, 10:42 AM",
    assignedTo: "Marcus Chen",
    assignedAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    affectedComponent: "com.acme.banking.support.SupportWebActivity",
    filePath: "app/src/main/java/com/acme/banking/support/SupportWebActivity.kt",
    lineNumber: 62,
    description: "The support WebView enables JavaScript execution and attaches a native object via `addJavascriptInterface`. The WebView loads dynamic remote help URLs without strict origin validation.",
    impact: "Remote code execution or native bridge hijacking if the remote help desk server is compromised or loaded over an unpinned connection.",
    technicalEvidence: `val webView = findViewById<WebView>(R.id.support_webview)
webView.settings.javaScriptEnabled = true
webView.addJavascriptInterface(NativeBridge(this), "AcmeAndroidBridge")
webView.loadUrl(intent.getStringExtra("SUPPORT_URL") ?: "https://help.acme.com")`,
    remediation: "Validate loaded URLs strictly against a trusted whitelist. Restrict bridge methods with `@JavascriptInterface` and avoid exposing privileged native functions.",
    remediationDiff: {
      original: `webView.settings.javaScriptEnabled = true
webView.addJavascriptInterface(NativeBridge(this), "AcmeAndroidBridge")
webView.loadUrl(intent.getStringExtra("SUPPORT_URL"))`,
      suggested: `val targetUrl = intent.getStringExtra("SUPPORT_URL")
if (targetUrl != null && targetUrl.startsWith("https://help.acme.com/verified/")) {
    webView.settings.javaScriptEnabled = false
    webView.loadUrl(targetUrl)
}`
    },
    references: [
      { title: "CWE-749: Exposed Hazardous Method with WebView", url: "https://cwe.mitre.org/data/definitions/749.html" }
    ],
    detectedBy: ["MobSF", "JADX"],
    exploitability: "Medium"
  },
  {
    id: "f-105",
    findingNumber: "F-1046",
    title: "Plaintext User Session & Auth Tokens in SQLite Database",
    severity: "High",
    status: "Open",
    applicationId: "app-1",
    applicationName: "Acme Banking Mobile",
    projectId: "proj-1",
    projectName: "Acme Banking",
    platform: "Android",
    category: "Insecure Data Storage",
    cwe: "CWE-312",
    cvss: 7.1,
    cvssVector: "CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N",
    owaspCategory: "MASVS-STORAGE",
    confidence: 95,
    detectedAt: "Today, 10:42 AM",
    assignedTo: "Elena Rostova",
    assignedAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80",
    affectedComponent: "com.acme.banking.data.UserDatabase",
    filePath: "app/src/main/java/com/acme/banking/data/UserDatabaseHelper.kt",
    lineNumber: 31,
    description: "The Room SQLite database file `user_sessions.db` is stored unencrypted in `/data/data/com.acme.banking.mobile/databases/`. It stores user email addresses, account balances, and unexpired refresh tokens.",
    impact: "Physical access, adb backups, or malicious apps on rooted devices can extract sensitive credentials.",
    technicalEvidence: `val db = Room.databaseBuilder(
    context.applicationContext,
    UserDatabase::class.java, "user_sessions.db"
).build()`,
    remediation: "Use SQLCipher or AndroidX Room Encrypted SupportFactory with hardware-backed Keystore keys.",
    remediationDiff: {
      original: `val db = Room.databaseBuilder(context, UserDatabase::class.java, "user_sessions.db").build()`,
      suggested: `val passphrase = KeystoreManager.getOrCreateDatabaseKey()
val factory = SupportFactory(passphrase)
val db = Room.databaseBuilder(context, UserDatabase::class.java, "user_sessions_encrypted.db")
    .openHelperFactory(factory)
    .build()`
    },
    references: [
      { title: "OWASP MASVS-STORAGE-1: Local Storage Encryption", url: "https://mas.owasp.org/MASVS/02-MASVS-STORAGE/" }
    ],
    detectedBy: ["MobSF", "Frida"],
    exploitability: "Medium"
  },
  {
    id: "f-106",
    findingNumber: "F-1047",
    title: "Application Allows ADB Backup (android:allowBackup=true)",
    severity: "Medium",
    status: "Open",
    applicationId: "app-1",
    applicationName: "Acme Banking Mobile",
    projectId: "proj-1",
    projectName: "Acme Banking",
    platform: "Android",
    category: "Platform Configuration",
    cwe: "CWE-200",
    cvss: 5.5,
    cvssVector: "CVSS:3.1/AV:P/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N",
    owaspCategory: "MASVS-PLATFORM",
    confidence: 99,
    detectedAt: "Today, 10:42 AM",
    assignedTo: "Liam O'Connor",
    assignedAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
    affectedComponent: "app/src/main/AndroidManifest.xml",
    filePath: "app/src/main/AndroidManifest.xml",
    lineNumber: 14,
    description: "The `<application>` tag specifies `android:allowBackup=\"true\"`. Any user with physical USB debugging enabled can clone private app storage using `adb backup -f backup.ab com.acme.banking.mobile`.",
    impact: "Data theft via USB debugging without requiring device rooting.",
    technicalEvidence: `<application
    android:allowBackup="true"
    android:label="@string/app_name"
    android:icon="@mipmap/ic_launcher">`,
    remediation: "Set `android:allowBackup=\"false\"` in AndroidManifest.xml for financial applications.",
    remediationDiff: {
      original: `<application android:allowBackup="true"`,
      suggested: `<application android:allowBackup="false"`
    },
    references: [
      { title: "Android Developers: Controlling Backup", url: "https://developer.android.com/guide/topics/data/autobackup" }
    ],
    detectedBy: ["Apktool", "MobSF"],
    exploitability: "Medium"
  },
  {
    id: "f-107",
    findingNumber: "F-1048",
    title: "Sensitive Customer PII Emitted to Android Logcat",
    severity: "Low",
    status: "Open",
    applicationId: "app-1",
    applicationName: "Acme Banking Mobile",
    projectId: "proj-1",
    projectName: "Acme Banking",
    platform: "Android",
    category: "Privacy",
    cwe: "CWE-532",
    cvss: 3.8,
    cvssVector: "CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N",
    owaspCategory: "MASVS-STORAGE",
    confidence: 92,
    detectedAt: "Today, 10:42 AM",
    assignedTo: "Aisha Patel",
    assignedAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
    affectedComponent: "com.acme.banking.net.HttpLoggingInterceptor",
    filePath: "app/src/main/java/com/acme/banking/net/ApiModule.kt",
    lineNumber: 88,
    description: "The application prints HTTP request headers including Authorization Bearer tokens and JSON bodies to Logcat via `Log.d(\"API_RESPONSE\", body)`.",
    impact: "Other apps with READ_LOGS permission on older Android versions or crash reporters may harvest tokens.",
    technicalEvidence: `Log.d("ACME_NET", "Response from /v2/transfer: " + response.body?.string())`,
    remediation: "Strip debug logs in release builds using ProGuard/R8 rules or Timber DebugTree configuration.",
    remediationDiff: {
      original: `Log.d("ACME_NET", "Response from /v2/transfer: " + response.body?.string())`,
      suggested: `if (BuildConfig.DEBUG) {
    Timber.tag("ACME_NET").d("Response: %s", response.code)
}`
    },
    references: [
      { title: "CWE-532: Insertion of Sensitive Information into Log File", url: "https://cwe.mitre.org/data/definitions/532.html" }
    ],
    detectedBy: ["MobSF", "SentinelX Static Core"],
    exploitability: "Low"
  },
  {
    id: "f-108",
    findingNumber: "F-1049",
    title: "Insecure KeyChain Item Sharing Without Access Control Constraints",
    severity: "High",
    status: "Open",
    applicationId: "app-2",
    applicationName: "Acme Banking iOS",
    projectId: "proj-1",
    projectName: "Acme Banking",
    platform: "iOS",
    category: "Insecure Data Storage",
    cwe: "CWE-311",
    cvss: 7.2,
    cvssVector: "CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N",
    owaspCategory: "MASVS-STORAGE",
    confidence: 96,
    detectedAt: "Yesterday, 2:10 PM",
    assignedTo: "Elena Rostova",
    assignedAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80",
    affectedComponent: "Services/KeyChainManager.swift",
    filePath: "AcmeBanking/Services/KeyChainManager.swift",
    lineNumber: 42,
    description: "iOS Keychain item `kSecAttrAccessibleAlways` is used to store user authentication tokens. This accessibility attribute allows items to be accessed while the device is locked.",
    impact: "Data accessible during device lock state or through forensic extractions.",
    technicalEvidence: `let query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrAccount as String: account,
    kSecValueData as String: data,
    kSecAttrAccessible as String: kSecAttrAccessibleAlways
]`,
    remediation: "Migrate to `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly` with `kSecAccessControlBiometryAny` constraints.",
    remediationDiff: {
      original: `kSecAttrAccessible as String: kSecAttrAccessibleAlways`,
      suggested: `kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`
    },
    references: [
      { title: "Apple Developer - Keychain Access Controls", url: "https://developer.apple.com/documentation/security/keychain_services" }
    ],
    detectedBy: ["MobSF", "SentinelX Static Core"],
    exploitability: "Medium"
  },
  {
    id: "f-109",
    findingNumber: "F-1050",
    title: "Missing Certificate Pinning on Critical Transaction Endpoints",
    severity: "High",
    status: "Open",
    applicationId: "app-2",
    applicationName: "Acme Banking iOS",
    projectId: "proj-1",
    projectName: "Acme Banking",
    platform: "iOS",
    category: "Network Security",
    cwe: "CWE-295",
    cvss: 7.4,
    cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:H/I:H/A:N",
    owaspCategory: "MASVS-NETWORK",
    confidence: 94,
    detectedAt: "Yesterday, 2:10 PM",
    assignedTo: "David Kim",
    assignedAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    affectedComponent: "Networking/NetworkClient.swift",
    filePath: "AcmeBanking/Networking/NetworkClient.swift",
    lineNumber: 78,
    description: "The URLSessionConfiguration relies on the default system trust store without Public Key Pinning (HPKP / TrustKit) for transaction endpoints.",
    impact: "Adversaries with malicious root CAs installed on device can intercept banking traffic.",
    technicalEvidence: `let session = URLSession(configuration: .default)`,
    remediation: "Implement SSL Pinning using TrustKit or URLSessionDelegate `didReceive challenge:` verifying SPKI hashes.",
    remediationDiff: {
      original: `let session = URLSession(configuration: .default)`,
      suggested: `let pinDelegate = PinnedSessionDelegate(pinnedHashes: ["BB87...="])
let session = URLSession(configuration: .ephemeral, delegate: pinDelegate, delegateQueue: nil)`
    },
    references: [
      { title: "OWASP MASVS-NETWORK-2: Certificate Pinning", url: "https://mas.owasp.org/MASVS/05-MASVS-NETWORK/" }
    ],
    detectedBy: ["Burp Suite", "MobSF"],
    exploitability: "High"
  },
  {
    id: "f-110",
    findingNumber: "F-1051",
    title: "Hardcoded Stripe Test & Live Secret API Key",
    severity: "Critical",
    status: "Open",
    applicationId: "app-3",
    applicationName: "ShopSphere Buyer APK",
    projectId: "proj-2",
    projectName: "ShopSphere",
    platform: "Android",
    category: "Hardcoded Secrets",
    cwe: "CWE-798",
    cvss: 9.1,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N",
    owaspCategory: "MASVS-STORAGE",
    confidence: 99,
    detectedAt: "Yesterday, 3:15 PM",
    assignedTo: "Marcus Chen",
    assignedAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    affectedComponent: "com.shopsphere.payment.StripeConfig",
    filePath: "app/src/main/java/com/shopsphere/payment/StripeConfig.kt",
    lineNumber: 19,
    description: "A live Stripe API Secret Key (`sk_live_51M...`) was found embedded in compiled Java bytecode. This key possesses merchant authorization privileges.",
    impact: "Attacker can initiate unauthorized merchant refund requests and export customer payment records.",
    technicalEvidence: `val STRIPE_KEY = "sk_live_51Mz0...99xY"`,
    remediation: "Revoke the exposed key immediately in the Stripe Dashboard. Perform payment intent tokenization via backend server endpoints only.",
    remediationDiff: {
      original: `val STRIPE_KEY = "sk_live_51Mz0...99xY"`,
      suggested: `// Client must only hold ephemeral client_secrets requested from backend
val clientSecret = backendApiService.createPaymentIntent(orderId).clientSecret`
    },
    references: [
      { title: "Stripe API Key Security Best Practices", url: "https://stripe.com/docs/keys" }
    ],
    detectedBy: ["MobSF", "JADX", "SentinelX Static Core"],
    correlatedIssueId: "corr-3",
    exploitability: "Proof of Concept Available"
  },
  {
    id: "f-111",
    findingNumber: "F-1052",
    title: "Vulnerable Third-Party Library OkHttp 3.12.0 (CVE-2021-0341)",
    severity: "High",
    status: "Open",
    applicationId: "app-3",
    applicationName: "ShopSphere Buyer APK",
    projectId: "proj-2",
    projectName: "ShopSphere",
    platform: "Android",
    category: "Dependencies",
    cwe: "CWE-295",
    cvss: 7.5,
    cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:N",
    owaspCategory: "MASVS-CODE",
    confidence: 98,
    detectedAt: "Yesterday, 3:15 PM",
    assignedTo: "Alex Vance",
    assignedAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    affectedComponent: "com.squareup.okhttp3:okhttp:3.12.0",
    filePath: "app/build.gradle",
    lineNumber: 52,
    description: "OkHttp 3.12.0 does not properly validate server hostnames if custom TrustManagers are registered, resulting in potential MitM certificate spoofing.",
    impact: "Remote attackers can forge TLS certificates on intercepted networks.",
    technicalEvidence: `implementation 'com.squareup.okhttp3:okhttp:3.12.0'`,
    remediation: "Upgrade OkHttp dependency to version `4.12.0` or higher.",
    remediationDiff: {
      original: `implementation 'com.squareup.okhttp3:okhttp:3.12.0'`,
      suggested: `implementation 'com.squareup.okhttp3:okhttp:4.12.0'`
    },
    references: [
      { title: "NVD - CVE-2021-0341 Detail", url: "https://nvd.nist.gov/vuln/detail/CVE-2021-0341" }
    ],
    detectedBy: ["MobSF", "SentinelX Static Core"],
    exploitability: "High"
  },
  {
    id: "f-112",
    findingNumber: "F-1053",
    title: "Unchecked Custom URL Scheme Handler (Deep Link Hijacking)",
    severity: "Critical",
    status: "Open",
    applicationId: "app-6",
    applicationName: "TransitGo Passenger",
    projectId: "proj-4",
    projectName: "TransitGo",
    platform: "Android",
    category: "Platform Configuration",
    cwe: "CWE-939",
    cvss: 8.2,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N",
    owaspCategory: "MASVS-PLATFORM",
    confidence: 93,
    detectedAt: "3 days ago",
    assignedTo: "David Kim",
    assignedAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    affectedComponent: "com.transitgo.rider.DeepLinkActivity",
    filePath: "app/src/main/java/com/transitgo/rider/DeepLinkActivity.kt",
    lineNumber: 24,
    description: "The application parses `transitgo://buy_pass?card_id=...&amount=...` and executes instant fund deductions without requiring user touch confirmation.",
    impact: "Websites visited in Chrome can trigger 1-click silent unauthorized wallet deductions.",
    technicalEvidence: `val uri = intent.data
val cardId = uri?.getQueryParameter("card_id")
val amount = uri?.getQueryParameter("amount")
TransitPaymentService.charge(cardId, amount)`,
    remediation: "Enforce biometric or PIN re-authentication before processing financial transactions initiated via URL schemes.",
    remediationDiff: {
      original: `TransitPaymentService.charge(cardId, amount)`,
      suggested: `showTransactionConfirmationDialog(amount) { confirmed ->
    if (confirmed) authenticateBiometricAndPay(cardId, amount)
}`
    },
    references: [
      { title: "OWASP MASVS-PLATFORM-2: Deep Link Validation", url: "https://mas.owasp.org/MASVS/06-MASVS-PLATFORM/" }
    ],
    detectedBy: ["Apktool", "Frida"],
    exploitability: "Proof of Concept Available"
  },
  {
    id: "f-113",
    findingNumber: "F-1054",
    title: "Ethereum Private Key Seed Phrase Dumped into NSLog",
    severity: "Critical",
    status: "Open",
    applicationId: "app-10",
    applicationName: "CryptoVault iOS Wallet",
    projectId: "proj-6",
    projectName: "CryptoVault Pro",
    platform: "iOS",
    category: "Secrets",
    cwe: "CWE-532",
    cvss: 9.3,
    cvssVector: "CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N",
    owaspCategory: "MASVS-CRYPTO",
    confidence: 99,
    detectedAt: "May 14, 2026",
    assignedTo: "Tariq Mansoor",
    assignedAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
    affectedComponent: "CryptoEngine/BIP39Mnemonic.swift",
    filePath: "CryptoVault/CryptoEngine/BIP39Mnemonic.swift",
    lineNumber: 114,
    description: "The wallet mnemonic generator calls `NSLog(\"Generated Mnemonic: %@\", words)` during debug and release runs.",
    impact: "Direct wallet compromise and permanent loss of all user funds.",
    technicalEvidence: `NSLog("DEBUG_MNEMONIC: %@", mnemonicPhrase)`,
    remediation: "Eradicate all logging statements referencing seed words, private keys, or BIP-39 mnemonic arrays.",
    remediationDiff: {
      original: `NSLog("DEBUG_MNEMONIC: %@", mnemonicPhrase)`,
      suggested: `// Eradicated for security compliance`
    },
    references: [
      { title: "Cryptocurrency Security Standard (CCSS)", url: "https://cryptoconsortium.github.io/CCSS/" }
    ],
    detectedBy: ["MobSF", "SentinelX Static Core"],
    exploitability: "Proof of Concept Available"
  },
  {
    id: "f-114",
    findingNumber: "F-1055",
    title: "Weak DES & RC4 Cryptographic Cipher Modes",
    severity: "Medium",
    status: "Open",
    applicationId: "app-11",
    applicationName: "CryptoVault Android Core",
    projectId: "proj-6",
    projectName: "CryptoVault Pro",
    platform: "Android",
    category: "Cryptography",
    cwe: "CWE-327",
    cvss: 5.9,
    cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:N/A:N",
    owaspCategory: "MASVS-CRYPTO",
    confidence: 95,
    detectedAt: "May 12, 2026",
    assignedTo: "Tariq Mansoor",
    assignedAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
    affectedComponent: "com.vaulttech.cryptovault.crypto.LegacyEncryptionHelper",
    filePath: "app/src/main/java/com/vaulttech/cryptovault/crypto/LegacyEncryptionHelper.kt",
    lineNumber: 45,
    description: "The application initializes `Cipher.getInstance(\"DES/ECB/PKCS5Padding\")` for encrypting metadata blobs.",
    impact: "DES 56-bit keys and ECB mode are vulnerable to brute force and frequency analysis attacks.",
    technicalEvidence: `val cipher = Cipher.getInstance("DES/ECB/PKCS5Padding")`,
    remediation: "Upgrade to `AES/GCM/NoPadding` with 256-bit keys.",
    remediationDiff: {
      original: `val cipher = Cipher.getInstance("DES/ECB/PKCS5Padding")`,
      suggested: `val cipher = Cipher.getInstance("AES/GCM/NoPadding")`
    },
    references: [
      { title: "CWE-327: Use of Broken or Risky Cryptographic Algorithm", url: "https://cwe.mitre.org/data/definitions/327.html" }
    ],
    detectedBy: ["JADX", "MobSF"],
    exploitability: "Low"
  }
];
