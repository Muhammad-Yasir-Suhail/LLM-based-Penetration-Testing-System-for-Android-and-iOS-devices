'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Layers,
  Activity
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { getScoreGrade } from '@/lib/utils';

export default function ApplicationsPage() {
  const { applications } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'All' | 'Android' | 'iOS'>('All');

  const filteredApps = applications.filter(app => {
    if (platformFilter !== 'All' && app.platform !== platformFilter) return false;
    if (searchTerm && !app.name.toLowerCase().includes(searchTerm.toLowerCase()) && !app.packageName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[36px] leading-[1.1] font-medium text-white font-sans">
            Applications Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Registered Android APK/AAB builds and iOS IPA application packages monitored by SentinelX.
          </p>
        </div>

        <Link
          href="/analysis/run"
          className="btn-app btn-app-primary"
        >
          <Activity className="w-4 h-4" />
          <span>Launch Analysis Pipeline</span>
        </Link>
      </div>

      {/* Toolbar: search and platform filter, no box around them */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by app name or package id (e.g. com.acme.banking)…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="field w-full pl-9 pr-3 h-9 text-[13px]"
          />
        </div>

        <div className="segmented" role="tablist" aria-label="Platform">
          {['All', 'Android', 'iOS'].map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={platformFilter === p}
              onClick={() => setPlatformFilter(p as any)}
              className="segmented__item"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Applications table */}
      <div className="surface-flat">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[860px]">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] text-slate-500">
                <th className="py-2.5 px-4 font-normal">Application</th>
                <th className="py-2.5 px-3 font-normal">Platform</th>
                <th className="py-2.5 px-3 font-normal">Version</th>
                <th className="py-2.5 px-3 font-normal">Last Analyzed</th>
                <th className="py-2.5 px-3 font-normal text-right">Security Score</th>
                <th className="py-2.5 px-3 font-normal text-right" colSpan={3}>
                  Vulnerabilities <span className="font-mono">(C/H/M)</span>
                </th>
                <th className="py-2.5 px-4 font-normal text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-[13px] tabular-nums">
              {filteredApps.map((app, idx) => {
                const scoreMeta = getScoreGrade(app.securityScore);
                const counts = [
                  { n: app.findingsCount.critical, label: 'Crit', tone: 'text-rose-400' },
                  { n: app.findingsCount.high, label: 'High', tone: 'text-amber-400' },
                  { n: app.findingsCount.medium, label: 'Med', tone: 'text-yellow-400' },
                ];
                return (
                  <tr
                    key={app.id}
                    className="row-in row-hover group cursor-pointer"
                    style={{ animationDelay: `${Math.min(idx, 10) * 30}ms` }}
                  >
                    <td className="py-3 px-4">
                      <Link href={`/applications/${app.id}`} className="flex items-center gap-3 min-w-0">
                        <span className="shrink-0 inline-flex items-center justify-center h-6 w-9 rounded-[4px] bg-elevated-2 ring-1 ring-white/[0.08] font-mono text-[10px] text-slate-300">
                          {app.platform === 'Android' ? 'APK' : 'IPA'}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-slate-100 group-hover:text-white transition-colors duration-150 truncate">{app.name}</span>
                          <span className="block text-[11px] font-mono text-slate-500 truncate">{app.packageName}</span>
                        </span>
                      </Link>
                    </td>

                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{app.platform}</td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-slate-200 font-mono">v{app.currentVersion}</span>
                      <span className="block text-[11px] text-slate-500 font-mono">#{app.currentBuild}</span>
                    </td>

                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{app.lastAnalyzed}</td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 font-mono ${scoreMeta.color}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                        <span className="text-slate-100">
                          {app.securityScore}
                          <span className="text-slate-500"> / 100</span>
                        </span>
                      </span>
                    </td>

                    {counts.map((c) => (
                      <td key={c.label} className="py-3 px-2 text-right whitespace-nowrap w-[64px]">
                        <span className={`font-mono ${c.n > 0 ? c.tone : 'text-slate-600'}`}>{c.n}</span>
                        <span className="ml-1 text-[11px] text-slate-500">{c.label}</span>
                      </td>
                    ))}

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/applications/${app.id}`}
                        className="inline-flex items-center gap-1 text-[12px] text-slate-500 group-hover:text-white transition-colors duration-150"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transform-none" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
