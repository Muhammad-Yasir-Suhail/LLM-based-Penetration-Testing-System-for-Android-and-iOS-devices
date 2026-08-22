'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Cpu,
  Terminal,
  ArrowRight,
  AlertTriangle,
  Layers,
  Sparkles,
  Bot,
  RotateCw
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';

const analysisStages = [
  { id: 1, name: 'Upload validation', tool: 'SentinelX Core', duration: '0.3s' },
  { id: 2, name: 'Application fingerprinting (SHA-256 & Cert)', tool: 'Apktool', duration: '0.5s' },
  { id: 3, name: 'Manifest & IPC attack surface extraction', tool: 'Apktool / MobSF', duration: '0.8s' },
  { id: 4, name: 'Static bytecode & Smali AST deconstruction', tool: 'JADX Engine', duration: '1.2s' },
  { id: 5, name: 'Third-party dependency CVE lookup', tool: 'SentinelX Core', duration: '0.6s' },
  { id: 6, name: 'Network security config & TLS rules', tool: 'Burp / MobSF', duration: '0.7s' },
  { id: 7, name: 'OWASP MASVS security rule evaluation', tool: 'MobSF Analyzer', duration: '1.0s' },
  { id: 8, name: 'Cross-engine finding deduplication & correlation', tool: 'SentinelX AI Correlator', duration: '0.9s' },
  { id: 9, name: 'AI security exploitability & context generation', tool: 'Security Copilot', duration: '1.1s' },
  { id: 10, name: 'Executive security assessment compilation', tool: 'Reporting Engine', duration: '0.5s' },
];

export default function RunAnalysisPage() {
  const router = useRouter();
  const { selectedApplication, applications } = useAppState();
  const targetApp = selectedApplication || applications[0] || { name: 'Acme Banking Mobile', currentVersion: '4.2.1' };
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([
    '[00:00.120] Ingesting package: com.acme.banking.mobile (v4.2.1)',
    '[00:00.340] Initializing multi-engine orchestration sandbox...'
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < analysisStages.length) {
          const next = prev + 1;
          const stageInfo = analysisStages[next - 1];
          setLogs((l) => [
            ...l,
            `[00:0${next}.${Math.floor(Math.random() * 800 + 100)}] Stage ${next}: ${stageInfo.name} completed via ${stageInfo.tool}`
          ]);
          return next;
        } else {
          setIsCompleted(true);
          clearInterval(timer);
          return prev;
        }
      });
    }, 700);

    return () => clearInterval(timer);
  }, []);

  const progressPercent = Math.round((currentStage / analysisStages.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-brand-500/20 text-brand-cyan border border-brand-cyan/40">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-brand-cyan tracking-wider">
                {isCompleted ? 'PIPELINE RUN COMPLETED' : 'ORCHESTRATED SCAN IN PROGRESS'}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                Security Analysis Pipeline
              </h1>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Target: <span className="text-slate-200">{targetApp.name}</span> (v{targetApp.currentVersion})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold font-mono text-brand-cyan">{progressPercent}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 font-mono text-xs">
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-brand-cyan via-sky-400 to-brand-indigo transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Completion Summary Card (Shows when done) */}
      {isCompleted ? (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-[#0d121c] to-brand-cyan/15 border border-emerald-500/40 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Analysis Complete</h3>
                <p className="text-xs font-mono text-emerald-300">
                  142 checks evaluated • 12 security findings discovered
                </p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
              Duration: 2m 41s
            </span>
          </div>

          {/* Finding Breakdown */}
          <div className="grid grid-cols-4 gap-3 text-center font-mono">
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30">
              <p className="text-xs text-rose-400 font-bold uppercase">Critical</p>
              <p className="text-2xl font-extrabold text-white">2</p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30">
              <p className="text-xs text-amber-400 font-bold uppercase">High</p>
              <p className="text-2xl font-extrabold text-white">4</p>
            </div>
            <div className="p-3 rounded-2xl bg-yellow-500/15 border border-yellow-500/30">
              <p className="text-xs text-yellow-400 font-bold uppercase">Medium</p>
              <p className="text-2xl font-extrabold text-white">5</p>
            </div>
            <div className="p-3 rounded-2xl bg-sky-500/15 border border-sky-500/30">
              <p className="text-xs text-sky-400 font-bold uppercase">Low</p>
              <p className="text-2xl font-extrabold text-white">1</p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Link
              href="/static-analysis"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition-all text-center"
            >
              Inspect Decompiled Code & AST
            </Link>

            <Link
              href="/findings"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-indigo text-slate-950 text-xs font-mono font-bold shadow-lg shadow-cyan-500/25 hover:opacity-95 transition-all"
            >
              <span>View Findings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : null}

      {/* 10-Stage Pipeline Checklist */}
      <div className="p-6 rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl space-y-3">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
          Orchestration Stages (10 Steps)
        </h3>

        <div className="space-y-2">
          {analysisStages.map((stage) => {
            const isPassed = currentStage > stage.id || isCompleted;
            const isCurrent = currentStage === stage.id && !isCompleted;

            return (
              <div
                key={stage.id}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                  isPassed
                    ? 'bg-slate-900/60 border-slate-800 text-slate-200'
                    : isCurrent
                    ? 'bg-brand-500/15 border-brand-cyan text-white shadow-lg ring-1 ring-brand-cyan/40'
                    : 'bg-slate-950/40 border-slate-900 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isPassed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <RotateCw className="w-4 h-4 text-brand-cyan animate-spin shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-400">
                      {stage.id}
                    </span>
                  )}
                  <span className="font-semibold">{stage.name}</span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    {stage.tool}
                  </span>
                  <span>{isPassed ? '✓ Complete' : isCurrent ? 'In Progress...' : 'Waiting'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Terminal Log Stream */}
      <div className="p-5 rounded-3xl bg-black/90 border border-slate-800 shadow-xl space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-brand-cyan" />
            <span className="text-[11px] uppercase">SentinelX Orchestrator Console</span>
          </div>
          <span className="text-[10px] text-slate-400">STDOUT Stream</span>
        </div>

        <div className="max-h-48 overflow-y-auto space-y-1 text-[11px] text-slate-300 pr-1">
          {logs.map((line, idx) => (
            <p key={idx} className="leading-relaxed">
              <span className="text-brand-cyan">{line.substring(0, 11)}</span>
              <span className="text-slate-200">{line.substring(11)}</span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
