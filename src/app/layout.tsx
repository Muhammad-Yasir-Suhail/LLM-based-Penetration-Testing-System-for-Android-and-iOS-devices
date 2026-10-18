import type { Metadata } from 'next';
import './globals.css';
import { AppStateProvider } from '@/context/AppStateContext';

export const metadata: Metadata = {
  title: 'VulnCope — Evidence-Grounded Agentic Mobile Application Security Testing Framework',
  description: 'Evidence-grounded, LLM-assisted agentic framework for authorized mobile application security testing, adaptive action planning, and traceable audit findings.',
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
