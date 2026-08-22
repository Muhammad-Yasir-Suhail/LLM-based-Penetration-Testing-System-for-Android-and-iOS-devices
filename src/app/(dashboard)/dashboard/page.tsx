'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Smartphone,
  Activity,
  ArrowUpRight,
  TrendingUp,
  FolderGit2,
  Cpu,
  Layers,
  Sparkles,
  ChevronRight,
  Zap,
  CheckCircle2,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { useAppState } from '@/context/AppStateContext';
import { PipelineBanner } from '@/components/shell/PipelineBanner';
import { getScoreGrade, formatSeverityColor } from '@/lib/utils';

// Mock chart datasets
const findingsOverTimeData = [
  { month: 'Jan', critical: 6, high: 22, medium: 48, resolved: 30 },
  { month: 'Feb', critical: 5, high: 20, medium: 44, resolved: 38 },
  { month: 'Mar', critical: 7, high: 24, medium: 50, resolved: 42 },
  { month: 'Apr', critical: 5, high: 19, medium: 45, resolved: 56 },
  { month: 'May', critical: 4, high: 18, medium: 41, resolved: 68 },
  { month: 'Jun', critical: 4, high: 17, medium: 42, resolved: 74 },
];

const scoreTrendData = [
  { month: 'Jan', score: 64 },
  { month: 'Feb', score: 68 },
  { month: 'Mar', score: 71 },
  { month: 'Apr', score: 72 },
  { month: 'May', score: 75 },
  { month: 'Jun', score: 78 },
];

const vulnerabilityCategoriesData = [
  { category: 'Insecure Data Storage', count: 18, risk: 'High' },
  { category: 'Weak Cryptography', count: 14, risk: 'Critical' },
  { category: 'Improper TLS Config', count: 12, risk: 'High' },
  { category: 'Exported Components', count: 11, risk: 'Critical' },
  { category: 'Hardcoded Secrets', count: 9, risk: 'Critical' },
  { category: 'Insecure WebView', count: 7, risk: 'Medium' },
  { category: 'Vulnerable Dependencies', count: 6, risk: 'High' },
];

