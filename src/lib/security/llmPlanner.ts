import { RegisteredAction, ActionExecutionRecord, ApkMetadata } from '@/types/agent';
import { ToolRegistry } from './toolRegistry';

export interface PlannerDecision {
  actionId: string;
  rationale: string;
  input: Record<string, any>;
  isTerminal: boolean;
  plannerType: 'LLMAgent' | 'DeterministicFallback';
  providerName?: string;
}

export interface PlannerContext {
  targetApk: ApkMetadata;
  trace: ActionExecutionRecord[];
  allActions: RegisteredAction[];
  toolRegistry: ToolRegistry;
  stepCount: number;
  maxSteps: number;
}

export async function planNextAction(context: PlannerContext): Promise<PlannerDecision> {
  const { targetApk, trace, allActions, toolRegistry, stepCount, maxSteps } = context;

  // Enforce bounded execution limit
  if (stepCount >= maxSteps) {
    return {
      actionId: 'ACTION_FINISH_ANALYSIS',
      rationale: `Reached maximum execution boundary of ${maxSteps} steps. Finalizing session safely.`,
      input: { summaryNote: 'Reached maximum bounded execution steps.' },
      isTerminal: true,
      plannerType: 'DeterministicFallback'
    };
  }

  // Check if an LLM API key is configured
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (openaiKey && openaiKey.trim().length > 10) {
    try {
      const decision = await callOpenAiPlanner(context, openaiKey);
      if (toolRegistry.isActionSupported(decision.actionId)) {
        return decision;
      }
    } catch {
      // Fall through to deterministic fallback if LLM request fails
    }
  } else if (geminiKey && geminiKey.trim().length > 10) {
    try {
      const decision = await callGeminiPlanner(context, geminiKey);
      if (toolRegistry.isActionSupported(decision.actionId)) {
        return decision;
      }
    } catch {
      // Fall through to deterministic fallback
    }
  }

  // Deterministic Adaptive Rule-Based Planner (auditable, reproducible fallback)
  return planDeterministicAction(context);
}

function planDeterministicAction(context: PlannerContext): PlannerDecision {
  const { targetApk, trace } = context;
  const executedActionIds = new Set(trace.map((t) => t.actionId));

  // Step 1: Package Validation
  if (!executedActionIds.has('ACTION_VALIDATE_PACKAGE')) {
    return {
      actionId: 'ACTION_VALIDATE_PACKAGE',
      rationale:
        'Initial intake step: Validate APK file format, verify ZIP structure, compute SHA-256 fingerprint, and confirm AndroidManifest presence.',
      input: {},
      isTerminal: false,
      plannerType: 'DeterministicFallback'
    };
  }

  // Check if validate package failed
  const validateRecord = trace.find((t) => t.actionId === 'ACTION_VALIDATE_PACKAGE');
  if (validateRecord && validateRecord.status === 'FAILURE') {
    return {
      actionId: 'ACTION_FINISH_ANALYSIS',
      rationale:
        'Package intake validation failed; aborting subsequent analysis to prevent unsafe execution.',
      input: { summaryNote: 'Package intake validation failed.' },
      isTerminal: true,
      plannerType: 'DeterministicFallback'
    };
  }

  // Step 2: Manifest Inspection
  if (!executedActionIds.has('ACTION_INSPECT_MANIFEST')) {
    return {
      actionId: 'ACTION_INSPECT_MANIFEST',
      rationale:
        'APK integrity verified. Inspecting compiled AndroidManifest.xml to extract package identity, SDK levels, and evaluate core security flags (debuggable, allowBackup, cleartext).',
      input: { includeRawSummary: true },
      isTerminal: false,
      plannerType: 'DeterministicFallback'
    };
  }

  // Step 3: Adaptive branching based on Manifest Observations
  const manifestRecord = trace.find((t) => t.actionId === 'ACTION_INSPECT_MANIFEST');
  const manifestOutput = manifestRecord?.output || {};

  // Check if permissions need analysis
  if (
    !executedActionIds.has('ACTION_ANALYZE_PERMISSIONS') &&
    (manifestOutput.totalDeclaredPermissions > 0 || manifestOutput.packageName)
  ) {
    return {
      actionId: 'ACTION_ANALYZE_PERMISSIONS',
      rationale: `Manifest declared ${manifestOutput.totalDeclaredPermissions || 0} permissions. Selecting permission analysis to check for high-privilege dangerous grants (SMS, location, mic, storage).`,
      input: { minRiskLevel: 'dangerous' },
      isTerminal: false,
      plannerType: 'DeterministicFallback'
    };
  }

  // Check if exported components need scanning
  if (
    !executedActionIds.has('ACTION_SCAN_EXPORTED_COMPONENTS') &&
    manifestOutput.totalComponents > 0
  ) {
    return {
      actionId: 'ACTION_SCAN_EXPORTED_COMPONENTS',
      rationale: `Manifest declared ${manifestOutput.totalComponents} IPC components. Scanning for unprotected exported Activities, Services, Receivers, and ContentProviders.`,
      input: { checkProtections: true },
      isTerminal: false,
      plannerType: 'DeterministicFallback'
    };
  }

  // Check if network security config needs inspection
  if (!executedActionIds.has('ACTION_INSPECT_NETWORK_CONFIG')) {
    const isCleartext = manifestOutput.usesCleartextTraffic === true;
    return {
      actionId: 'ACTION_INSPECT_NETWORK_CONFIG',
      rationale: isCleartext
        ? 'Manifest observation: Cleartext traffic is enabled. Selecting network security inspection to identify plain HTTP endpoints and TLS configuration weaknesses.'
        : 'Selecting network security inspection to evaluate TLS configuration and cleartext policies.',
      input: { correlateBytecode: true },
      isTerminal: false,
      plannerType: 'DeterministicFallback'
    };
  }

  // Check if Dalvik Bytecode needs secret & crypto scanning
  if (!executedActionIds.has('ACTION_SCAN_DEX_SECRETS') && targetApk.hasDex) {
    return {
      actionId: 'ACTION_SCAN_DEX_SECRETS',
      rationale:
        'APK contains compiled classes.dex bytecode. Scanning Dalvik string tables for hardcoded API credentials, cryptographic cipher weaknesses (DES/RC4/ECB), and permissive TrustManagers.',
      input: { scanDepth: 'standard' },
      isTerminal: false,
      plannerType: 'DeterministicFallback'
    };
  }

  // Terminal Action: Conclude
  return {
    actionId: 'ACTION_FINISH_ANALYSIS',
    rationale:
      'All registered security checks for this package profile have been completed. Compiling final findings and verified evidence audit trail.',
    input: { summaryNote: 'Automated agentic analysis pipeline completed successfully.' },
    isTerminal: true,
    plannerType: 'DeterministicFallback'
  };
}

