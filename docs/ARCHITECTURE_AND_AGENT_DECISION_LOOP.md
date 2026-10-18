# VulnScope — System Architecture & Agent Decision Loop (R5)
**Project Title:** AI-Assisted Vulnerability Detection and Security Analysis of Mobile Applications  
**Framework Name:** VulnScope  
**Milestone Focus:** Mid Evaluation 01 Design Artefacts  
**Rubric Area:** R5 — 15 Marks

---

## 1. High-Level System Architecture

VulnScope is designed as a modular, evidence-grounded security testing framework. The frontend developer workspace communicates with the Next.js API layer, which coordinates the bounded Agent Controller, allowlisted Tool Registry, and static deconstruction engines.

```mermaid
graph TB
    subgraph Client ["Frontend Developer Workspace (Next.js 14 / React 18)"]
        UI_Run["/analysis/run (Live Pipeline)"]
        UI_List["/analysis (Session History)"]
        UI_Detail["/analysis/:id (Audit Trail)"]
        UI_Dash["/dashboard (Security Overview)"]
    end

    subgraph API ["Next.js Backend API Handlers"]
        API_Upload["/api/analysis/upload"]
        API_Run["/api/analysis/run"]
        API_Get["/api/analysis/:id"]
        API_Sessions["/api/analysis/sessions"]
    end

    subgraph AgentCore ["VulnScope Agentic Security Core"]
        Controller["AgentController (Bounded Loop)"]
        Planner["llmPlanner (LLM / Rule Fallback)"]
        Registry["ToolRegistry (Allowlisted Actions)"]
        Storage["SessionStore (.vulnscope/sessions)"]
    end

    subgraph Analyzers ["Real Static & Bytecode Analyzers"]
        Validator["ApkValidator (PKZIP & SHA-256)"]
        AXML["AxmlParser (Binary XML Decoder)"]
        Manifest["ManifestAnalyzer (Permissions & IPC)"]
        DEX["DexAnalyzer (Bytecode StringPool)"]
    end

    UI_Run --> API_Upload
    UI_Run --> API_Run
    UI_List --> API_Sessions
    UI_Detail --> API_Get

    API_Upload --> Validator
    API_Run --> Controller
    Controller --> Planner
    Planner --> Registry
    Controller --> Registry
    Registry --> Validator
    Registry --> Manifest
    Registry --> DEX
    Manifest --> AXML
    Controller --> Storage
```

---

## 2. Agent Decision & Tool Execution Sequence

The agent decision loop executes bounded, adaptive analysis steps. Every tool execution returns a concise, structured observation that is ingested into the agent context before the next action is selected.

```mermaid
sequenceDiagram
    autonumber
    actor User as Security Analyst
    participant UI as Analysis Workspace (/analysis/run)
    participant API as /api/analysis/run
    participant Controller as AgentController
    participant Planner as llmPlanner (Adaptive Engine)
    participant Registry as ToolRegistry (Allowlist)
    participant Analyzers as Static / DEX Analyzers
    participant Store as SessionStore

    User->>UI: Select APK or Benchmark -> Click "Execute Analysis"
    UI->>API: POST { fixtureId or fileBuffer }
    API->>Controller: runAnalysis(apkBuffer)
    
    Note over Controller: Step 1: Initial Intake & Digest
    Controller->>Registry: Execute ACTION_VALIDATE_PACKAGE
    Registry->>Analyzers: Validate PKZIP, compute SHA-256, inspect entries
    Analyzers-->>Registry: Validation metadata
    Registry-->>Controller: Return Observation 1

    loop Bounded Decision Loop (Max 8 Steps)
        Controller->>Planner: planNextAction(context, priorObservations)
        Note over Planner: Observation-to-Next-Action Rationale
        Planner-->>Controller: Selected Action ID + Decision Rationale
        
        alt Action Unsupported or Not on Allowlist
            Controller->>Controller: Log Security Boundary Rejection & Halt
        else Action Supported
            Controller->>Registry: Execute Action with Timeout (5s - 15s)
            Registry->>Analyzers: Run specific inspection
            Analyzers-->>Registry: Programmatic output & findings
            Registry-->>Controller: Return ActionExecutionRecord & Observation
        end
        
        opt Terminal Condition or ACTION_FINISH_ANALYSIS
            Note over Controller: Terminate Bounded Loop Safely
        end
    end

    Controller->>Controller: Compile verified findings & posture grade
    Controller->>Store: saveSession(session)
    Store-->>Controller: Persisted on disk
    Controller-->>API: Return complete AnalysisSession
    API-->>UI: Render live trace & findings
    UI-->>User: Display verified findings with technical evidence
```

