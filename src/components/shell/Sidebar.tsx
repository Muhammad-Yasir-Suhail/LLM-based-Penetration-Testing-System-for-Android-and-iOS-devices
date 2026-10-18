'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  LayoutDashboard,
  FolderGit2,
  Smartphone,
  Network,
  GitFork,
  Activity,
  Code2,
  AlertTriangle,
  Bot,
  FileText,
  LineChart,
  Cpu,
  History,
  Users2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  CheckCircle2,
  Info,
  LogOut
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  isNew?: boolean;
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const {
    activeWorkspace,
    workspaceScore,
    setDemoModalOpen,
    findings
  } = useAppState();

  const openCriticals = findings.filter(f => f.severity === 'Critical' && (f.status === 'Open' || f.status === 'In Review')).length;

  const navGroups: { groupName: string; items: NavItem[] }[] = [
    {
      groupName: 'Platform Core',
      items: [
        { name: 'Security Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Projects', href: '/projects', icon: FolderGit2 },
        { name: 'Applications', href: '/applications', icon: Smartphone },
        { name: 'Security Posture', href: '/posture', icon: LineChart },
      ]
    },
    {
      groupName: 'Agentic Analysis & Core',
      items: [
        { name: 'Security Analysis', href: '/analysis', icon: Activity, badge: 'Agent Core', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
        {
          name: 'Security Findings',
          href: '/findings',
          icon: AlertTriangle,
          badge: openCriticals > 0 ? `${openCriticals} Crit` : undefined,
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
        },
        { name: 'Attack Surface', href: '/attack-surface', icon: Network, badge: 'Demo Data' },
        { name: 'Finding Correlation', href: '/correlation', icon: GitFork, badge: 'Demo Data' },
        { name: 'Static Code Viewer', href: '/static-analysis', icon: Code2 },
      ]
    },
    {
      groupName: 'AI & Reporting',
      items: [
        { name: 'Security Copilot', href: '/copilot', icon: Bot, badge: 'AI Assistant' },
        { name: 'Security Reports', href: '/reports', icon: FileText },
        { name: 'Security Engines', href: '/engines', icon: Cpu, badge: 'Tool Registry' },
      ]
    },
    {
      groupName: 'Governance',
      items: [
        { name: 'Activity Stream', href: '/activity', icon: History },
        { name: 'Team & Access', href: '/team', icon: Users2 },
        { name: 'Settings', href: '/settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col bg-[#090d15] border-r border-slate-800/80 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header / Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/30 to-blue-500/10 border border-emerald-500/40 shadow-lg shadow-emerald-500/10 shrink-0">
            <Shield className="w-5 h-5 text-emerald-400" />
            <div className="absolute inset-0 rounded-xl bg-emerald-400/10 animate-pulse-slow pointer-events-none" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-white font-mono">
                  Vuln<span className="text-emerald-400">Cope</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  FYP Core
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono tracking-tight">
                Agentic Mobile SecOps
              </span>
            </div>
          )}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Workspace Switcher */}
      {!collapsed ? (
        <div className="p-3 border-b border-slate-800/60 bg-slate-900/30">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-6 h-6 rounded-md bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-slate-200 truncate">{activeWorkspace}</span>
                <span className="text-[10px] text-slate-400 font-mono">Score: {workspaceScore.score}/100</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2 border-b border-slate-800/60 flex justify-center">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center" title={activeWorkspace}>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <h4 className="px-2 mb-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                {group.groupName}
              </h4>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-500/15 text-white border border-brand-cyan/30 shadow-sm shadow-cyan-950/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-brand-cyan' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  />
                  {!collapsed && (
                    <div className="flex items-center justify-between flex-1 overflow-hidden">
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ml-1 shrink-0 ${
                            item.badgeColor || 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                  {isActive && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-brand-cyan rounded-l-full shadow-glow" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / Simulation Status & User */}
      <div className="p-3 border-t border-slate-800/80 bg-[#070a10] space-y-2">
        {/* Simulation Mode Pill */}
        <button
          onClick={() => setDemoModalOpen(true)}
          className={`w-full flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/15 transition-all text-left ${
            collapsed ? 'justify-center p-2' : ''
          }`}
          title="VulnCope Real Agentic Core & Demo Status"
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-[11px] font-mono font-bold text-emerald-300">REAL AGENT ACTIVE</span>
                <span className="text-[9px] text-emerald-400/80">Bounded tool registry running</span>
              </div>
            )}
          </div>
          {!collapsed && <Info className="w-3.5 h-3.5 text-emerald-400" />}
        </button>

        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
              alt="Alex Vance"
              className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0"
            />
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-slate-200 truncate">Alex Vance</span>
                <span className="text-[10px] text-slate-400 font-mono">Lead SecOps Analyst</span>
              </div>
            )}
          </div>
          {!collapsed && (
            <Link
              href="/"
              className="text-slate-400 hover:text-rose-400 p-1 rounded transition-colors"
              title="Switch Workspace / Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
};
