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
  Terminal,
  SlidersHorizontal,
  ChevronDown,
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount = [severityFilter, statusFilter, categoryFilter].filter((v) => v !== 'All').length;

  // Fetch real sessions from VulnScope API
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
                  projectId: 'proj-vulnscope',
                  projectName: 'VulnScope Real Sessions',
                  platform: 'Android',
                  category: sf.category,
                  cwe: sf.cwe,
                  cvss: sf.severity === 'Critical' ? 9.8 : sf.severity === 'High' ? 8.2 : sf.severity === 'Medium' ? 5.5 : 3.1,
                  cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U',
                  owaspCategory: sf.owaspCategory as any,
                  confidence: sf.confidence === 'Confirmed' ? 95 : sf.confidence === 'Suspected' ? 70 : 50,
                  detectedAt: sf.timestamp || session.completedAt || new Date().toISOString(),
                  assignedTo: 'VulnScope Core',
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
            <h1 className="text-[28px] sm:text-[36px] leading-[1.1] font-medium text-white font-sans">
              Security Findings
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs tabular-nums bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30">
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
            className="btn-app btn-app-secondary"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Run New APK Analysis</span>
          </Link>
          <Link
            href="/copilot"
            className="btn-app btn-app-secondary"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </Link>
        </div>
      </div>

      {/* Backend API status notice */}
      {realFetchError && (
        <div className="p-3.5 text-amber-300 text-xs tabular-nums flex items-center justify-between panel">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-slate-500" />
            <span>Notice: Could not sync real session findings ({realFetchError}). Sample findings remain accessible.</span>
          </div>
        </div>
      )}

      {/* Source Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 tabular-nums text-xs card">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Data Source:</span>
          <div className="flex items-center gap-1 p-1 panel">
            <button
              onClick={() => setSourceFilter('All')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                sourceFilter === 'All'
                  ? 'bg-slate-700 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Sources ({allTaggedFindings.length})
            </button>
            <button
              onClick={() => setSourceFilter('Real')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                sourceFilter === 'Real'
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse motion-reduce:animate-none" />
              <span>Real Agent Runs ({realFindings.length})</span>
            </button>
            <button
              onClick={() => setSourceFilter('Sample')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                sourceFilter === 'Sample'
                  ? 'bg-slate-800 text-slate-200 border border-slate-700 font-medium'
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
            <span>Syncing real sessions…</span>
          </div>
        )}
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 tabular-nums text-xs">
        <div className="p-4 card">
          <span className="text-slate-400 text-[11px] block">Total Displayed</span>
          <span className="text-2xl font-semibold text-white">
            {filteredFindings.length}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Filtered findings</span>
        </div>

        <div className="p-4 card">
          <span className="text-rose-400 text-[11px] font-medium block">Critical</span>
          <span className="text-2xl font-semibold text-rose-400">
            {criticalCount}
          </span>
          <span className="text-[11px] text-rose-300 block mt-0.5">P0 Blockers</span>
        </div>

        <div className="p-4 card">
          <span className="text-amber-400 text-[11px] font-medium block">High</span>
          <span className="text-2xl font-semibold text-amber-400">
            {highCount}
          </span>
          <span className="text-[11px] text-amber-300 block mt-0.5">P1 Urgent</span>
        </div>

        <div className="p-4 card">
          <span className="text-yellow-400 text-[11px] font-medium block">Medium</span>
          <span className="text-2xl font-semibold text-yellow-400">
            {mediumCount}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">P2 Standard</span>
        </div>

        <div className="p-4 col-span-2 sm:col-span-1 card">
          <span className="text-emerald-400 text-[11px] font-medium block">Verified</span>
          <span className="text-2xl font-semibold text-emerald-400">
            {verifiedCount}
          </span>
          <span className="text-[11px] text-emerald-300 block mt-0.5">Evidence confirmed</span>
        </div>
      </div>

      {/* Filter toolbar: search always visible, the rest behind one Filters button */}
      <div className="space-y-3 text-xs tabular-nums">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter findings by keyword, CWE, or title…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="field w-full pl-9 pr-3 h-9 text-[13px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              aria-expanded={filtersOpen}
              aria-controls="findings-filters"
              className="btn-app btn-app-secondary"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-[4px] bg-white text-[11px] font-mono text-black">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`} />
            </button>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSeverityFilter('All');
                  setStatusFilter('All');
                  setCategoryFilter('All');
                }}
                className="h-9 px-2 text-[12px] text-slate-500 hover:text-white transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div
          id="findings-filters"
          className={`disclosure ${filtersOpen ? 'is-open' : ''}`}
          aria-hidden={!filtersOpen}
        >
          <div className="disclosure__inner">
            <div className="surface-flat p-3 flex flex-wrap items-center gap-x-5 gap-y-3">
              {/* Severity */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Severity</span>
                <div className="segmented" role="tablist" aria-label="Severity">
                  {['All', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
                    <button
                      key={sev}
                      role="tab"
                      aria-selected={severityFilter === sev}
                      tabIndex={filtersOpen ? 0 : -1}
                      onClick={() => setSeverityFilter(sev)}
                      className="segmented__item"
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <label className="flex items-center gap-2">
                <span className="text-slate-500">Status</span>
                <select
                  value={statusFilter}
                  tabIndex={filtersOpen ? 0 : -1}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="field h-8 px-2 text-[12px]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Review">In Review</option>
                  <option value="Resolved">Resolved</option>
                  <option value="False Positive">False Positive</option>
                </select>
              </label>

              {/* Category Filter */}
              <label className="flex items-center gap-2">
                <span className="text-slate-500">Category</span>
                <select
                  value={categoryFilter}
                  tabIndex={filtersOpen ? 0 : -1}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="field h-8 px-2 text-[12px]"
                >
                  <option value="All">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Findings Table */}
      <div className="overflow-hidden card">
        {filteredFindings.length === 0 ? (
          <div className="p-12 text-center space-y-3 tabular-nums">
            <ShieldCheck className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-medium text-white">No Findings Match Active Filters</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {sourceFilter === 'Real'
                ? 'No real analysis sessions found. Run a live security scan on an APK package to populate real findings.'
                : 'Try adjusting your search query, source selection, or severity filters.'}
            </p>
            {sourceFilter === 'Real' && (
              <Link
                href="/analysis/run"
                className="btn-app btn-app-secondary mt-2"
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
                <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] text-slate-400">
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
              <tbody className="divide-y divide-slate-800/60 text-xs tabular-nums">
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
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            REAL RUN
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                            SAMPLE
                          </span>
                        )}
                      </td>

                      {/* Severity */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md font-medium text-[11px] border ${sColor.badge}`}>
                          {finding.severity}
                        </span>
                      </td>

                      {/* Finding Title & Target Component */}
                      <td className="py-4 px-4 max-w-xs">
                        {finding.isRealRun && finding.sessionId ? (
                          <Link href={`/analysis/${finding.sessionId}`} className="block">
                            <p className="font-medium text-slate-100 group-hover:text-brand-cyan transition-colors truncate">
                              {finding.findingNumber}: {finding.title}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {finding.affectedComponent}
                            </p>
                          </Link>
                        ) : (
                          <Link href={`/findings/${finding.id}`} className="block">
                            <p className="font-medium text-slate-100 group-hover:text-brand-cyan transition-colors truncate">
                              {finding.findingNumber}: {finding.title}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {finding.affectedComponent}
                            </p>
                          </Link>
                        )}
                      </td>

                      {/* Verification Status Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {finding.verificationStatus ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border ${ finding.verificationStatus === 'Verified' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : finding.verificationStatus === 'Suspected' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : finding.verificationStatus === 'Detected' ? 'bg-sky-500/15 text-sky-300 border-sky-500/30' : 'bg-purple-500/15 text-purple-300 border-purple-500/30' }`}
                          >
                            {finding.verificationStatus}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">None</span>
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
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px]">
                          {finding.category}
                        </span>
                      </td>

                      {/* CWE / CVSS */}
                      <td className="py-4 px-4 text-slate-300 whitespace-nowrap">
                        <span>{finding.cwe}</span>
                        <span className="text-[11px] text-amber-400 block">CVSS {finding.cvss}</span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {finding.isRealRun ? (
                          <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                            {finding.status}
                          </span>
                        ) : (
                          <select
                            value={finding.status}
                            onChange={(e) => updateFindingStatus(finding.id, e.target.value as FindingStatus)}
              className={`px-2 py-1 rounded-lg text-xs font-medium border focus:outline-none cursor-pointer transition-colors ${
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

