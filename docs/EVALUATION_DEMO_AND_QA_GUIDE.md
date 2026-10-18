# VulnCope — Mid Evaluation 01 Demonstration Script & Defense Q&A Guide (R8)
**Project Title:** AI-Assisted Vulnerability Detection and Security Analysis of Mobile Applications  
**Team Members:** Member 1 (Lead Developer / Architecture) & Member 2 (Security Analyzers & UI)  
**Target Milestone:** Mid Evaluation 01  
**Rubric Area:** R8 — 10 Marks

---

## 1. Live Demonstration Path (3–5 Minute Step-by-Step Sequence)

This sequence demonstrates the genuine agentic decision core, real APK intake, observable evidence, and failure handling live before the evaluation panel.

### Step 1: Open Application & Environment Verification (Member 1)
- **Action:** Open browser to `http://localhost:3000`.
- **Narration:** "Welcome to VulnCope. Our project focuses on an evidence-grounded agentic mobile application security testing framework. Unlike simple chatbots or static wrappers, VulnCope operates an autonomous decision loop where an agent executes allowlisted tools, observes real outputs, and adapts subsequent decisions."
- **Point out:** Visible VulnCope branding, clean developer workspace UI, and the active agent core status.

### Step 2: Navigate to Live Agent Pipeline (`/analysis/run`) (Member 2)
- **Action:** Click "Launch Agent Run" or navigate to `/analysis/run`.
- **Narration:** "Here is the core analysis pipeline. Evaluators can either drag-and-drop any authorized Android .apk file or use our pre-bundled benchmark test fixtures for instant reproducibility."
- **Point out:** The two benchmark cards: `Insecure Bank Benchmark` (deliberate vulnerabilities) and `Hardened Vault Benchmark` (clean baseline).

### Step 3: Execute Positive Test Case — Insecure Bank Benchmark (Member 1 & 2)
- **Action:** Select `Insecure Bank Benchmark` and click "Execute Benchmark Analysis".
- **Narration:** "The agent begins by validating the APK structure, checking ZIP signatures, and computing a SHA-256 digest. Based on the initial observation that an AndroidManifest.xml exists, the agent plans `ACTION_INSPECT_MANIFEST`. When it observes `android:usesCleartextTraffic='true'` and exported services without permissions, it adaptively schedules IPC component scanning, network security inspection, and Dalvik bytecode scanning."
- **Point out:**
  1. The **Execution Trace**: Notice how each step shows the exact tool duration, the **Observed Tool Evidence**, and the **Agent Decision Rationale**.
  2. The **Discovered Findings**: Show the Critical hardcoded credentials (`AIzaSy...` and `AKIA...`), the High debuggable and cleartext findings, and the verified status on each.
  3. The **Traceable Technical Evidence**: Expand any finding to show the exact snippet extracted from `classes.dex` or `AndroidManifest.xml`.

### Step 4: Execute Negative / Hardened Test Case (Member 2)
- **Action:** Click "Analyze Another APK", select `Hardened Vault Benchmark`, and click "Execute Benchmark Analysis".
- **Narration:** "To demonstrate that VulnCope does not invent false positives or rely on hardcoded scan results, we run the Hardened Benchmark. The agent observes clean manifest flags, no unprotected IPC components, and no hardcoded credentials in the bytecode."
- **Point out:** 0 Critical findings, 0 High findings, Overall Security Posture: **Grade A**.

### Step 5: Demonstrate Security Boundary & Failure Handling (Member 1)
- **Action:** Run the automated acceptance test suite in terminal: `npm run test:security`.
- **Narration:** "We demonstrate our security boundary. When a corrupt or non-ZIP file is provided, or an unauthorized arbitrary shell action is attempted, the controller rejects the action at the security boundary and logs a clean failure in the audit trace."
- **Point out:** 9/9 passing tests in the terminal output.

---

## 2. Likely Evaluation Panel Questions & Technically Honest Answers

### Q1: "How is this different from just running MobSF or another scanner and sending the output to ChatGPT?"
**Technically Honest Answer (Member 1):**  
"A standard scanner-plus-wrapper approach is a rigid, one-way pipeline: it executes a predetermined set of tools, generates a static report, and asks an LLM to summarize it. In VulnCope, the LLM or planner is placed **inside an active decision loop**. The agent starts with minimal observations, selects an allowlisted action, inspects the programmatic result, and determines what to inspect next based on what it actually found. For example, if no cleartext flag or network permission is observed, the agent does not waste time or context tokens on network inspections. Furthermore, findings are never accepted merely because the LLM claimed they exist; every finding requires programmatic verification and traceable evidence."

### Q2: "What happens if you do not have an OpenAI or Gemini API key during testing or grading?"
**Technically Honest Answer (Member 1):**  
"We anticipated API unavailability, connectivity limits, and grading unpredictability. VulnCope includes an auditable `DeterministicRulePlanner` fallback. It executes the exact same allowlisted actions, evaluates the exact same observation criteria, and produces the exact same verified findings without sending any data over the internet or requiring an API key. When an API key is provided in `.env.local`, the platform seamlessly transitions to LLM-guided planning."

### Q3: "Did you decompile the APKs yourself or are you using external tools?"
**Technically Honest Answer (Member 2):**  
"For this mid-evaluation milestone, we implemented a self-contained, in-process static analyzer in TypeScript. We built an Android compiled binary XML (`AxmlParser`) that parses binary `AndroidManifest.xml` files, an `ApkValidator` that checks PKZIP layout and cryptographic digests, a `ManifestAnalyzer` that audits permissions and IPC component exposure, and a `DexAnalyzer` that extracts strings from compiled Dalvik bytecode (`classes.dex`). This ensures VulnCope runs with zero external binary dependencies on any operating system."

### Q4: "Can the LLM execute arbitrary shell commands on the server?"
**Technically Honest Answer (Member 1):**  
"No. Security boundary enforcement is a primary non-functional requirement (FR-05). The agent interacts exclusively with an allowlisted `ToolRegistry`. The controller validates every requested action ID against this registry. If an unknown action or arbitrary shell command is proposed, the controller immediately rejects it, marks the step as failed in the audit history, and halts execution safely."

### Q5: "What are the limitations of what you have built so far?"
**Technically Honest Answer (Member 2):**  
"We are honest about our current boundaries:
1. Our static analysis is targeted toward Android configuration, IPC exposure, and bytecode string table analysis; it does not yet perform full inter-procedural data-flow taint tracking.
2. Full dynamic instrumentation (Frida runtime hooking and Burp proxying) is modeled in our prototype UI but is scheduled for implementation in FYP-2 final evaluation.
3. iOS runtime testing is not yet active; our immediate evaluation milestone concentrates on the Android static core."
