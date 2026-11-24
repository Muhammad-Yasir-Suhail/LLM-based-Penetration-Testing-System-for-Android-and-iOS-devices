'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  HelpCircle,
  Command,
  ChevronRight,
  Activity,
  Menu
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { useShell } from './ShellContext';

export const Topbar: React.FC = () => {
  const pathname = usePathname();
  const { setMobileOpen } = useShell();
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
    <header className="sticky top-0 z-30 h-16 px-3 sm:px-6 flex items-center justify-between gap-3 bg-[#07080a]/70 backdrop-blur-xl backdrop-saturate-150 border-b border-white/[0.06]">
      {/* Left: menu + breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 -ml-1 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06]"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5 text-[13px] min-w-0">
          <span className="hidden sm:inline text-white/40">VulnScope</span>
          <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-white/25 shrink-0" />
          <span key={pathname} className="text-white font-medium truncate animate-in">
            {getBreadcrumbTitle(pathname)}
          </span>
        </div>
      </div>

      {/* Center / Search Button (Raycast-style command bar) */}
      <div className="flex-1 max-w-md hidden md:block">
        <button
          onClick={() => setSearchModalOpen(true)}
          className="group w-full flex items-center justify-between h-9 pl-3 pr-1.5 rounded-[10px] bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.05] text-white/45 hover:text-white/80 text-[13px]"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <span className="truncate">Search findings, applications, CVEs, rules...</span>
          </div>
          <span className="flex items-center gap-1 shrink-0">
            <kbd className="kbd"><Command className="w-3 h-3" /></kbd>
            <kbd className="kbd">K</kbd>
          </span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Quick Scan Action */}
        <Link
          href="/analysis/run"
          className="rc-btn rc-btn-primary hidden sm:inline-flex !h-8 !px-3 !text-[13px]"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>New Analysis Run</span>
        </Link>

        {/* Security Score Badge */}
        <div className="hidden xl:flex items-center gap-2 h-8 px-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs font-mono">
          <span className="text-white/40">Score</span>
          <span className="font-semibold text-emerald-400">{workspaceScore.score}/100</span>
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="group relative p-2 rounded-lg text-white/55 hover:text-white hover:bg-white/[0.06]"
          title="Notifications"
        >
          <Bell className="w-4 h-4 transition-transform duration-300 ease-rc group-hover:rotate-[14deg]" />
          {openFindingsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#ff6363] ring-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff6363] ring-2 ring-[#07080a]" />
            </span>
          )}
        </button>

        {/* Prototype Info Trigger */}
        <button
          onClick={() => setDemoModalOpen(true)}
          className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-amber-400/[0.08] text-amber-200 hover:bg-amber-400/15 border border-amber-400/20 hover:border-amber-400/40 text-xs font-mono"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">FYP Demo</span>
        </button>

        {/* Search on mobile */}
        <button
          onClick={() => setSearchModalOpen(true)}
          className="md:hidden p-2 rounded-lg text-white/55 hover:text-white hover:bg-white/[0.06]"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
