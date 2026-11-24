'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/shell/Sidebar';
import { Topbar } from '@/components/shell/Topbar';
import { CommandPalette } from '@/components/shell/CommandPalette';
import { NotificationDrawer } from '@/components/shell/NotificationDrawer';
import { DemoModeModal } from '@/components/shell/DemoModeModal';
import { OnboardingModal } from '@/components/shell/OnboardingModal';
import { ShellProvider } from '@/components/shell/ShellContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ShellProvider>
      <div className="app-shell relative min-h-screen bg-grid-cyber text-white flex flex-col">
        {/* Ambient top glow, like the keyboard's under-light */}
        <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(255,99,99,0.08),transparent_70%)]" />

        {/* Persistent Left Sidebar (drawer on mobile) */}
        <Sidebar />

        {/* Main column follows the sidebar width on desktop */}
        <div className="relative flex-1 flex flex-col lg:pl-[var(--sidebar-w)] transition-[padding] duration-300 ease-rc">
          {/* Persistent Top Navigation Bar */}
          <Topbar />

          {/* Dynamic Page Content — keyed by route so the staggered entrance replays */}
          <main
            key={pathname}
            className="app-main page-enter flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8 max-w-[1320px] w-full mx-auto space-y-6"
          >
            {children}
          </main>
        </div>

        {/* Global Overlays & Modals */}
        <CommandPalette />
        <NotificationDrawer />
        <DemoModeModal />
        <OnboardingModal />
      </div>
    </ShellProvider>
  );
}
