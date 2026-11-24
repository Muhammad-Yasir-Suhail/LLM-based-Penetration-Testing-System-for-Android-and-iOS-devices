'use client';

import React, { useEffect, useState } from 'react';
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
  Cpu,
  ScanSearch,
  FileSearch,
  Binary,
  ShieldCheck,
  Gauge,
  OctagonX,
  Workflow,
  ListChecks,
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { LogoMark, Wordmark } from '@/components/shell/Logo';
import { Reveal, Spotlight, Magnetic, WordReveal, TypedLines } from '@/components/ui/Motion';
import { cn } from '@/lib/utils';

/* The eight stages of the VulnScope autonomous decision loop, rendered as keycaps. */
const LOOP_STAGES = [
  { n: '01', label: 'INTAKE VALIDATE', icon: FileSearch, tone: 'text-emerald-400' },
  { n: '02', label: 'OBSERVE MANIFEST', icon: ScanSearch, tone: 'text-cyan-400' },
  { n: '03', label: 'ADAPTIVE PLAN', icon: Workflow, tone: 'text-indigo-400' },
  { n: '04', label: 'ALLOWLIST EXEC', icon: ListChecks, tone: 'text-purple-400' },
  { n: '05', label: 'SCAN BYTECODE', icon: Binary, tone: 'text-amber-400' },
  { n: '06', label: 'VERIFY EVIDENCE', icon: ShieldCheck, tone: 'text-rose-400' },
  { n: '07', label: 'RATING & AUDIT', icon: Gauge, tone: 'text-teal-400' },
  { n: '08', label: 'SAFE STOP', icon: OctagonX, tone: 'text-slate-400' },
];

const ARC_KEYS = [Shield, Lock, Fingerprint, KeyRound, Smartphone, Cpu, Globe, Layers, Zap];

