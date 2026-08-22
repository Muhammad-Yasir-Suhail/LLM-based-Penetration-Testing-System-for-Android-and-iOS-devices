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
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
            Security Posture Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Holistic risk distribution, OWASP MASVS compliance scorecards, and cross-application risk trends.
          </p>
        </div>

        <span className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold border ${scoreMeta.bg} ${scoreMeta.color}`}>
          Workspace Score: {workspaceScore.score}/100 ({scoreMeta.label})
        </span>
      </div>

      <PipelineBanner activeStep="prioritize" compact />

      {/* OWASP MASVS Category Compliance Grid */}
      <div className="p-6 rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              OWASP Mobile Standard Benchmark
            </span>
            <h3 className="text-base font-bold text-white">MASVS v2.0 Domain Compliance</h3>
          </div>
          <span className="text-xs font-mono text-emerald-400">8 Domains Evaluated</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          {masvsComplianceData.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">MASVS-{item.category.toUpperCase()}</span>
                <span className={`font-bold ${item.score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {item.score}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.score >= 80 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>{item.pass} Passed</span>
                <span className="text-rose-400">{item.fail} Failed</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Application Risk Matrix */}
      <div className="p-6 rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Cross-Application Matrix
            </span>
            <h3 className="text-base font-bold text-white">Applications at Risk</h3>
          </div>
          <Link href="/applications" className="text-xs font-mono text-brand-cyan hover:underline">
            View All Applications
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {applications.slice(0, 6).map((app) => {
            const appScoreMeta = getScoreGrade(app.securityScore);
            return (
              <Link
                key={app.id}
                href={`/applications/${app.id}`}
                className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 group transition-all"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs font-mono shrink-0">
                    {app.platform === 'Android' ? 'APK' : 'IPA'}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-200 group-hover:text-brand-cyan truncate">
                      {app.name}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400">{app.platform} • v{app.currentVersion}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border shrink-0 ${appScoreMeta.bg} ${appScoreMeta.color}`}>
                  {app.securityScore}/100
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
