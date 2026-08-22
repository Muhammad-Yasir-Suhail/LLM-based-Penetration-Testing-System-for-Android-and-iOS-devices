'use client';

import React from 'react';
import { Database, Binary, GitFork, ArrowUpNarrowWide, Sparkles, ShieldCheck, CheckCheck, ChevronRight } from 'lucide-react';

const pipelineSteps = [
  { id: 'collect', label: 'COLLECT', desc: 'Multi-Engine Ingestion', icon: Database, color: 'text-sky-400', border: 'border-sky-500/30 bg-sky-500/10' },
  { id: 'normalize', label: 'NORMALIZE', desc: 'Unified MASVS / CWE', icon: Binary, color: 'text-cyan-400', border: 'border-cyan-500/30 bg-cyan-500/10' },
  { id: 'correlate', label: 'CORRELATE', desc: 'Cross-Engine Deduplication', icon: GitFork, color: 'text-indigo-400', border: 'border-indigo-500/30 bg-indigo-500/10' },
  { id: 'prioritize', label: 'PRIORITIZE', desc: 'Attack Surface Reachability', icon: ArrowUpNarrowWide, color: 'text-amber-400', border: 'border-amber-500/30 bg-amber-500/10' },
  { id: 'explain', label: 'EXPLAIN', desc: 'Generative Security Copilot', icon: Sparkles, color: 'text-purple-400', border: 'border-purple-500/30 bg-purple-500/10' },
  { id: 'remediate', label: 'REMEDIATE', desc: 'Actionable Code Diffs', icon: ShieldCheck, color: 'text-emerald-400', border: 'border-emerald-500/30 bg-emerald-500/10' },
  { id: 'verify', label: 'VERIFY', desc: 'Automated Regression', icon: CheckCheck, color: 'text-teal-400', border: 'border-teal-500/30 bg-teal-500/10' },
];

export const PipelineBanner: React.FC<{ activeStep?: string; compact?: boolean }> = ({ activeStep = 'correlate', compact = false }) => {
  return (
    <div className="w-full bg-[#0a0e17]/80 border border-slate-800/80 rounded-xl p-3 sm:p-4 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-brand-cyan animate-ping" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            SentinelX Security Intelligence & Orchestration Pipeline
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
          Autonomous Security Lifecycle Engine
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {pipelineSteps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = step.id === activeStep;
          return (
            <div
              key={step.id}
              className={`relative rounded-lg p-2.5 transition-all duration-200 border ${
                isActive
                  ? `${step.border} ring-1 ring-brand-cyan/40 shadow-lg shadow-cyan-950/40`
                  : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold text-slate-400">0{idx + 1}</span>
                <Icon className={`w-3.5 h-3.5 ${step.color}`} />
              </div>
              <p className={`text-xs font-mono font-bold tracking-wide ${isActive ? 'text-white' : 'text-slate-300'}`}>
                {step.label}
              </p>
              {!compact && (
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {step.desc}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
