'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Bot,
  ExternalLink,
  ChevronRight,
  User,
  ArrowUpDown
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { FindingSeverity, FindingStatus } from '@/types';
import { formatSeverityColor } from '@/lib/utils';

export default function FindingsPage() {
  const {
    findings,
    updateFindingStatus,
    workspaceScore,
    applications
  } = useAppState();

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [appFilter, setAppFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Filter findings
  const filteredFindings = findings.filter(f => {
    if (severityFilter !== 'All' && f.severity !== severityFilter) return false;
    if (statusFilter !== 'All' && f.status !== statusFilter) return false;
    if (appFilter !== 'All' && f.applicationId !== appFilter) return false;
    if (categoryFilter !== 'All' && f.category !== categoryFilter) return false;
    if (searchTerm && !f.title.toLowerCase().includes(searchTerm.toLowerCase()) && !f.cwe.toLowerCase().includes(searchTerm.toLowerCase()) && !f.findingNumber.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const categories = Array.from(new Set(findings.map(f => f.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              Security Findings
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30">
              Vulnerability Management
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Normalized OWASP MASVS & CWE findings across all mobile builds. Changing status live-recalculates security scores.
          </p>
        </div>

        <Link
          href="/copilot"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold transition-all"
        >
          <Bot className="w-4 h-4" />
          <span>Ask AI to Prioritize</span>
        </Link>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 font-mono text-xs">
        <div className="p-4 rounded-2xl bg-[#0d121c] border border-slate-800 shadow-md">
          <span className="text-slate-400 text-[10px] uppercase block">Total Open</span>
          <span className="text-2xl font-extrabold text-white">
            {workspaceScore.openCritical + workspaceScore.openHigh + workspaceScore.openMedium + workspaceScore.openLow}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Active issues</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d121c] border border-rose-500/30 shadow-md">
          <span className="text-rose-400 text-[10px] uppercase font-bold block">Critical</span>
          <span className="text-2xl font-extrabold text-rose-400">
            {workspaceScore.openCritical}
          </span>
          <span className="text-[10px] text-rose-300 block mt-0.5">P0 Blockers</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d121c] border border-amber-500/30 shadow-md">
          <span className="text-amber-400 text-[10px] uppercase font-bold block">High</span>
          <span className="text-2xl font-extrabold text-amber-400">
            {workspaceScore.openHigh}
          </span>
          <span className="text-[10px] text-amber-300 block mt-0.5">P1 Urgent</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d121c] border border-yellow-500/30 shadow-md">
          <span className="text-yellow-400 text-[10px] uppercase font-bold block">Medium</span>
          <span className="text-2xl font-extrabold text-yellow-400">
            {workspaceScore.openMedium}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">P2 Standard</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d121c] border border-emerald-500/30 shadow-md col-span-2 sm:col-span-1">
          <span className="text-emerald-400 text-[10px] uppercase font-bold block">Resolved</span>
          <span className="text-2xl font-extrabold text-emerald-400">
            {workspaceScore.resolvedCount}
          </span>
          <span className="text-[10px] text-emerald-300 block mt-0.5">Score increased</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0d121c] border border-slate-800/80 shadow-lg space-y-3 text-xs font-mono">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter findings by keyword, CWE, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
            />
          </div>

          {/* Severity Pills */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto">
            {['All', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  severityFilter === sev
                    ? 'bg-brand-cyan/20 text-brand-cyan font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/60">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-brand-cyan"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Review">In Review</option>
              <option value="Resolved">Resolved</option>
              <option value="False Positive">False Positive</option>
            </select>
          </div>

          {/* Application Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Application:</span>
            <select
              value={appFilter}
              onChange={(e) => setAppFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-brand-cyan"
            >
              <option value="All">All Applications</option>
              {applications.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-brand-cyan"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Findings Table */}
      <div className="rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] font-mono text-slate-400 uppercase">
                <th className="py-3.5 px-4 font-semibold">Severity</th>
                <th className="py-3.5 px-4 font-semibold">Finding Title</th>
                <th className="py-3.5 px-4 font-semibold">Target Application</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">CWE / CVSS</th>
                <th className="py-3.5 px-4 font-semibold">Status (Live Action)</th>
                <th className="py-3.5 px-4 font-semibold">Assigned To</th>
                <th className="py-3.5 px-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {filteredFindings.map((finding) => {
                const sColor = formatSeverityColor(finding.severity);
                return (
                  <tr
                    key={finding.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-md font-bold uppercase text-[10px] border ${sColor.badge}`}>
                        {finding.severity}
                      </span>
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <Link href={`/findings/${finding.id}`} className="block">
                        <p className="font-bold text-slate-100 group-hover:text-brand-cyan transition-colors truncate">
                          {finding.findingNumber}: {finding.title}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {finding.affectedComponent}
                        </p>
                      </Link>
                    </td>

                    <td className="py-4 px-4 text-slate-300 whitespace-nowrap">
                      {finding.applicationName}
                    </td>

                    <td className="py-4 px-4 text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px]">
                        {finding.category}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-300 whitespace-nowrap">
                      <span>{finding.cwe}</span>
                      <span className="text-[10px] text-amber-400 block">CVSS {finding.cvss}</span>
                    </td>

                    {/* Live Reactive Status Dropdown */}
                    <td className="py-4 px-4">
                      <select
                        value={finding.status}
                        onChange={(e) => updateFindingStatus(finding.id, e.target.value as FindingStatus)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border focus:outline-none cursor-pointer transition-colors ${
                          finding.status === 'Resolved'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : finding.status === 'In Review'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : finding.status === 'False Positive'
                            ? 'bg-slate-700 text-slate-300 border-slate-600'
                            : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        <option value="Open" className="bg-slate-900 text-white">Open</option>
                        <option value="In Review" className="bg-slate-900 text-white">In Review</option>
                        <option value="Resolved" className="bg-slate-900 text-white">✓ Resolved (Score +)</option>
                        <option value="False Positive" className="bg-slate-900 text-white">False Positive</option>
                      </select>
                    </td>

                    <td className="py-4 px-4 text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{finding.assignedTo}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/findings/${finding.id}`}
                        className="inline-flex items-center gap-1 text-brand-cyan hover:underline text-xs font-semibold"
                      >
                        <span>View</span>
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
