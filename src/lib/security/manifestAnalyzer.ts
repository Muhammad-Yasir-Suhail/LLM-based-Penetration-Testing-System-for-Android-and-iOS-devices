import { AxmlParser, ParsedXmlElement } from './axmlParser';
import { SecurityFinding } from '@/types/agent';

export interface ComponentInfo {
  type: 'activity' | 'service' | 'receiver' | 'provider';
  name: string;
  exported: boolean;
  permission?: string;
  intentFiltersCount: number;
}

export interface ManifestAnalysisResult {
  packageName: string;
  versionCode: string;
  versionName: string;
  minSdkVersion: string;
  targetSdkVersion: string;
  debuggable: boolean;
  allowBackup: boolean;
  usesCleartextTraffic: boolean;
  networkSecurityConfig?: string;
  declaredPermissions: string[];
  dangerousPermissions: string[];
  components: ComponentInfo[];
  exportedWithoutPermission: ComponentInfo[];
  findings: SecurityFinding[];
  rawXmlSummary: string;
}

const DANGEROUS_PERMISSIONS: Record<string, { label: string; severity: 'High' | 'Medium'; masvs: string }> = {
  'android.permission.READ_SMS': { label: 'Read SMS Messages', severity: 'High', masvs: 'MASVS-PRIVACY' },
  'android.permission.RECEIVE_SMS': { label: 'Intercept Incoming SMS', severity: 'High', masvs: 'MASVS-PRIVACY' },
  'android.permission.SEND_SMS': { label: 'Send Premium SMS', severity: 'High', masvs: 'MASVS-PRIVACY' },
  'android.permission.RECORD_AUDIO': { label: 'Access Microphone', severity: 'Medium', masvs: 'MASVS-PRIVACY' },
  'android.permission.CAMERA': { label: 'Capture Photos and Video', severity: 'Medium', masvs: 'MASVS-PRIVACY' },
  'android.permission.ACCESS_FINE_LOCATION': { label: 'High Accuracy GPS Tracking', severity: 'Medium', masvs: 'MASVS-PRIVACY' },
  'android.permission.ACCESS_BACKGROUND_LOCATION': { label: 'Persistent Background Tracking', severity: 'High', masvs: 'MASVS-PRIVACY' },
  'android.permission.READ_CONTACTS': { label: 'Access Address Book', severity: 'Medium', masvs: 'MASVS-PRIVACY' },
  'android.permission.WRITE_EXTERNAL_STORAGE': { label: 'Modify Shared External Storage', severity: 'Medium', masvs: 'MASVS-STORAGE' },
  'android.permission.READ_EXTERNAL_STORAGE': { label: 'Read Shared External Storage', severity: 'Medium', masvs: 'MASVS-STORAGE' },
  'android.permission.SYSTEM_ALERT_WINDOW': { label: 'Draw Over Other Apps (Tapjacking Risk)', severity: 'High', masvs: 'MASVS-PLATFORM' }
};

