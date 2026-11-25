'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  ChevronDown,
  ChevronRight,
  Search,
  Bell,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Layers,
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { useShell } from './ShellContext';
import { LogoMark } from './Logo';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  hint: string;
  badge?: string;
  badgeTone?: 'critical' | 'neutral';
}

interface NavGroup {
  name: string;
  items: NavItem[];
}

/* Page titles for the breadcrumb, as the old top bar showed them */
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

const isActivePath = (pathname: string, href: string) =>
  pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

/* -------------------------------------------------------------------------- */
/* A category menu: opens on hover, click or keyboard focus                   */
/* -------------------------------------------------------------------------- */

function CategoryMenu({
  group,
  open,
  onOpen,
  onClose,
  pathname,
}: {
  group: NavGroup;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  pathname: string;
}) {
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = group.items.some((i) => isActivePath(pathname, i.href));

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(onClose, 120);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        onOpen();
      }}
      onMouseLeave={scheduleClose}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) onClose();
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => (open ? onClose() : onOpen())}
        className={cn(
          'nav-link-u flex items-center gap-1 h-9 px-3 rounded-lg text-[14px] transition-colors duration-150',
          open || active ? 'text-white' : 'text-white/60 hover:text-white'
        )}
      >
        {group.name}
        <ChevronDown
          className={cn('w-3.5 h-3.5 text-white/40 transition-transform duration-200', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown panel */}
      <div
        className={cn(
          'absolute left-1/2 top-full pt-3 -translate-x-1/2 transition duration-150 ease-out',
          open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'
        )}
        onMouseEnter={cancelClose}
      >
        <div className="nav-card nav-card--solid w-[340px] p-2" role="menu" aria-label={group.name}>
          {group.items.map((item) => {
            const Icon = item.icon;
            const current = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                tabIndex={open ? 0 : -1}
                onClick={onClose}
                className={cn(
                  'flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150',
                  current ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
                )}
              >
                <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', current ? 'text-signal' : 'text-white/45')} aria-hidden="true" />
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="text-[14px] text-white">{item.name}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          'text-[11px] px-1.5 rounded-md',
                          item.badgeTone === 'critical' ? 'text-rose-300 bg-rose-500/10' : 'text-white/45 bg-white/[0.05]'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </span>
                  <span className="block text-[12px] text-white/45 mt-0.5">{item.hint}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Top navigation                                                             */
/* -------------------------------------------------------------------------- */

export const TopNav: React.FC = () => {
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen } = useShell();
  const {
    activeWorkspace,
    workspaceScore,
    setDemoModalOpen,
    setSearchModalOpen,
    notificationsOpen,
    setNotificationsOpen,
    findings,
  } = useAppState();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // The bar gains depth once the page scrolls under it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const accountRef = useRef<HTMLDivElement>(null);

  const openCriticals = findings.filter(f => f.severity === 'Critical' && (f.status === 'Open' || f.status === 'In Review')).length;
  const openFindingsCount = findings.filter(f => f.status === 'Open' || f.status === 'In Review').length;

  const navGroups: NavGroup[] = [
    {
      name: 'Platform',
      items: [
        { name: 'Security Overview', href: '/dashboard', icon: LayoutDashboard, hint: 'Posture, findings and the agent pipeline' },
        { name: 'Projects', href: '/projects', icon: FolderGit2, hint: 'Projects management' },
        { name: 'Applications', href: '/applications', icon: Smartphone, hint: 'Applications inventory' },
        { name: 'Security Posture', href: '/posture', icon: LineChart, hint: 'Security posture analytics' },
      ],
    },
    {
      name: 'Analysis',
      items: [
        { name: 'Security Analysis', href: '/analysis', icon: Activity, hint: 'Agentic analysis runs', badge: 'Agent Core' },
        {
          name: 'Security Findings',
          href: '/findings',
          icon: AlertTriangle,
          hint: 'Security findings management',
          badge: openCriticals > 0 ? `${openCriticals} Crit` : undefined,
          badgeTone: 'critical',
        },
        { name: 'Attack Surface', href: '/attack-surface', icon: Network, hint: 'Attack surface visualizer', badge: 'Demo Data' },
        { name: 'Finding Correlation', href: '/correlation', icon: GitFork, hint: 'Multi-engine finding correlation', badge: 'Demo Data' },
        { name: 'Static Code Viewer', href: '/static-analysis', icon: Code2, hint: 'Static analysis and code viewer' },
      ],
    },
    {
      name: 'AI & Reports',
      items: [
        { name: 'Security Copilot', href: '/copilot', icon: Bot, hint: 'Security Copilot', badge: 'AI Assistant' },
        { name: 'Security Reports', href: '/reports', icon: FileText, hint: 'Security reports and assessments' },
        { name: 'Security Engines', href: '/engines', icon: Cpu, hint: 'Security engines', badge: 'Tool Registry' },
      ],
    },
    {
      name: 'Governance',
      items: [
        { name: 'Activity Stream', href: '/activity', icon: History, hint: 'Activity and audit trail' },
        { name: 'Team & Access', href: '/team', icon: Users2, hint: 'Team and access management' },
        { name: 'Settings', href: '/settings', icon: Settings, hint: 'Workspace settings' },
      ],
    },
  ];

  // Close menus on navigation and on Escape.
  useEffect(() => {
    setOpenMenu(null);
  }, [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setMobileOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-3 z-40 px-3 sm:px-4">
        <div className={cn('nav-card nav-shell mx-auto max-w-[1200px]', scrolled && 'is-scrolled')}>
          {/* Row 1: navigation */}
          <nav aria-label="Primary" className="h-[56px] flex items-center justify-between gap-2 pl-4 pr-2">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0" aria-label="VulnScope, Security Overview">
              <LogoMark size={24} />
              <span className="hidden md:inline text-[15px] font-medium text-white tracking-tight">VulnScope</span>
            </Link>

            {/* Categories, visible from tablet width up */}
            <div className="hidden sm:flex items-center gap-0.5">
              {navGroups.map((g) => (
                <CategoryMenu
                  key={g.name}
                  group={g}
                  pathname={pathname}
                  open={openMenu === g.name}
                  onOpen={() => setOpenMenu(g.name)}
                  onClose={() => setOpenMenu((m) => (m === g.name ? null : m))}
                />
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative h-9 w-9 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell className="w-4 h-4" aria-hidden="true" />
                {openFindingsCount > 0 && <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />}
              </button>

              {/* Account and workspace */}
              <div
                ref={accountRef}
                className="relative"
                onMouseEnter={() => setOpenMenu('account')}
                onMouseLeave={() => setOpenMenu((m) => (m === 'account' ? null : m))}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpenMenu((m) => (m === 'account' ? null : m));
                }}
              >
                <button
                  type="button"
                  aria-expanded={openMenu === 'account'}
                  aria-haspopup="true"
                  onClick={() => setOpenMenu((m) => (m === 'account' ? null : 'account'))}
                  className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-white/[0.05] transition-colors"
                  aria-label="Workspace and account"
                >
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                    alt=""
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10 grayscale"
                  />
                </button>
                <div
                  className={cn(
                    'absolute right-0 top-full pt-3 transition duration-150 ease-out',
                    openMenu === 'account' ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'
                  )}
                >
                  <div className="nav-card nav-card--solid w-[280px] p-2">
                    <div className="px-3 py-2.5">
                      <p className="text-[14px] text-white">Alex Vance</p>
                      <p className="text-[12px] text-white/45">Lead SecOps Analyst</p>
                    </div>
                    <div className="mx-3 my-1 h-px bg-white/[0.06]" />
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <Layers className="w-4 h-4 text-white/45" aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] text-white truncate">{activeWorkspace}</p>
                        <p className="text-[12px] text-white/45 tabular-nums">Score: {workspaceScore.score}/100</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDemoModalOpen(true)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/[0.04] transition-colors"
                      title="VulnScope Real Agentic Core & Demo Status"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mx-[5px]" aria-hidden="true" />
                      <span>
                        <span className="block text-[14px] text-emerald-300">Real agent active</span>
                        <span className="block text-[12px] text-white/45">Bounded tool registry running</span>
                      </span>
                    </button>
                    <div className="mx-3 my-1 h-px bg-white/[0.06]" />
                    <Link
                      href="/"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      Switch Workspace / Sign Out
                    </Link>
                  </div>
                </div>
              </div>

              {/* Phone: every destination in a sheet */}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="sm:hidden h-9 w-9 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/[0.05]"
                aria-label="Open navigation"
              >
                <Menu className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </nav>

          {/* Row 2: the workspace bar (breadcrumb, search, run, score, FYP demo) */}
          <div className="h-[48px] flex items-center gap-3 pl-4 pr-2 border-t border-white/[0.06]">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[13px] min-w-0 shrink">
              <span className="hidden sm:inline text-white/40 shrink-0">VulnScope</span>
              <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-white/25 shrink-0" aria-hidden="true" />
              <span className="text-white truncate">{getBreadcrumbTitle(pathname)}</span>
            </div>

            {/* Search field */}
            <div className="hidden md:flex flex-1 justify-center min-w-0">
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="w-full max-w-md flex items-center justify-between h-8 pl-3 pr-1.5 rounded-md bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] text-white/45 hover:text-white/80 text-[13px] transition-colors"
              >
                <span className="flex items-center gap-2 truncate">
                  <Search className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">Search findings, applications, CVEs, rules…</span>
                </span>
                <span className="flex items-center gap-1 shrink-0">
                  <kbd className="kbd">Ctrl</kbd>
                  <kbd className="kbd">K</kbd>
                </span>
              </button>
            </div>

            {/* Right controls */}
            <div className="ml-auto md:ml-0 flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="md:hidden h-8 w-8 flex items-center justify-center rounded-md text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4" aria-hidden="true" />
              </button>

              <span className="hidden lg:flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-white/[0.08] text-[12px] tabular-nums">
                <span className="text-white/45">Score</span>
                <span className="font-mono text-white">{workspaceScore.score}/100</span>
              </span>

              <button
                type="button"
                onClick={() => setDemoModalOpen(true)}
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-white/[0.08] text-white/70 hover:text-white hover:border-white/[0.16] text-[12px] transition-colors"
                title="FYP Demo"
              >
                <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">FYP Demo</span>
              </button>

              <Link href="/analysis/run" className="btn-app btn-app-primary hidden sm:inline-flex !min-h-[32px]">
                <Activity className="w-3.5 h-3.5" aria-hidden="true" />
                New Analysis Run
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sheet with every destination */}
      <div
        className={cn(
          'fixed inset-0 z-50 sm:hidden transition-opacity duration-200',
          mobileOpen ? 'opacity-100 visible' : 'opacity-0 pointer-events-none invisible'
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
        <div className="nav-card nav-card--solid absolute inset-x-3 top-3 max-h-[calc(100dvh-24px)] overflow-y-auto p-3">
          <div className="flex items-center justify-between px-2 pb-2">
            <span className="flex items-center gap-2.5">
              <LogoMark size={22} />
              <span className="text-[15px] font-medium text-white">VulnScope</span>
            </span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="h-9 w-9 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/[0.05]"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
          {navGroups.map((g) => (
            <div key={g.name} className="py-2">
              <p className="px-3 pb-1 text-[12px] text-white/40">{g.name}</p>
              {g.items.map((item) => {
                const Icon = item.icon;
                const current = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 h-11 rounded-xl text-[15px]',
                      current ? 'bg-white/[0.06] text-white' : 'text-white/70'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', current ? 'text-signal' : 'text-white/45')} aria-hidden="true" />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && <span className="text-[11px] text-white/45">{item.badge}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
          <div className="mt-1 pt-3 border-t border-white/[0.06] px-3 space-y-3">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-white/70">{activeWorkspace}</span>
              <span className="text-white/45 tabular-nums">Score: {workspaceScore.score}/100</span>
            </div>
            <button type="button" onClick={() => setDemoModalOpen(true)} className="text-[13px] text-emerald-300">
              Real agent active, bounded tool registry running
            </button>
            <div className="flex items-center justify-between pb-1">
              <Link href="/analysis/run" className="btn-app btn-app-primary">
                <Activity className="w-3.5 h-3.5" aria-hidden="true" />
                New Analysis Run
              </Link>
              <Link href="/" className="text-[13px] text-white/60 hover:text-white">
                Sign out
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
