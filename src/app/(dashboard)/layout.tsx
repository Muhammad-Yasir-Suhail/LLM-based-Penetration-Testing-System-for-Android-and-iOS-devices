'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { TopNav } from '@/components/shell/TopNav';
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
      <div className="app-shell relative min-h-screen bg-ink text-white">
        {/* Floating top navigation with category menus */}
        <TopNav />

        {/* Page content, keyed by route so the entrance replays */}
        <main
          key={pathname}
          className="app-main page-enter px-4 pt-40 pb-16 sm:px-6 max-w-[1200px] w-full mx-auto space-y-8"
        >
          {children}
        </main>

        {/* Global overlays and modals */}
        <CommandPalette />
        <NotificationDrawer />
        <DemoModeModal />
        <OnboardingModal />
      </div>
    </ShellProvider>
  );
}