export default function LoginPage() {
  const router = useRouter();
  const { setOnboardingOpen } = useAppState();
  const [email, setEmail] = useState('lead.researcher@vulnscope.security');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  // Animated decision-loop "key presses"
  const [activeStage, setActiveStage] = useState(0);
  const [pressed, setPressed] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const id = setInterval(() => {
      setActiveStage((s) => {
        const next = (s + 1) % LOOP_STAGES.length;
        setPressed(next);
        setTimeout(() => setPressed(null), 180);
        return next;
      });
    }, 1400);
    return () => clearInterval(id);
  }, [paused]);

  const handleEnterPlatform = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 300);
  };

  const handleLaunchPipeline = () => {
    router.push('/analysis/run');
  };

  const stage = LOOP_STAGES[activeStage];

  return (
    <div className="relative min-h-screen bg-[#07080a] text-white overflow-x-clip bg-noise">
      {/* Ambient under-glow (keyboard light) */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(50%_45%_at_50%_42%,rgba(255,99,99,0.16),transparent_70%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000,transparent)]" />

      {/* ------------------------------------------------------------------ */}
      {/* Floating navbar                                                   */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-3 z-40 px-3 sm:px-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-3 h-14 pl-3 pr-2 sm:pl-4 rounded-2xl bg-[#0c0d0f]/75 backdrop-blur-xl backdrop-saturate-150 border border-white/[0.08] shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_20px_40px_-20px_rgba(0,0,0,0.9)] animate-in">
          <Link href="/" className="group flex items-center gap-2.5 min-w-0">
            <LogoMark size={28} className="transition-transform duration-300 ease-rc group-hover:rotate-[8deg] group-hover:scale-105" />
            <div className="flex flex-col leading-tight min-w-0">
              <div className="flex items-center gap-2">
                <Wordmark />
                <span className="hidden sm:inline text-[9px] uppercase font-mono tracking-wider px-1.5 py-[1px] rounded-md bg-white/[0.06] text-white/60 border border-white/10">
                  FYP Core
                </span>
              </div>
              <span className="hidden sm:block text-[10px] text-white/40 font-mono truncate">
                Agentic Mobile Security Framework
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex text-[11px] font-mono h-7 items-center px-2.5 rounded-full bg-white/[0.04] text-white/55 border border-white/[0.08]">
              Mid Evaluation 01
            </span>
            <Link href="/analysis/run" className="rc-btn rc-btn-secondary !h-9 !px-3 !text-[13px]">
              <Activity className="w-3.5 h-3.5 text-[#ff6363]" />
              <span className="hidden sm:inline">Launch Live Agent</span>
              <span className="sm:hidden">Live Agent</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* ------------------------------------------------------------------ */}
        {/* Hero                                                               */}
        {/* ------------------------------------------------------------------ */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-24 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 h-8 px-3 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/70 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#ff6363]" />
              <span>AI-Assisted Mobile Application Security Testing</span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 mx-auto max-w-4xl text-[34px] leading-[1.05] sm:text-[52px] lg:text-[64px] font-medium tracking-[-0.035em]">
              <span className="text-gradient-silver">Evidence-Grounded </span>
              <span className="text-white">Agentic Security Analysis</span>
              <span className="text-white/40"> for Mobile Applications.</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-white/60">
              VulnScope is an autonomous security testing framework for authorized Android applications.
            </p>
          </Reveal>

          {/* Quick Benchmark Cards */}
          <Reveal delay={240}>
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Magnetic>
                <button onClick={handleLaunchPipeline} className="rc-btn rc-btn-primary group">
                  <Activity className="w-4 h-4" />
                  <span>Launch Live Agentic Analysis Pipeline</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-rc group-hover:translate-x-0.5" />
                </button>
              </Magnetic>
              <Magnetic>
                <button onClick={handleEnterPlatform} className="rc-btn rc-btn-secondary">
                  <span>Explore Dashboard & Workspaces</span>
                </button>
              </Magnetic>
            </div>
          </Reveal>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Keyboard: Core Workflow Lifecycle (VulnScope decision loop)        */}
        {/* ------------------------------------------------------------------ */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 mt-16 sm:mt-20">
          <Reveal variant="scale" delay={120}>
            <div
              className="relative"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {/* under-glow */}
              <div aria-hidden className="absolute -inset-x-10 -bottom-10 h-40 bg-[#ff6363]/20 blur-[80px] rounded-full" />

              {/* chassis */}
              <div className="relative rounded-[28px] p-[1px] bg-gradient-to-b from-white/[0.16] via-white/[0.05] to-white/[0.02]">
                <div className="relative overflow-hidden rounded-[27px] bg-[linear-gradient(180deg,#151619,#0b0c0e)] p-4 sm:p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_50px_100px_-40px_rgba(0,0,0,1)]">
                  <div className="scan-beam" aria-hidden />

                  {/* chassis header */}
                  <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
                    <span className="flex items-center gap-2 text-[13px] font-medium text-white">
                      <span className="keycap w-7 h-7 flex items-center justify-center !rounded-lg">
                        <Terminal className="w-3.5 h-3.5 text-[#ff6363]" />
                      </span>
                      VulnScope Autonomous Decision Loop
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="hidden sm:flex flex-col gap-[3px]" aria-hidden>
                        {LOOP_STAGES.slice(0, 4).map((_, i) => (
                          <span key={i} className={cn('led', i <= activeStage % 4 && 'on')} />
                        ))}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.12em] text-emerald-400">
                        Auditable Trace
                      </span>
                    </span>
                  </div>

                  {/* keys */}
                  <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    {LOOP_STAGES.map((s, i) => {
                      const Icon = s.icon;
                      const lit = i === activeStage;
                      const done = i < activeStage;
                      return (
                        <button
                          key={s.n}
                          type="button"
                          onClick={() => {
                            setActiveStage(i);
                            setPressed(i);
                            setTimeout(() => setPressed(null), 180);
                          }}
                          className={cn(
                            'keycap press text-left h-[84px] sm:h-[96px] p-3 flex flex-col justify-between',
                            lit && 'is-lit',
                            pressed === i && 'is-pressed'
                          )}
                          aria-pressed={lit}
                        >
                          <span className="relative z-[1] flex items-center justify-between">
                            <span className={cn('text-[10px] font-mono transition-colors', lit ? 'text-[#ff8a8a]' : 'text-white/30')}>{s.n}</span>
                            <Icon className={cn('w-4 h-4 transition-all duration-300', lit ? `${s.tone} scale-110` : done ? 'text-white/50' : 'text-white/25')} />
                          </span>
                          <span className={cn('relative z-[1] text-[10px] sm:text-[11px] font-mono font-semibold tracking-wide transition-colors', lit ? s.tone : 'text-white/55')}>
                            {s.n}. {s.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* status strip */}
                  <div className="mt-4 sm:mt-5 flex items-center gap-3 rounded-xl bg-black/40 border border-white/[0.06] px-3 py-2.5 font-mono text-[11px]">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#ff6363] ring-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff6363]" />
                    </span>
                    <span className="text-white/40 hidden sm:inline">agent.step</span>
                    <span key={activeStage} className={cn('truncate animate-in', stage.tone)}>
                      {stage.n}. {stage.label}
                    </span>
                    <span className="ml-auto text-white/30 shrink-0">{activeStage + 1}/{LOOP_STAGES.length}</span>
                  </div>
                </div>
              </div>

              {/* RGB light bar */}
              <div className="mx-auto mt-6 w-2/3 light-bar" aria-hidden />
            </div>
          </Reveal>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Word reveal — full value proposition                               */}
        {/* ------------------------------------------------------------------ */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-28 sm:py-40 text-center">
          <WordReveal
            className="text-2xl sm:text-4xl lg:text-[44px] leading-[1.2] font-medium tracking-[-0.025em]"
            text="An LLM-assisted controller plans allowlisted tool actions, observes verified static & bytecode outputs, adapts subsequent decisions, and compiles traceable, evidence-backed security findings."
          />
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Arc of keycaps + three pillars                                      */}
        {/* ------------------------------------------------------------------ */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative h-[150px] sm:h-[210px] overflow-hidden" aria-hidden>
            {ARC_KEYS.map((Icon, i) => {
              const n = ARC_KEYS.length - 1;
              const angle = -70 + (140 / n) * i; // degrees across the arc
              return (
                <div
                  key={i}
                  className="absolute left-1/2 top-full"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(calc(-1 * var(--arc-r))) rotate(${-angle * 0.6}deg)`,
                  }}
                >
                  <Reveal variant="scale" delay={i * 70}>
                    <div
                      className="keycap w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center float-y"
                      style={{ animationDelay: `${i * 0.35}s` }}
                    >
                      <Icon className="relative z-[1] w-5 h-5 sm:w-6 sm:h-6 text-white/70" strokeWidth={1.6} />
                    </div>
                  </Reveal>
                </div>
              );
            })}
            <style>{`:root{--arc-r:130px}@media(min-width:640px){:root{--arc-r:190px}}`}</style>
          </div>

          <div className="relative border-t border-white/[0.06] pt-14 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Shield, title: 'OWASP MASVS Aligned' },
              { icon: CheckCircle2, title: 'Evidence-Backed Verification' },
              { icon: Lock, title: 'Allowlisted Tool Registry' },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 90}>
                <Spotlight className="rc-card rc-card-hover h-full p-6">
                  <div className="keycap w-10 h-10 flex items-center justify-center mb-8">
                    <f.icon className="relative z-[1] w-[18px] h-[18px] text-[#ff6363]" />
                  </div>
                  <h3 className="text-lg font-medium tracking-tight text-white">{f.title}</h3>
                </Spotlight>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Workspace access — terminal + spec sheet                            */}
        {/* ------------------------------------------------------------------ */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-32 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Live terminal */}
          <Reveal variant="left">
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0a0b0d] shadow-[0_40px_80px_-40px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 px-4 h-10 border-b border-white/[0.06] bg-white/[0.02]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-3 text-[11px] font-mono text-white/35">vulnscope — agent trace</span>
              </div>
              <div className="relative p-5 min-h-[280px]">
                <div className="scan-beam opacity-60" aria-hidden />
                <TypedLines
                  className="relative font-mono text-[11px] sm:text-[12px] leading-6 whitespace-pre-wrap break-words"
                  lines={[
                    { text: '$ vulnscope run --target app.apk --mode bounded', className: 'text-white' },
                    { text: '[01] INTAKE VALIDATE   sha256 ✓  zip ✓', className: 'text-emerald-400' },
                    { text: '[02] OBSERVE MANIFEST  AndroidManifest.xml parsed', className: 'text-cyan-400' },
                    { text: '[03] ADAPTIVE PLAN     next → dex.secret_scan', className: 'text-indigo-400' },
                    { text: '[04] ALLOWLIST EXEC    tool registry: permitted', className: 'text-purple-400' },
                    { text: '[05] SCAN BYTECODE     classes.dex analysed', className: 'text-amber-400' },
                    { text: '[06] VERIFY EVIDENCE   findings grounded ✓', className: 'text-rose-400' },
                    { text: '[07] RATING & AUDIT    trace written', className: 'text-teal-400' },
                    { text: '[08] SAFE STOP         9/9 Passing', className: 'text-white/60' },
                  ]}
                />
              </div>
            </div>
          </Reveal>

          {/* Right Column: Instant Access Card */}
          <Reveal variant="right" delay={100}>
            <div className="space-y-6">
              <div className="space-y-3">
                <span className="eyebrow text-[#ff8a8a]">Evaluation Workspace</span>
                <h2 className="text-3xl sm:text-[40px] leading-[1.1] font-medium tracking-[-0.03em] text-white">
                  Enter VulnScope Platform
                </h2>
                <p className="text-base text-white/60 leading-relaxed max-w-md">
                  Access the live agent execution loop, interactive attack-surface graphs, and findings manager.
                </p>
              </div>

              <div>
                <div className="spec-row">
                  <span className="text-white/45">Real Security Core:</span>
                  <span className="text-emerald-400 font-semibold">ACTIVE (Verified)</span>
                </div>
                <div className="spec-row">
                  <span className="text-white/45">Agentic Loop:</span>
                  <span className="text-emerald-400 font-semibold">Allowlist Registry</span>
                </div>
                <div className="spec-row">
                  <span className="text-white/45">Target Platform:</span>
                  <span className="text-white">Android APK (Static/DEX)</span>
                </div>
                <div className="spec-row">
                  <span className="text-white/45">Evaluation Tests:</span>
                  <span className="text-emerald-400 font-semibold">9/9 Passing</span>
                </div>
              </div>

              <Magnetic strength={0.15} className="w-full sm:w-auto">
                <button
                  onClick={handleEnterPlatform}
                  disabled={isLoading}
                  className="rc-btn rc-btn-red group w-full sm:w-auto !h-11 !px-6"
                >
                  <span>{isLoading ? 'Entering…' : 'Enter Workspace'}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-rc group-hover:translate-x-1" />
                </button>
              </Magnetic>
            </div>
          </Reveal>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Marquee                                                             */}
        {/* ------------------------------------------------------------------ */}
        <section className="border-y border-white/[0.06] py-5 marquee-mask overflow-hidden" aria-hidden>
          <div className="marquee gap-10 pr-10">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex items-center gap-10 shrink-0">
                {[...LOOP_STAGES.map((s) => s.label), 'OWASP MASVS Aligned', 'Evidence-Backed Verification', 'Allowlisted Tool Registry'].map((t, i) => (
                  <span key={`${dup}-${i}`} className="flex items-center gap-10 font-mono text-xs uppercase tracking-[0.14em] text-white/30 whitespace-nowrap">
                    {t}
                    <span className="w-1 h-1 rounded-full bg-[#ff6363]/60" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/40">
        <div className="flex items-center gap-2.5 text-center md:text-left">
          <LogoMark size={18} />
          <span>VulnScope • Final Year Project (FYP-2 Mid Evaluation 01) • BS Software Engineering</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-[11px]">
          <span>OWASP MASVS Aligned</span>
          <span className="text-white/20">•</span>
          <span>Evidence-Backed Verification</span>
          <span className="text-white/20">•</span>
          <span>Allowlisted Tool Registry</span>
        </div>
      </footer>
    </div>
  );
}
