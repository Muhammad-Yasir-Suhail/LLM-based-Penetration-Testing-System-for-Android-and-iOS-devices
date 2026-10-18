'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  HelpCircle,
  Sparkles,
  Command,
  ShieldCheck,
  ChevronRight,
  Terminal,
  Activity
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';

export const Topbar: React.FC = () => {
  const pathname = usePathname();
  const {
    setSearchModalOpen,
    notificationsOpen,
    setNotificationsOpen,
    setDemoModalOpen,
    findings,
    workspaceScore
  } = useAppState();

  const getBreadcrumbTitle = (path: string) => {
    if (path === '/dashboard') return 'Security Overview';
    if (path.startsWith('/projects')) return 'Projects Management';
    if (path.startsWith('/applications')) return 'Applications Inventory';
    if (path.startsWith('/attack-surface')) return 'Attack Surface Visualizer (Demo)';
    if (path.startsWith('/correlation')) return 'Multi-Engine Finding Correlation (Demo)';
    if (path.startsWith('/analysis/run')) return 'Agentic Security Analysis Pipeline';
    if (path.startsWith('/analysis')) return 'Security Analysis Runs';
    if (path.startsWith('/static-analysis')) return 'Static Analysis & Code Viewer';
    if (path.startsWith('/findings')) return 'Security Findings Management';
    if (path.startsWith('/copilot')) return 'Security Copilot (AI Assistant)';
    if (path.startsWith('/reports')) return 'Security Reports & Assessments';
    if (path.startsWith('/posture')) return 'Security Posture Analytics';
    if (path.startsWith('/engines')) return 'Security Engines & Tool Registry';
    if (path.startsWith('/activity')) return 'Activity & Audit Trail';
    if (path.startsWith('/team')) return 'Team & Access Management';
    if (path.startsWith('/settings')) return 'Workspace Settings';
    return 'Dashboard';
  };

  const openFindingsCount = findings.filter(f => f.status === 'Open' || f.status === 'In Review').length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#080c14]/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="text-emerald-400 font-bold">VulnCope</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-200 font-semibold">{getBreadcrumbTitle(pathname)}</span>
      </div>

      {/* Center / Search Button */}
      <div className="flex-1 max-w-md hidden md:block">
        <button
          onClick={() => setSearchModalOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all text-xs"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search findings, applications, CVEs, rules...</span>
          </div>
          <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-mono">
            <Command className="w-3 h-3" /> K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Scan Action */}
        <Link
          href="/analysis/run"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-semibold font-mono transition-all shadow-sm"
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>New Analysis Run</span>
        </Link>

        {/* Security Score Badge */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono">
          <span className="text-slate-400">Score:</span>
          <span className="font-bold text-emerald-400">{workspaceScore.score}/100</span>
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {openFindingsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#080c14]" />
          )}
        </button>

        {/* Prototype Info Trigger */}
        <button
          onClick={() => setDemoModalOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-mono transition-all"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">FYP Demo</span>
        </button>

        {/* Search on mobile */}
        <button
          onClick={() => setSearchModalOpen(true)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
