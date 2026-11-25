import React from 'react';
import { cn } from '@/lib/utils';

/** VulnScope mark: a diamond with a scope reticle, in the light end of the grey ramp. */
export function LogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn('relative inline-flex items-center justify-center shrink-0 text-signal', className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
        <rect x="5" y="5" width="22" height="22" rx="6" transform="rotate(45 16 16)" fill="currentColor" />
        <g stroke="var(--signal-ink)" strokeWidth="1.8" strokeLinecap="round" fill="none">
          <circle cx="16" cy="16" r="5.2" />
          <path d="M16 7.8v3.4M16 20.8v3.4M7.8 16h3.4M20.8 16h3.4" />
        </g>
        <circle cx="16" cy="16" r="1.4" fill="var(--signal-ink)" />
      </svg>
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('text-[15px] font-semibold tracking-tight text-white', className)}>
      Vuln<span className="text-white/50">Scope</span>
    </span>
  );
}
