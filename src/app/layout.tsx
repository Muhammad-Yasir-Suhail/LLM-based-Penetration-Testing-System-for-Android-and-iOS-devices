import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Instrument_Sans, Figtree } from 'next/font/google';
import './globals.css';
import { AppStateProvider } from '@/context/AppStateContext';
import { Interactions } from '@/components/ui/Interactions';

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

/* Landing page faces (Ribbon): Instrument Sans for heads, Figtree for reading */
const instrument = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--ff-instrument',
  display: 'swap',
});

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--ff-figtree',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VulnScope | Evidence-Grounded Agentic Mobile Application Security Testing Framework',
  description: 'Evidence-grounded, LLM-assisted agentic framework for authorized mobile application security testing, adaptive action planning, and traceable audit findings.',
};

export const viewport: Viewport = {
  themeColor: '#0a0a0b',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${mono.variable} ${instrument.variable} ${figtree.variable}`}>
      <body className="bg-ink text-white min-h-screen font-sans">
        <AppStateProvider>
          {children}
          <Interactions />
        </AppStateProvider>
      </body>
    </html>
  );
}
