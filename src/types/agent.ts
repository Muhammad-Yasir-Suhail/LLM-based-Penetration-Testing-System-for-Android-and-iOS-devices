export type AgentMode = 'DeterministicFallback' | 'LLMAgent';

export type SessionStatus = 'Queued' | 'Running' | 'Completed' | 'Failed' | 'Stopped';

export type ActionStatus = 'SUCCESS' | 'FAILURE' | 'TIMEOUT' | 'SKIPPED';

export type FindingVerificationStatus = 'Detected' | 'Suspected' | 'Verified' | 'Inconclusive' | 'Resolved';

export type FindingSeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';

export interface ActionInputSchema {
  type: string;
  properties: Record<string, { type: string; description: string; default?: any }>;
  required?: string[];
}

export interface RegisteredAction {
  actionId: string;
  name: string;
  purpose: string;
  category: 'intake' | 'manifest' | 'permissions' | 'components' | 'network' | 'dex' | 'control';
  inputSchema: ActionInputSchema;
  timeoutMs: number;
  supported: boolean;
}

export interface ActionExecutionRecord {
  stepNumber: number;
  actionId: string;
  actionName: string;
  input: Record<string, any>;
  status: ActionStatus;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  output: Record<string, any>;
  observation: string;
  decisionRationale: string;
  error?: string;
}

export interface SecurityFinding {
  stableId: string; // e.g. "VS-SEC-001"
  title: string;
  description: string;
  category: string;
  owaspCategory: string; // e.g. "MASVS-STORAGE", "MASVS-PLATFORM"
  cwe: string; // e.g. "CWE-926"
  severity: FindingSeverity;
  confidence: 'Confirmed' | 'Suspected' | 'Inconclusive';
  verificationStatus: FindingVerificationStatus;
  evidence: string; // Exact code, manifest XML line, or DEX string match
  location: string; // e.g. "AndroidManifest.xml:line 18"
  sourceTool: string; // e.g. "VulnScope Manifest Inspector v1.0"
  remediation: string;
  sessionId: string;
  timestamp: string;
}

export interface ApkMetadata {
  fileName: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  sha256: string;
  sha1: string;
  md5: string;
  packageName?: string;
  versionCode?: string;
  versionName?: string;
  minSdkVersion?: string;
  targetSdkVersion?: string;
  totalZipEntries: number;
  hasManifest: boolean;
  hasDex: boolean;
  uploadedAt: string;
}

/**
 * Where the complete, unmodified APK for a session is kept.
 * Every upload is stored in full (all entries, byte for byte) for later processing,
 * independent of what the current analysis pipeline reads.
 */
export interface StoredApk {
  /** 'vercel-blob': durable Blob storage. 'local': the server's disk (durable locally, temporary on Vercel). */
  location: 'vercel-blob' | 'local';
  durable: boolean;
  /** Blob URL (location 'vercel-blob') */
  url?: string;
  /** Blob pathname inside the store, or file name on disk */
  pathname: string;
  /** Absolute path on the server's disk (location 'local') */
  path?: string;
  access?: 'public' | 'private';
  originalFileName: string;
  sizeBytes: number;
  sha256: string;
  storedAt: string;
}

export interface AnalysisSession {
  /** The complete uploaded APK, kept for later processing (absent for built-in benchmarks). */
  storedApk?: StoredApk;
  sessionId: string;
  status: SessionStatus;
  agentMode: AgentMode;
  llmProvider?: string;
  targetApk: ApkMetadata;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  durationSeconds?: number;
  totalActionsExecuted: number;
  actionsRegistry: RegisteredAction[];
  executionTrace: ActionExecutionRecord[];
  findings: SecurityFinding[];
  summary: {
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    infoCount: number;
    verifiedCount: number;
    detectedCount?: number;
    suspectedCount?: number;
    inconclusiveCount: number;
    securityPostureRating: 'A' | 'B' | 'C' | 'D' | 'F';
    summaryNarrative: string;
  };
  errorMessage?: string;
}
