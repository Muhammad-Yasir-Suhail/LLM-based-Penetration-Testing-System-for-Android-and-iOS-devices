'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GitFork,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Cpu,
  Terminal,
  Code2,
  Zap,
  Radio,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Bot,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { CorrelatedIssue, EngineType } from '@/types';
import { PipelineBanner } from '@/components/shell/PipelineBanner';

export default function CorrelationPage() {
  const { correlatedIssues, engines } = useAppState();
  const [selectedIssueId, setSelectedIssueId] = useState<string>(correlatedIssues[0]?.id || 'corr-1');
  const [expandedEngine, setExpandedEngine] = useState<string | null>(null);

  const selectedIssue = correlatedIssues.find(c => c.id === selectedIssueId) || correlatedIssues[0];

  const getEngineBadge = (engine: EngineType) => {
    switch (engine) {
      case 'MobSF':
        return { color: 'text-sky-400', bg: 'bg-sky-500/15 border-sky-500/30', icon: ShieldCheck };
      case 'JADX':
        return { color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30', icon: Code2 };
      case 'Apktool':
        return { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', icon: Terminal };
      case 'Frida':
        return { color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/30', icon: Zap };
      case 'Burp Suite':
        return { color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30', icon: Radio };
      case 'SentinelX Static Core':
      default:
        return { color: 'text-brand-cyan', bg: 'bg-brand-cyan/15 border-brand-cyan/30', icon: Sparkles };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              Cross-Engine Finding Correlation
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              AI Multi-Source Deduplication
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            SentinelX correlates raw findings across MobSF, JADX, Apktool, Frida, and Burp Suite into unified systemic issues.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Deduplication Rate: <strong>68% Noise Reduced</strong></span>
        </div>
      </div>

      {/* Pipeline Banner */}
      <PipelineBanner activeStep="correlate" compact />

      {/* Correlated Issues Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Correlated Issues List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-mono text-slate-400">
            <span>CORRELATED ROOT-CAUSE ISSUES ({correlatedIssues.length})</span>
            <span>Confidence Threshold &gt; 90%</span>
          </div>

          <div className="space-y-2.5">
            {correlatedIssues.map((issue) => {
              const isSelected = issue.id === selectedIssueId;
              return (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssueId(issue.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-500/15 border-indigo-400 shadow-xl shadow-indigo-950/40 ring-1 ring-indigo-400'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                      issue.severity === 'Critical' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}>
                      {issue.severity}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      {issue.confidence}% Confidence
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100">{issue.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{issue.description}</p>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/60 text-[11px] font-mono">
                    <span className="text-slate-400">{issue.applicationName}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-indigo-400 font-bold">{issue.evidenceTree.length} Evidence Sources</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Interactive Evidence Relationship Tree & Unified Remediation */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl space-y-6">
          {/* Correlated Issue Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase font-bold text-brand-cyan">
                  CORRELATED MASTER ISSUE
                </span>
                <span className="text-[10px] font-mono text-slate-400">• {selectedIssue.category}</span>
              </div>
              <h2 className="text-lg font-bold text-white">{selectedIssue.title}</h2>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Target Component: <span className="text-slate-200">{selectedIssue.affectedComponent}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-mono font-extrabold text-emerald-400">{selectedIssue.confidence}%</span>
              <p className="text-[10px] font-mono text-slate-400 uppercase">Correlation Fit</p>
            </div>
          </div>

          {/* Interactive Evidence Relationship Tree */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <GitFork className="w-4 h-4 text-indigo-400" />
                Multi-Engine Evidence Relationship Tree
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                {selectedIssue.evidenceTree.length} independent analyzer signals
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 space-y-3 font-mono">
              <div className="flex items-center gap-2 text-xs font-bold text-white pb-2 border-b border-slate-800/60">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan" />
                <span>Underlying Security Flaw: {selectedIssue.title}</span>
              </div>

              {/* Evidence Tree Branches */}
              <div className="space-y-2.5 pl-4 border-l-2 border-slate-800">
                {selectedIssue.evidenceTree.map((evidence, idx) => {
                  const badge = getEngineBadge(evidence.engine);
                  const Icon = badge.icon;
                  const isExpanded = expandedEngine === evidence.engine;

                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                    >
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedEngine(isExpanded ? null : evidence.engine)}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${badge.bg} ${badge.color}`}>
                            <Icon className="w-3 h-3" />
                            {evidence.engine}
                          </span>
                          <span className="text-xs font-semibold text-slate-200">{evidence.findingTitle}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{evidence.confidence}% fit</span>
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                        </div>
                      </div>

                      {/* Raw Tool Output Evidence Snippet */}
                      <pre className="p-2.5 rounded-lg bg-black/80 border border-slate-800/80 text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap">
                        {evidence.rawEvidence}
                      </pre>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>File: {evidence.filePath} {evidence.line ? `(Line ${evidence.line})` : ''}</span>
                        <span className="text-brand-cyan">Verified Engine Output</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Unified AI Remediation */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-900/80 to-indigo-500/10 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Unified Cross-Engine Remediation Directive
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Singular Root Fix
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedIssue.unifiedRemediation}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Link
              href="/copilot"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold transition-all"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI To Auto-Patch</span>
            </Link>

            <Link
              href="/findings"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-indigo text-slate-950 text-xs font-mono font-bold shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all"
            >
              <span>View Individual Findings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
