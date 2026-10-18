'use client';

import React, { useState, useEffect } from 'react';
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
  ArrowUpDown,
  RefreshCw,
  Terminal
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { Finding, FindingSeverity, FindingStatus } from '@/types';
import { AnalysisSession, SecurityFinding } from '@/types/agent';
import { formatSeverityColor } from '@/lib/utils';

export default function FindingsPage() {
  const {
    findings: sampleFindings,
    updateFindingStatus,
    workspaceScore,
    applications
  } = useAppState();

  const [realFindings, setRealFindings] = useState<Finding[]>([]);
  const [isLoadingReal, setIsLoadingReal] = useState<boolean>(true);
  const [realFetchError, setRealFetchError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<'All' | 'Real' | 'Sample'>('All');
  const [appFilter, setAppFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Fetch real sessions from VulnCope API
  useEffect(() => {
    let isMounted = true;
    async function loadRealSessions() {
      try {
        setIsLoadingReal(true);
        setRealFetchError(null);
        const res = await fetch('/api/analysis/sessions');
        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`);
        }
        const data = await res.json();
        if (data.success && Array.isArray(data.sessions)) {
          const mapped: Finding[] = [];
          const seenKeys = new Set<string>();

          for (const session of data.sessions as AnalysisSession[]) {
            if (session.findings && Array.isArray(session.findings)) {
              for (const sf of session.findings) {
                const uniqueKey = `${session.sessionId}:${sf.stableId}`;
                if (seenKeys.has(uniqueKey)) continue;
                seenKeys.add(uniqueKey);

                mapped.push({
                  id: `real-${session.sessionId}-${sf.stableId}`,
                  findingNumber: sf.stableId,
                  title: sf.title,
                  severity: sf.severity,
                  status: 'Open',
                  applicationId: session.sessionId,
                  applicationName: session.targetApk.fileName,
                  projectId: 'proj-vulncope',
                  projectName: 'VulnCope Real Sessions',
                  platform: 'Android',
                  category: sf.category,
                  cwe: sf.cwe,
                  cvss: sf.severity === 'Critical' ? 9.8 : sf.severity === 'High' ? 8.2 : sf.severity === 'Medium' ? 5.5 : 3.1,
                  cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U',
                  owaspCategory: sf.owaspCategory as any,
                  confidence: sf.confidence === 'Confirmed' ? 95 : sf.confidence === 'Suspected' ? 70 : 50,
                  detectedAt: sf.timestamp || session.completedAt || new Date().toISOString(),
                  assignedTo: 'VulnCope Core',
                  affectedComponent: sf.location,
                  filePath: sf.location,
                  lineNumber: 1,
                  description: sf.description,
                  impact: sf.description,
                  technicalEvidence: sf.evidence,
                  remediation: sf.remediation,
                  references: [{ title: sf.owaspCategory || 'OWASP MASVS', url: 'https://mas.owasp.org/MASVS/' }],
                  detectedBy: ['SentinelX Static Core'],
                  exploitability: sf.verificationStatus === 'Verified' ? 'Proof of Concept Available' : 'Medium',
                  isRealRun: true,
                  verificationStatus: sf.verificationStatus,
                  sessionId: session.sessionId,
                  sourceTool: sf.sourceTool
                });
              }
            }
          }
          if (isMounted) {
            setRealFindings(mapped);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setRealFetchError(err.message || 'Failed to load real sessions');
        }
      } finally {
        if (isMounted) {
          setIsLoadingReal(false);
        }
      }
    }

    loadRealSessions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Combine real findings with baseline sample data (explicitly tagged)
  const allTaggedFindings: Finding[] = [
    ...realFindings,
    ...sampleFindings.map((f) => ({ ...f, isRealRun: false }))
  ];

  // Filter findings
  const filteredFindings = allTaggedFindings.filter((f) => {
    // Source filter
    if (sourceFilter === 'Real' && !f.isRealRun) return false;
    if (sourceFilter === 'Sample' && f.isRealRun) return false;

    // Severity & status filters
    if (severityFilter !== 'All' && f.severity !== severityFilter) return false;
    if (statusFilter !== 'All' && f.status !== statusFilter) return false;
    if (appFilter !== 'All' && f.applicationId !== appFilter) return false;
    if (categoryFilter !== 'All' && f.category !== categoryFilter) return false;

    // Search term
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        f.title.toLowerCase().includes(q) ||
        f.cwe.toLowerCase().includes(q) ||
        f.findingNumber.toLowerCase().includes(q) ||
        f.applicationName.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const categories = Array.from(new Set(allTaggedFindings.map((f) => f.category)));

  // Dynamic counts reflecting active dataset
  const openCount = filteredFindings.filter((f) => f.status === 'Open').length;
  const criticalCount = filteredFindings.filter((f) => f.severity === 'Critical').length;
  const highCount = filteredFindings.filter((f) => f.severity === 'High').length;
  const mediumCount = filteredFindings.filter((f) => f.severity === 'Medium').length;
  const verifiedCount = filteredFindings.filter((f) => f.verificationStatus === 'Verified').length;

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
              Unified Vulnerability View
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real agentic scan results combined with benchmark evaluation datasets. Real runs and sample data are distinctly badged.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/analysis/run"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold transition-all"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Run New APK Analysis</span>
          </Link>
          <Link
            href="/copilot"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold transition-all"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </Link>
        </div>
      </div>

      {/* Backend API status notice */}
      {realFetchError && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Notice: Could not sync real session findings ({realFetchError}). Sample findings remain accessible.</span>
          </div>
        </div>
      )}

      {/* Source Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0d121c] border border-slate-800 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] uppercase">Data Source:</span>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSourceFilter('All')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                sourceFilter === 'All'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Sources ({allTaggedFindings.length})
            </button>
            <button
              onClick={() => setSourceFilter('Real')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                sourceFilter === 'Real'
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real Agent Runs ({realFindings.length})</span>
            </button>
            <button
              onClick={() => setSourceFilter('Sample')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                sourceFilter === 'Sample'
                  ? 'bg-slate-800 text-slate-200 border border-slate-700 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sample Data ({sampleFindings.length})
            </button>
          </div>
        </div>

        {isLoadingReal && (
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-cyan" />
            <span>Syncing real sessions...</span>
          </div>
        )}
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 font-mono text-xs">
        <div className="p-4 rounded-2xl bg-[#0d121c] border border-slate-800 shadow-md">
          <span className="text-slate-400 text-[10px] uppercase block">Total Displayed</span>
          <span className="text-2xl font-extrabold text-white">
            {filteredFindings.length}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Filtered findings</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d121c] border border-rose-500/30 shadow-md">
          <span className="text-rose-400 text-[10px] uppercase font-bold block">Critical</span>
          <span className="text-2xl font-extrabold text-rose-400">
            {criticalCount}
          </span>
          <span className="text-[10px] text-rose-300 block mt-0.5">P0 Blockers</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d121c] border border-amber-500/30 shadow-md">
          <span className="text-amber-400 text-[10px] uppercase font-bold block">High</span>
          <span className="text-2xl font-extrabold text-amber-400">
            {highCount}
          </span>
          <span className="text-[10px] text-amber-300 block mt-0.5">P1 Urgent</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d121c] border border-yellow-500/30 shadow-md">
          <span className="text-yellow-400 text-[10px] uppercase font-bold block">Medium</span>
          <span className="text-2xl font-extrabold text-yellow-400">
            {mediumCount}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">P2 Standard</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d121c] border border-emerald-500/30 shadow-md col-span-2 sm:col-span-1">
          <span className="text-emerald-400 text-[10px] uppercase font-bold block">Verified</span>
          <span className="text-2xl font-extrabold text-emerald-400">
            {verifiedCount}
          </span>
          <span className="text-[10px] text-emerald-300 block mt-0.5">Evidence confirmed</span>
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

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-brand-cyan"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Findings Table */}
      <div className="rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl overflow-hidden">
        {filteredFindings.length === 0 ? (
          <div className="p-12 text-center space-y-3 font-mono">
            <ShieldCheck className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No Findings Match Active Filters</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {sourceFilter === 'Real'
                ? 'No real analysis sessions found. Run a live security scan on an APK package to populate real findings.'
                : 'Try adjusting your search query, source selection, or severity filters.'}
            </p>
            {sourceFilter === 'Real' && (
              <Link
                href="/analysis/run"
                className="inline-flex items-center gap-2 px-4 py-2 mt-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all"
              >
                <Terminal className="w-4 h-4" />
                <span>Go to APK Analyzer</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] font-mono text-slate-400 uppercase">
                  <th className="py-3.5 px-4 font-semibold">Origin</th>
                  <th className="py-3.5 px-4 font-semibold">Severity</th>
                  <th className="py-3.5 px-4 font-semibold">Finding Title</th>
                  <th className="py-3.5 px-4 font-semibold">Verification State</th>
                  <th className="py-3.5 px-4 font-semibold">Target Application</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">CWE / CVSS</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
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
                      {/* Origin Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {finding.isRealRun ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            REAL RUN
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            SAMPLE
                          </span>
                        )}
                      </td>

                      {/* Severity */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md font-bold uppercase text-[10px] border ${sColor.badge}`}>
                          {finding.severity}
                        </span>
                      </td>

                      {/* Finding Title & Target Component */}
                      <td className="py-4 px-4 max-w-xs">
                        {finding.isRealRun && finding.sessionId ? (
                          <Link href={`/analysis/${finding.sessionId}`} className="block">
                            <p className="font-bold text-slate-100 group-hover:text-brand-cyan transition-colors truncate">
                              {finding.findingNumber}: {finding.title}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              {finding.affectedComponent}
                            </p>
                          </Link>
                        ) : (
                          <Link href={`/findings/${finding.id}`} className="block">
                            <p className="font-bold text-slate-100 group-hover:text-brand-cyan transition-colors truncate">
                              {finding.findingNumber}: {finding.title}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              {finding.affectedComponent}
                            </p>
                          </Link>
                        )}
                      </td>

                      {/* Verification Status Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {finding.verificationStatus ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              finding.verificationStatus === 'Verified'
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : finding.verificationStatus === 'Suspected'
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : finding.verificationStatus === 'Detected'
                                ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                            }`}
                          >
                            {finding.verificationStatus}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">—</span>
                        )}
                      </td>

                      {/* Application */}
                      <td className="py-4 px-4 text-slate-300 whitespace-nowrap">
                        <span className="truncate max-w-[160px] block" title={finding.applicationName}>
                          {finding.applicationName}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px]">
                          {finding.category}
                        </span>
                      </td>

                      {/* CWE / CVSS */}
                      <td className="py-4 px-4 text-slate-300 whitespace-nowrap">
                        <span>{finding.cwe}</span>
                        <span className="text-[10px] text-amber-400 block">CVSS {finding.cvss}</span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {finding.isRealRun ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                            {finding.status}
                          </span>
                        ) : (
                          <select
                            value={finding.status}
                            onChange={(e) => updateFindingStatus(finding.id, e.target.value as FindingStatus)}
                            className={`px-2 py-1 rounded-lg text-xs font-mono font-bold border focus:outline-none cursor-pointer transition-colors ${
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
                            <option value="Resolved" className="bg-slate-900 text-white">✓ Resolved</option>
                            <option value="False Positive" className="bg-slate-900 text-white">False Positive</option>
                          </select>
                        )}
                      </td>

                      {/* Details Link */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        {finding.isRealRun && finding.sessionId ? (
                          <Link
                            href={`/analysis/${finding.sessionId}`}
                            className="inline-flex items-center gap-1 text-emerald-400 hover:underline text-xs font-semibold"
                          >
                            <span>Session Trace</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <Link
                            href={`/findings/${finding.id}`}
                            className="inline-flex items-center gap-1 text-brand-cyan hover:underline text-xs font-semibold"
                          >
                            <span>View</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

