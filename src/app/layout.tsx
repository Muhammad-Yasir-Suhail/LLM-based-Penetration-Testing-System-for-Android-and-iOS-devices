import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppStateProvider } from '@/context/AppStateContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VulnScope — Evidence-Grounded Agentic Mobile Application Security Testing Framework',
  description: 'Evidence-grounded, LLM-assisted agentic framework for authorized mobile application security testing, adaptive action planning, and traceable audit findings.',
};

export const viewport: Viewport = {
  themeColor: '#07080a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${mono.variable}`}>
      <body className="bg-[#07080a] text-white min-h-screen font-sans">
        <AppStateProvider>
          {children}
        </AppStateProvider>
      </body>
    </html>
  );
}
