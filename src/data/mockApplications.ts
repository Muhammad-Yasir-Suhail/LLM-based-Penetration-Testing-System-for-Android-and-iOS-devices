import { Application } from "@/types";

export const initialApplications: Application[] = [
  {
    id: "app-1",
    name: "Acme Banking Mobile",
    packageName: "com.acme.banking.mobile",
    platform: "Android",
    currentVersion: "4.2.1",
    currentBuild: "42108",
    projectId: "proj-1",
    projectName: "Acme Banking",
    securityScore: 82,
    lastAnalyzed: "Today, 10:42 AM",
    fileSize: "48.6 MB",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    minSdk: "API 26 (Android 8.0)",
    targetSdk: "API 34 (Android 14)",
    status: "Active",
    attackSurfaceScore: 68,
    iconBg: "from-blue-600 to-indigo-900",
    findingsCount: {
      critical: 2,
      high: 4,
      medium: 5,
      low: 1,
      info: 0
    },
    versionHistory: [
      {
        version: "v4.2.1",
        buildNumber: "42108",
        scanDate: "Today, 10:42 AM",
        securityScore: 82,
        criticalFindings: 2,
        highFindings: 4,
        totalFindings: 12,
        fileSize: "48.6 MB",
        changesSummary: "Biometric login update, biometric prompt fallback fix.",
        events: [
          {
            type: "score_change",
            label: "Security Score Adjusted",
            description: "Score stands at 82/100 following latest static analysis run."
          },
          {
            type: "sdk_added",
            label: "New Dependency Added",
            description: "Integrated androidx.biometric:biometric-ktx:1.2.0-alpha05"
          }
        ]
      },
      {
        version: "v4.1.0",
        buildNumber: "41052",
        scanDate: "2 weeks ago",
        securityScore: 74,
        criticalFindings: 3,
        highFindings: 6,
        totalFindings: 17,
        fileSize: "46.2 MB",
        changesSummary: "Quick transfer deep links feature and updated payment gateway SDK.",
        events: [
          {
            type: "vuln_introduced",
            label: "Critical Vulnerability Introduced",
            description: "Deep link exported activity detected without authorization checks."
          },
          {
            type: "perm_added",
            label: "New Permission Added",
            description: "Requested USE_BIOMETRIC and POST_NOTIFICATIONS."
          }
        ]
      },
      {
        version: "v4.0.0",
        buildNumber: "40019",
        scanDate: "1 month ago",
        securityScore: 88,
        criticalFindings: 0,
        highFindings: 3,
        totalFindings: 9,
        fileSize: "44.8 MB",
        changesSummary: "Major architecture migration to Jetpack Compose.",
        events: [
          {
            type: "vuln_resolved",
            label: "Resolved SQLite Plaintext Token",
            description: "Migrated user session credentials to encrypted Room SQLite DB."
          },
          {
            type: "score_change",
            label: "Score Improved (+14%)",
            description: "Security score jumped from 74 to 88."
          }
        ]
      },
      {
        version: "v3.9.0",
        buildNumber: "39044",
        scanDate: "2 months ago",
        securityScore: 71,
        criticalFindings: 3,
        highFindings: 7,
        totalFindings: 20,
        fileSize: "42.1 MB",
        changesSummary: "Added in-app customer support live chat module.",
        events: [
          {
            type: "vuln_introduced",
            label: "Insecure WebView JavaScript Interface",
            description: "Exposed native JavaScriptInterface to untrusted remote domains."
          }
        ]
      },
      {
        version: "v3.8.0",
        buildNumber: "38012",
        scanDate: "3 months ago",
        securityScore: 68,
        criticalFindings: 4,
        highFindings: 8,
        totalFindings: 24,
        fileSize: "39.5 MB",
        changesSummary: "Initial biometric enrollment beta.",
        events: [
          {
            type: "vuln_introduced",
            label: "Hardcoded Cryptographic AES Key",
            description: "Initial decompilation revealed static key in AuthManager.kt."
          }
        ]
      }
    ]
  },
  {
    id: "app-2",
    name: "Acme Banking iOS",
    packageName: "com.acme.banking.ios",
    platform: "iOS",
    currentVersion: "4.2.0",
    currentBuild: "42010",
    projectId: "proj-1",
    projectName: "Acme Banking",
    securityScore: 89,
    lastAnalyzed: "Yesterday, 2:10 PM",
    fileSize: "62.1 MB",
    sha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    minSdk: "iOS 16.0",
    targetSdk: "iOS 17.4",
    status: "Active",
    attackSurfaceScore: 54,
    iconBg: "from-sky-600 to-blue-900",
    findingsCount: {
      critical: 0,
      high: 2,
      medium: 4,
      low: 1,
      info: 0
    },
    versionHistory: [
      {
        version: "v4.2.0",
        buildNumber: "42010",
        scanDate: "Yesterday, 2:10 PM",
        securityScore: 89,
        criticalFindings: 0,
        highFindings: 2,
        totalFindings: 7,
        fileSize: "62.1 MB",
        changesSummary: "iOS 17 FaceID keychain access control migration.",
        events: [
          {
            type: "vuln_resolved",
            label: "Resolved Keychain Access Policy",
            description: "Added kSecAccessControlBiometryAny constraint."
          }
        ]
      }
    ]
  },
  {
    id: "app-3",
    name: "ShopSphere Buyer APK",
    packageName: "com.shopsphere.marketplace",
    platform: "Android",
    currentVersion: "3.4.8",
    currentBuild: "34800",
    projectId: "proj-2",
    projectName: "ShopSphere",
    securityScore: 67,
    lastAnalyzed: "Yesterday, 3:15 PM",
    fileSize: "78.4 MB",
    sha256: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    minSdk: "API 24",
    targetSdk: "API 33",
    status: "Active",
    attackSurfaceScore: 82,
    iconBg: "from-amber-600 to-red-900",
    findingsCount: {
      critical: 2,
      high: 5,
      medium: 8,
      low: 3,
      info: 1
    },
    versionHistory: []
  },
  {
    id: "app-4",
    name: "ShopSphere POS Merchant",
    packageName: "com.shopsphere.merchant.pos",
    platform: "Android",
    currentVersion: "2.1.0",
    currentBuild: "21044",
    projectId: "proj-2",
    projectName: "ShopSphere",
    securityScore: 71,
    lastAnalyzed: "May 20, 2026",
    fileSize: "55.2 MB",
    sha256: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
    minSdk: "API 28",
    targetSdk: "API 34",
    status: "Active",
    attackSurfaceScore: 75,
    iconBg: "from-orange-600 to-amber-900",
    findingsCount: {
      critical: 1,
      high: 3,
      medium: 4,
      low: 2,
      info: 0
    },
    versionHistory: []
  },
  {
    id: "app-5",
    name: "HealthTrack Patient iOS",
    packageName: "com.healthtrack.patient",
    platform: "iOS",
    currentVersion: "5.1.2",
    currentBuild: "51201",
    projectId: "proj-3",
    projectName: "HealthTrack",
    securityScore: 91,
    lastAnalyzed: "2 days ago",
    fileSize: "41.5 MB",
    sha256: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
    minSdk: "iOS 16.4",
    targetSdk: "iOS 17.2",
    status: "Active",
    attackSurfaceScore: 38,
    iconBg: "from-emerald-600 to-teal-900",
    findingsCount: {
      critical: 0,
      high: 1,
      medium: 2,
      low: 1,
      info: 0
    },
    versionHistory: []
  },
  {
    id: "app-6",
    name: "TransitGo Passenger",
    packageName: "com.transitgo.rider",
    platform: "Android",
    currentVersion: "2.8.4",
    currentBuild: "28400",
    projectId: "proj-4",
    projectName: "TransitGo",
    securityScore: 73,
    lastAnalyzed: "3 days ago",
    fileSize: "51.3 MB",
    sha256: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
    minSdk: "API 26",
    targetSdk: "API 34",
    status: "Active",
    attackSurfaceScore: 66,
    iconBg: "from-cyan-600 to-blue-900",
    findingsCount: {
      critical: 1,
      high: 2,
      medium: 6,
      low: 2,
      info: 0
    },
    versionHistory: []
  },
  {
    id: "app-7",
    name: "TransitGo NFC Inspector",
    packageName: "com.transitgo.nfc.inspector",
    platform: "Android",
    currentVersion: "1.4.0",
    currentBuild: "14002",
    projectId: "proj-4",
    projectName: "TransitGo",
    securityScore: 85,
    lastAnalyzed: "May 15, 2026",
    fileSize: "32.0 MB",
    sha256: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
    minSdk: "API 29",
    targetSdk: "API 34",
    status: "Active",
    attackSurfaceScore: 49,
    iconBg: "from-blue-600 to-cyan-900",
    findingsCount: {
      critical: 0,
      high: 1,
      medium: 3,
      low: 1,
      info: 0
    },
    versionHistory: []
  },
  {
    id: "app-8",
    name: "SecureAuth Authenticator",
    packageName: "com.zerotrust.secureauth",
    platform: "Android",
    currentVersion: "6.0.1",
    currentBuild: "60110",
    projectId: "proj-5",
    projectName: "SecureAuth Mobile",
    securityScore: 94,
    lastAnalyzed: "May 18, 2026",
    fileSize: "22.4 MB",
    sha256: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    minSdk: "API 30",
    targetSdk: "API 34",
    status: "Active",
    attackSurfaceScore: 28,
    iconBg: "from-purple-600 to-indigo-950",
    findingsCount: {
      critical: 0,
      high: 0,
      medium: 2,
      low: 1,
      info: 0
    },
    versionHistory: []
  },
  {
    id: "app-9",
    name: "SecureAuth iOS Token",
    packageName: "com.zerotrust.secureauth.ios",
    platform: "iOS",
    currentVersion: "6.0.0",
    currentBuild: "60001",
    projectId: "proj-5",
    projectName: "SecureAuth Mobile",
    securityScore: 96,
    lastAnalyzed: "May 17, 2026",
    fileSize: "19.8 MB",
    sha256: "3f79bb7b435b05321651daefd374cdc681dc06faa65e374e38337b88ca046dea",
    minSdk: "iOS 16.0",
    targetSdk: "iOS 17.4",
    status: "Active",
    attackSurfaceScore: 22,
    iconBg: "from-indigo-600 to-purple-950",
    findingsCount: {
      critical: 0,
      high: 0,
      medium: 1,
      low: 1,
      info: 0
    },
    versionHistory: []
  },
  {
    id: "app-10",
    name: "CryptoVault iOS Wallet",
    packageName: "com.vaulttech.cryptovault.ios",
    platform: "iOS",
    currentVersion: "1.9.4",
    currentBuild: "19400",
    projectId: "proj-6",
    projectName: "CryptoVault Pro",
    securityScore: 58,
    lastAnalyzed: "May 14, 2026",
    fileSize: "84.2 MB",
    sha256: "2c624232cdd221771294dfbb310aca000a0df6ac9b66b0d199bf41e418b45638",
    minSdk: "iOS 15.0",
    targetSdk: "iOS 17.0",
    status: "Active",
    attackSurfaceScore: 89,
    iconBg: "from-yellow-600 to-amber-950",
    findingsCount: {
      critical: 3,
      high: 6,
      medium: 7,
      low: 3,
      info: 1
    },
    versionHistory: []
  },
  {
    id: "app-11",
    name: "CryptoVault Android Core",
    packageName: "com.vaulttech.cryptovault.android",
    platform: "Android",
    currentVersion: "1.9.2",
    currentBuild: "19210",
    projectId: "proj-6",
    projectName: "CryptoVault Pro",
    securityScore: 61,
    lastAnalyzed: "May 12, 2026",
    fileSize: "91.0 MB",
    sha256: "11a4a60b518bf24989d4818c7ecd38343f6bec2c06e2003dd473a24c0226a996",
    minSdk: "API 26",
    targetSdk: "API 33",
    status: "Active",
    attackSurfaceScore: 85,
    iconBg: "from-rose-600 to-amber-950",
    findingsCount: {
      critical: 2,
      high: 5,
      medium: 8,
      low: 2,
      info: 0
    },
    versionHistory: []
  },
  {
    id: "app-12",
    name: "FleetLogistics ELD Tablet",
    packageName: "com.freighthub.driver.eld",
    platform: "Android",
    currentVersion: "3.2.0",
    currentBuild: "32001",
    projectId: "proj-7",
    projectName: "FleetLogistics Driver",
    securityScore: 76,
    lastAnalyzed: "May 10, 2026",
    fileSize: "68.4 MB",
    sha256: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    minSdk: "API 28",
    targetSdk: "API 34",
    status: "Active",
    attackSurfaceScore: 62,
    iconBg: "from-slate-600 to-slate-900",
    findingsCount: {
      critical: 0,
      high: 3,
      medium: 5,
      low: 2,
      info: 0
    },
    versionHistory: []
  },
  {
    id: "app-13",
    name: "FleetLogistics Dispatcher",
    packageName: "com.freighthub.dispatcher",
    platform: "Android",
    currentVersion: "2.5.1",
    currentBuild: "25102",
    projectId: "proj-7",
    projectName: "FleetLogistics Driver",
    securityScore: 80,
    lastAnalyzed: "May 09, 2026",
    fileSize: "44.9 MB",
    sha256: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
    minSdk: "API 28",
    targetSdk: "API 34",
    status: "Active",
    attackSurfaceScore: 52,
    iconBg: "from-blue-700 to-slate-900",
    findingsCount: {
      critical: 0,
      high: 2,
      medium: 4,
      low: 1,
      info: 0
    },
    versionHistory: []
  },
  {
    id: "app-14",
    name: "SmartHome Controller",
    packageName: "com.nexhome.smartcontroller",
    platform: "Android",
    currentVersion: "4.0.5",
    currentBuild: "40502",
    projectId: "proj-8",
    projectName: "SmartHome Hub",
    securityScore: 84,
    lastAnalyzed: "May 08, 2026",
    fileSize: "59.3 MB",
    sha256: "d41d8cd98f00b204e9800998ecf8427e",
    minSdk: "API 29",
    targetSdk: "API 34",
    status: "Active",
    attackSurfaceScore: 48,
    iconBg: "from-teal-600 to-cyan-950",
    findingsCount: {
      critical: 0,
      high: 2,
      medium: 3,
      low: 1,
      info: 0
    },
    versionHistory: []
  },
  {
    id: "app-15",
    name: "SmartHome iOS Bridge",
    packageName: "com.nexhome.bridge.ios",
    platform: "iOS",
    currentVersion: "3.9.0",
    currentBuild: "39002",
    projectId: "proj-8",
    projectName: "SmartHome Hub",
    securityScore: 87,
    lastAnalyzed: "May 07, 2026",
    fileSize: "43.1 MB",
    sha256: "7b52009b64fd0a2a49e6d8a939753077792b0554",
    minSdk: "iOS 16.0",
    targetSdk: "iOS 17.2",
    status: "Active",
    attackSurfaceScore: 42,
    iconBg: "from-cyan-600 to-teal-950",
    findingsCount: {
      critical: 0,
      high: 1,
      medium: 3,
      low: 2,
      info: 0
    },
    versionHistory: []
  }
];
