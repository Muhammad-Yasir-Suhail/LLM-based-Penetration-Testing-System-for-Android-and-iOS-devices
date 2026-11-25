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
import { ViewTabs } from '@/components/ui/ViewTabs';
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
    { name: 'Critical', value: workspaceScore.openCritical, color: '#fafafa' },
    { name: 'High', value: workspaceScore.openHigh, color: '#d4d4d8' },
    { name: 'Medium', value: workspaceScore.openMedium, color: '#a1a1aa' },
    { name: 'Low', value: workspaceScore.openLow, color: '#71717a' },
    { name: 'Info', value: workspaceScore.openInfo, color: '#52525b' },
  ];

  const androidAppsCount = applications.filter(a => a.platform === 'Android').length;
  const iosAppsCount = applications.filter(a => a.platform === 'iOS').length;

  const platformDistribution = [
    { name: 'Android', count: androidAppsCount, color: '#71717a' },
    { name: 'iOS', count: iosAppsCount, color: '#a1a1aa' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[28px] sm:text-[36px] leading-[1.1] font-medium text-white font-sans">
              Security Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs tabular-nums bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {activeWorkspace}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time mobile security posture, autonomous agent analysis pipeline, and evidence-backed remediation tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/projects"
            className="btn-app btn-app-secondary"
          >
            + New Project
          </Link>
          <Link
            href="/analysis/run"
            className="btn-app btn-app-secondary"
          >
            <Activity className="w-4 h-4" />
            <span>Launch Agent Run</span>
          </Link>
        </div>
      </div>

      {/* Top KPI strip: one surface, hairline dividers */}
      <div className="surface-flat grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-white/[0.06]">
        {/* Total Apps */}
        <div className="kpi-cell p-4 relative overflow-hidden group bg-elevated">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">Applications</span>
            <Smartphone className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span data-countup className="text-2xl sm:text-3xl font-semibold text-white tabular-nums">{applications.length}</span>
            <span className="text-[11px] text-sky-400 tabular-nums">15 active builds</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span>{androidAppsCount} Android, {iosAppsCount} iOS</span>
          </div>
        </div>

        {/* Critical Findings */}
        <div className="kpi-cell p-4 relative overflow-hidden group bg-elevated">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs text-rose-400 font-medium">Critical Findings</span>
            <ShieldAlert className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span data-countup className="text-2xl sm:text-3xl font-semibold text-rose-400 tabular-nums">
              {workspaceScore.openCritical}
            </span>
            <span className="text-[11px] text-rose-300 tabular-nums">P0 Immediate</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Hardcoded keys & unauth IPC
          </div>
        </div>

        {/* High Findings */}
        <div className="kpi-cell p-4 relative overflow-hidden group bg-elevated">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs text-amber-400 font-medium">High Findings</span>
            <AlertTriangle className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span data-countup className="text-2xl sm:text-3xl font-semibold text-amber-400 tabular-nums">
              {workspaceScore.openHigh}
            </span>
            <span className="text-[11px] text-amber-300 tabular-nums">P1 Priority</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Cleartext TLS & DB leaks
          </div>
        </div>

        {/* Security Score */}
        <div className="kpi-cell p-4 relative overflow-hidden group bg-elevated">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs text-brand-cyan font-medium">Security Score</span>
            <ShieldCheck className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span data-countup className="text-2xl sm:text-3xl font-semibold text-white tabular-nums">
              {workspaceScore.score}
            </span>
            <span className="text-xs text-slate-400 tabular-nums">/ 100</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 tabular-nums flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+8.4% from last month</span>
          </div>
        </div>

        {/* Scans This Month */}
        <div className="kpi-cell p-4 relative overflow-hidden group col-span-2 sm:col-span-1 bg-elevated">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">Scans This Month</span>
            <Activity className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span data-countup className="text-2xl sm:text-3xl font-semibold text-white tabular-nums">48</span>
            <span className="text-[11px] text-emerald-400 tabular-nums">100% completed</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            142 checks per scan run
          </div>
        </div>
      </div>

      {/* Everything else sits behind views: one group on screen at a time */}
      <ViewTabs
        label="Security Overview sections"
        views={[
          { id: 'posture', label: 'Posture', content: (
          <>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Large Security Score Posture Gauge */}
                  <div className="lg:col-span-5 p-6 flex flex-col justify-between space-y-6 card">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400">Workspace Posture</span>
                        <h3 className="text-base font-medium text-white">Overall Security Rating</h3>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs tabular-nums font-medium border ${scoreMeta.bg} ${scoreMeta.color}`}>
                        {scoreMeta.label}
                      </span>
                    </div>

                    {/* Circular Score Visualization */}
                    <div className="flex flex-col items-center justify-center py-4 relative">
                      <div className="relative w-44 h-44 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
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
                            className="stroke-brand-cyan transition duration-700 ease-out"
                            strokeWidth="8"
                            strokeDasharray={251.2}
                            strokeDashoffset={251.2 - (251.2 * workspaceScore.score) / 100}
                            strokeLinecap="round"
                            fill="transparent"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center text-center">
                          <span data-countup className="text-4xl font-semibold text-white tabular-nums">{workspaceScore.score}</span>
                          <span className="text-[11px] tabular-nums text-slate-400">OUT OF 100</span>
                          <span className="text-[11px] text-emerald-400 tabular-nums mt-0.5">+8.4% 30d</span>
                        </div>
                      </div>
                    </div>

                    {/* Vulnerability Distribution Pills */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-xs tabular-nums text-slate-400 mb-1">
                        <span>Open Findings Breakdown</span>
                        <span>{workspaceScore.totalFindings - workspaceScore.resolvedCount} Active</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5 text-center tabular-nums">
                        <div className="p-2 panel">
                          <p className="text-[11px] text-rose-400 font-medium">CRIT</p>
                          <p className="text-sm font-medium text-white">{workspaceScore.openCritical}</p>
                        </div>
                        <div className="p-2 panel">
                          <p className="text-[11px] text-amber-400 font-medium">HIGH</p>
                          <p className="text-sm font-medium text-white">{workspaceScore.openHigh}</p>
                        </div>
                        <div className="p-2 panel">
                          <p className="text-[11px] text-yellow-400 font-medium">MED</p>
                          <p className="text-sm font-medium text-white">{workspaceScore.openMedium}</p>
                        </div>
                        <div className="p-2 panel">
                          <p className="text-[11px] text-sky-400 font-medium">LOW</p>
                          <p className="text-sm font-medium text-white">{workspaceScore.openLow}</p>
                        </div>
                        <div className="p-2 panel">
                          <p className="text-[11px] text-slate-400 font-medium">INFO</p>
                          <p className="text-sm font-medium text-white">{workspaceScore.openInfo}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Severity Donut & Platforms */}
                  <div className="lg:col-span-7 p-6 space-y-4 card">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400">Risk Allocation</span>
                        <h3 className="text-base font-medium text-white">Severity Distribution</h3>
                      </div>
                      <span className="text-[11px] tabular-nums text-brand-cyan">Active Set</span>
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
                            contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line-strong)', borderRadius: '12px', fontSize: '12px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                      <div className="p-2.5 flex items-center justify-between panel">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                          <span className="text-xs text-slate-300">Android APKs</span>
                        </div>
                        <span className="text-xs tabular-nums font-medium text-white">{androidAppsCount}</span>
                      </div>
                      <div className="p-2.5 flex items-center justify-between panel">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                          <span className="text-xs text-slate-300">iOS IPAs</span>
                        </div>
                        <span className="text-xs tabular-nums font-medium text-white">{iosAppsCount}</span>
                      </div>
                    </div>
                  </div>
        </div>
          </>
          ) },
          { id: 'graphs', label: 'Graphs', content: (
          <>
                {/* Findings Over Time & Severity Donut */}
                <div className="p-6 flex flex-col justify-between space-y-4 card">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400">Remediation Velocity</span>
                      <h3 className="text-base font-medium text-white">Findings Trend & Resolution Rate</h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs tabular-nums">
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
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={findingsOverTimeData}>
                        <defs>
                          <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a1a1aa" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#a1a1aa" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#fafafa" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#fafafa" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" stroke="#52525b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#52525b" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line-strong)', borderRadius: '12px', fontSize: '12px' }}
                        />
                        <Area type="monotone" dataKey="resolved" stroke="#a1a1aa" fillOpacity={1} fill="url(#colorResolved)" strokeWidth={2} />
                        <Area type="monotone" dataKey="critical" stroke="#fafafa" fillOpacity={1} fill="url(#colorCritical)" strokeWidth={2} />
                        <Area type="monotone" dataKey="high" stroke="#d4d4d8" fill="transparent" strokeWidth={2} strokeDasharray="3 3" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="p-3 flex items-center justify-between text-xs panel">
                    <span className="text-slate-400 tabular-nums">
                      74 vulnerabilities successfully resolved to date.
                    </span>
                    <Link href="/findings" className="text-brand-cyan hover:underline flex items-center gap-1">
                      <span>View All Findings</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
          </>
          ) },
          { id: 'vulnerabilities', label: 'Vulnerabilities', count: vulnerabilityCategoriesData.length, content: (
          <>
                {/* Most Common Vulnerability Categories */}
                <div className="p-6 space-y-4 card">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400">OWASP MASVS / CWE</span>
                      <h3 className="text-base font-medium text-white">Common Vulnerabilities</h3>
                    </div>
                    <span className="text-[11px] tabular-nums text-slate-400">7 categories</span>
                  </div>

                  <div className="space-y-2.5">
                    {vulnerabilityCategoriesData.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 truncate">{item.category}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] tabular-nums font-medium px-1.5 py-0.2 rounded border ${ item.risk === 'Critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30' }`}>
                              {item.risk}
                            </span>
                            <span className="tabular-nums text-slate-200 font-medium">{item.count}</span>
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${ item.risk === 'Critical' ? 'bg-rose-500' : 'bg-amber-500' }`}
                            style={{ width: `${(item.count / 20) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
          </>
          ) },
          { id: 'activity', label: 'Activity', count: Math.min(4, activityEvents.length), content: (
          <>
                {/* Recent Security Activity Stream */}
                <div className="p-6 space-y-4 card">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400">Live Audit Stream</span>
                      <h3 className="text-base font-medium text-white">Recent Activity</h3>
                    </div>
                    <Link href="/activity" className="text-xs text-brand-cyan hover:underline">
                      View All
                    </Link>
                  </div>

                  <div className="space-y-3 ">
                    {activityEvents.slice(0, 4).map((evt) => (
                      <div key={evt.id} className="flex items-start gap-3 p-2.5 panel">
                        <span className="w-2 h-2 rounded-full bg-brand-cyan shrink-0 mt-1.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-slate-200 truncate">{evt.title}</p>
                            <span className="text-[11px] tabular-nums text-slate-400 whitespace-nowrap ml-1">{evt.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{evt.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
          </>
          ) },
        ]}
      />
    </div>
  );
}
