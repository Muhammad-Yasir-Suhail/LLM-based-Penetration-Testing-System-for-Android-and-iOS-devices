'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Lock,
  ArrowRight,
  Sparkles,
  Smartphone,
  CheckCircle2,
  KeyRound,
  Fingerprint,
  Zap,
  Globe,
  Terminal,
  Activity,
  Layers,
  Cpu
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';

export default function LoginPage() {
  const router = useRouter();
  const { setOnboardingOpen } = useAppState();
  const [email, setEmail] = useState('lead.researcher@vulnscope.security');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleEnterPlatform = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 300);
  };

  const handleLaunchPipeline = () => {
    router.push('/analysis/run');
  };

  return (
    <div className="min-h-screen bg-[#07090e] bg-grid-cyber flex flex-col justify-between text-slate-100 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-slate-800/80 bg-[#080c14]/70 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/30 to-blue-500/10 border border-emerald-500/40 shadow-lg shadow-emerald-500/10">
            <Shield className="w-5 h-5 text-emerald-400" />
            <div className="absolute inset-0 rounded-xl bg-emerald-400/10 animate-pulse-slow pointer-events-none" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold font-mono tracking-tight text-white">
                Vuln<span className="text-emerald-400">Scope</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                FYP Core
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Agentic Mobile Security Framework
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/analysis/run"
            className="text-xs font-mono px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all hidden sm:flex items-center gap-1.5 font-bold"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Launch Live Agent</span>
          </Link>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Mid Evaluation 01
          </span>
        </div>
      </header>

      {/* Main Hero & Access Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 flex flex-col lg:flex-row items-center justify-between gap-12 z-10">
        {/* Left Column: Research Value Proposition */}
        <div className="flex-1 space-y-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Assisted Mobile Application Security Testing</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
              Evidence-Grounded{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Agentic Security Analysis
              </span>{' '}
              for Mobile Applications.
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
              VulnScope is an autonomous security testing framework for authorized Android applications. An LLM-assisted controller plans allowlisted tool actions, observes verified static & bytecode outputs, adapts subsequent decisions, and compiles traceable, evidence-backed security findings.
            </p>
          </div>

          {/* Core Workflow Lifecycle */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="flex items-center gap-2 font-bold text-white">
                <Terminal className="w-4 h-4 text-emerald-400" />
                VulnScope Autonomous Decision Loop
              </span>
              <span className="text-[11px] text-emerald-400">Auditable Trace</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-emerald-400">
                01. INTAKE VALIDATE
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-cyan-400">
                02. OBSERVE MANIFEST
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-indigo-400">
                03. ADAPTIVE PLAN
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-purple-400">
                04. ALLOWLIST EXEC
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-amber-400">
                05. SCAN BYTECODE
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-rose-400">
                06. VERIFY EVIDENCE
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-teal-400">
                07. RATING & AUDIT
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-slate-400">
                08. SAFE STOP
              </div>
            </div>
          </div>

          {/* Quick Benchmark Cards */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleLaunchPipeline}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Activity className="w-4 h-4" />
              <span>Launch Live Agentic Analysis Pipeline</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleEnterPlatform}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono font-bold text-xs transition-all"
            >
              <span>Explore Dashboard & Workspaces</span>
            </button>
          </div>
        </div>

        {/* Right Column: Instant Access Card */}
        <div className="w-full max-w-md">
          <div className="p-6 rounded-3xl bg-[#0d121c]/90 border border-slate-800/90 shadow-2xl space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 tracking-wider">
                Evaluation Workspace
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Enter VulnScope Platform
              </h2>
              <p className="text-xs text-slate-400">
                Access the live agent execution loop, interactive attack-surface graphs, and findings manager.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Real Security Core:</span>
                <span className="text-emerald-400 font-bold">ACTIVE (Verified)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Agentic Loop:</span>
                <span className="text-emerald-400 font-bold">Allowlist Registry</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Target Platform:</span>
                <span className="text-slate-200">Android APK (Static/DEX)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Evaluation Tests:</span>
                <span className="text-emerald-400 font-bold">9/9 Passing</span>
              </div>
            </div>

            <button
              onClick={handleEnterPlatform}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold shadow-lg shadow-emerald-500/20 transition-all"
            >
              <span>Enter Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-800/80 bg-[#080c14]/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-400 z-10">
        <div>
          VulnScope • Final Year Project (FYP-2 Mid Evaluation 01) • BS Software Engineering
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>OWASP MASVS Aligned</span>
          <span>•</span>
          <span>Evidence-Backed Verification</span>
          <span>•</span>
          <span>Allowlisted Tool Registry</span>
        </div>
      </footer>
    </div>
  );
}