async function callOpenAiPlanner(context: PlannerContext, apiKey: string): Promise<PlannerDecision> {
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const actionsPrompt = context.allActions
    .map((a) => `- ${a.actionId}: ${a.name} (${a.purpose})`)
    .join('\n');

  const tracePrompt = context.trace
    .map(
      (t) =>
        `Step ${t.stepNumber}: ${t.actionId} -> Status: ${t.status}\nObservation: ${t.observation}`
    )
    .join('\n\n');

  const systemMessage = `You are VulnCope's autonomous mobile security testing planner.
You select the NEXT action to run against the target APK from the allowed registry.
Never execute arbitrary commands. Select only from the provided action IDs.
Respond ONLY with a valid JSON object matching this schema:
{
  "selectedActionId": "ACTION_...",
  "rationale": "Clear, concise technical reason explaining why this action is selected based on preceding observations",
  "input": {}
}`;

  const userMessage = `Target APK: ${context.targetApk.fileName} (Size: ${context.targetApk.fileSizeFormatted}, SHA256: ${context.targetApk.sha256})

Available Actions:
${actionsPrompt}

Prior Execution Trace:
${tracePrompt || 'No actions executed yet.'}

Select the next supported action or ACTION_FINISH_ANALYSIS if sufficient evidence has been gathered.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal
    });

    if (!res.ok) {
      throw new Error(`OpenAI API returned status ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    return {
      actionId: parsed.selectedActionId,
      rationale: parsed.rationale || 'Selected by OpenAI LLM security planner.',
      input: parsed.input || {},
      isTerminal: parsed.selectedActionId === 'ACTION_FINISH_ANALYSIS',
      plannerType: 'LLMAgent',
      providerName: `OpenAI (${model})`
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function callGeminiPlanner(context: PlannerContext, apiKey: string): Promise<PlannerDecision> {
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const actionsPrompt = context.allActions
    .map((a) => `- ${a.actionId}: ${a.name} (${a.purpose})`)
    .join('\n');

  const tracePrompt = context.trace
    .map(
      (t) =>
        `Step ${t.stepNumber}: ${t.actionId} -> Status: ${t.status}\nObservation: ${t.observation}`
    )
    .join('\n\n');

  const prompt = `You are VulnCope's autonomous mobile security testing planner.
Target APK: ${context.targetApk.fileName} (SHA256: ${context.targetApk.sha256})

Available Actions:
${actionsPrompt}

Prior Execution Trace:
${tracePrompt || 'No actions executed yet.'}

Select the NEXT action to run against the target APK from the allowed registry.
Respond ONLY with a valid JSON object matching:
{
  "selectedActionId": "ACTION_...",
  "rationale": "Clear technical reason based on observations",
  "input": {}
}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.1
        }
      }),
      signal: controller.signal
    });

    if (!res.ok) {
      throw new Error(`Gemini API returned status ${res.status}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(text);

    return {
      actionId: parsed.selectedActionId,
      rationale: parsed.rationale || 'Selected by Google Gemini security planner.',
      input: parsed.input || {},
      isTerminal: parsed.selectedActionId === 'ACTION_FINISH_ANALYSIS',
      plannerType: 'LLMAgent',
      providerName: `Google Gemini (${model})`
    };
  } finally {
    clearTimeout(timeout);
  }
}
