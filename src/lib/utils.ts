import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FindingSeverity } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSeverityColor(severity: FindingSeverity) {
  switch (severity) {
    case 'Critical':
      return {
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        text: 'text-rose-400',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        dot: 'bg-rose-500',
      };
    case 'High':
      return {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        dot: 'bg-amber-500',
      };
    case 'Medium':
      return {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'text-yellow-400',
        badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
        dot: 'bg-yellow-500',
      };
    case 'Low':
      return {
        bg: 'bg-sky-500/10',
        border: 'border-sky-500/30',
        text: 'text-sky-400',
        badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        dot: 'bg-sky-500',
      };
    case 'Info':
    default:
      return {
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/30',
        text: 'text-slate-400',
        badge: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
        dot: 'bg-slate-400',
      };
  }
}

export function getScoreGrade(score: number): { label: string; color: string; bg: string } {
  if (score >= 90) return { label: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
  if (score >= 75) return { label: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
  if (score >= 60) return { label: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
  if (score >= 40) return { label: 'At Risk', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' };
  return { label: 'Critical Risk', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
}
