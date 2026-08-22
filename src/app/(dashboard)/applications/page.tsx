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
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
            Applications Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Registered Android APK/AAB builds and iOS IPA application packages monitored by SentinelX.
          </p>
        </div>

        <Link
          href="/analysis/run"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-indigo text-slate-950 text-xs font-mono font-bold shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all"
        >
          <Activity className="w-4 h-4" />
          <span>Launch Analysis Pipeline</span>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0d121c] border border-slate-800/80 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by app name or package id (e.g. com.acme.banking)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          {['All', 'Android', 'iOS'].map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p as any)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                platformFilter === p
                  ? 'bg-brand-cyan/20 text-brand-cyan font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table / Cards */}
      <div className="rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] font-mono text-slate-400 uppercase">
                <th className="py-3.5 px-4 font-semibold">Application</th>
                <th className="py-3.5 px-4 font-semibold">Platform</th>
                <th className="py-3.5 px-4 font-semibold">Version</th>
                <th className="py-3.5 px-4 font-semibold">Last Analyzed</th>
                <th className="py-3.5 px-4 font-semibold">Security Score</th>
                <th className="py-3.5 px-4 font-semibold text-center">Vulnerabilities (C/H/M)</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {filteredApps.map((app) => {
                const scoreMeta = getScoreGrade(app.securityScore);
                return (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  >
                    <td className="py-4 px-4">
                      <Link href={`/applications/${app.id}`} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center font-bold text-xs text-white shrink-0">
                          {app.platform === 'Android' ? 'APK' : 'IPA'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-100 group-hover:text-brand-cyan transition-colors">
                            {app.name}
                          </p>
                          <p className="text-[10px] text-slate-400">{app.packageName}</p>
                        </div>
                      </Link>
                    </td>

                    <td className="py-4 px-4 text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px]">
                        {app.platform}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-300">
                      <span>v{app.currentVersion}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">#{app.currentBuild}</span>
                    </td>

                    <td className="py-4 px-4 text-slate-400 text-[11px]">
                      {app.lastAnalyzed}
                    </td>

                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold border text-[11px] ${scoreMeta.bg} ${scoreMeta.color}`}>
                        {app.securityScore} / 100
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-1.5 text-[11px]">
                        <span className="px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">
                          {app.findingsCount.critical} Crit
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                          {app.findingsCount.high} High
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 font-bold">
                          {app.findingsCount.medium} Med
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/applications/${app.id}`}
                        className="inline-flex items-center gap-1 text-brand-cyan hover:underline text-xs font-semibold"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
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