export function analyzeManifestBuffer(
  manifestBuffer: Buffer,
  sessionId: string = 'SESSION-UNKNOWN'
): ManifestAnalysisResult {
  const parser = new AxmlParser(manifestBuffer);
  const root = parser.parse();

  const packageName =
    root.attributes['package'] ||
    root.attributes['manifest:package'] ||
    'com.unknown.android';
  const versionCode =
    root.attributes['versionCode'] ||
    root.attributes['android:versionCode'] ||
    '1';
  const versionName =
    root.attributes['versionName'] ||
    root.attributes['android:versionName'] ||
    '1.0.0';

  let minSdkVersion = '21';
  let targetSdkVersion = '30';
  let debuggable = false;
  let allowBackup = true; // Android default is true unless explicitly set to false
  let usesCleartextTraffic = false;
  let networkSecurityConfig: string | undefined = undefined;

  const declaredPermissions: string[] = [];
  const dangerousPermissions: string[] = [];
  const components: ComponentInfo[] = [];
  const exportedWithoutPermission: ComponentInfo[] = [];
  const findings: SecurityFinding[] = [];

  const timestamp = new Date().toISOString();
  let findingCounter = 1;

  function genId() {
    return `VC-MAN-${String(findingCounter++).padStart(3, '0')}`;
  }

  // Traverse tree
  function visit(node: ParsedXmlElement) {
    const tag = node.tag.toLowerCase();

    if (tag === 'uses-sdk') {
      if (node.attributes['minSdkVersion'] || node.attributes['android:minSdkVersion']) {
        minSdkVersion = node.attributes['minSdkVersion'] || node.attributes['android:minSdkVersion'];
      }
      if (node.attributes['targetSdkVersion'] || node.attributes['android:targetSdkVersion']) {
        targetSdkVersion = node.attributes['targetSdkVersion'] || node.attributes['android:targetSdkVersion'];
      }
    }

    if (tag === 'uses-permission') {
      const permName =
        node.attributes['name'] ||
        node.attributes['android:name'] ||
        '';
      if (permName && !declaredPermissions.includes(permName)) {
        declaredPermissions.push(permName);
        if (DANGEROUS_PERMISSIONS[permName]) {
          dangerousPermissions.push(permName);
        }
      }
    }

    if (tag === 'application') {
      const debugVal = node.attributes['debuggable'] || node.attributes['android:debuggable'];
      debuggable = debugVal === 'true';

      const backupVal = node.attributes['allowBackup'] || node.attributes['android:allowBackup'];
      if (backupVal !== undefined) {
        allowBackup = backupVal === 'true';
      }

      const cleartextVal = node.attributes['usesCleartextTraffic'] || node.attributes['android:usesCleartextTraffic'];
      usesCleartextTraffic = cleartextVal === 'true';

      networkSecurityConfig = node.attributes['networkSecurityConfig'] || node.attributes['android:networkSecurityConfig'];
    }

    if (['activity', 'service', 'receiver', 'provider'].includes(tag)) {
      const compName = node.attributes['name'] || node.attributes['android:name'] || 'UnknownComponent';
      const permission = node.attributes['permission'] || node.attributes['android:permission'];
      const exportedAttr = node.attributes['exported'] || node.attributes['android:exported'];
      
      const intentFilters = node.children.filter((c) => c.tag.toLowerCase() === 'intent-filter');
      const intentFiltersCount = intentFilters.length;

      // On Android < 12 (targetSdk < 31), if intent-filter exists and exported is not specified, it defaults to true!
      let isExported = false;
      if (exportedAttr !== undefined) {
        isExported = exportedAttr === 'true';
      } else if (intentFiltersCount > 0) {
        isExported = true;
      }

      const compInfo: ComponentInfo = {
        type: tag as ComponentInfo['type'],
        name: compName,
        exported: isExported,
        permission,
        intentFiltersCount
      };

      components.push(compInfo);

      if (isExported && !permission) {
        exportedWithoutPermission.push(compInfo);
      }
    }

    for (const child of node.children) {
      visit(child);
    }
  }

  visit(root);

  // Generate verified findings based on real manifest values

  // 1. Debuggable check: Confirmed dangerous build configuration
  if (debuggable) {
    findings.push({
      stableId: genId(),
      title: 'Application Compiled with Debuggable Flag Enabled',
      description:
        'The application manifest explicitly declares android:debuggable="true". This enables runtime code injection via JDWP (Java Debug Wire Protocol), memory dumping, and application state tampering.',
      category: 'Insecure Build Configuration',
      owaspCategory: 'MASVS-CODE',
      cwe: 'CWE-215',
      severity: 'High',
      confidence: 'Confirmed',
      verificationStatus: 'Verified',
      evidence: '<application android:debuggable="true" ...>',
      location: 'AndroidManifest.xml:<application>',
      sourceTool: 'VulnCope Manifest Inspector v1.0',
      remediation:
        'Ensure android:debuggable is removed or set to false in production release configurations via build.gradle release buildType.',
      sessionId,
      timestamp
    });
  }

  // 2. AllowBackup check: Static configuration indicator
  if (allowBackup) {
    findings.push({
      stableId: genId(),
      title: 'Static Configuration: Application Enables Data Backup (android:allowBackup=true)',
      description:
        'Application data backup is enabled (default Android configuration). If an adversary gains physical or adb debugging access, sandbox databases and shared preferences can be copied using adb backup.',
      category: 'Insecure Data Storage',
      owaspCategory: 'MASVS-STORAGE',
      cwe: 'CWE-312',
      severity: 'Low',
      confidence: 'Suspected',
      verificationStatus: 'Detected',
      evidence: '<application android:allowBackup="true" ...>',
      location: 'AndroidManifest.xml:<application>',
      sourceTool: 'VulnCope Manifest Inspector v1.0',
      remediation:
        'Explicitly disable application backup with android:allowBackup="false", or specify granular dataExtractionRules.',
      sessionId,
      timestamp
    });
  }

  // 3. Cleartext Traffic check: Confirmed insecure network permission setting
  if (usesCleartextTraffic) {
    findings.push({
      stableId: genId(),
      title: 'Cleartext HTTP Network Traffic Explicitly Permitted',
      description:
        'The manifest sets android:usesCleartextTraffic="true", explicitly disabling modern Android TLS enforcement. Cleartext traffic enables Man-In-The-Middle (MITM) inspection, session hijacking, and credential eavesdropping.',
      category: 'Insecure Network Transmission',
      owaspCategory: 'MASVS-NETWORK',
      cwe: 'CWE-319',
      severity: 'High',
      confidence: 'Confirmed',
      verificationStatus: 'Verified',
      evidence: '<application android:usesCleartextTraffic="true" ...>',
      location: 'AndroidManifest.xml:<application>',
      sourceTool: 'VulnCope Manifest Inspector v1.0',
      remediation:
        'Set android:usesCleartextTraffic="false" and enforce HTTPS/TLS across all application endpoints with certificate pinning where appropriate.',
      sessionId,
      timestamp
    });
  }

  // 4. Exported components without permission: Evaluated in context
  for (const comp of exportedWithoutPermission) {
    const isServiceOrProvider = comp.type === 'service' || comp.type === 'provider';
    const isReceiver = comp.type === 'receiver';
    const isActivity = comp.type === 'activity';

    // Contextual evaluation: Check if component is standard OS launcher activity
    const isLauncherActivity =
      isActivity &&
      (comp.name.toLowerCase().includes('main') || comp.name.toLowerCase().includes('launcher')) &&
      comp.intentFiltersCount > 0;

    if (isLauncherActivity) {
      // Standard Android requirement: Main launcher activity must be exported for OS launcher icon
      // Do not report standard launcher activity as a vulnerability
      continue;
    }

    const verificationStatus = isServiceOrProvider || isReceiver ? 'Suspected' : 'Detected';
    const severity = isServiceOrProvider ? 'High' : isReceiver ? 'Medium' : 'Low';

    findings.push({
      stableId: genId(),
      title: `Exported ${comp.type.toUpperCase()} Component Accessible Without Permission: ${comp.name.split('.').pop()}`,
      description: `The ${comp.type} component "${comp.name}" is declared as exported="true" without an android:permission restriction. Any third-party application on the device may interact with this component.`,
      category: 'Improper Component Exposure',
      owaspCategory: 'MASVS-PLATFORM',
      cwe: 'CWE-926',
      severity,
      confidence: 'Suspected',
      verificationStatus,
      evidence: `<${comp.type} android:name="${comp.name}" android:exported="true" (missing android:permission) />`,
      location: `AndroidManifest.xml:<${comp.type} name="${comp.name}">`,
      sourceTool: 'VulnCope Manifest Inspector v1.0',
      remediation: `Set android:exported="false" if external invocation is not required, or define custom permission with protectionLevel="signature".`,
      sessionId,
      timestamp
    });
  }

  // 5. Dangerous permissions: Static privilege indicators, not confirmed vulnerabilities
  for (const perm of dangerousPermissions) {
    const meta = DANGEROUS_PERMISSIONS[perm];
    if (meta) {
      findings.push({
        stableId: genId(),
        title: `Static Indicator: Sensitive Permission Declared (${perm.replace('android.permission.', '')})`,
        description: `Application statically requests high-privilege permission "${perm}" (${meta.label}) in its manifest. Declared permissions expand the attack surface if components are subverted, but do not constitute an exploitable vulnerability in isolation.`,
        category: 'Privilege Declaration',
        owaspCategory: meta.masvs,
        cwe: 'CWE-250',
        severity: meta.severity === 'High' ? 'Medium' : 'Low',
        confidence: 'Suspected',
        verificationStatus: 'Detected',
        evidence: `<uses-permission android:name="${perm}" />`,
        location: `AndroidManifest.xml:<uses-permission name="${perm}">`,
        sourceTool: 'VulnCope Manifest Inspector v1.0',
        remediation: `Review whether this permission is strictly necessary for core functionality and verify runtime permission request guards.`,
        sessionId,
        timestamp
      });
    }
  }

  const rawXmlSummary = `Package: ${packageName} (v${versionName}, code: ${versionCode}) | minSdk: ${minSdkVersion}, targetSdk: ${targetSdkVersion} | Permissions: ${declaredPermissions.length} declared (${dangerousPermissions.length} sensitive) | Components: ${components.length} total (${exportedWithoutPermission.length} exported unprotected)`;

  return {
    packageName,
    versionCode,
    versionName,
    minSdkVersion,
    targetSdkVersion,
    debuggable,
    allowBackup,
    usesCleartextTraffic,
    networkSecurityConfig,
    declaredPermissions,
    dangerousPermissions,
    components,
    exportedWithoutPermission,
    findings,
    rawXmlSummary
  };
}
