'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Smartphone,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Activity,
  FileText,
  Bot,
  Calendar,
  History,
  TrendingUp,
  Layers,
  Fingerprint,
  Cpu,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useAppState } from '@/context/AppStateContext';
import { getScoreGrade, formatSeverityColor } from '@/lib/utils';

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id as string;
  const { applications, findings, addReport } = useAppState();

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'findings' | 'metadata'>('history');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const application = applications.find(a => a.id === appId) || applications[0];
  const appFindings = findings.filter(f => f.applicationId === application.id);
  const scoreMeta = getScoreGrade(application.securityScore);

  // Version history data for charts
  const historyTrendData = application.versionHistory?.map(vh => ({
    version: vh.version,
    score: vh.securityScore,
    critical: vh.criticalFindings,
    high: vh.highFindings,
    total: vh.totalFindings
  })) || [
    { version: 'v3.8', score: 68, critical: 4, high: 8, total: 24 },
    { version: 'v3.9', score: 71, critical: 3, high: 7, total: 20 },
    { version: 'v4.0', score: 88, critical: 0, high: 3, total: 9 },
    { version: 'v4.1', score: 74, critical: 3, high: 6, total: 17 },
    { version: 'v4.2.1', score: application.securityScore, critical: application.findingsCount.critical, high: application.findingsCount.high, total: appFindings.length }
  ];

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      const rep = addReport({
        title: `Security Assessment Report - ${application.name}`,
        type: 'Executive Summary',
        applicationName: application.name,
        version: application.currentVersion,
        generatedBy: 'Alex Vance',
        securityScore: application.securityScore,
        findingsCount: appFindings.length,
        downloadSize: '2.8 MB PDF',
        executiveSummary: `Automated assessment of ${application.name} (${application.packageName}) conducted via SentinelX. Overall security score: ${application.securityScore}/100.`
      });
      setIsGeneratingReport(false);
      router.push(`/reports/${rep.id}`);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/applications"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Applications</span>
      </Link>

      {/* Main Application Header Card */}
      <div className="p-6 rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center font-mono font-extrabold text-sm text-white shadow-xl shrink-0">
              {application.platform === 'Android' ? 'APK' : 'IPA'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-white">{application.name}</h1>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
                  v{application.currentVersion} (#{application.currentBuild})
                </span>
                <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-mono">
                  {application.platform}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${scoreMeta.bg} ${scoreMeta.color}`}>
                  Score {application.securityScore}/100 ({scoreMeta.label})
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Package: <span className="text-slate-200">{application.packageName}</span> • Last analyzed: <span className="text-slate-200">{application.lastAnalyzed}</span>
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/analysis/run"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-indigo text-slate-950 text-xs font-mono font-bold shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all"
            >
              <Activity className="w-4 h-4 animate-pulse" />
              <span>Run Analysis</span>
            </Link>

            <button
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-semibold transition-all"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>{isGeneratingReport ? 'Generating...' : 'Generate Report'}</span>
            </button>

            <Link
              href="/copilot"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold transition-all"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI</span>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-t border-slate-800/80 pt-3 overflow-x-auto text-xs font-mono">
          {[
            { id: 'history', label: 'Security History & Version Progression', icon: History, count: application.versionHistory?.length },
            { id: 'findings', label: 'Vulnerabilities & Findings', icon: ShieldAlert, count: appFindings.length },
            { id: 'metadata', label: 'Package & Fingerprint Metadata', icon: Fingerprint },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab: Security History (Version Timeline Progression) */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Version Score Trend Chart */}
          <div className="p-6 rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Version-over-Version Posture Trend
                </span>
                <h3 className="text-base font-bold text-white">Security Score & Vulnerability Trajectory</h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan inline-block" /> Security Score
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Critical Vulnerabilities
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyTrendData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="version" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0d121c', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#38bdf8" fillOpacity={1} fill="url(#colorScore)" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="critical" stroke="#f43f5e" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chronological Version Timeline Cards */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider">
              Chronological Release Builds & Security Events
            </h3>

            <div className="space-y-4 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-800">
              {application.versionHistory?.map((ver, idx) => {
                const vScoreMeta = getScoreGrade(ver.securityScore);
                return (
                  <div key={idx} className="relative pl-10">
                    {/* Timeline Node Dot */}
                    <div className="absolute left-2.5 top-5 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-brand-cyan border-4 border-[#07090e] shadow-md" />

                    <div className="p-5 rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-lg space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="text-base font-bold text-white font-mono">{ver.version}</span>
                          <span className="text-xs font-mono text-slate-400">Build #{ver.buildNumber}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${vScoreMeta.bg} ${vScoreMeta.color}`}>
                            Score {ver.securityScore}/100
                          </span>
                        </div>
                        <span className="text-xs font-mono text-slate-400">{ver.scanDate} • {ver.fileSize}</span>
                      </div>

                      <p className="text-xs text-slate-300">
                        {ver.changesSummary}
                      </p>

                      {/* Milestone Event Badges */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                        {ver.events.map((evt, eIdx) => {
                          const isVulnIntro = evt.type === 'vuln_introduced';
                          const isVulnResolved = evt.type === 'vuln_resolved';
                          return (
                            <div
                              key={eIdx}
                              className={`p-2.5 rounded-xl border text-xs font-mono flex items-start gap-2.5 ${
                                isVulnIntro
                                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                                  : isVulnResolved
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-300'
                              }`}
                            >
                              <span className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-current" />
                              <div>
                                <span className="font-bold">{evt.label}:</span>{' '}
                                <span className="text-slate-400">{evt.description}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
                        <span>Total Findings: {ver.totalFindings} ({ver.criticalFindings} Critical, {ver.highFindings} High)</span>
                        <Link href="/static-analysis" className="text-brand-cyan hover:underline flex items-center gap-1">
                          <span>Inspect Code State</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Findings List */}
      {activeTab === 'findings' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-mono text-slate-400">
            <span>FINDINGS DETECTED IN THIS APPLICATION ({appFindings.length})</span>
            <Link href="/findings" className="text-brand-cyan hover:underline">
              Open Full Vulnerability Manager
            </Link>
          </div>

          <div className="space-y-2.5">
            {appFindings.map((finding) => {
              const sColor = formatSeverityColor(finding.severity);
              return (
                <Link
                  key={finding.id}
                  href={`/findings/${finding.id}`}
                  className="p-4 rounded-2xl bg-[#0d121c] border border-slate-800 hover:border-slate-700 shadow-md flex items-center justify-between gap-4 group transition-all"
                >
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <span className={`px-2 py-1 rounded text-xs font-mono font-bold uppercase border shrink-0 ${sColor.badge}`}>
                      {finding.severity}
                    </span>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-slate-100 group-hover:text-brand-cyan transition-colors truncate">
                        {finding.findingNumber}: {finding.title}
                      </p>
                      <p className="text-xs font-mono text-slate-400 truncate mt-0.5">
                        {finding.affectedComponent} • {finding.cwe} • CVSS {finding.cvss}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-slate-400">{finding.status}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-cyan" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Metadata */}
      {activeTab === 'metadata' && (
        <div className="p-6 rounded-3xl bg-[#0d121c] border border-slate-800 shadow-xl space-y-4 text-xs font-mono">
          <h3 className="text-sm font-bold text-white uppercase">Package Fingerprint & Security Metadata</h3>

          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Package Identifier</span>
              <span className="text-slate-100 font-bold">{application.packageName}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-slate-400">SHA-256 Checksum</span>
              <span className="text-slate-300 truncate max-w-md">{application.sha256}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Build Size</span>
              <span className="text-slate-200">{application.fileSize}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Target SDK / Min SDK</span>
              <span className="text-slate-200">{application.targetSdk} (Min: {application.minSdk})</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
