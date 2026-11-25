'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowRight,
  FileSearch,
  ScanSearch,
  Workflow,
  ListChecks,
  Binary,
  ShieldCheck,
  Gauge,
  OctagonX,
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { LogoMark } from '@/components/shell/Logo';
import './landing.css';

/* The eight stages of the VulnScope autonomous decision loop. */
const LOOP_STAGES = [
  { n: '01', label: 'Intake validate', icon: FileSearch },
  { n: '02', label: 'Observe manifest', icon: ScanSearch },
  { n: '03', label: 'Adaptive plan', icon: Workflow },
  { n: '04', label: 'Allowlist exec', icon: ListChecks },
  { n: '05', label: 'Scan bytecode', icon: Binary },
  { n: '06', label: 'Verify evidence', icon: ShieldCheck },
  { n: '07', label: 'Rating & audit', icon: Gauge },
  { n: '08', label: 'Safe stop', icon: OctagonX },
];

/* What the controller does, each move mapped to the stages that carry it out. */
const MOVES = [
  { text: 'Plans allowlisted tool actions', stages: [2, 3] },
  { text: 'Observes verified static & bytecode outputs', stages: [1, 4] },
  { text: 'Adapts subsequent decisions', stages: [2, 7] },
  { text: 'Compiles traceable, evidence-backed security findings', stages: [5, 6] },
];

const STEP_MS = 1800;

