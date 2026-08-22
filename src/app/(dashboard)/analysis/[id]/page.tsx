'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  FileCode,
  Layers,
  Radio,
  Lock,
  Eye,
  Bot,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { formatSeverityColor } from '@/lib/utils';

export default function AnalysisDetailPage() {
  const params = useParams();
  const runId = params.id as string;
  const { analyses, findings } = useAppState();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const run = analyses.find(a => a.id === runId) || analyses[0];
  const runFindings = findings.filter(f => f.applicationId === run.applicationId);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'static', label: 'Static Analysis', icon: FileCode },
    { id: 'manifest', label: 'Manifest & IPC', icon: Layers },
    { id: 'dependencies', label: 'Dependencies & CVEs', icon: Layers },
    { id: 'network', label: 'Network & TLS', icon: Radio },
    { id: 'secrets', label: 'Hardcoded Secrets', icon: Lock },
    { id: 'privacy', label: 'Privacy & Permissions', icon: Eye },
    { id: 'ai', label: 'AI Security Copilot Analysis', icon: Bot },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/analysis"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Analysis Runs</span>
      </Link>

      {/* Analysis Header Card */}
      <div className="p-6 rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-white font-mono">{run.runNumber}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {run.status}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-xs font-mono text-slate-300 border border-slate-700">
                {run.duration}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Target: <span className="text-slate-200">{run.applicationName}</span> ({run.version}) • Started: <span className="text-slate-200">{run.startedAt}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/static-analysis"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan/30 border border-brand-cyan/40 text-xs font-mono font-bold transition-all"
            >
              <FileCode className="w-4 h-4" />
              <span>Launch Code Viewer</span>
            </Link>
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Checks Executed</span>
            <span className="text-lg font-bold text-white">{run.checksExecuted}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Files Analyzed</span>
            <span className="text-lg font-bold text-white">{run.filesAnalyzed}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Rules Executed</span>
            <span className="text-lg font-bold text-white">{run.rulesExecuted}</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
            <span className="text-rose-400 text-[10px] block font-bold">Findings Discovered</span>
            <span className="text-lg font-bold text-white">{run.findingsFound}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 border-t border-slate-800 pt-3 overflow-x-auto text-xs font-mono">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="p-6 rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                Analysis Summary & Findings Detected
              </h3>

              <div className="space-y-2.5">
                {runFindings.map((f) => {
                  const sColor = formatSeverityColor(f.severity);
                  return (
                    <Link
                      key={f.id}
                      href={`/findings/${f.id}`}
                      className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-4 group transition-all"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border shrink-0 ${sColor.badge}`}>
                          {f.severity}
                        </span>
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-100 group-hover:text-brand-cyan transition-colors truncate">
                            {f.findingNumber}: {f.title}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400 truncate">
                            {f.affectedComponent} • {f.cwe}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-cyan shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl space-y-4 text-xs font-mono">
              <h3 className="text-sm font-bold text-white uppercase">Engines Orchestrated</h3>
              <div className="space-y-2">
                {run.enginesUsed.map((eng, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-200 font-semibold">{eng}</span>
                    <span className="text-emerald-400">✓ Completed</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'static' && (
        <div className="p-6 rounded-3xl bg-[#0d121c] border border-slate-800 shadow-xl space-y-4 text-xs font-mono">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase">Static Decompiler Output (JADX / AST)</h3>
            <Link href="/static-analysis" className="text-brand-cyan hover:underline">
              Open Interactive Code Viewer →
            </Link>
          </div>
          <p className="text-slate-300">
            1,428 Dalvik classes deconstructed into Java/Kotlin AST. 9 static vulnerabilities flagged with source code reachability mappings.
          </p>
        </div>
      )}

      {activeTab === 'manifest' && (
        <div className="p-6 rounded-3xl bg-[#0d121c] border border-slate-800 shadow-xl space-y-4 text-xs font-mono">
          <h3 className="text-sm font-bold text-white uppercase">AndroidManifest.xml & IPC Security</h3>
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
            ⚠ Alert: TransactionConfirmationActivity declared with android:exported=&quot;true&quot; without permission guard.
          </div>
        </div>
      )}

      {activeTab === 'dependencies' && (
        <div className="p-6 rounded-3xl bg-[#0d121c] border border-slate-800 shadow-xl space-y-4 text-xs font-mono">
          <h3 className="text-sm font-bold text-white uppercase">Third-Party Dependency Vulnerabilities</h3>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
            OkHttp 3.12.0 flagged with CVE-2021-0341 (Hostname validation bypass).
          </div>
        </div>
      )}

      {activeTab === 'network' && (
        <div className="p-6 rounded-3xl bg-[#0d121c] border border-slate-800 shadow-xl space-y-4 text-xs font-mono">
          <h3 className="text-sm font-bold text-white uppercase">Network Security Configuration</h3>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
            Cleartext HTTP allowed on staging-api.acme-banking.com and telemetry.internal.net.
          </div>
        </div>
      )}

      {activeTab === 'secrets' && (
        <div className="p-6 rounded-3xl bg-[#0d121c] border border-slate-800 shadow-xl space-y-4 text-xs font-mono">
          <h3 className="text-sm font-bold text-white uppercase">Hardcoded Secrets & High Entropy Scanning</h3>
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
            Critical: Hardcoded AES 256-bit key `4c7865396d3238613437623930313233` discovered in AuthManager.kt.
          </div>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="p-6 rounded-3xl bg-[#0d121c] border border-slate-800 shadow-xl space-y-4 text-xs font-mono">
          <h3 className="text-sm font-bold text-white uppercase">Privacy & Permission Extraction</h3>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            5 permissions requested: INTERNET, ACCESS_NETWORK_STATE, USE_BIOMETRIC, READ_EXTERNAL_STORAGE, POST_NOTIFICATIONS.
          </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="p-6 rounded-3xl bg-[#0d121c] border border-slate-800 shadow-xl space-y-4 text-xs font-mono">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase">Security Copilot AI Assessment</h3>
            <Link href="/copilot" className="text-brand-cyan hover:underline">
              Launch Interactive Copilot →
            </Link>
          </div>
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-200 leading-relaxed">
            AI synthesized 12 raw scan outputs into 2 primary attack vectors: Local cryptographic token extraction and unauthenticated IPC intent hijacking. Immediate remediation of AuthManager.kt recommended.
          </div>
        </div>
      )}
    </div>
  );
}
