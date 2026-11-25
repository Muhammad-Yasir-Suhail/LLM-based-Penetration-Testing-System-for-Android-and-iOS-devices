'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/** Purely presentational shell state (sidebar collapse + mobile drawer). */
type ShellState = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
};

const ShellContext = createContext<ShellState | null>(null);

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile drawer on navigation.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Expose the sidebar width as a CSS variable so the content column can follow it.
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-w', collapsed ? '76px' : '256px');
  }, [collapsed]);

  // Count-up: figures marked data-countup roll from 0 to their value when a page opens.
  // Only the displayed text animates; the final value is always what React rendered.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const frames: number[] = [];
    const t = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>('[data-countup]').forEach((el) => {
        // Write into React's own text node so later re-renders still update it.
        const node = el.firstChild;
        if (!node || node.nodeType !== Node.TEXT_NODE || el.childNodes.length !== 1) return;
        const target = parseInt(node.nodeValue || '', 10);
        if (!Number.isFinite(target) || target <= 0) return;
        const start = performance.now();
        const duration = 900;
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          node.nodeValue = String(Math.round(target * eased));
          if (p < 1) frames.push(requestAnimationFrame(tick));
          else node.nodeValue = String(target);
        };
        frames.push(requestAnimationFrame(tick));
      });
    }, 60);
    return () => {
      window.clearTimeout(t);
      frames.forEach((f) => cancelAnimationFrame(f));
    };
  }, [pathname]);

  // Card hover light: one delegated listener sets the cursor position on the card under it.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = (e.target as Element | null)?.closest?.('.card, .surface-flat') as HTMLElement | null;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <ShellContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      {children}
    </ShellContext.Provider>
  );
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error('useShell must be used inside <ShellProvider>');
  return ctx;
}