export default function LoginPage() {
  const router = useRouter();
  const { setOnboardingOpen } = useAppState();
  const [email, setEmail] = useState('lead.researcher@vulnscope.security');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  // Decision-loop instrument: steps through the stages while visible, pauses on hover, focus or the Pause button.
  const [activeStage, setActiveStage] = useState(0);
  const [held, setHeld] = useState(false);
  const [pressed, setPressed] = useState<number | null>(null);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [seen, setSeen] = useState(false);
  const [reduced, setReduced] = useState(false);
  const loopRef = useRef<HTMLDivElement>(null);
  const running = seen && !hover && !focus && !held && !reduced;

  useEffect(() => {
    document.documentElement.classList.add('js');
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);

    // One reveal, below the hero only.
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }),
      { rootMargin: '0px 0px -10% 0px' }
    );
    document.querySelectorAll('.lp [data-reveal]').forEach((el) => io.observe(el));

    const el = loopRef.current;
    const seenIo = el ? new IntersectionObserver(([e]) => setSeen(e.isIntersecting)) : null;
    if (el && seenIo) seenIo.observe(el);
    return () => {
      io.disconnect();
      seenIo?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setActiveStage((s) => (s + 1) % LOOP_STAGES.length), STEP_MS);
    return () => clearInterval(id);
  }, [running]);

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
    <div className="lp">
      {/* Nav: slab */}
      <header className="nav">
        <div className="container nav__inner">
          <Link href="/" className="brand" aria-label="VulnScope home">
            <LogoMark size={28} />
            <span className="brand__name">VulnScope</span>
            <span className="brand__sub">Agentic Mobile Security Framework</span>
          </Link>
          <div className="nav__meta">
            <span className="nav__stage">FYP Core, Mid Evaluation 01</span>
            <Link href="/analysis/run" className="btn btn--small">
              <Activity aria-hidden="true" />
              <span>Launch Live Agent</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero: Stage, the decision loop beside the head */}
        <section className="hero">
          <div className="container hero__grid">
            <div className="hero__text">
              <h1>
                Evidence-grounded agentic security analysis for mobile applications.
              </h1>
              <p className="lead">
                VulnScope is an autonomous security testing framework for authorized Android applications.
              </p>
              <div className="hero__actions">
                <button type="button" onClick={handleLaunchPipeline} className="btn btn--primary">
                  Launch Live Agentic Analysis Pipeline
                </button>
                <button type="button" onClick={handleEnterPlatform} className="btn">
                  Explore Dashboard & Workspaces
                </button>
              </div>
            </div>

            <div
              ref={loopRef}
              className="panel"
              data-loop
              onPointerEnter={() => setHover(true)}
              onPointerLeave={() => setHover(false)}
              onFocus={() => setFocus(true)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocus(false);
              }}
            >
              <div className="panel__head">
                <h2 className="panel__title">VulnScope Autonomous Decision Loop</h2>
                <span className="panel__note">Auditable Trace</span>
              </div>

              <div className="bed" role="group" aria-label="Decision loop stages">
                {LOOP_STAGES.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.n}
                      type="button"
                      className={`key${i < activeStage ? ' is-done' : ''}${pressed === i ? ' is-pressed' : ''}`}
                      aria-pressed={i === activeStage}
                      onClick={() => { setActiveStage(i); setPressed(i); setTimeout(() => setPressed(null), 180); }}
                    >
                      <span className="key__top">
                        <span className="key__n">{s.n}</span>
                        <Icon aria-hidden="true" />
                      </span>
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="readout">
                <div
                  className="readout__track"
                  role="progressbar"
                  aria-label="Loop progress"
                  aria-valuemin={1}
                  aria-valuemax={LOOP_STAGES.length}
                  aria-valuenow={activeStage + 1}
                >
                  <span className="readout__fill" style={{ ['--p' as string]: (activeStage + 1) / LOOP_STAGES.length }} />
                </div>
                <span className="readout__label" aria-live="polite">
                  {stage.n} {stage.label}
                </span>
                <span className="readout__count num">
                  {activeStage + 1}/{LOOP_STAGES.length}
                </span>
                {!reduced && (
                  <button type="button" className="btn btn--small" data-loop-toggle onClick={() => setHeld((h) => !h)}>
                    {held ? 'Play' : 'Pause'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Showcase: the real workspace */}
        <section className="section section--first">
          <div className="container">
            <div className="head" data-reveal>
              <h2>Enter VulnScope Platform</h2>
              <p className="lead">
                Access the live agent execution loop, interactive attack-surface graphs, and findings manager.
              </p>
            </div>

            <figure className="shot shot--main" data-slot="product-overview" data-kind="product" data-alt="The Security Overview screen of the running workspace" data-reveal>
              <img
                src="/screens/screen-dashboard-desktop.png"
                width={2880}
                height={1800}
                alt="VulnScope Security Overview: application count, critical and high findings, security score and the agentic pipeline"
                loading="lazy"
              />
            </figure>
            <p className="caption">Security Overview</p>

            <div className="shots">
              <div data-reveal style={{ ['--i' as string]: 1 }}>
                <figure className="shot shot--pair" data-slot="product-run" data-kind="product" data-alt="The Agentic Security Analysis Pipeline screen">
                  <img
                    src="/screens/screen-analysis-run-desktop.png"
                    width={2880}
                    height={1800}
                    alt="Agentic Security Analysis Pipeline with the authorized benchmark APKs ready to run"
                    loading="lazy"
                  />
                </figure>
                <p className="caption">Agentic Security Analysis Pipeline</p>
              </div>
              <div data-reveal style={{ ['--i' as string]: 2 }}>
                <figure className="shot shot--pair" data-slot="product-findings" data-kind="product" data-alt="The Security Findings screen">
                  <img
                    src="/screens/screen-findings-desktop.png"
                    width={2880}
                    height={1800}
                    alt="Security Findings with severity counts and the findings list"
                    loading="lazy"
                  />
                </figure>
                <p className="caption">Security Findings</p>
              </div>
            </div>
          </div>
        </section>

        {/* Rows: each move of the controller, mapped to its stages */}
        <section className="section--l section">
          <div className="container rows-wrap">
            <h2>An LLM-assisted controller</h2>
            <ol className="rows">
              {MOVES.map((m, i) => (
                <li key={m.text} className="row" data-reveal style={{ ['--i' as string]: i }}>
                  <h3>{m.text}</h3>
                  <div className="row__stages">
                    {m.stages.map((si) => (
                      <span key={si} className="stage-tag">
                        <b>{LOOP_STAGES[si].n}</b>
                        {LOOP_STAGES[si].label}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Code: the trace */}
        <section className="section--l section">
          <div className="container trace-wrap">
            <div className="head-col" data-reveal>
              <h2>Auditable trace</h2>
              <p className="lead">
                Restricted tool registry, observation-driven adaptive decision loop, bounded execution boundaries, and auditable action trace.
              </p>
            </div>
            <figure className="trace" data-reveal style={{ ['--i' as string]: 1 }}>
              <pre>
                <code>
                  <span className="t-cmd">$ vulnscope run --target app.apk --mode bounded</span>{'\n'}
                  <span className="t-step">[01]</span> intake validate    sha256 <span className="t-ok">ok</span>  zip <span className="t-ok">ok</span>{'\n'}
                  <span className="t-step">[02]</span> observe manifest   AndroidManifest.xml parsed{'\n'}
                  <span className="t-step">[03]</span> adaptive plan      next: dex.secret_scan{'\n'}
                  <span className="t-step">[04]</span> allowlist exec     tool registry: permitted{'\n'}
                  <span className="t-step">[05]</span> scan bytecode      classes.dex analysed{'\n'}
                  <span className="t-step">[06]</span> verify evidence    findings grounded <span className="t-ok">ok</span>{'\n'}
                  <span className="t-step">[07]</span> rating & audit     trace written{'\n'}
                  <span className="t-step">[08]</span> safe stop
                </code>
              </pre>
              <figcaption>agent-trace.log, a sample run</figcaption>
            </figure>
          </div>
        </section>

        {/* Close: the evaluation workspace */}
        <section className="close">
          <div className="container close__grid">
            <div className="close__text" data-reveal>
              <h2>Evaluation workspace</h2>
              <div>
                <button
                  type="button"
                  onClick={handleEnterPlatform}
                  disabled={isLoading}
                  aria-busy={isLoading}
                  className="btn"
                >
                  <span>{isLoading ? 'Entering…' : 'Enter Workspace'}</span>
                  <ArrowRight aria-hidden="true" />
                </button>
              </div>
            </div>
            <table className="close__table" data-reveal style={{ ['--i' as string]: 1 }}>
              <tbody>
                <tr>
                  <th scope="row">Real Security Core</th>
                  <td className="is-pass">Active (verified)</td>
                </tr>
                <tr>
                  <th scope="row">Agentic Loop</th>
                  <td>Allowlist Registry</td>
                </tr>
                <tr>
                  <th scope="row">Target Platform</th>
                  <td>Android APK (Static/DEX)</td>
                </tr>
                <tr>
                  <th scope="row">Evaluation Tests</th>
                  <td className="is-pass num">9/9 Passing</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Footer: colophon block */}
      <footer className="footer">
        <div className="container footer__grid">
          <div className="footer__brand">
            <LogoMark size={22} />
            <span className="brand__name">VulnScope</span>
          </div>
          <div className="footer__text">
            <p>AI-Assisted Mobile Application Security Testing.</p>
            <p>Final Year Project (FYP-2 Mid Evaluation 01), BS Software Engineering.</p>
          </div>
          <ul className="footer__list">
            <li>OWASP MASVS Aligned</li>
            <li>Evidence-Backed Verification</li>
            <li>Allowlisted Tool Registry</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
