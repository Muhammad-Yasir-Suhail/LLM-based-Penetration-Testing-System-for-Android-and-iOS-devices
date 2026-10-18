'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  FileCode,
  Layers,
  Radio,
  Lock,
  Eye,
  Bot,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Terminal,
  Download
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { AnalysisSession } from '@/types/agent';

export default function AnalysisDetailPage() {
  const params = useParams();
  const runId = params.id as string;
  const { analyses, findings } = useAppState();

  const [realSession, setRealSession] = useState<AnalysisSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});

  // Check if runId is a real session from API
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch(`/api/analysis/${runId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.session) {
            setRealSession(data.session);
          }
        }
      } catch {
        // Not a real session or network error
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [runId]);

  const toggleStep = (stepNumber: number) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };

  const downloadSessionJson = () => {
    if (!realSession) return;
    const blob = new Blob([JSON.stringify(realSession, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vulnscope_${realSession.sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // If this is a real session, render the Real Agentic Audit Trail View
  if (realSession) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Back Link */}
        <Link
          href="/analysis"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Analysis Runs</span>
        </Link>

        {/* Real Session Header */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  REAL AGENTIC RUN
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-white font-mono">{realSession.sessionId}</h1>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {realSession.status}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Target: <span className="text-white font-bold">{realSession.targetApk.fileName}</span> ({realSession.targetApk.packageName || 'com.android.app'}) • Duration: <span className="text-white">{realSession.durationSeconds}s</span> • Planner: <span className="text-emerald-400">{realSession.agentMode}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={downloadSessionJson}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Session JSON</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Actions Executed</span>
              <span className="text-base font-bold text-white">{realSession.totalActionsExecuted} steps</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">File Size</span>
              <span className="text-base font-bold text-white">{realSession.targetApk.fileSizeFormatted}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">SHA-256 Digest</span>
              <span className="text-[11px] font-bold text-slate-300 truncate block select-all">
                {realSession.targetApk.sha256.substring(0, 16)}...
              </span>
            </div>
            <div
              className={`p-3 rounded-xl border ${
                realSession.summary.securityPostureRating === 'A'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-rose-500/10 border-rose-500/30'
              }`}
            >
              <span className="text-[10px] text-slate-400 block font-bold">Posture Rating</span>
              <span
                className={`text-base font-extrabold ${
                  realSession.summary.securityPostureRating === 'A' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                Grade {realSession.summary.securityPostureRating}
              </span>
            </div>
          </div>
        </div>

        {/* Execution Trace Timeline */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                Agent Decision History & Action Execution Trace
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {realSession.executionTrace.length} Allowlisted Steps
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {realSession.executionTrace.map((record) => {
              const isExpanded = !!expandedSteps[record.stepNumber];
              return (
                <div
                  key={record.stepNumber}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden"
                >
                  <div
                    onClick={() => toggleStep(record.stepNumber)}
                    className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-900/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">
                        {record.stepNumber}
                      </span>
                      <div className="truncate">
                        <span className="font-bold text-white truncate">{record.actionName}</span>
                        <span className="text-[10px] text-slate-400 ml-2">({record.actionId})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] text-slate-400">{record.durationMs}ms</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {record.status}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  <div className="px-4 pb-3.5 pt-1 space-y-2 border-t border-slate-800/40 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                      <span className="text-[9px] uppercase font-bold text-emerald-400 block tracking-wider">
                        Observed Tool Evidence
                      </span>
                      <p className="text-slate-200 leading-relaxed font-sans">{record.observation}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-500/30 space-y-1">
                      <span className="text-[9px] uppercase font-bold text-indigo-400 block tracking-wider">
                        Agent Decision Rationale
                      </span>
                      <p className="text-indigo-200 leading-relaxed font-sans">{record.decisionRationale}</p>
                    </div>

                    {isExpanded && record.output && (
                      <div className="pt-1">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                          Action Output Data
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

        {/* Evidence-Backed Findings */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                Discovered Verified Security Findings ({realSession.findings.length})
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Every finding retains traceable evidence from verified AndroidManifest and classes.dex deconstructions.
              </p>
            </div>
          </div>

          {realSession.findings.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-white font-mono">Clean Security Baseline</p>
              <p className="text-xs text-slate-400 font-sans">
                No high-risk vulnerabilities or policy violations detected in this package.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {realSession.findings.map((f) => (
                <div key={f.stableId} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          f.severity === 'Critical'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : f.severity === 'High'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                        }`}
                      >
                        {f.severity}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-300">{f.stableId}</span>
                      <span className="text-sm font-bold text-white">{f.title}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold border ${
                          f.verificationStatus === 'Verified'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : f.verificationStatus === 'Suspected'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : f.verificationStatus === 'Detected'
                            ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                            : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                        }`}
                      >
                        {f.verificationStatus || 'Verified'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{f.cwe}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{f.owaspCategory}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{f.description}</p>

                  <div className="p-3 rounded-lg bg-[#07090e] border border-slate-800 space-y-1 font-mono text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>EVIDENCE ({f.sourceTool})</span>
                      <span className="text-slate-500">{f.location}</span>
                    </div>
                    <pre className="text-emerald-300 overflow-x-auto whitespace-pre-wrap select-all text-[11px] bg-slate-900/50 p-2 rounded">
                      {f.evidence}
                    </pre>
                  </div>

                  <div className="text-xs text-slate-400 font-sans">
                    <span className="font-bold text-slate-200">Recommended Remediation: </span>
                    {f.remediation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // FALLBACK: Legacy mock exploratory run view (honestly badged)
  const run = analyses.find((a) => a.id === runId) || analyses[0];
  const runFindings = findings.filter((f) => f.applicationId === run?.applicationId);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/analysis"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Analysis Runs</span>
      </Link>

      {/* Analysis Header Card */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                SAMPLE DEMO RUN (Simulated)
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white font-mono">{run?.runNumber}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {run?.status}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-xs font-mono text-slate-300 border border-slate-700">
                {run?.duration}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Target: <span className="text-slate-200">{run?.applicationName}</span> ({run?.version}) • Started: <span className="text-slate-200">{run?.startedAt}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/analysis/run"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-mono font-bold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
            >
              <Activity className="w-4 h-4" />
              <span>Launch Live Agent Run</span>
            </Link>
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Checks Evaluated</span>
            <span className="text-lg font-bold text-white">{run?.checksExecuted}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Files Analyzed</span>
            <span className="text-lg font-bold text-white">{run?.filesAnalyzed}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Rules Executed</span>
            <span className="text-lg font-bold text-white">{run?.rulesExecuted}</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
            <span className="text-rose-400 text-[10px] block font-bold">Findings Discovered</span>
            <span className="text-lg font-bold text-rose-400">
              {run?.findingsBreakdown.critical + run?.findingsBreakdown.high + run?.findingsBreakdown.medium}
            </span>
          </div>
        </div>
      </div>

      {/* Simulated Findings Preview */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">
          Sample Findings ({runFindings.length})
        </h2>
        <div className="space-y-3 font-mono text-xs">
          {runFindings.map((finding) => (
            <div key={finding.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">
                    {finding.severity}
                  </span>
                  <span className="font-bold text-white">{finding.title}</span>
                </div>
                <span className="text-slate-400 text-[11px]">{finding.cwe}</span>
              </div>
              <p className="text-slate-300 text-xs font-sans leading-relaxed">{finding.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
