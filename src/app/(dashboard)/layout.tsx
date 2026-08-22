'use client';

import React from 'react';
import { Sidebar } from '@/components/shell/Sidebar';
import { Topbar } from '@/components/shell/Topbar';
import { CommandPalette } from '@/components/shell/CommandPalette';
import { NotificationDrawer } from '@/components/shell/NotificationDrawer';
import { DemoModeModal } from '@/components/shell/DemoModeModal';
import { OnboardingModal } from '@/components/shell/OnboardingModal';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#07090e] bg-grid-cyber text-slate-100 flex flex-col">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Layout Area offset by sidebar width */}
      <div className="flex-1 flex flex-col pl-20 sm:pl-64 transition-all duration-300">
        {/* Persistent Top Navigation Bar */}
        <Topbar />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Global Overlays & Modals */}
      <CommandPalette />
      <NotificationDrawer />
      <DemoModeModal />
      <OnboardingModal />
    </div>
  );
}
