import type { Metadata } from 'next';
import './globals.css';
import { AppStateProvider } from '@/context/AppStateContext';

export const metadata: Metadata = {
  title: 'SentinelX - AI-Assisted Mobile Application Security Testing Platform',
  description: 'Enterprise SecOps platform orchestrating multi-engine cross-platform mobile security analysis, attack surface topology, and AI-driven remediation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#07090e] text-slate-100 min-h-screen font-sans selection:bg-brand-500/30 selection:text-brand-cyan">
        <AppStateProvider>
          {children}
        </AppStateProvider>
      </body>
    </html>
  );
}
