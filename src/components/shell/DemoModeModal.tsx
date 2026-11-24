'use client';

import React from 'react';
import { X, ShieldAlert, Cpu, CheckCircle2, ArrowRight, Sparkles, BookOpen, Activity, Terminal } from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';

export const DemoModeModal: React.FC = () => {
  const { demoModalOpen, setDemoModalOpen } = useAppState();

  if (!demoModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setDemoModalOpen(false)}>
      <div
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl glass-panel-glow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-5 border-b border-white/[0.07] flex items-start justify-between overflow-hidden"><div aria-hidden className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-32 bg-emerald-500/15 blur-3xl" />
          <div className="flex items-center gap-3">
            <div className="relative keycap p-2.5 text-emerald-300">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                VulnScope Mid Evaluation 01
              </span>
              <h3 className="text-base font-semibold tracking-tight text-white mt-1.5">Platform Architecture & Operational Status</h3>
            </div>
          </div>
          <button
            onClick={() => setDemoModalOpen(false)}
            className="relative p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] hover:rotate-90 transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs leading-relaxed text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <p className="font-semibold text-slate-100">
              VulnScope: AI-Assisted Vulnerability Detection & Security Analysis of Mobile Applications
            </p>
            <p className="text-slate-400">
              An evidence-grounded, LLM-assisted agentic framework for authorized mobile application security testing. The agent selects supported analysis actions, observes real tool outputs, adapts subsequent decisions, and compiles traceable security findings.
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-mono font-bold text-slate-200 uppercase text-[11px] tracking-wider">
              Component Operational Status:
            </h4>
            <ul className="space-y-2 font-mono text-[11px] text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Real Security Core (ACTIVE):</strong> Full APK intake validation, cryptographic digests (SHA-256), binary AXML parsing, permissions analysis, unprotected exported IPC detection, and Dalvik bytecode (classes.dex) secret scanning.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Bounded Agentic Loop (ACTIVE):</strong> Restricted tool registry, observation-driven adaptive decision loop, bounded execution boundaries, and auditable action trace.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Deterministic & LLM Planners:</strong> Operates deterministically out-of-the-box for reproducible grading; seamlessly enables live OpenAI / Gemini planning when API keys are configured in .env.local.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Preserved Demo Modules:</strong> Attack surface topological graphs, multi-engine deduplication views, and legacy project catalogs remain accessible for visual exploration and future evaluation milestones.
                </span>
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px] text-emerald-200">Test suite verified: 9/9 acceptance criteria passing</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-300">v1.2.0</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.07] flex justify-end">
          <button
            onClick={() => setDemoModalOpen(false)}
            className="rc-btn rc-btn-primary"
          >
            Acknowledge & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
