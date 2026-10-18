const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const FIXTURES_DIR = path.resolve(__dirname, '..', 'fixtures');

if (!fs.existsSync(FIXTURES_DIR)) {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
}

// Helper to create a minimal valid DEX buffer with custom strings
function createDexBuffer(strings = []) {
  // DEX Magic: dex\n035\0 (8 bytes)
  const header = Buffer.alloc(112);
  header.write('dex\n035\0', 0, 8, 'ascii');
  header.writeUInt32LE(0x12345678, 40); // endian tag
  header.writeUInt32LE(112, 36); // header size
  
  // Encode strings
  const stringDataBuffers = [];
  for (const s of strings) {
    const strBytes = Buffer.from(s, 'utf8');
    // ULEB128 len
    const lenByte = Buffer.from([strBytes.length]);
    const nullTerm = Buffer.from([0]);
    stringDataBuffers.push(Buffer.concat([lenByte, strBytes, nullTerm]));
  }

  const stringCount = strings.length;
  header.writeUInt32LE(stringCount, 56); // string_ids_size
  header.writeUInt32LE(112, 60); // string_ids_off

  const stringIdsBuffer = Buffer.alloc(stringCount * 4);
  let currentDataOffset = 112 + stringCount * 4;

  const finalStringBuffers = [];
  for (let i = 0; i < stringCount; i++) {
    stringIdsBuffer.writeUInt32LE(currentDataOffset, i * 4);
    currentDataOffset += stringDataBuffers[i].length;
    finalStringBuffers.push(stringDataBuffers[i]);
  }

  const totalSize = currentDataOffset;
  header.writeUInt32LE(totalSize, 32); // file_size

  return Buffer.concat([header, stringIdsBuffer, ...finalStringBuffers]);
}

// 1. Generate Vulnerable Test APK
function generateVulnerableApk() {
  const zip = new AdmZip();

  const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.vulncope.insecurebank"
    android:versionCode="101"
    android:versionName="1.0.1">

    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="28" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.READ_SMS" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

    <application
        android:label="VulnCope Insecure Bank Benchmark"
        android:debuggable="true"
        android:allowBackup="true"
        android:usesCleartextTraffic="true">

        <activity
            android:name="com.vulncope.insecurebank.MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity
            android:name="com.vulncope.insecurebank.DebugAuthBypassActivity"
            android:exported="true" />

        <service
            android:name="com.vulncope.insecurebank.BackdoorTransferService"
            android:exported="true" />

        <receiver
            android:name="com.vulncope.insecurebank.UnprotectedSmsReceiver"
            android:exported="true" />

    </application>
</manifest>`;

  zip.addFile('AndroidManifest.xml', Buffer.from(manifestXml, 'utf8'));

  // DEX with hardcoded secrets
  const dex = createDexBuffer([
    'com/vulncope/insecurebank/MainActivity',
    'AIzaSyD-vulncope-test-google-key-99824',
    'AKIAIOSFODNN7EXAMPLE',
    'http://api.insecurebank.internal/transfer',
    'http://auth.insecurebank.internal/login',
    'DES',
    'AES/ECB/PKCS5Padding',
    'TrustAllCerts',
    'ALLOW_ALL_HOSTNAME_VERIFIER'
  ]);

  zip.addFile('classes.dex', dex);
  zip.addFile('res/values/strings.xml', Buffer.from('<resources><string name="app_name">InsecureBank</string></resources>', 'utf8'));

  const outPath = path.join(FIXTURES_DIR, 'vulnerable_bank.apk');
  zip.writeZip(outPath);
  console.log(`[Fixture] Created: ${outPath} (${fs.statSync(outPath).size} bytes)`);
}

// 2. Generate Hardened Secure Test APK
function generateHardenedApk() {
  const zip = new AdmZip();

  const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.vulncope.securevault"
    android:versionCode="204"
    android:versionName="2.4.0">

    <uses-sdk android:minSdkVersion="26" android:targetSdkVersion="34" />

    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:label="VulnCope Hardened Benchmark"
        android:debuggable="false"
        android:allowBackup="false"
        android:usesCleartextTraffic="false">

        <activity
            android:name="com.vulncope.securevault.MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name="com.vulncope.securevault.ProtectedCryptoService"
            android:exported="false" />

    </application>
</manifest>`;

  zip.addFile('AndroidManifest.xml', Buffer.from(manifestXml, 'utf8'));

  const dex = createDexBuffer([
    'com/vulncope/securevault/MainActivity',
    'https://api.securevault.com/v2/handshake',
    'AES/GCM/NoPadding'
  ]);

  zip.addFile('classes.dex', dex);

  const outPath = path.join(FIXTURES_DIR, 'hardened_app.apk');
  zip.writeZip(outPath);
  console.log(`[Fixture] Created: ${outPath} (${fs.statSync(outPath).size} bytes)`);
}

// 3. Generate Corrupt APK (Not a ZIP)
function generateCorruptApk() {
  const outPath = path.join(FIXTURES_DIR, 'corrupt_archive.apk');
  fs.writeFileSync(outPath, Buffer.from('NOT_A_VALID_APK_CORRUPT_BYTES_XYZ_123', 'utf8'));
  console.log(`[Fixture] Created: ${outPath} (${fs.statSync(outPath).size} bytes)`);
}

// 4. Generate Missing Manifest APK (ZIP without AndroidManifest.xml)
function generateMissingManifestApk() {
  const zip = new AdmZip();
  zip.addFile('classes.dex', Buffer.from('dex\n035\0', 'utf8'));
  zip.addFile('assets/data.json', Buffer.from('{"test": true}', 'utf8'));
  const outPath = path.join(FIXTURES_DIR, 'missing_manifest.apk');
  zip.writeZip(outPath);
  console.log(`[Fixture] Created: ${outPath} (${fs.statSync(outPath).size} bytes)`);
}

generateVulnerableApk();
generateHardenedApk();
generateCorruptApk();
generateMissingManifestApk();
console.log('All test fixtures generated successfully.');
