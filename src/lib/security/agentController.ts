import {
  AnalysisSession,
  ActionExecutionRecord,
  SecurityFinding,
  ApkMetadata,
  AgentMode
} from '@/types/agent';
import { validateApkBuffer, ApkValidationResult } from './apkValidator';
import { defaultToolRegistry, ToolRegistry, ActionExecutionContext } from './toolRegistry';
import { planNextAction, PlannerDecision } from './llmPlanner';
import { ManifestAnalysisResult } from './manifestAnalyzer';
import { DexAnalysisResult } from './dexAnalyzer';

export interface ControllerOptions {
  sessionId?: string;
  maxSteps?: number;
  fileName?: string;
  toolRegistry?: ToolRegistry;
  onStepProgress?: (record: ActionExecutionRecord) => void;
}

export class AgentController {
  private toolRegistry: ToolRegistry;
  private maxSteps: number;

  constructor(options?: { toolRegistry?: ToolRegistry; maxSteps?: number }) {
    this.toolRegistry = options?.toolRegistry || defaultToolRegistry;
    this.maxSteps = options?.maxSteps || parseInt(process.env.AGENT_MAX_STEPS || '8', 10);
  }

  public async runAnalysis(
    apkBuffer: Buffer,
    options?: ControllerOptions
  ): Promise<AnalysisSession> {
    const startTime = Date.now();
    const sessionId = options?.sessionId || `VC-SES-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const fileName = options?.fileName || 'target.apk';

    // Initial APK intake validation
    const validationResult: ApkValidationResult = validateApkBuffer(apkBuffer, fileName);

    const targetApk: ApkMetadata = validationResult.isValid
      ? validationResult.metadata
      : {
          fileName,
          fileSizeBytes: apkBuffer?.length || 0,
          fileSizeFormatted: `${((apkBuffer?.length || 0) / 1024).toFixed(1)} KB`,
          sha256: 'unknown',
          sha1: 'unknown',
          md5: 'unknown',
          totalZipEntries: 0,
          hasManifest: false,
          hasDex: false,
          uploadedAt: new Date().toISOString()
        };

    const executionTrace: ActionExecutionRecord[] = [];
    const executionContext: ActionExecutionContext = {
      sessionId,
      apkBuffer,
      validationResult
    };

    let agentMode: AgentMode = 'DeterministicFallback';
    let llmProvider: string | undefined = undefined;

    // If initial validation failed, record the failure step and exit safely
    if (!validationResult.isValid) {
      const failedRecord: ActionExecutionRecord = {
        stepNumber: 1,
        actionId: 'ACTION_VALIDATE_PACKAGE',
        actionName: 'Validate Package Fingerprint & Integrity',
        input: {},
        status: 'FAILURE',
        startedAt: new Date(startTime).toISOString(),
        completedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
        output: {
          errorCode: validationResult.errorCode,
          errorMessage: validationResult.errorMessage
        },
        observation: `Intake validation failed: ${validationResult.errorMessage}`,
        decisionRationale: 'Initial intake step failed package validation checks.',
        error: validationResult.errorMessage
      };

      executionTrace.push(failedRecord);
      options?.onStepProgress?.(failedRecord);

      return this.compileSession(
        sessionId,
        'Failed',
        agentMode,
        targetApk,
        startTime,
        executionTrace,
        [],
        llmProvider,
        validationResult.errorMessage
      );
    }

    // Bounded Agent Decision Loop
    let stepCount = 0;
    let isTerminated = false;

    while (stepCount < this.maxSteps && !isTerminated) {
      stepCount++;

      // 1. Planner selects next action based on actual observations
      const decision: PlannerDecision = await planNextAction({
        targetApk,
        trace: executionTrace,
        allActions: this.toolRegistry.getAllRegisteredActions(),
        toolRegistry: this.toolRegistry,
        stepCount,
        maxSteps: this.maxSteps
      });

      agentMode = decision.plannerType;
      if (decision.providerName) {
        llmProvider = decision.providerName;
      }

      const actionRegistration = this.toolRegistry.getAction(decision.actionId);

      // Enforce strict security boundary: reject unregistered or unsupported actions
      if (!actionRegistration || !actionRegistration.supported) {
        const rejectedRecord: ActionExecutionRecord = {
          stepNumber: stepCount,
          actionId: decision.actionId,
          actionName: 'UNSUPPORTED_ACTION',
          input: decision.input,
          status: 'FAILURE',
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          durationMs: 0,
          output: {
            error: `Action '${decision.actionId}' is not registered or not supported in this environment.`
          },
          observation: `Security Controller rejected unsupported action '${decision.actionId}'. Allowed registry policy enforced.`,
          decisionRationale: decision.rationale,
          error: `Action '${decision.actionId}' not permitted.`
        };

        executionTrace.push(rejectedRecord);
        options?.onStepProgress?.(rejectedRecord);
        break;
      }

      // 2. Execute registered action with bounded timeout
      const stepStartTime = Date.now();
      let outputRecord: ActionExecutionRecord;

      try {
        const actionResult = await this.executeWithTimeout(
          actionRegistration.handler(decision.input, executionContext),
          actionRegistration.timeoutMs
        );

        outputRecord = {
          stepNumber: stepCount,
          actionId: actionRegistration.actionId,
          actionName: actionRegistration.name,
          input: decision.input,
          status: actionResult.status,
          startedAt: new Date(stepStartTime).toISOString(),
          completedAt: new Date().toISOString(),
          durationMs: Date.now() - stepStartTime,
          output: actionResult.output,
          observation: actionResult.observation,
          decisionRationale: decision.rationale,
          error: actionResult.error
        };
      } catch (err: any) {
        outputRecord = {
          stepNumber: stepCount,
          actionId: actionRegistration.actionId,
          actionName: actionRegistration.name,
          input: decision.input,
          status: 'FAILURE',
          startedAt: new Date(stepStartTime).toISOString(),
          completedAt: new Date().toISOString(),
          durationMs: Date.now() - stepStartTime,
          output: { error: err.message },
          observation: `Tool execution failed: ${err.message}`,
          decisionRationale: decision.rationale,
          error: err.message
        };
      }

      executionTrace.push(outputRecord);
      options?.onStepProgress?.(outputRecord);

      // Stop condition
      if (decision.isTerminal || decision.actionId === 'ACTION_FINISH_ANALYSIS') {
        isTerminated = true;
      }
    }

    // Collect all genuine findings discovered by analyzers
    const allFindings: SecurityFinding[] = [];
    if (executionContext.manifestAnalysis?.findings) {
      allFindings.push(...executionContext.manifestAnalysis.findings);
    }
    if (executionContext.dexAnalysis?.findings) {
      allFindings.push(...executionContext.dexAnalysis.findings);
    }

    // Update targetApk metadata with parsed manifest details if available
    if (executionContext.manifestAnalysis) {
      const m = executionContext.manifestAnalysis;
      targetApk.packageName = m.packageName;
      targetApk.versionCode = m.versionCode;
      targetApk.versionName = m.versionName;
      targetApk.minSdkVersion = m.minSdkVersion;
      targetApk.targetSdkVersion = m.targetSdkVersion;
    }

    return this.compileSession(
      sessionId,
      'Completed',
      agentMode,
      targetApk,
      startTime,
      executionTrace,
      allFindings,
      llmProvider
    );
  }

  private async executeWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    let timer: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`Action execution timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      return result;
    } finally {
      clearTimeout(timer!);
    }
  }

  private compileSession(
    sessionId: string,
    status: AnalysisSession['status'],
    agentMode: AgentMode,
    targetApk: ApkMetadata,
    startTime: number,
    trace: ActionExecutionRecord[],
    findings: SecurityFinding[],
    llmProvider?: string,
    errorMessage?: string
  ): AnalysisSession {
    const durationSeconds = parseFloat(((Date.now() - startTime) / 1000).toFixed(2));

    const criticalCount = findings.filter((f) => f.severity === 'Critical').length;
    const highCount = findings.filter((f) => f.severity === 'High').length;
    const mediumCount = findings.filter((f) => f.severity === 'Medium').length;
    const lowCount = findings.filter((f) => f.severity === 'Low').length;
    const infoCount = findings.filter((f) => f.severity === 'Info').length;
    const verifiedCount = findings.filter((f) => f.verificationStatus === 'Verified').length;
    const inconclusiveCount = findings.filter((f) => f.verificationStatus === 'Inconclusive').length;

    // Transparent, defensible posture rating formula
    let securityPostureRating: 'A' | 'B' | 'C' | 'D' | 'F' = 'A';
    if (criticalCount > 0) {
      securityPostureRating = 'F';
    } else if (highCount >= 3) {
      securityPostureRating = 'D';
    } else if (highCount > 0) {
      securityPostureRating = 'C';
    } else if (mediumCount > 2) {
      securityPostureRating = 'B';
    }

    const narrative =
      status === 'Failed'
        ? `Analysis terminated abnormally: ${errorMessage || 'Unknown error'}.`
        : `Autonomous security evaluation executed ${trace.length} verified action steps in ${durationSeconds}s. Discovered ${findings.length} evidence-backed findings (${criticalCount} Critical, ${highCount} High, ${mediumCount} Medium). Overall Security Posture: Rating ${securityPostureRating}.`;

    return {
      sessionId,
      status,
      agentMode,
      llmProvider,
      targetApk,
      createdAt: new Date(startTime).toISOString(),
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      durationSeconds,
      totalActionsExecuted: trace.length,
      actionsRegistry: this.toolRegistry.getAllRegisteredActions(),
      executionTrace: trace,
      findings,
      summary: {
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        infoCount,
        verifiedCount,
        inconclusiveCount,
        securityPostureRating,
        summaryNarrative: narrative
      },
      errorMessage
    };
  }
}
