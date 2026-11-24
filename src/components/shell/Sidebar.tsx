'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
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
  Layers,
  Info,
  LogOut,
  X
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { useShell } from './ShellContext';
import { LogoMark, Wordmark } from './Logo';
import { cn } from '@/lib/utils';

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
  const { collapsed: collapsedState, setCollapsed, mobileOpen, setMobileOpen } = useShell();
  const {
    activeWorkspace,
    workspaceScore,
    setDemoModalOpen,
    findings
  } = useAppState();

  // The mobile drawer always shows the full (expanded) sidebar.
  const collapsed = collapsedState && !mobileOpen;

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
        { name: 'Security Analysis', href: '/analysis', icon: Activity, badge: 'Agent Core', badgeColor: 'bg-[#ff6363]/10 text-[#ff8a8a] border-[#ff6363]/30' },
        {
          name: 'Security Findings',
          href: '/findings',
          icon: AlertTriangle,
          badge: openCriticals > 0 ? `${openCriticals} Crit` : undefined,
          badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
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
    <>
      {/* Mobile backdrop */}
      <div
        onClick={() => setMobileOpen(false)}
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ease-rc',
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        aria-hidden
      />

      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 z-50 flex flex-col',
          'bg-[linear-gradient(180deg,#0c0d0f,#08090a)] border-r border-white/[0.06]',
          'transition-[width,transform] duration-300 ease-rc',
          collapsed ? 'lg:w-[76px]' : 'lg:w-64',
          'w-[280px]',
          mobileOpen ? 'translate-x-0 shadow-[30px_0_80px_-20px_rgba(0,0,0,0.9)]' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Primary"
      >
        {/* Header / Logo */}
        <div className={cn('h-16 flex items-center px-4 border-b border-white/[0.06]', collapsed ? 'justify-center' : 'justify-between')}>
          <Link href="/dashboard" className="group flex items-center gap-2.5 overflow-hidden">
            <LogoMark size={30} className="transition-transform duration-300 ease-rc group-hover:rotate-[8deg] group-hover:scale-105" />
            {!collapsed && (
              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-1.5">
                  <Wordmark />
                  <span className="text-[9px] uppercase font-mono tracking-wider px-1.5 py-[1px] rounded-md bg-white/[0.06] text-white/60 border border-white/10">
                    FYP Core
                  </span>
                </div>
                <span className="text-[10px] text-white/40 font-mono tracking-tight">
                  Agentic Mobile SecOps
                </span>
              </div>
            )}
          </Link>

          {/* Desktop collapse */}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="hidden lg:inline-flex p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/[0.06]"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/[0.06]"
            title="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="hidden lg:flex mx-auto mt-3 p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/[0.06]"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Workspace Switcher */}
        {!collapsed ? (
          <div className="p-3">
            <div className="group flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.05] transition-colors duration-200">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="keycap w-7 h-7 flex items-center justify-center shrink-0 !rounded-lg">
                  <Layers className="w-3.5 h-3.5 text-white/80" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-medium text-white truncate">{activeWorkspace}</span>
                  <span className="text-[10px] text-white/40 font-mono">Score: {workspaceScore.score}/100</span>
                </div>
              </div>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 ring-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
            </div>
          </div>
        ) : (
          <div className="p-2 flex justify-center">
            <div className="keycap w-9 h-9 flex items-center justify-center" title={activeWorkspace}>
              <Layers className="w-4 h-4 text-white/80" />
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-5">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-0.5">
              {!collapsed ? (
                <h4 className="px-2.5 pt-2 pb-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-white/30">
                  {group.groupName}
                </h4>
              ) : (
                <div className="mx-auto my-2 h-px w-6 bg-white/[0.08]" />
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-lg text-[13px] transition-all duration-200 ease-rc',
                      collapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-2.5 h-9',
                      isActive
                        ? 'bg-white/[0.07] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(255,255,255,0.06)]'
                        : 'text-white/55 hover:text-white hover:bg-white/[0.04]'
                    )}
                    title={collapsed ? item.name : undefined}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-all duration-200 ease-rc group-hover:scale-110',
                        isActive ? 'text-[#ff6363] drop-shadow-[0_0_6px_rgba(255,99,99,0.6)]' : 'text-white/45 group-hover:text-white/80'
                      )}
                    />
                    {!collapsed && (
                      <div className="flex items-center justify-between flex-1 overflow-hidden">
                        <span className="truncate">{item.name}</span>
                        {item.badge && (
                          <span
                            className={cn(
                              'text-[9px] font-mono px-1.5 py-0.5 rounded-md border ml-1 shrink-0',
                              item.badgeColor || 'bg-white/[0.04] text-white/45 border-white/10'
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                    {isActive && (
                      <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#ff6363] rounded-r-full shadow-glow" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer / Simulation Status & User */}
        <div className="p-3 border-t border-white/[0.06] space-y-2">
          {/* Simulation Mode Pill */}
          <button
            onClick={() => setDemoModalOpen(true)}
            className={cn(
              'w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/10 text-left',
              collapsed && 'justify-center'
            )}
            title="VulnScope Real Agentic Core & Demo Status"
          >
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 ring-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono font-semibold tracking-wider text-emerald-300">REAL AGENT ACTIVE</span>
                  <span className="text-[10px] text-emerald-200/50">Bounded tool registry running</span>
                </div>
              )}
            </div>
            {!collapsed && <Info className="w-3.5 h-3.5 text-emerald-300/70" />}
          </button>

          {/* User Card */}
          <div className={cn('flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.03] transition-colors', collapsed && 'justify-center')}>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                alt="Alex Vance"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 shrink-0"
              />
              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-medium text-white truncate">Alex Vance</span>
                  <span className="text-[10px] text-white/40 font-mono">Lead SecOps Analyst</span>
                </div>
              )}
            </div>
            {!collapsed && (
              <Link
                href="/"
                className="text-white/40 hover:text-[#ff6363] p-1.5 rounded-md hover:bg-white/[0.05] transition-colors"
                title="Switch Workspace / Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
