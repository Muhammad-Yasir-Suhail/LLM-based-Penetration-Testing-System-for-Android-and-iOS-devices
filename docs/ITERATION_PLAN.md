# VulnScope — Iteration Plan & Work Breakdown (Mid Evaluation 01)
**Project Title:** AI-Assisted Vulnerability Detection and Security Analysis of Mobile Applications  
**Team Composition:** 2 Software Engineering Team Members  
**Milestone Focus:** Mid Evaluation 01 Implementation & Demonstration  
**Rubric Area:** R2 — 10 Marks

---

## 1. Team Allocation & Role Ownership

| Team Member | Primary Technical Role | Core Implementation Ownership | Reporting & Evaluation Ownership |
| :--- | :--- | :--- | :--- |
| **Member 1 (Lead Developer / Architecture)** | Agent Controller & Decision Engine | `AgentController`, `ToolRegistry`, `llmPlanner`, Backend API Route Handlers (`/api/analysis/*`), Session Persistence | Agent decision architecture documentation, sequence diagrams, proposal action register |
| **Member 2 (Core Security & Frontend UI)** | Security Analyzers & Developer UI | `AxmlParser`, `ApkValidator`, `ManifestAnalyzer`, `DexAnalyzer`, Analysis Run UI (`/analysis/run`), Acceptance Test Suite | Requirements-to-tests mapping, benchmark fixture generation, live demo presentation script |

---

## 2. Milestone Schedule & Work Breakdown Structure (WBS)

### Milestone 1: Environment Audit, Rebranding, and Baseline Checkpoint (Completed)
- **Task 1.1:** Audit existing Next.js codebase, dependencies, build status, and Git history. *(Owner: Member 1)*
- **Task 1.2:** Rebrand product identity from SentinelX to VulnScope across visible branding and metadata. *(Owner: Member 2)*
- **Task 1.3:** Configure secure storage directory `.vulnscope` and `storage/uploads/` in `.gitignore`. *(Owner: Member 1)*
- **Deliverable:** Clean baseline Git commit and verified compilation.

### Milestone 2: Genuine Static & Bytecode Analysis Core (Completed)
- **Task 2.1:** Implement PKZIP and SHA-256 intake validator with 100MB configurable limit (`apkValidator.ts`). *(Owner: Member 1)*
- **Task 2.2:** Build binary `AndroidManifest.xml` compiled AXML decoder (`axmlParser.ts`). *(Owner: Member 2)*
- **Task 2.3:** Implement manifest security rule engine: debuggable, cleartext traffic, backup, exported components, permissions (`manifestAnalyzer.ts`). *(Owner: Member 2)*
- **Task 2.4:** Build Dalvik Executable (`classes.dex`) string pool parser and secret/crypto regex scanner (`dexAnalyzer.ts`). *(Owner: Member 2)*
- **Deliverable:** Working in-process static security deconstruction without external binary dependencies.

### Milestone 3: Bounded Agentic Decision Loop & Tool Registry (Completed)
- **Task 3.1:** Implement allowlisted `ToolRegistry` with strict schema validation and timeouts (`toolRegistry.ts`). *(Owner: Member 1)*
- **Task 3.2:** Build adaptive `AgentController` executing observation-driven action transitions (`agentController.ts`). *(Owner: Member 1)*
- **Task 3.3:** Implement `llmPlanner` supporting OpenAI and Gemini API with deterministic rule-based fallback (`llmPlanner.ts`). *(Owner: Member 1)*
- **Task 3.4:** Build local session persistence store (`sessionStore.ts`). *(Owner: Member 1)*
- **Deliverable:** Autonomous decision loop compiling verified findings and complete execution trace.

### Milestone 4: Next.js API Routes & UI Centerpiece Integration (Completed)
- **Task 4.1:** Implement `/api/analysis/upload`, `/api/analysis/run`, `/api/analysis/sessions`, and `/api/analysis/fixtures`. *(Owner: Member 1)*
- **Task 4.2:** Rebuild `/analysis/run` into a live agentic pipeline with APK upload and 1-click benchmark evaluation. *(Owner: Member 2)*
- **Task 4.3:** Update `/analysis` and `/analysis/[id]` to render live session audit traces alongside clearly labeled sample data. *(Owner: Member 2)*
- **Task 4.4:** Refine dashboard navigation and remove generic visual clutter. *(Owner: Member 2)*
- **Deliverable:** Demonstrable, responsive web workspace ready for live defense presentation.

### Milestone 5: Test Automation & Benchmark Verification (Completed)
- **Task 5.1:** Generate test fixtures: `vulnerable_bank.apk`, `hardened_app.apk`, corrupt archive, missing manifest (`generate_fixtures.js`). *(Owner: Member 2)*
- **Task 5.2:** Build automated acceptance test runner verifying FR-01 through FR-07 (`run_security_tests.ts`). *(Owner: Member 2)*
- **Task 5.3:** Validate production build (`npm run build`) and test suite (`npm run test:security`). *(Owner: Member 1 & 2)*
- **Deliverable:** 9/9 passing automated tests and clean production build.

---

## 3. Dependency Management Matrix

```
[Milestone 1: Baseline Checkpoint]
           │
           ▼
[Milestone 2: Security Analyzers (AXML/DEX)] ──┐
           │                                   │
           ▼                                   ▼
[Milestone 3: Tool Registry & Agent Controller]
           │
           ▼
[Milestone 4: Next.js APIs & UI Centerpiece]
           │
           ▼
[Milestone 5: Benchmark Tests & Evaluation Defense]
```

---

## 4. Delay-Recovery & Contingency Plan

| Risk / Potential Delay | Impact | Mitigation Strategy Implemented in Code |
| :--- | :--- | :--- |
| **LLM Provider API Key Unavailable or Rate Limited** | High (could block agent demonstration) | **Implemented `DeterministicRulePlanner` fallback:** The controller automatically falls back to an auditable rule engine that executes the full decision loop offline with zero fabricated data. |
| **Target APK Unavailable During Live Demo** | High (evaluation delay while searching for test files) | **Pre-bundled Authorized Benchmarks:** 1-Click "Insecure Bank Benchmark" and "Hardened Vault Benchmark" embedded in the UI and test fixtures. |
| **Complex External Binary Installation Failures (e.g. Frida / MobSF / JADX)** | Critical (tools fail on evaluation host machine) | **Self-Contained In-Process Engines:** All parsing (ZIP, AXML, DEX) is implemented in clean TypeScript/Node without requiring system Java or external binaries. |
| **Build / Typechecking Errors on Windows** | Medium | **Target ES5/ESNext Compatibility Checked:** Ensured standard Map iterations and regex flags compile smoothly under Next.js 14 and Node 24. |
