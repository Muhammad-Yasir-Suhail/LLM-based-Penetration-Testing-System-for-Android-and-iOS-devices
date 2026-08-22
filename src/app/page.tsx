'use client';

import React, { useState } from 'react';
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
  Activity
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';

export default function LoginPage() {
  const router = useRouter();
  const { setOnboardingOpen } = useAppState();
  const [email, setEmail] = useState('security.lead@acme-financial.com');
  const [password, setPassword] = useState('••••••••••••');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEnterDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 400);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 400);
  };

  const handleLaunchOnboarding = () => {
    setOnboardingOpen(true);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#07090e] bg-grid-cyber flex flex-col justify-between text-slate-100 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-slate-800/80 bg-[#080c14]/70 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-cyan/20 via-brand-indigo/30 to-brand-500/10 border border-brand-cyan/40 shadow-lg shadow-cyan-500/10">
            <Shield className="w-5 h-5 text-brand-cyan" />
            <div className="absolute inset-0 rounded-xl bg-brand-cyan/10 animate-pulse-slow pointer-events-none" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold font-mono tracking-tight text-white">
              Sentinel<span className="text-brand-cyan">X</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Enterprise Mobile SecOps
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLaunchOnboarding}
            className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors hidden sm:block"
          >
            Run Workspace Onboarding
          </button>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
            Prototype Evaluation Mode
          </span>
        </div>
      </header>

      {/* Main Hero & Auth Split Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10">
        {/* Left Column: Product Showcase */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AI-Assisted Cross-Platform Mobile Security Platform</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
              Continuous Intelligence for{' '}
              <span className="bg-gradient-to-r from-brand-cyan via-sky-400 to-brand-indigo bg-clip-text text-transparent">
                Android & iOS
              </span>{' '}
              Security Operations.
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
              SentinelX orchestrates specialized mobile analysis engines (MobSF, JADX, Apktool, Frida, Burp Suite) into a unified intelligence pipeline. Correlate vulnerabilities, evaluate live attack surfaces, and generate AI-guided developer remediations.
            </p>
          </div>

          {/* Orchestration Pipeline Pills */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="flex items-center gap-2 font-bold text-white">
                <Terminal className="w-4 h-4 text-brand-cyan" />
                The SentinelX Intelligence Lifecycle
              </span>
              <span className="text-[11px] text-slate-400">7-Stage Engine</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-sky-400">
                01. COLLECT
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-cyan-400">
                02. NORMALIZE
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-indigo-400">
                03. CORRELATE
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-amber-400">
                04. PRIORITIZE
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-purple-400">
                05. EXPLAIN
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-emerald-400">
                06. REMEDIATE
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-teal-400 col-span-2">
                07. VERIFY & REGRESSION
              </div>
            </div>
          </div>

          {/* Key Feature List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 font-mono">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/30 border border-slate-800/60">
              <CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0" />
              <span>Multi-Engine Finding Deduplication</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/30 border border-slate-800/60">
              <CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0" />
              <span>Interactive Attack Surface Graph</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/30 border border-slate-800/60">
              <CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0" />
              <span>Dynamic Scoring & Version Diffing</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/30 border border-slate-800/60">
              <CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0" />
              <span>AI Security Copilot & Auto-Diffs</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Login Card */}
        <div className="lg:col-span-5">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0d131f]/90 border border-slate-700/80 shadow-2xl glass-panel-glow space-y-6">
            {/* Direct Demo Entry CTA - Prominently Displayed */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-cyan/20 via-brand-indigo/20 to-brand-500/10 border border-brand-cyan/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">
                  Instant Demo Access
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40">
                  Preloaded Data
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Explore the complete SentinelX platform loaded with 8 projects, 15 apps, 50+ findings, and simulated security engines.
              </p>
              <button
                onClick={handleEnterDemo}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-indigo hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-sm font-mono shadow-lg shadow-cyan-500/25 transition-all transform active:scale-[0.98]"
              >
                {isLoading ? (
                  <Activity className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <>
                    <span>Enter Demo Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-[10px] font-mono uppercase text-slate-400">
                or sign in with credentials
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  ENTERPRISE EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-brand-cyan transition-colors"
                  placeholder="name@company.com"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono text-slate-300">
                    PASSWORD
                  </label>
                  <a href="#" className="text-[11px] font-mono text-brand-cyan hover:underline">
                    Forgot password?
                  </a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-brand-cyan transition-colors"
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded bg-slate-900 border-slate-700 text-brand-cyan focus:ring-0"
                  />
                  <span>Remember this device</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-mono font-semibold transition-all"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Sign in to SentinelX</span>
              </button>

              <button
                type="button"
                onClick={handleEnterDemo}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-300 text-xs font-mono transition-all"
              >
                <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
                <span>Sign in with Enterprise SSO / Okta</span>
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-800/80 bg-[#080c14]/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-400 z-10">
        <div>
          SentinelX • Final Year Project Prototype (FYP-2)
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>OWASP MASVS Aligned</span>
          <span>•</span>
          <span>CVSS v3.1 Scoring</span>
          <span>•</span>
          <span>Simulated Security Engines</span>
        </div>
      </footer>
    </div>
  );
}
