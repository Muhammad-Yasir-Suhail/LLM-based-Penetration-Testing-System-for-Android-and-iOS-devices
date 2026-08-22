import { SecurityEngine } from "@/types";

export const initialSecurityEngines: SecurityEngine[] = [
  {
    id: "engine-mobsf",
    name: "MobSF",
    tagline: "Mobile Security Framework - Automated All-in-One SAST / DAST",
    capabilities: [
      "Android APK/AAB Static Analysis",
      "iOS IPA & Source Code Scanning",
      "OWASP Mobile Top 10 Mapping",
      "Hardcoded Secrets & High Entropy Scanning",
      "Manifest & App Permissions Extraction"
    ],
    status: "Simulation Mode",
    version: "v3.9.4 REST-API",
    lastExecution: "Today, 10:40 AM",
    totalChecks: 142,
    iconType: "shield",
    config: {
      enabledRules: 87,
      timeoutSeconds: 180,
      deepDecompilation: true,
      aiPostProcessing: true
    }
  },
  {
    id: "engine-jadx",
    name: "JADX",
    tagline: "Dex to Java Decompiler & Abstract Syntax Tree (AST) Engine",
    capabilities: [
      "Dalvik Bytecode to Java Decompilation",
      "Smali to Kotlin AST Reconstruction",
      "Data-Flow & Taint Sink Tracing",
      "Hardcoded Key & IV Extraction",
      "Obfuscation De-flattening"
    ],
    status: "Simulation Mode",
    version: "v1.5.0 Native Core",
    lastExecution: "Today, 10:41 AM",
    totalChecks: 64,
    iconType: "code",
    config: {
      enabledRules: 52,
      timeoutSeconds: 120,
      deepDecompilation: true,
      aiPostProcessing: true
    }
  },
  {
    id: "engine-apktool",
    name: "Apktool",
    tagline: "APK Resource Deconstruction & AndroidManifest Disassembly",
    capabilities: [
      "AndroidManifest.xml XML Decoding",
      "Smali Disassembly & Modification",
      "Res/Values Security Evaluation",
      "Deep Link & Intent Filter Parsing",
      "Network Security Config XML Verification"
    ],
    status: "Simulation Mode",
    version: "v2.9.3 Smali v3.0",
    lastExecution: "Today, 10:40 AM",
    totalChecks: 38,
    iconType: "terminal",
    config: {
      enabledRules: 38,
      timeoutSeconds: 60,
      deepDecompilation: false,
      aiPostProcessing: false
    }
  },
  {
    id: "engine-frida",
    name: "Frida",
    tagline: "Dynamic Binary Instrumentation & Runtime Hooking",
    capabilities: [
      "SSL Certificate Pinning Bypass Emulation",
      "Root & Jailbreak Detection Probing",
      "Crypto Cipher.init Hooking & Key Interception",
      "IPC Intent Fuzzing & Activity Launching",
      "Biometric Prompt Hook Simulation"
    ],
    status: "Simulation Mode",
    version: "v16.2.1 Core Daemon",
    lastExecution: "Today, 10:41 AM",
    totalChecks: 26,
    iconType: "zap",
    config: {
      enabledRules: 20,
      timeoutSeconds: 240,
      deepDecompilation: false,
      aiPostProcessing: true
    }
  },
  {
    id: "engine-burp",
    name: "Burp Suite",
    tagline: "Enterprise Dynamic API & Network Traffic Interceptor",
    capabilities: [
      "Mobile REST / GraphQL API Fuzzing",
      "Cleartext HTTP Traffic Detection",
      "Insecure TLS Cipher Suite Flagging",
      "Token Exposure in Query Params",
      "Cross-Site Scripting (XSS) in Mobile WebViews"
    ],
    status: "Simulation Mode",
    version: "v2026.4.1 REST API",
    lastExecution: "Today, 10:41 AM",
    totalChecks: 45,
    iconType: "radio",
    config: {
      enabledRules: 35,
      timeoutSeconds: 300,
      deepDecompilation: false,
      aiPostProcessing: true
    }
  }
];