export default function DashboardPage() {
  const {
    applications,
    projects,
    findings,
    workspaceScore,
    activityEvents,
    activeWorkspace
  } = useAppState();

  const scoreMeta = getScoreGrade(workspaceScore.score);

  // Dynamic severity breakdown from active findings
  const severityDistributionData = [
    { name: 'Critical', value: workspaceScore.openCritical, color: '#f43f5e' },
    { name: 'High', value: workspaceScore.openHigh, color: '#f97316' },
    { name: 'Medium', value: workspaceScore.openMedium, color: '#eab308' },
    { name: 'Low', value: workspaceScore.openLow, color: '#38bdf8' },
    { name: 'Info', value: workspaceScore.openInfo, color: '#94a3b8' },
  ];

  const androidAppsCount = applications.filter(a => a.platform === 'Android').length;
  const iosAppsCount = applications.filter(a => a.platform === 'iOS').length;

  const platformDistribution = [
    { name: 'Android', count: androidAppsCount, color: '#38bdf8' },
    { name: 'iOS', count: iosAppsCount, color: '#818cf8' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              Security Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30">
              {activeWorkspace}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time cross-platform mobile security posture, correlation streams, and remediation tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/projects"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-medium transition-all"
          >
            + New Project
          </Link>
          <Link
            href="/analysis/run"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-indigo text-slate-950 text-xs font-mono font-bold shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all"
          >
            <Activity className="w-4 h-4 animate-pulse" />
            <span>Run Analysis</span>
          </Link>
        </div>
      </div>

      {/* SentinelX 7-Stage Intelligence Pipeline Banner */}
      <PipelineBanner activeStep="correlate" />

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Apps */}
        <div className="p-4 rounded-2xl bg-[#0d121c] border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">Applications</span>
            <Smartphone className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{applications.length}</span>
            <span className="text-[10px] text-sky-400 font-mono">15 active builds</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span>{androidAppsCount} Android</span> • <span>{iosAppsCount} iOS</span>
          </div>
        </div>

        {/* Critical Findings */}
        <div className="p-4 rounded-2xl bg-[#0d121c] border border-rose-500/30 shadow-lg relative overflow-hidden group hover:border-rose-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase text-rose-400 font-bold">Critical Findings</span>
            <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">
              {workspaceScore.openCritical}
            </span>
            <span className="text-[10px] text-rose-300 font-mono">P0 Immediate</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Hardcoded keys & unauth IPC
          </div>
        </div>

        {/* High Findings */}
        <div className="p-4 rounded-2xl bg-[#0d121c] border border-amber-500/30 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase text-amber-400 font-bold">High Findings</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
              {workspaceScore.openHigh}
            </span>
            <span className="text-[10px] text-amber-300 font-mono">P1 Priority</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Cleartext TLS & DB leaks
          </div>
        </div>

        {/* Security Score */}
        <div className="p-4 rounded-2xl bg-[#0d121c] border border-brand-cyan/30 shadow-lg relative overflow-hidden group hover:border-brand-cyan/50 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase text-brand-cyan font-bold">Security Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {workspaceScore.score}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+8.4% from last month</span>
          </div>
        </div>

        {/* Scans This Month */}
        <div className="p-4 rounded-2xl bg-[#0d121c] border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">Scans This Month</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">48</span>
            <span className="text-[10px] text-emerald-400 font-mono">100% completed</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            142 checks per scan run
          </div>
        </div>
      </div>

      {/* Main Posture & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Large Security Score Posture Gauge */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Workspace Posture</span>
              <h3 className="text-base font-bold text-white">Overall Security Rating</h3>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${scoreMeta.bg} ${scoreMeta.color}`}>
              {scoreMeta.label}
            </span>
          </div>

          {/* Circular Score Visualization */}
          <div className="flex flex-col items-center justify-center py-4 relative">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress animated stroke */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-brand-cyan transition-all duration-700 ease-out"
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * workspaceScore.score) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-extrabold text-white font-mono">{workspaceScore.score}</span>
                <span className="text-[11px] font-mono text-slate-400">OUT OF 100</span>
                <span className="text-[10px] text-emerald-400 font-mono mt-0.5">+8.4% 30d</span>
              </div>
            </div>
          </div>

          {/* Vulnerability Distribution Pills */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
              <span>Open Findings Breakdown</span>
              <span>{workspaceScore.totalFindings - workspaceScore.resolvedCount} Active</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 text-center font-mono">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30">
                <p className="text-[10px] text-rose-400 font-bold">CRIT</p>
                <p className="text-sm font-bold text-white">{workspaceScore.openCritical}</p>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <p className="text-[10px] text-amber-400 font-bold">HIGH</p>
                <p className="text-sm font-bold text-white">{workspaceScore.openHigh}</p>
              </div>
              <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-[10px] text-yellow-400 font-bold">MED</p>
                <p className="text-sm font-bold text-white">{workspaceScore.openMedium}</p>
              </div>
              <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30">
                <p className="text-[10px] text-sky-400 font-bold">LOW</p>
                <p className="text-sm font-bold text-white">{workspaceScore.openLow}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-500/10 border border-slate-500/30">
                <p className="text-[10px] text-slate-400 font-bold">INFO</p>
                <p className="text-sm font-bold text-white">{workspaceScore.openInfo}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Findings Over Time & Severity Donut */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Remediation Velocity</span>
              <h3 className="text-base font-bold text-white">Findings Trend & Resolution Rate</h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Critical
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> High
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Resolved
              </span>
            </div>
          </div>

          {/* Area Chart */}
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={findingsOverTimeData}>
                <defs>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d121c', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" strokeWidth={2} />
                <Area type="monotone" dataKey="critical" stroke="#f43f5e" fillOpacity={1} fill="url(#colorCritical)" strokeWidth={2} />
                <Area type="monotone" dataKey="high" stroke="#f97316" fill="transparent" strokeWidth={2} strokeDasharray="3 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">
              74 vulnerabilities successfully resolved to date.
            </span>
            <Link href="/findings" className="text-brand-cyan hover:underline font-mono flex items-center gap-1">
              <span>View All Findings</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Second Row: Top Vulnerability Categories & Platform Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Most Common Vulnerability Categories */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">OWASP MASVS / CWE</span>
              <h3 className="text-base font-bold text-white">Common Vulnerabilities</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">7 categories</span>
          </div>

          <div className="space-y-2.5">
            {vulnerabilityCategoriesData.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 truncate max-w-[200px]">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                      item.risk === 'Critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {item.risk}
                    </span>
                    <span className="font-mono text-slate-200 font-bold">{item.count}</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.risk === 'Critical' ? 'bg-rose-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${(item.count / 20) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Severity Donut & Platforms */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Risk Allocation</span>
              <h3 className="text-base font-bold text-white">Severity Distribution</h3>
            </div>
            <span className="text-[11px] font-mono text-brand-cyan">Active Set</span>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d121c', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span className="text-xs text-slate-300">Android APKs</span>
              </div>
              <span className="text-xs font-mono font-bold text-white">{androidAppsCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                <span className="text-xs text-slate-300">iOS IPAs</span>
              </div>
              <span className="text-xs font-mono font-bold text-white">{iosAppsCount}</span>
            </div>
          </div>
        </div>

        {/* Recent Security Activity Stream */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Live Audit Stream</span>
              <h3 className="text-base font-bold text-white">Recent Activity</h3>
            </div>
            <Link href="/activity" className="text-xs font-mono text-brand-cyan hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {activityEvents.slice(0, 4).map((evt) => (
              <div key={evt.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60">
                <span className="w-2 h-2 rounded-full bg-brand-cyan shrink-0 mt-1.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-200 truncate">{evt.title}</p>
                    <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap ml-1">{evt.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{evt.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
