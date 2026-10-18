# VulnCope — Requirements Traceability & Acceptance Criteria (R4)
**Project Title:** AI-Assisted Vulnerability Detection and Security Analysis of Mobile Applications  
**Milestone Focus:** Mid Evaluation 01  
**Rubric Area:** R4 — 10 Marks

---

## 1. Functional Requirements Matrix

| Req ID | Requirement Statement | Acceptance Criteria | Implementation Component | Test Verification Case in `scripts/run_security_tests.ts` | Test Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-01** | **APK Intake & Validation** | Validate PKZIP format, verify presence of `AndroidManifest.xml`, calculate SHA-256 and MD5 digests, enforce 100MB limit, reject corrupt archives. | `src/lib/security/apkValidator.ts`, `/api/analysis/upload` | `[TEST] FR-01: Valid Authorized APK intake...`<br>`[TEST] FR-01: Reject corrupt / non-ZIP archive...`<br>`[TEST] FR-01: Reject ZIP archive lacking manifest...` | **PASSED** |
| **FR-02** | **Allowlisted Tool Execution** | Allow only registered security analysis actions to execute with validated input schema and bounded timeouts. | `src/lib/security/toolRegistry.ts` | `[TEST] FR-02: Enforce registered action allowlist and verify execution handler output` | **PASSED** |
| **FR-03** | **Result & State Persistence** | Persist complete analysis session, ordered action execution trace, real tool outputs, and findings to local disk and memory. | `src/lib/security/sessionStore.ts`, `/api/analysis/sessions` | `[TEST] FR-03: Persist analysis session to local storage and retrieve by ID` | **PASSED** |
| **FR-04** | **Adaptive Decision Loop** | Select subsequent analysis actions dynamically based on preceding tool observations (e.g., manifest flags trigger component and network checks). | `src/lib/security/agentController.ts`, `src/lib/security/llmPlanner.ts` | `[TEST] FR-04: Observation-driven adaptive decision loop discovers real vulnerabilities`<br>`[TEST] FR-04: Hardened APK produces zero false-positives and rating A` | **PASSED** |
| **FR-05** | **Security Boundary Enforcement** | Reject arbitrary command execution, unknown action IDs, or shell injection attempts at the controller boundary. | `src/lib/security/agentController.ts` | `[TEST] FR-05: Controller rejects unregistered / arbitrary shell action at security boundary` | **PASSED** |
| **FR-06** | **Traceable Evidence & Verification** | Every finding must include exact technical evidence (manifest XML attribute or DEX string), location, CWE, OWASP MASVS, and explicit verification status. | `src/lib/security/manifestAnalyzer.ts`, `src/lib/security/dexAnalyzer.ts` | `[TEST] FR-06: Every discovered finding contains traceable evidence, location, and Verified status` | **PASSED** |
| **FR-07** | **Interactive UI Integration** | Display real session status, live agent decisions, observations, real findings, and execution history in the web interface. | `src/app/(dashboard)/analysis/run/page.tsx`, `src/app/(dashboard)/analysis/page.tsx`, `src/app/(dashboard)/analysis/[id]/page.tsx` | Production build verification (`npm run build`) + UI interactive flow check | **PASSED** |

---

## 2. Non-Functional Requirements (NFR)

| NFR ID | Category | Requirement Statement | Architectural Implementation |
| :--- | :--- | :--- | :--- |
| **NFR-01** | **Input Sanitization & Path Traversal** | Uploaded filenames and storage keys must be sanitized against path traversal (`../`) and illegal character injection. | `path.basename` sanitization in `/api/analysis/upload` and `/api/analysis/run`. |
| **NFR-02** | **Bounded Execution** | The agent decision loop must strictly enforce a maximum action boundary (default: 8 steps) to prevent runaway execution. | Controlled iteration counter and `maxSteps` boundary in `AgentController.runAnalysis()`. |
| **NFR-03** | **Execution Timeouts** | Individual tool actions must be constrained by execution timeouts (5s to 15s) to prevent thread hangs. | `Promise.race` timeout wrapper in `AgentController.executeWithTimeout()`. |
| **NFR-04** | **Secret Management** | LLM API credentials must never be committed to Git, leaked to the frontend client bundle, or logged to disk. | Server-side environment variables (`.env.local`), placeholder `.env.example`, gitignored storage. |
| **NFR-05** | **Safe Storage** | Uploaded packages and extracted bytecode must be stored in private, unserved directories (`storage/uploads/`, `.vulncope/`). | Gitignored storage directories outside the public Next.js static asset root. |
| **NFR-06** | **Offline Reproducibility** | The platform must remain 100% functional and demonstrable even when internet connectivity or third-party LLM API keys are unavailable. | `DeterministicRulePlanner` fallback providing verified, honest offline execution. |
