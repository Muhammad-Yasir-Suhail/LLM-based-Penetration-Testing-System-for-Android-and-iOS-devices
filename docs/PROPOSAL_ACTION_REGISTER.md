# VulnCope — Proposal Action Register (Mid Evaluation 01)
**Project Title:** AI-Assisted Vulnerability Detection and Security Analysis of Mobile Applications  
**Framework Name:** VulnCope  
**Degree Program:** BS Software Engineering — Final Year Project (FYP-2)  
**Evaluation Milestone:** Mid Evaluation 01 (Rubric Area R1 — 10 Marks)

---

## 1. Overview and Purpose

This register tracks all actionable recommendations, scope adjustments, and technical commitments established during initial proposal review. It provides transparent implementation evidence, current operational statuses, and honest boundary limitations for each item.

---

## 2. Action Tracking Register

| Action ID | Proposal Recommendation / Action Item | Responsible Team Member | Status | Implementation Evidence in Codebase | Technical Limitation / Boundary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ACT-01** | **Evolve beyond a simple chatbot/wrapper into an evidence-driven agentic framework.** | Lead Developer (Member 1) | **Completed** | Implemented `AgentController` (`src/lib/security/agentController.ts`) and `ToolRegistry` (`src/lib/security/toolRegistry.ts`) with bounded adaptive decision loop. | The agent is strictly bounded to allowlisted registered security actions; arbitrary command execution is explicitly disallowed. |
| **ACT-02** | **Replace simulated security scanning with genuine Android static analysis.** | Core Engineer (Member 2) | **Completed** | Pure in-process binary `AxmlParser` (`src/lib/security/axmlParser.ts`), `ManifestAnalyzer` (`manifestAnalyzer.ts`), and `DexAnalyzer` (`dexAnalyzer.ts`). | Focuses on static analysis & bytecode deconstruction; full dynamic instrumentation (Frida runtime hooking) is deferred to FYP-2 final milestone. |
| **ACT-03** | **Enforce strict security boundaries on APK intake and storage.** | Lead Developer (Member 1) | **Completed** | `ApkValidator` (`apkValidator.ts`) checks PKZIP headers, enforces 100MB limit, computes SHA-256 digests, stores in private `storage/uploads/` (gitignored). | Uploaded packages are never executed; non-ZIP or malformed archives are immediately rejected with HTTP 422. |
| **ACT-04** | **Ground all security findings in traceable technical evidence.** | Core Engineer (Member 2) | **Completed** | `SecurityFinding` structure with `evidence`, `location`, `verificationStatus: 'Verified'`, and OWASP MASVS / CWE mapping. | Only configurations directly observed in manifest or DEX string pool are marked `Verified`; speculative issues remain `Suspected`. |
| **ACT-05** | **Provide an auditable execution trace for agent decisions.** | Lead Developer (Member 1) | **Completed** | Full timeline in `AnalysisSession.executionTrace` displaying step number, action ID, observation, and explicit decision rationale. | Trace records concise structured summaries to avoid context window explosion when interfacing with LLM providers. |
| **ACT-06** | **Implement provider-independent LLM integration with deterministic fallback.** | Lead Developer (Member 1) | **Completed** | `llmPlanner.ts` supports OpenAI and Google Gemini via structured JSON outputs; automatically falls back to deterministic rule engine if API key is unconfigured. | LLM decisions require external internet connectivity and valid API credentials; deterministic mode guarantees 100% offline reproducibility. |
| **ACT-07** | **Refine product UI to avoid generic enterprise clutter and prioritize the developer workspace.** | Core Engineer (Member 2) | **Completed** | Restructured `/analysis/run`, `/analysis`, and `/dashboard` using restrained dark developer palette, clear typography, and Discord/Antigravity inspired utility. | Advanced prototype visualizations (Attack Surface topology, correlation views) are retained but honestly badged as Demo Data. |
| **ACT-08** | **Establish executable acceptance test suite for grading defense.** | Core Engineer (Member 2) | **Completed** | Automated test runner (`scripts/run_security_tests.ts`) verifying FR-01 through FR-07 against real vulnerable and hardened benchmark APKs. | Tests evaluate against bundled benchmark fixtures; expanded fuzzing corpus planned for subsequent sprint. |

---

## 3. Scope Boundaries & FYP-2 Evaluation Commitments

- **Platform Focus:** Android is the primary operational implementation platform for Mid Evaluation 01. iOS source analysis remains part of the long-term research direction.
- **Defensive Research Guarantee:** VulnCope does not construct autonomous exploit payloads or perform unauthorized network intrusion. All testing is conducted on applications owned by the team or authorized benchmark packages.
- **Verification Integrity:** An issue is never flagged as "Verified" simply because an LLM asserted it. Verification requires programmatic confirmation from the parser or analyzer.
