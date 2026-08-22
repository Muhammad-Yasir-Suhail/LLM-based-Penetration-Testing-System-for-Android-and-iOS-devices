export interface MockCodeFile {
  id: string;
  name: string;
  language: 'xml' | 'kotlin' | 'java' | 'swift' | 'json';
  filePath: string;
  vulnerableLineNumber: number;
  highlightedLineStart: number;
  highlightedLineEnd: number;
  associatedFindingId: string;
  content: string;
}

export const mockCodeFiles: MockCodeFile[] = [
  {
    id: "file-manifest",
    name: "AndroidManifest.xml",
    language: "xml",
    filePath: "app/src/main/AndroidManifest.xml",
    vulnerableLineNumber: 74,
    highlightedLineStart: 72,
    highlightedLineEnd: 79,
    associatedFindingId: "f-102",
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.acme.banking.mobile">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:name=".AcmeApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:networkSecurityConfig="@xml/network_security_config"
        android:theme="@style/Theme.AcmeBanking">

        <!-- Main Dashboard Entry Point -->
        <activity
            android:name=".ui.MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Biometric Authentication Screen -->
        <activity
            android:name=".ui.AuthLoginActivity"
            android:exported="false"
            android:theme="@style/Theme.Acme.NoActionBar" />

        <!-- User Accounts & Balance Overview -->
        <activity
            android:name=".ui.AccountsOverviewActivity"
            android:exported="false" />

        <!-- Customer In-App Help & Support WebView -->
        <activity
            android:name=".support.SupportWebActivity"
            android:exported="false" />

        <!-- Peer-to-Peer Fund Transfer -->
        <activity
            android:name=".ui.TransferFundsActivity"
            android:exported="false" />

        <!-- VULNERABILITY (CWE-926): Exported Activity Without Signature Permission -->
        <activity
            android:name=".ui.TransactionConfirmationActivity"
            android:exported="true"
            android:theme="@style/Theme.Acme.Dialog">
            <intent-filter>
                <action android:name="com.acme.banking.action.CONFIRM_TRANSFER" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
        </activity>

        <!-- Push Notifications Service -->
        <service
            android:name=".services.AcmeFirebaseMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>

        <!-- Background Diagnostic Sync -->
        <service
            android:name=".services.TelemetrySyncService"
            android:exported="false" />

    </application>
</manifest>`
  },
  {
    id: "file-auth-manager",
    name: "AuthManager.kt",
    language: "kotlin",
    filePath: "app/src/main/java/com/acme/banking/auth/AuthManager.kt",
    vulnerableLineNumber: 48,
    highlightedLineStart: 47,
    highlightedLineEnd: 54,
    associatedFindingId: "f-101",
    content: `package com.acme.banking.auth

import android.content.Context
import android.util.Base64
import java.security.Key
import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AuthManager(private val context: Context) {

    companion object {
        private const val TAG = "AuthManager"
        private const val ALGORITHM = "AES/CBC/PKCS5Padding"
        private const val IV_INITIAL = "0000000000000000"

        // ========================================================================
        // VULNERABILITY DETECTED: Hardcoded 256-bit AES symmetric encryption key
        // CWE-798 / OWASP MASVS-CRYPTO-1
        // Decompiled string extracted by MobSF & JADX AST scanners
        // ========================================================================
        private const val AES_KEY_STRING = "4c7865396d3238613437623930313233"
    }

    suspend fun encryptSessionToken(rawToken: String): String = withContext(Dispatchers.IO) {
        val keyBytes = AES_KEY_STRING.toByteArray(Charsets.UTF_8)
        val secretKey: Key = SecretKeySpec(keyBytes, "AES")
        val cipher = Cipher.getInstance(ALGORITHM)
        val ivSpec = IvParameterSpec(IV_INITIAL.toByteArray(Charsets.UTF_8))
        
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivSpec)
        val encrypted = cipher.doFinal(rawToken.toByteArray(Charsets.UTF_8))
        Base64.encodeToString(encrypted, Base64.NO_WRAP)
    }

    suspend fun decryptSessionToken(encryptedBase64: String): String = withContext(Dispatchers.IO) {
        val keyBytes = AES_KEY_STRING.toByteArray(Charsets.UTF_8)
        val secretKey: Key = SecretKeySpec(keyBytes, "AES")
        val cipher = Cipher.getInstance(ALGORITHM)
        val ivSpec = IvParameterSpec(IV_INITIAL.toByteArray(Charsets.UTF_8))
        
        cipher.init(Cipher.DECRYPT_MODE, secretKey, ivSpec)
        val decoded = Base64.decode(encryptedBase64, Base64.NO_WRAP)
        val decrypted = cipher.doFinal(decoded)
        String(decrypted, Charsets.UTF_8)
    }
}`
  },
  {
    id: "file-net-config",
    name: "network_security_config.xml",
    language: "xml",
    filePath: "app/src/main/res/xml/network_security_config.xml",
    vulnerableLineNumber: 6,
    highlightedLineStart: 4,
    highlightedLineEnd: 9,
    associatedFindingId: "f-103",
    content: `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Production Pinning Configuration -->
    <domain-config>
        <domain includeSubdomains="true">api.acme-banking.com</domain>
        <pin-set expiration="2027-01-01">
            <pin digest="SHA-256">BB87Gj+6/9N64m2y+9o8W...=</pin>
            <pin digest="SHA-256">CC91Hk+7/0O75n3z+0p9X...=</pin>
        </pin-set>
    </domain-config>

    <!-- VULNERABILITY (CWE-319): Cleartext Traffic Allowed on Subdomains -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">staging-api.acme-banking.com</domain>
        <domain includeSubdomains="false">telemetry.internal.net</domain>
    </domain-config>
</network-security-config>`
  }
];
