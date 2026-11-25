'use client';

import React from 'react';
import Link from 'next/link';
import {
  LineChart as LineChartIcon,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  Smartphone,
  ChevronRight,
  Layers,
  Sparkles,
  BarChart2,
  CheckCircle2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useAppState } from '@/context/AppStateContext';
import { getScoreGrade } from '@/lib/utils';
import { PipelineBanner } from '@/components/shell/PipelineBanner';

const masvsComplianceData = [
  { category: 'Storage', score: 72, pass: 14, fail: 4 },
  { category: 'Crypto', score: 64, pass: 12, fail: 6 },
  { category: 'Auth', score: 88, pass: 18, fail: 2 },
  { category: 'Network', score: 76, pass: 16, fail: 5 },
  { category: 'Platform', score: 68, pass: 15, fail: 7 },
  { category: 'Code', score: 82, pass: 19, fail: 3 },
  { category: 'Resilience', score: 91, pass: 20, fail: 1 },
  { category: 'Privacy', score: 85, pass: 17, fail: 3 },
];

export default function SecurityPosturePage() {
  const { applications, workspaceScore, findings } = useAppState();
  const scoreMeta = getScoreGrade(workspaceScore.score);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[36px] leading-[1.1] font-medium text-white font-sans">
            Security Posture Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Holistic risk distribution, OWASP MASVS compliance scorecards, and cross-application risk trends.
          </p>
        </div>

        <span className={`inline-flex items-center gap-2 text-[13px] tabular-nums ${scoreMeta.color}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
          <span className="text-slate-300">Workspace Score: <span className="font-mono text-white">{workspaceScore.score}/100</span> ({scoreMeta.label})</span>
        </span>
      </div>

      <PipelineBanner activeStep="prioritize" compact />

      {/* OWASP MASVS Category Compliance Matrix */}
      <section className="surface-flat" aria-labelledby="masvs-heading">
        <header className="flex flex-wrap items-end justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-white/[0.06]">
          <div>
            <span className="block text-[11px] text-slate-500">OWASP Mobile Standard Benchmark</span>
            <h3 id="masvs-heading" className="text-[15px] font-medium text-white mt-0.5">MASVS v2.0 Domain Compliance</h3>
          </div>
          <span className="text-[12px] tabular-nums text-slate-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 mr-2 align-middle" aria-hidden="true" />
            8 Domains Evaluated
          </span>
        </header>

        <div className="grid lg:grid-cols-2 lg:divide-x divide-white/[0.06]">
          {[masvsComplianceData.slice(0, 4), masvsComplianceData.slice(4)].map((half, h) => (
            <table key={h} className="w-full text-[13px] tabular-nums">
              <thead className={h === 1 ? 'hidden lg:table-header-group' : undefined}>
                <tr className="text-[11px] text-slate-500 text-left border-b border-white/[0.06]">
                  <th scope="col" className="font-normal px-4 sm:px-5 py-2">Domain</th>
                  <th scope="col" className="font-normal px-2 py-2 w-[34%]">Coverage</th>
                  <th scope="col" className="font-normal px-2 py-2 text-right">Score</th>
                  <th scope="col" className="font-normal px-2 py-2 text-right">Passed</th>
                  <th scope="col" className="font-normal pl-2 pr-4 sm:pr-5 py-2 text-right">Failed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {half.map((item, idx) => {
                  const good = item.score >= 80;
                  return (
                    <tr
                      key={item.category}
                      className="row-in row-hover"
                      style={{ animationDelay: `${(h * 4 + idx) * 30}ms` }}
                    >
                      <th scope="row" className="font-normal text-left px-4 sm:px-5 py-3 font-mono text-[12px] text-slate-200 whitespace-nowrap">
                        MASVS-{item.category.toUpperCase()}
                      </th>
                      <td className="px-2 py-3">
                        <span className="meter" aria-hidden="true">
                          <span className={good ? 'meter__fill bg-emerald-400' : 'meter__fill bg-amber-400'} style={{ transform: `scaleX(${item.score / 100})` }} />
                        </span>
                      </td>
                      <td className={`px-2 py-3 text-right font-mono ${good ? 'text-emerald-400' : 'text-amber-400'}`}>{item.score}%</td>
                      <td className="px-2 py-3 text-right font-mono text-slate-400 whitespace-nowrap">{item.pass} Passed</td>
                      <td className="pl-2 pr-4 sm:pr-5 py-3 text-right font-mono text-rose-400 whitespace-nowrap">{item.fail} Failed</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ))}
        </div>
      </section>

      {/* Application Risk Matrix */}
      <section className="surface-flat" aria-labelledby="risk-heading">
        <header className="flex flex-wrap items-end justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-white/[0.06]">
          <div>
            <span className="block text-[11px] text-slate-500">Cross-Application Matrix</span>
            <h3 id="risk-heading" className="text-[15px] font-medium text-white mt-0.5">Applications at Risk</h3>
          </div>
          <Link href="/applications" className="text-[12px] text-slate-400 hover:text-white transition-colors duration-150">
            View All Applications
          </Link>
        </header>

        <div role="table" aria-labelledby="risk-heading">
          <div role="row" className="grid grid-cols-[minmax(0,1fr)_auto_24px] gap-4 px-4 sm:px-5 py-2 text-[11px] text-slate-500 border-b border-white/[0.06]">
            <span role="columnheader">Application</span>
            <span role="columnheader" className="text-right">Risk score</span>
            <span role="columnheader" className="sr-only">Open</span>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {applications.slice(0, 6).map((app, idx) => {
              const appScoreMeta = getScoreGrade(app.securityScore);
              return (
                <Link
                  key={app.id}
                  href={`/applications/${app.id}`}
                  role="row"
                  className="row-in row-hover group grid grid-cols-[minmax(0,1fr)_auto_24px] items-center gap-4 px-4 sm:px-5 py-3"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <span role="cell" className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0 inline-flex items-center justify-center h-6 w-9 rounded-[4px] bg-elevated-2 ring-1 ring-white/[0.08] font-mono text-[10px] tracking-tight text-slate-300">
                      {app.platform === 'Android' ? 'APK' : 'IPA'}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] text-slate-100 truncate group-hover:text-white transition-colors duration-150">{app.name}</span>
                      <span className="block text-[11px] tabular-nums text-slate-500 truncate">{app.platform}, v{app.currentVersion}</span>
                    </span>
                  </span>
                  <span role="cell" className={`flex items-center justify-end gap-2 font-mono text-[13px] tabular-nums ${appScoreMeta.color}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                    <span className="text-slate-200">{app.securityScore}<span className="text-slate-500">/100</span></span>
                  </span>
                  <span role="cell" className="flex justify-end">
                    <ChevronRight
                      className="w-4 h-4 text-slate-500 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 transition duration-150 motion-reduce:transform-none"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
