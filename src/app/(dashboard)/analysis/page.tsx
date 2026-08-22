'use client';

import React from 'react';
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
  FileCode
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';

export default function AnalysisRunsPage() {
  const { analyses } = useAppState();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
            Security Analysis Runs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Historical multi-engine mobile security pipeline executions and vulnerability scan logs.
          </p>
        </div>

        <Link
          href="/analysis/run"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-indigo text-slate-950 text-xs font-mono font-bold shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all"
        >
          <Activity className="w-4 h-4" />
          <span>New Analysis Run</span>
        </Link>
      </div>

      {/* Analysis Runs Table */}
      <div className="rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] font-mono text-slate-400 uppercase">
                <th className="py-3.5 px-4 font-semibold">Run Identifier</th>
                <th className="py-3.5 px-4 font-semibold">Target Application</th>
                <th className="py-3.5 px-4 font-semibold">Started</th>
                <th className="py-3.5 px-4 font-semibold">Duration</th>
                <th className="py-3.5 px-4 font-semibold">Checks Evaluated</th>
                <th className="py-3.5 px-4 font-semibold text-center">Findings (C/H/M)</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {analyses.map((run) => (
                <tr
                  key={run.id}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                >
                  <td className="py-4 px-4 font-bold text-slate-100 group-hover:text-brand-cyan transition-colors">
                    <Link href={`/analysis/${run.id}`}>
                      {run.runNumber}
                    </Link>
                  </td>

                  <td className="py-4 px-4 text-slate-200">
                    <div>
                      <p className="font-semibold">{run.applicationName}</p>
                      <p className="text-[10px] text-slate-400">{run.version}</p>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-slate-400 text-[11px]">
                    {run.startedAt}
                  </td>

                  <td className="py-4 px-4 text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {run.duration}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-slate-300">
                    <span>{run.checksExecuted} checks</span>
                    <span className="text-[10px] text-slate-400 block">{run.filesAnalyzed} files</span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-1.5 text-[11px]">
                      <span className="px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">
                        {run.findingsBreakdown.critical} Crit
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                        {run.findingsBreakdown.high} High
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 font-bold">
                        {run.findingsBreakdown.medium} Med
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <Link
                      href={`/analysis/${run.id}`}
                      className="inline-flex items-center gap-1 text-brand-cyan hover:underline text-xs font-semibold"
                    >
                      <span>Inspect</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
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
