'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Bot,
  FileCode,
  Sparkles,
  ExternalLink,
  User,
  CheckCircle2,
  Copy,
  Check,
  Layers,
  ChevronRight,
  GitCompare
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { FindingStatus } from '@/types';
import { formatSeverityColor } from '@/lib/utils';
import { ViewTabs } from '@/components/ui/ViewTabs';

export default function FindingDetailPage() {
  const params = useParams();
  const findingId = params.id as string;
  const { findings, updateFindingStatus, assignFinding, teamMembers } = useAppState();

  const [copied, setCopied] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  const finding = findings.find(f => f.id === findingId) || findings[0];
  const sColor = formatSeverityColor(finding.severity);

  const handleCopyEvidence = () => {
    navigator.clipboard.writeText(finding.technicalEvidence);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/findings"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Findings</span>
      </Link>

      {/* Main Finding Card */}
      <div className="p-6 space-y-6 card">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-4 border-b border-slate-800">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 rounded-md font-medium text-xs border ${sColor.badge}`}>
                {finding.severity}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-xs tabular-nums text-slate-300 border border-slate-700">
                {finding.findingNumber}
              </span>
              <span className="text-xs tabular-nums text-slate-400">
               {finding.category}, {finding.cwe}
              </span>
            </div>
            <h1 className="text-2xl sm:text-[30px] leading-tight font-medium text-white">
              {finding.title}
            </h1>
            <p className="text-xs tabular-nums text-slate-400">
              Application: <span className="text-slate-200">{finding.applicationName}</span>, Platform: <span className="text-slate-200">{finding.platform}</span>
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs tabular-nums text-slate-400">Status:</span>
              <select
                value={finding.status}
                onChange={(e) => updateFindingStatus(finding.id, e.target.value as FindingStatus)}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-medium border focus:outline-none cursor-pointer transition-colors ${
                  finding.status === 'Resolved'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : finding.status === 'In Review'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
              >
                <option value="Open" className="bg-slate-900 text-white">Open</option>
                <option value="In Review" className="bg-slate-900 text-white">In Review</option>
                <option value="Resolved" className="bg-slate-900 text-white">✓ Resolved (Score +)</option>
                <option value="False Positive" className="bg-slate-900 text-white">False Positive</option>
              </select>
            </div>

            {/* Ask AI Trigger */}
            <button
              onClick={() => setAiDrawerOpen(!aiDrawerOpen)}
              className="btn-app btn-app-secondary"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Explanation</span>
            </button>
          </div>
        </div>

        {/* Risk Scores Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums text-xs">
          <div className="p-3 panel">
            <span className="text-slate-400 text-[11px] block">CVSS v3.1 Score</span>
            <span className="text-xl font-semibold text-rose-400">{finding.cvss}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5 truncate">{finding.cvssVector}</span>
          </div>

          <div className="p-3 panel">
            <span className="text-slate-400 text-[11px] block">OWASP MASVS Mapping</span>
            <span className="text-sm font-medium text-brand-cyan">{finding.owaspCategory}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Mobile Standard v2.0</span>
          </div>

          <div className="p-3 panel">
            <span className="text-slate-400 text-[11px] block">Decompiler Confidence</span>
            <span className="text-xl font-semibold text-emerald-400">{finding.confidence}%</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Multi-engine match</span>
          </div>

          <div className="p-3 panel">
            <span className="text-slate-400 text-[11px] block">Assigned Engineer</span>
            <div className="flex items-center gap-2 mt-1">
              <User className="w-4 h-4 text-slate-400" />
              <select
                value={finding.assignedTo}
                onChange={(e) => assignFinding(finding.id, e.target.value)}
                className="bg-transparent text-slate-200 text-xs tabular-nums focus:outline-none"
              >
                {teamMembers.map(m => (
                  <option key={m.id} value={m.name} className="bg-slate-900 text-white">{m.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* AI Explanation Side Panel (Collapsible / Reactive) */}
        {aiDrawerOpen && (
          <div className="p-5 space-y-4 animate-in fade-in duration-200 card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-300 font-medium text-xs">
                <Bot className="w-4 h-4 text-slate-500" />
                <span>Security Copilot, AI Vulnerability Breakdown</span>
              </div>
              <span className="text-[11px] tabular-nums px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                Contextual Analysis
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
              <div className="space-y-1">
                <h4 className="tabular-nums font-medium text-white">What this means:</h4>
                <p className="text-slate-300">
                  {finding.category === 'Hardcoded Secrets'
                    ? 'A static symmetric encryption key is embedded directly into compiled DEX bytecode, making it trivial for adversaries to decompile and decrypt offline data caches.'
                    : 'The declared Android component is exposed across process boundaries without requiring calling applications to hold valid signature permissions.'}
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="tabular-nums font-medium text-rose-400">Developer Explanation:</h4>
                <p className="text-slate-300">
                  &ldquo;This activity or secret constant was declared with public accessibility. Depending on device state, another malicious package can trigger unauthorized state mutations.&rdquo;
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grouped into views: one group on screen at a time */}
      <ViewTabs
        label="Finding details"
        views={[
          { id: 'overview', label: 'Overview', content: (
            <>
              <div className="p-6 card">
                {/* Technical Description & Impact */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xs font-medium text-slate-300">
                      Technical Description
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                      {finding.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-medium text-rose-400">
                      Security & Exploitation Impact
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed bg-rose-500/10 p-4 rounded-2xl border border-rose-500/25">
                      {finding.impact}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) },
          { id: 'evidence', label: 'Evidence', content: (
            <>
              <div className="p-6 card">
                {/* Technical Evidence Code Snippet */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-medium text-slate-300">
                      Technical Evidence Snippet ({finding.filePath}:{finding.lineNumber})
                    </h3>
                    <button
                      onClick={handleCopyEvidence}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-slate-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <pre className="p-4 rounded-2xl bg-black/90 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                    <code>{finding.technicalEvidence}</code>
                  </pre>
                </div>
              </div>
            </>
          ) },
          ...(finding.remediationDiff ? [
            { id: 'remediation', label: 'Remediation', content: (
              <>
                <div className="p-6 card">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-medium text-emerald-400 flex items-center gap-2">
                        <GitCompare className="w-4 h-4 text-slate-500" />
                        Actionable Remediation Code Diff
                      </h3>
                      <span className="text-[11px] tabular-nums text-slate-400">Before & After Patch</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 tabular-nums text-xs">
                      {/* Vulnerable Original */}
                      <div className="p-4 space-y-2 card">
                        <span className="text-[11px] font-medium text-rose-400 block">
                          - Vulnerable Source
                        </span>
                        <pre className="text-rose-200 text-[11px] overflow-x-auto whitespace-pre-wrap">
                          <code>{finding.remediationDiff.original}</code>
                        </pre>
                      </div>

                      {/* Secure Remediation */}
                      <div className="p-4 space-y-2 card">
                        <span className="text-[11px] font-medium text-emerald-400 block">
                          + Secure Remediation
                        </span>
                        <pre className="text-emerald-200 text-[11px] overflow-x-auto whitespace-pre-wrap">
                          <code>{finding.remediationDiff.suggested}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) }
          ] : []),
          { id: 'references', label: 'References', count: finding.references.length, content: (
            <>
              <div className="p-6 card">
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <h3 className="text-xs font-medium text-slate-400">
                    References & Standards
                  </h3>
                  <div className="space-y-1.5 tabular-nums text-xs">
                    {finding.references.map((ref, idx) => (
                      <a
                        key={idx}
                        href={ref.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-brand-cyan hover:underline p-2 rounded-xl bg-slate-900/40 border border-slate-800/60"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span>{ref.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) },
        ]}
      />
    </div>
  );
}
