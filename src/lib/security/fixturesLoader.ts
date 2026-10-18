import fs from 'node:fs';
import path from 'node:path';
import AdmZip from 'adm-zip';

export const CANDIDATE_FIXTURE_DIRS = [
  path.resolve(process.cwd(), 'fixtures'),
  path.resolve(process.cwd(), '..', 'fixtures'),
  path.resolve(__dirname, '..', '..', '..', 'fixtures'),
  path.resolve(__dirname, '..', '..', '..', '..', 'fixtures'),
  'C:\\Users\\oreo\\Downloads\\Penetration Testing FYP\\fixtures'
];

export function getFixturesDir(): string {
  for (const dir of CANDIDATE_FIXTURE_DIRS) {
    if (fs.existsSync(dir)) {
      return dir;
    }
  }
  const defaultDir = path.resolve(process.cwd(), 'fixtures');
  if (!fs.existsSync(defaultDir)) {
    fs.mkdirSync(defaultDir, { recursive: true });
  }
  return defaultDir;
}

// In-process fallback generator to ensure test benchmarks ALWAYS exist
function createDexBuffer(strings: string[] = []): Buffer {
  const header = Buffer.alloc(112);
  header.write('dex\n035\0', 0, 8, 'ascii');
  header.writeUInt32LE(0x12345678, 40); // endian tag
  header.writeUInt32LE(112, 36); // header size

  const stringDataBuffers: Buffer[] = [];
  for (const s of strings) {
    const strBytes = Buffer.from(s, 'utf8');
    const lenByte = Buffer.from([strBytes.length]);
    const nullTerm = Buffer.from([0]);
    stringDataBuffers.push(Buffer.concat([lenByte, strBytes, nullTerm]));
  }

  const stringCount = strings.length;
  header.writeUInt32LE(stringCount, 56);
  header.writeUInt32LE(112, 60);

  const stringIdsBuffer = Buffer.alloc(stringCount * 4);
  let currentDataOffset = 112 + stringCount * 4;

  const finalStringBuffers: Buffer[] = [];
  for (let i = 0; i < stringCount; i++) {
    stringIdsBuffer.writeUInt32LE(currentDataOffset, i * 4);
    currentDataOffset += stringDataBuffers[i].length;
    finalStringBuffers.push(stringDataBuffers[i]);
  }

  header.writeUInt32LE(currentDataOffset, 32);
  return Buffer.concat([header, stringIdsBuffer, ...finalStringBuffers]);
}

function generateVulnerableApkInMemory(): Buffer {
  const zip = new AdmZip();
  const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.vulnscope.insecurebank"
    android:versionCode="101"
    android:versionName="1.0.1">

    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="28" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.READ_SMS" />
    <uses-permission android:name="android.permission.CAMERA" />

    <application
        android:allowBackup="true"
        android:debuggable="true"
        android:usesCleartextTraffic="true"
        android:label="InsecureBank">

        <activity
            android:name="com.vulnscope.insecurebank.MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name="com.vulnscope.insecurebank.TransferService"
            android:exported="true" />

        <receiver
            android:name="com.vulnscope.insecurebank.SmsReceiver"
            android:exported="true" />
    </application>
</manifest>`;

  zip.addFile('AndroidManifest.xml', Buffer.from(manifestXml, 'utf8'));

  const dexStrings = [
    'Lcom/vulnscope/insecurebank/AuthManager;',
    'AIzaSyD-vulnscope-test-google-key-99824',
    'AKIAIOSFODNN7EXAMPLE',
    'http://api.insecurebank.internal:8080/v1/auth/login',
    'http://legacy-gateway.bank.internal/transfer',
    'DES',
    'RC4',
    'AES/ECB/PKCS5Padding',
    'TrustAllCerts',
    'ALLOW_ALL_HOSTNAME_VERIFIER'
  ];

  zip.addFile('classes.dex', createDexBuffer(dexStrings));
  zip.addFile('META-INF/MANIFEST.MF', Buffer.from('Manifest-Version: 1.0\nCreated-By: VulnScope Generator\n'));
  return zip.toBuffer();
}

function generateHardenedApkInMemory(): Buffer {
  const zip = new AdmZip();
  const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.vulnscope.securevault"
    android:versionCode="200"
    android:versionName="2.0.0">

    <uses-sdk android:minSdkVersion="26" android:targetSdkVersion="34" />

    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:allowBackup="false"
        android:debuggable="false"
        android:usesCleartextTraffic="false"
        android:label="SecureVault">

        <activity
            android:name="com.vulnscope.securevault.MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name="com.vulnscope.securevault.InternalVaultSync"
            android:exported="false" />
    </application>
</manifest>`;

  zip.addFile('AndroidManifest.xml', Buffer.from(manifestXml, 'utf8'));

  const dexStrings = [
    'Lcom/vulnscope/securevault/VaultService;',
    'https://vault.secureapp.com/v2/api',
    'AES/GCM/NoPadding',
    'SecurityProvider'
  ];

  zip.addFile('classes.dex', createDexBuffer(dexStrings));
  zip.addFile('META-INF/MANIFEST.MF', Buffer.from('Manifest-Version: 1.0\nCreated-By: VulnScope Generator\n'));
  return zip.toBuffer();
}

export function getFixtureBuffer(fixtureId: string): { fileName: string; buffer: Buffer } {
  const isHardened = fixtureId === 'hardened_app' || fixtureId === 'hardened';
  const fileName = isHardened ? 'hardened_app.apk' : 'vulnerable_bank.apk';

  // Try candidate disk directories
  for (const dir of CANDIDATE_FIXTURE_DIRS) {
    const candidatePath = path.join(dir, fileName);
    if (fs.existsSync(candidatePath)) {
      try {
        const buffer = fs.readFileSync(candidatePath);
        if (buffer && buffer.length > 0) {
          return { fileName, buffer };
        }
      } catch {
        // Fall through to in-memory generation
      }
    }
  }

  // Fallback: Generate dynamically and write back to fixtures directory
  const buffer = isHardened ? generateHardenedApkInMemory() : generateVulnerableApkInMemory();
  try {
    const targetDir = getFixturesDir();
    const savePath = path.join(targetDir, fileName);
    fs.writeFileSync(savePath, buffer);
  } catch {
    // Ignore write error, return buffer directly
  }

  return { fileName, buffer };
}
