'use client';

import React from 'react';
import { X, ShieldAlert, Cpu, CheckCircle2, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';

export const DemoModeModal: React.FC = () => {
  const { demoModalOpen, setDemoModalOpen } = useAppState();

  if (!demoModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-[#0d121c] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden glass-panel-glow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-amber-500/10 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                FYP-2 Technical Prototype
              </span>
              <h3 className="text-base font-bold text-white mt-1">Prototype & Simulation Notice</h3>
            </div>
          </div>
          <button
            onClick={() => setDemoModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs leading-relaxed text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <p className="font-semibold text-slate-100">
              Welcome to the SentinelX Product & UX Validation Prototype.
            </p>
            <p className="text-slate-400">
              This interactive platform demonstrates the intended user experience, architecture, and workflow for our Final Year Project: <span className="text-brand-cyan font-mono">AI-Assisted Cross-Platform Mobile Application Security Testing Platform</span>.
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-mono font-bold text-slate-200 uppercase text-[11px] tracking-wider">
              Prototype Operational Characteristics:
            </h4>
            <ul className="space-y-2 font-mono text-[11px] text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Simulated Engine Layer:</strong> MobSF, JADX, Apktool, Frida, and Burp Suite scanners are mocked with deterministic datasets to validate UI/UX without executing arbitrary binaries.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Fully Functional Frontend:</strong> State changes (resolving findings, running scans, generating reports) dynamically recalculate security scores and update all pages.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Interactive Security Pipeline:</strong> Visualizes the 7-stage orchestration lifecycle: Collect → Normalize → Correlate → Prioritize → Explain → Remediate → Verify.
                </span>
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-[11px] text-indigo-200">Interactive demo flow ready for evaluation</span>
            </div>
            <span className="text-[10px] font-mono text-indigo-300">v1.0.0</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0a0e16] border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setDemoModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan/30 border border-brand-cyan/40 text-xs font-bold font-mono transition-all"
          >
            Continue Demo Experience
          </button>
        </div>
      </div>
    </div>
  );
};
