'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  Clock,
  Cpu,
  Layers,
  FileCode,
  CheckCircle2,
  ExternalLink,
  Info
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { AnalysisSession } from '@/types/agent';

export default function AnalysisRunsPage() {
  const { analyses } = useAppState();
  const [realSessions, setRealSessions] = useState<AnalysisSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch('/api/analysis/sessions');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.sessions)) {
            setRealSessions(data.sessions);
          }
        }
      } catch {
        // ignore network error
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
            Security Analysis Runs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Historical autonomous agent executions, live APK static deconstructions, and traceable audit logs.
          </p>
        </div>

        <Link
          href="/analysis/run"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Activity className="w-4 h-4" />
          <span>New Agentic Analysis Run</span>
        </Link>
      </div>

      {/* Real Executions Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden space-y-2">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
            <h2 className="text-xs font-mono uppercase font-bold text-slate-200">
              Real Agentic Pipeline Runs ({realSessions.length})
            </h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">
            Backed by real APK inspection & allowlisted tools
          </span>
        </div>

        {realSessions.length === 0 && !loading ? (
          <div className="p-8 text-center space-y-3">
            <Activity className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400 font-mono">
              No live analysis runs executed yet in this session.
            </p>
            <Link
              href="/analysis/run"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-emerald-400 border border-slate-700 transition-colors"
            >
              <span>Run your first authorized APK analysis</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-mono text-slate-400 uppercase">
                  <th className="py-3 px-4 font-semibold">Session ID</th>
                  <th className="py-3 px-4 font-semibold">Target Package</th>
                  <th className="py-3 px-4 font-semibold">Planner Mode</th>
                  <th className="py-3 px-4 font-semibold">Duration</th>
                  <th className="py-3 px-4 font-semibold">Actions Executed</th>
                  <th className="py-3 px-4 font-semibold text-center">Verified Findings</th>
                  <th className="py-3 px-4 font-semibold text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {realSessions.map((session) => (
                  <tr
                    key={session.sessionId}
                    className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-bold text-white group-hover:text-emerald-400 transition-colors">
                      <Link href={`/analysis/${session.sessionId}`}>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            REAL
                          </span>
                          <span>{session.sessionId}</span>
                        </div>
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 text-slate-200">
                      <div>
                        <p className="font-semibold">{session.targetApk.fileName}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-xs">
                          {session.targetApk.packageName || 'Android Package'} • {session.targetApk.fileSizeFormatted}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 text-[11px]">
                      <span className="text-emerald-400 font-semibold">
                        {session.agentMode === 'LLMAgent' ? 'LLM Agent' : 'Deterministic Engine'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {session.durationSeconds}s
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <span>{session.totalActionsExecuted} steps</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5 text-[11px]">
                        <span className="px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">
                          {session.summary.criticalCount} Crit
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                          {session.summary.highCount} High
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30 font-bold">
                          {session.summary.mediumCount} Med
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-bold text-xs ${
                          session.summary.securityPostureRating === 'A'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : session.summary.securityPostureRating === 'F'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        Grade {session.summary.securityPostureRating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legacy Sample Exploratory Runs (Honestly Labeled) */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl overflow-hidden space-y-2 opacity-90">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0" />
            <h2 className="text-xs font-mono uppercase font-bold text-slate-300">
              Legacy Sample Exploratory Runs ({analyses.length})
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Pre-seeded prototype demo data for UI validation
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-mono text-slate-400 uppercase">
                <th className="py-3 px-4 font-semibold">Run Identifier</th>
                <th className="py-3 px-4 font-semibold">Target Application</th>
                <th className="py-3 px-4 font-semibold">Started</th>
                <th className="py-3 px-4 font-semibold">Duration</th>
                <th className="py-3 px-4 font-semibold">Checks Evaluated</th>
                <th className="py-3 px-4 font-semibold text-center">Findings (C/H/M)</th>
                <th className="py-3 px-4 font-semibold text-right">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {analyses.map((run) => (
                <tr
                  key={run.id}
                  className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-300 group-hover:text-emerald-400 transition-colors">
                    <Link href={`/analysis/${run.id}`}>
                      {run.runNumber}
                    </Link>
                  </td>

                  <td className="py-3.5 px-4 text-slate-300">
                    <div>
                      <p className="font-semibold">{run.applicationName}</p>
                      <p className="text-[10px] text-slate-500">{run.version}</p>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {run.startedAt}
                  </td>

                  <td className="py-3.5 px-4 text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {run.duration}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-300">
                    <span>{run.checksExecuted} checks</span>
                    <span className="text-[10px] text-slate-500 block">{run.filesAnalyzed} files</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-1.5 text-[11px]">
                      <span className="px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">
                        {run.findingsBreakdown.critical} Crit
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                        {run.findingsBreakdown.high} High
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30 font-bold">
                        {run.findingsBreakdown.medium} Med
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                      SAMPLE DATA
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
