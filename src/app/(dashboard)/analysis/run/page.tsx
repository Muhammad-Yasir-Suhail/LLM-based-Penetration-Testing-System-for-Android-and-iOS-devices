'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Upload,
  FileCode,
  Layers,
  Cpu,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  ArrowRight,
  RotateCw,
  Lock,
  ChevronDown,
  ChevronUp,
  Download,
  Bot,
  Zap,
  Info,
  Check
} from 'lucide-react';
import { AnalysisSession, ActionExecutionRecord, SecurityFinding } from '@/types/agent';

export default function RunAnalysisPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'upload'>('benchmarks');
  const [selectedFixture, setSelectedFixture] = useState<string>('vulnerable_bank');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [session, setSession] = useState<AnalysisSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
  const [activeFindingFilter, setActiveFindingFilter] = useState<'all' | 'Critical' | 'High' | 'Medium'>('all');

  const toggleStep = (stepNumber: number) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.apk')) {
      setFileError('Invalid file format. Please select an Android .apk package.');
      setSelectedFile(null);
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setFileError('File exceeds authorized maximum limit of 100MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const runAnalysis = async (fixtureId?: string) => {
    setIsRunning(true);
    setError(null);
    setSession(null);

    try {
      let res: Response;

      if (fixtureId) {
        res = await fetch('/api/analysis/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fixtureId })
        });
      } else if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        res = await fetch('/api/analysis/run', {
          method: 'POST',
          body: formData
        });
      } else {
        throw new Error('No target package selected for analysis.');
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Security analysis execution failed.');
      }

      setSession(data.session);
      // Auto-expand last step
      if (data.session.executionTrace?.length) {
        setExpandedSteps({ [data.session.executionTrace.length]: true });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected execution error occurred.');
    } finally {
      setIsRunning(false);
    }
  };

  const downloadSessionJson = () => {
    if (!session) return;
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vulncope_${session.sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredFindings = session?.findings.filter((f) => {
    if (activeFindingFilter === 'all') return true;
    return f.severity === activeFindingFilter;
  }) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className={`w-6 h-6 ${isRunning ? 'animate-pulse text-emerald-300' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 tracking-wider">
                  VulnCope Agent Core
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  Android Static & Bytecode Sandbox
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                Agentic Security Analysis Pipeline
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Evidence-grounded autonomous security testing loop: observe real tool outputs, adapt subsequent actions, and record traceable findings.
              </p>
            </div>
          </div>

          {session && (
            <div className="flex items-center gap-2">
              <button
                onClick={downloadSessionJson}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-colors"
                title="Download complete session audit JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit JSON</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Intake Control Panel (when not running or can select new target) */}
      {!session && !isRunning && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">
              Select Target Application
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('benchmarks')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                  activeTab === 'benchmarks'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                Authorized Benchmarks (1-Click)
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                  activeTab === 'upload'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                Upload Authorized APK
              </button>
            </div>
          </div>

          {/* TAB 1: 1-Click Evaluation Benchmarks */}
          {activeTab === 'benchmarks' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Authorized benchmark test APK fixtures packaged for immediate university evaluation and reproducible defense demonstrations.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vulnerable Bank Benchmark */}
                <div
                  onClick={() => setSelectedFixture('vulnerable_bank')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                    selectedFixture === 'vulnerable_bank'
                      ? 'bg-rose-950/20 border-rose-500/50 ring-1 ring-rose-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">Insecure Bank Benchmark</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold">
                          Deliberate Vulns
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        com.vulncope.insecurebank (v1.0.1) • 1.1 KB
                      </p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedFixture === 'vulnerable_bank'
                          ? 'border-rose-400 bg-rose-500 text-white'
                          : 'border-slate-700'
                      }`}
                    >
                      {selectedFixture === 'vulnerable_bank' && <Check className="w-2.5 h-2.5" />}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Test package with verified security flaws: debuggable=true, cleartext traffic permitted, unprotected exported IPC services, and embedded Google Cloud/AWS credentials in classes.dex.
                  </p>

                  <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-rose-300">CWE-798 (Secrets)</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-rose-300">CWE-215 (Debug)</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-rose-300">CWE-319 (Cleartext)</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-rose-300">CWE-926 (Exported IPC)</span>
                  </div>
                </div>

                {/* Hardened Benchmark */}
                <div
                  onClick={() => setSelectedFixture('hardened_app')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                    selectedFixture === 'hardened_app'
                      ? 'bg-emerald-950/20 border-emerald-500/50 ring-1 ring-emerald-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">Hardened Vault Benchmark</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                          Secure Baseline
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        com.vulncope.securevault (v2.4.0) • 0.8 KB
                      </p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedFixture === 'hardened_app'
                          ? 'border-emerald-400 bg-emerald-500 text-white'
                          : 'border-slate-700'
                      }`}
                    >
                      {selectedFixture === 'hardened_app' && <Check className="w-2.5 h-2.5" />}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Hardened Android application adhering to MASVS baseline: debuggable disabled, backup false, TLS enforced, no unprotected IPC components, clean bytecode.
                  </p>

                  <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300">0 Critical / High</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300">Posture Rating A</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300">MASVS Clean</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => runAnalysis(selectedFixture)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Activity className="w-4 h-4" />
                  <span>Execute Benchmark Analysis</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Upload Authorized APK */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Upload an authorized Android package (.apk) from local disk for automated intake validation and static security deconstruction.
              </p>

              <div className="border-2 border-dashed border-slate-700 hover:border-slate-600 rounded-xl p-8 text-center space-y-3 bg-slate-950/40">
                <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-xs text-slate-300">
                  <label htmlFor="apk-file" className="text-emerald-400 font-bold hover:underline cursor-pointer">
                    Browse files
                  </label>{' '}
                  or drag & drop your authorized Android .apk file
                </div>
                <p className="text-[11px] font-mono text-slate-500">
                  Maximum file size: 100 MB • Cryptographic SHA-256 computed on intake
                </p>
                <input
                  id="apk-file"
                  type="file"
                  accept=".apk"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs mt-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}

                {fileError && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-xs mt-2">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>{fileError}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  disabled={!selectedFile}
                  onClick={() => runAnalysis()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Activity className="w-4 h-4" />
                  <span>Upload & Run Security Pipeline</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State during analysis execution */}
      {isRunning && (
        <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-4">
          <div className="inline-flex p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
            <RotateCw className="w-8 h-8 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-mono">
              Autonomous Agent Execution Loop in Progress...
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Extracting ZIP layout, inspecting AndroidManifest.xml, validating component permissions, checking cleartext TLS policy, and scanning Dalvik bytecode string pool.
            </p>
          </div>
        </div>
      )}

      {/* Error Card */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* LIVE ANALYSIS RESULTS VIEW */}
      {session && (
        <div className="space-y-6">
          {/* Session Overview Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Session Identifier</span>
              <span className="text-xs font-bold text-white truncate block">{session.sessionId}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Execution Duration</span>
              <span className="text-xs font-bold text-white flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {session.durationSeconds}s ({session.totalActionsExecuted} steps)
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Planner Mode</span>
              <span className="text-xs font-bold text-emerald-400 truncate block">
                {session.agentMode === 'LLMAgent' ? session.llmProvider || 'LLM Agent' : 'Deterministic Engine'}
              </span>
            </div>
            <div
              className={`p-3.5 rounded-xl border space-y-1 ${
                session.summary.securityPostureRating === 'A'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : session.summary.securityPostureRating === 'F'
                  ? 'bg-rose-500/10 border-rose-500/30'
                  : 'bg-amber-500/10 border-amber-500/30'
              }`}
            >
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Posture Rating</span>
              <div className="flex items-center justify-between">
                <span
                  className={`text-base font-extrabold ${
                    session.summary.securityPostureRating === 'A'
                      ? 'text-emerald-400'
                      : session.summary.securityPostureRating === 'F'
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}
                >
                  Grade {session.summary.securityPostureRating}
                </span>
                <span className="text-[11px] text-slate-300">
                  {session.findings.length} findings
                </span>
              </div>
            </div>
          </div>

          {/* Target APK Metadata Strip */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Analyzed Package</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">{session.targetApk.fileName}</span>
                {session.targetApk.packageName && (
                  <span className="text-slate-400">({session.targetApk.packageName})</span>
                )}
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px]">
                  {session.targetApk.fileSizeFormatted}
                </span>
              </div>
            </div>

            <div className="space-y-1 text-slate-400 text-[11px]">
              <span className="text-[10px] uppercase font-semibold block">SHA-256 Fingerprint</span>
              <span className="text-slate-300 font-mono select-all truncate block max-w-sm">
                {session.targetApk.sha256}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSession(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
              >
                Analyze Another APK
              </button>
            </div>
          </div>

          {/* AGENTIC EXECUTION TRACE (Step-by-step adaptive decisions) */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                  Agent Execution Trace & Adaptive Decisions
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {session.executionTrace.length} Allowlisted Actions Executed
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {session.executionTrace.map((record) => {
                const isExpanded = !!expandedSteps[record.stepNumber];
                return (
                  <div
                    key={record.stepNumber}
                    className="rounded-xl border border-slate-800/80 bg-slate-950/70 overflow-hidden"
                  >
                    <div
                      onClick={() => toggleStep(record.stepNumber)}
                      className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-900/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">
                          {record.stepNumber}
                        </span>
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-bold text-white truncate">{record.actionName}</span>
                          <span className="text-[10px] text-slate-400 hidden sm:inline truncate">
                            ({record.actionId})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          {record.durationMs}ms
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            record.status === 'SUCCESS'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {record.status}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Step Details & Rationale */}
                    <div className="px-4 pb-3.5 pt-1 space-y-2.5 border-t border-slate-800/40 text-[11px]">
                      {/* Observation */}
                      <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                        <span className="text-[9px] uppercase font-bold text-emerald-400 block tracking-wider">
                          Observed Tool Evidence
                        </span>
                        <p className="text-slate-200 leading-relaxed font-sans">{record.observation}</p>
                      </div>

                      {/* Decision Rationale */}
                      <div className="p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-500/30 space-y-1">
                        <span className="text-[9px] uppercase font-bold text-indigo-400 block tracking-wider">
                          Agent Decision Rationale (Why this action was selected)
                        </span>
                        <p className="text-indigo-200 leading-relaxed font-sans">{record.decisionRationale}</p>
                      </div>

                      {/* Collapsible raw JSON */}
                      {isExpanded && record.output && (
                        <div className="pt-1">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                            Structured Action Output JSON
                          </span>
                          <pre className="p-2.5 rounded-lg bg-[#07090e] border border-slate-800 text-[10px] text-slate-300 overflow-x-auto max-h-48">
                            {JSON.stringify(record.output, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DISCOVERED EVIDENCE-BACKED FINDINGS */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                  Evidence-Backed Security Findings ({session.findings.length})
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Traceable security findings mapped to OWASP MASVS and Common Weakness Enumeration (CWE).
                </p>
              </div>

              {/* Severity filter pills */}
              <div className="flex gap-1.5 font-mono text-[11px]">
                <button
                  onClick={() => setActiveFindingFilter('all')}
                  className={`px-2.5 py-1 rounded-lg ${
                    activeFindingFilter === 'all'
                      ? 'bg-slate-700 text-white font-bold'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  All ({session.findings.length})
                </button>
                <button
                  onClick={() => setActiveFindingFilter('Critical')}
                  className={`px-2.5 py-1 rounded-lg ${
                    activeFindingFilter === 'Critical'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  Critical ({session.summary.criticalCount})
                </button>
                <button
                  onClick={() => setActiveFindingFilter('High')}
                  className={`px-2.5 py-1 rounded-lg ${
                    activeFindingFilter === 'High'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  High ({session.summary.highCount})
                </button>
                <button
                  onClick={() => setActiveFindingFilter('Medium')}
                  className={`px-2.5 py-1 rounded-lg ${
                    activeFindingFilter === 'Medium'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  Medium ({session.summary.mediumCount})
                </button>
              </div>
            </div>

            {/* Finding Cards */}
            {filteredFindings.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-white font-mono">No findings detected for this filter</p>
                <p className="text-xs text-slate-400 font-sans">
                  The application passed the evaluated checks cleanly.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFindings.map((finding) => (
                  <div
                    key={finding.stableId}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            finding.severity === 'Critical'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : finding.severity === 'High'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                          }`}
                        >
                          {finding.severity}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-300">{finding.stableId}</span>
                        <span className="text-sm font-bold text-white">{finding.title}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
                          Verified
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{finding.cwe}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{finding.owaspCategory}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{finding.description}</p>

                    {/* Exact Technical Evidence */}
                    <div className="p-3 rounded-lg bg-[#07090e] border border-slate-800 space-y-1 font-mono text-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>TECHNICAL EVIDENCE ({finding.sourceTool})</span>
                        <span className="text-slate-500">{finding.location}</span>
                      </div>
                      <pre className="text-emerald-300 overflow-x-auto whitespace-pre-wrap select-all text-[11px] bg-slate-900/50 p-2 rounded">
                        {finding.evidence}
                      </pre>
                    </div>

                    {/* Remediation */}
                    <div className="text-xs text-slate-400 font-sans">
                      <span className="font-bold text-slate-200">Recommended Remediation: </span>
                      {finding.remediation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
