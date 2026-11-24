import React from 'react';
import { cn } from '@/lib/utils';

/** VulnScope mark: a red glowing keycap-shaped diamond with a scope reticle. */
export function LogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn('relative inline-flex items-center justify-center shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <span className="absolute inset-0 rounded-[30%] bg-[#ff6363]/30 blur-md opacity-70" />
      <svg viewBox="0 0 32 32" width={size} height={size} className="relative" aria-hidden>
        <defs>
          <linearGradient id="vs-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff8585" />
            <stop offset="1" stopColor="#e5484d" />
          </linearGradient>
        </defs>
        <rect x="5" y="5" width="22" height="22" rx="6" transform="rotate(45 16 16)" fill="url(#vs-g)" />
        <rect x="5" y="5" width="22" height="22" rx="6" transform="rotate(45 16 16)" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth=".8" />
        <circle cx="16" cy="16" r="5.2" fill="none" stroke="#fff" strokeWidth="1.8" />
        <path d="M16 7.8v3.4M16 20.8v3.4M7.8 16h3.4M20.8 16h3.4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="16" cy="16" r="1.4" fill="#fff" />
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