---

## 3. Observation-Driven Adaptation Flow (State Diagram)

The hallmark of the agentic workflow is that **real observations alter the next decision**, rather than executing a hardcoded sequence:

```mermaid
stateDiagram-v2
    [*] --> IntakeValidation: Receive APK Buffer
    
    IntakeValidation --> TerminateFailure: Invalid ZIP / Missing Manifest
    IntakeValidation --> InspectManifest: Valid APK (SHA-256 computed)

    InspectManifest --> AnalyzePermissions: Manifest declares permissions
    InspectManifest --> ScanComponents: Manifest has IPC components
    
    AnalyzePermissions --> ScanComponents: Next priority
    
    ScanComponents --> CheckNetwork: usesCleartextTraffic=true OR internet perm
    ScanComponents --> ScanBytecode: usesCleartextTraffic=false & clean IPC
    
    CheckNetwork --> ScanBytecode: classes.dex exists in archive
    CheckNetwork --> FinalizeAnalysis: No DEX file present
    
    ScanBytecode --> FinalizeAnalysis: Bytecode scan finished
    
    FinalizeAnalysis --> [*]: Save Session & Render Findings
```

### Demonstrable Branching Scenarios in VulnScope:
1. **Vulnerable Package Branch (`vulnerable_bank.apk`):**
   - Manifest inspection observes `android:usesCleartextTraffic="true"`, `android:debuggable="true"`, and exported components without permissions.
   - The planner adaptively schedules `ACTION_INSPECT_NETWORK_CONFIG` and `ACTION_SCAN_DEX_SECRETS` to verify the presence of cleartext endpoints and embedded credentials.
   - Result: 8+ verified findings (Grade F).
2. **Hardened Package Branch (`hardened_app.apk`):**
   - Manifest inspection observes `debuggable="false"`, `allowBackup="false"`, `usesCleartextTraffic="false"`, and 0 unprotected exported components.
   - Bytecode scan finds zero hardcoded API keys and TLS v1.3 only.
   - Result: 0 critical/high findings (Grade A).

---

## 4. Core Data Structures

### 4.1 AnalysisSession Data Model
```typescript
interface AnalysisSession {
  sessionId: string;                        // Unique identifier, e.g. "VC-SES-1718..."
  status: 'Queued' | 'Running' | 'Completed' | 'Failed';
  agentMode: 'DeterministicFallback' | 'LLMAgent';
  llmProvider?: string;                     // e.g. "Google Gemini (gemini-1.5-flash)"
  targetApk: ApkMetadata;                   // SHA-256, filename, package, SDKs
  durationSeconds: number;
  totalActionsExecuted: number;
  executionTrace: ActionExecutionRecord[];  // Full chronological history
  findings: SecurityFinding[];              // Verified findings with evidence
  summary: {
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    securityPostureRating: 'A' | 'B' | 'C' | 'D' | 'F';
    summaryNarrative: string;
  };
}
```

### 4.2 ActionExecutionRecord Data Model
```typescript
interface ActionExecutionRecord {
  stepNumber: number;
  actionId: string;                        // e.g. "ACTION_INSPECT_MANIFEST"
  actionName: string;
  input: Record<string, any>;
  status: 'SUCCESS' | 'FAILURE' | 'TIMEOUT';
  startedAt: string;
  completedAt: string;
  durationMs: number;
  output: Record<string, any>;             // Structured programmatic output
  observation: string;                     // Concise summary ingested by agent
  decisionRationale: string;               // Why this action was chosen based on prior steps
  error?: string;
}
```

### 4.3 SecurityFinding Data Model
```typescript
interface SecurityFinding {
  stableId: string;                        // e.g. "VC-DEX-001"
  title: string;                           // "Hardcoded Google Cloud API Key in Bytecode"
  description: string;
  category: string;                        // "Hardcoded Credentials"
  owaspCategory: string;                   // "MASVS-CRYPTO"
  cwe: string;                             // "CWE-798"
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  confidence: 'Confirmed' | 'Suspected' | 'Inconclusive';
  verificationStatus: 'Verified' | 'Detected' | 'Suspected' | 'Inconclusive';
  evidence: string;                        // Exact extracted token or XML attribute
  location: string;                        // e.g. "classes.dex:StringPool"
  sourceTool: string;                      // "VulnScope DEX String Analyzer v1.0"
  remediation: string;
  sessionId: string;
  timestamp: string;
}
```
