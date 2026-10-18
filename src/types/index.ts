export type Platform = 'Android' | 'iOS' | 'Cross-Platform';

export type FindingSeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';

export type FindingStatus = 'Open' | 'In Review' | 'False Positive' | 'Resolved';

export type AnalysisStatus = 'Queued' | 'Running' | 'Completed' | 'Failed';

export type EngineType = 'MobSF' | 'JADX' | 'Apktool' | 'Frida' | 'Burp Suite' | 'SentinelX Static Core';

export type OwaspMasvsCategory =
  | 'MASVS-STORAGE'
  | 'MASVS-CRYPTO'
  | 'MASVS-AUTH'
  | 'MASVS-NETWORK'
  | 'MASVS-PLATFORM'
  | 'MASVS-CODE'
  | 'MASVS-RESILIENCE'
  | 'MASVS-PRIVACY';

export interface Finding {
  id: string;
  findingNumber: string; // e.g. "F-1042"
  title: string;
  severity: FindingSeverity;
  status: FindingStatus;
  applicationId: string;
  applicationName: string;
  projectId: string;
  projectName: string;
  platform: Platform;
  category: string; // e.g. "Hardcoded Secrets", "Insecure Data Storage", etc.
  cwe: string; // e.g. "CWE-798"
  cvss: number; // e.g. 8.4
  cvssVector: string; // e.g. "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N"
  owaspCategory: OwaspMasvsCategory;
  confidence: number; // percentage, e.g. 94
  detectedAt: string;
  assignedTo: string;
  assignedAvatar?: string;
  affectedComponent: string; // e.g. "com.acme.banking.auth.AuthManager"
  filePath: string; // e.g. "app/src/main/java/com/acme/banking/auth/AuthManager.kt"
  lineNumber: number;
  description: string;
  impact: string;
  technicalEvidence: string;
  remediation: string;
  remediationDiff?: {
    original: string;
    suggested: string;
  };
  references: { title: string; url: string }[];
  detectedBy: EngineType[];
  correlatedIssueId?: string;
  exploitability: 'High' | 'Medium' | 'Low' | 'Proof of Concept Available';
  isRealRun?: boolean;
  verificationStatus?: string;
  sessionId?: string;
  sourceTool?: string;
}

export interface ApplicationVersion {
  version: string;
  buildNumber: string;
  scanDate: string;
  securityScore: number;
  criticalFindings: number;
  highFindings: number;
  totalFindings: number;
  fileSize: string;
  changesSummary: string;
  events: {
    type: 'vuln_introduced' | 'vuln_resolved' | 'score_change' | 'sdk_added' | 'perm_added';
    label: string;
    description: string;
  }[];
}

export interface Application {
  id: string;
  name: string;
  packageName: string; // e.g. "com.acme.banking.mobile"
  platform: Platform;
  currentVersion: string;
  currentBuild: string;
  projectId: string;
  projectName: string;
  securityScore: number;
  lastAnalyzed: string;
  fileSize: string;
  sha256: string;
  minSdk?: string;
  targetSdk?: string;
  status: 'Active' | 'Under Review' | 'Archived';
  findingsCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  attackSurfaceScore: number; // 0-100
  versionHistory: ApplicationVersion[];
  iconBg: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  organization: string;
  environment: 'Production' | 'Staging' | 'Development';
  platforms: Platform[];
  applicationsCount: number;
  lastScan: string;
  securityScore: number;
  openFindingsCount: number;
  status: 'Healthy' | 'Needs Attention' | 'Critical Risk';
  leadEngineer: string;
  leadAvatar: string;
}

export interface AttackSurfaceNode {
  id: string;
  name: string;
  type:
    | 'Application'
    | 'Activity'
    | 'Service'
    | 'Broadcast Receiver'
    | 'Content Provider'
    | 'Deep Link'
    | 'WebView'
    | 'Network Endpoint'
    | 'Permission'
    | 'Cryptographic API'
    | 'Local Storage'
    | 'Third-Party SDK'
    | 'Finding';
  risk: 'Critical' | 'High' | 'Medium' | 'Low' | 'Safe';
  exposure: 'Exported / Public' | 'Internal / Protected' | 'Protected by Signature' | 'Dynamic / Runtime';
  details: string;
  relatedFindingsCount: number;
  evidence: string;
  codeSnippet?: string;
  parentId?: string;
  category: 'component' | 'permission' | 'network' | 'storage' | 'sdk' | 'crypto';
}

export interface AttackSurfaceEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
}

export interface CorrelatedIssue {
  id: string;
  title: string;
  severity: FindingSeverity;
  confidence: number;
  affectedComponent: string;
  applicationName: string;
  category: string;
  description: string;
  unifiedRemediation: string;
  evidenceTree: {
    engine: EngineType;
    findingTitle: string;
    rawEvidence: string;
    confidence: number;
    filePath: string;
    line?: number;
  }[];
}

export interface AnalysisRun {
  id: string;
  runNumber: string; // e.g. "AN-2026-0842"
  applicationId: string;
  applicationName: string;
  version: string;
  platform: Platform;
  startedAt: string;
  duration: string;
  status: AnalysisStatus;
  checksExecuted: number;
  filesAnalyzed: number;
  rulesExecuted: number;
  findingsFound: number;
  findingsBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  enginesUsed: EngineType[];
  staticAnalysisScore: number;
  manifestScore: number;
  dependencyScore: number;
}

export interface ActivityEvent {
  id: string;
  type: 'analysis_complete' | 'scan_started' | 'finding_resolved' | 'finding_detected' | 'report_generated' | 'app_uploaded' | 'ai_consultation';
  title: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  metadata?: {
    applicationName?: string;
    findingTitle?: string;
    severity?: FindingSeverity;
    reportType?: string;
  };
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Security Analyst' | 'Developer' | 'Viewer';
  status: 'Active' | 'Invited' | 'Suspended';
  lastActive: string;
  projectsAssigned: string[];
  avatar: string;
}

export interface SecurityReport {
  id: string;
  reportNumber: string;
  title: string;
  type: 'Executive Summary' | 'Technical Assessment' | 'Compliance (MASVS)' | 'Remediation Plan';
  applicationName: string;
  version: string;
  generatedDate: string;
  generatedBy: string;
  securityScore: number;
  findingsCount: number;
  downloadSize: string;
  status: 'Ready' | 'Archived';
  executiveSummary: string;
}

export interface SecurityEngine {
  id: string;
  name: EngineType;
  tagline: string;
  capabilities: string[];
  status: 'Simulation Mode' | 'Ready' | 'Updating';
  version: string;
  lastExecution: string;
  totalChecks: number;
  iconType: 'shield' | 'code' | 'terminal' | 'zap' | 'radio' | 'cpu';
  config: {
    enabledRules: number;
    timeoutSeconds: number;
    deepDecompilation: boolean;
    aiPostProcessing: boolean;
  };
}
