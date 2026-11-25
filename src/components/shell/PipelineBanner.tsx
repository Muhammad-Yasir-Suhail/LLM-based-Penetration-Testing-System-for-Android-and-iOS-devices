'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

const pipelineSteps = [
  { id: 'collect', label: 'Collect', desc: 'Multi-Engine Ingestion' },
  { id: 'normalize', label: 'Normalize', desc: 'Unified MASVS / CWE' },
  { id: 'correlate', label: 'Correlate', desc: 'Cross-Engine Deduplication' },
  { id: 'prioritize', label: 'Prioritize', desc: 'Attack Surface Reachability' },
  { id: 'explain', label: 'Explain', desc: 'Generative Security Copilot' },
  { id: 'remediate', label: 'Remediate', desc: 'Actionable Code Diffs' },
  { id: 'verify', label: 'Verify', desc: 'Automated Regression' },
];

/**
 * The seven-stage pipeline as one continuous step bar: mono step numbers on a hairline track,
 * a single signal underline that slides to the active stage. Clicking a stage moves the
 * highlight (view only); the `activeStep` prop sets where it starts.
 */
export const PipelineBanner: React.FC<{ activeStep?: string; compact?: boolean }> = ({ activeStep = 'correlate', compact = false }) => {
  const initial = Math.max(0, pipelineSteps.findIndex((s) => s.id === activeStep));
  const [current, setCurrent] = useState(initial);
  const count = pipelineSteps.length;

  return (
    <section className="surface-flat" aria-label="VulnScope Agentic Security Intelligence & Orchestration Pipeline">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 sm:px-5 py-3 border-b border-white/[0.06]">
        <h2 className="text-[13px] font-medium text-white">VulnScope Agentic Security Intelligence & Orchestration Pipeline</h2>
        <span className="text-[12px] text-slate-500">Autonomous Security Lifecycle Engine</span>
      </header>

      <div className="overflow-x-auto">
        <ol className="relative grid min-w-[760px]" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
          {/* the connecting track */}
          <span aria-hidden="true" className="absolute left-5 right-5 top-[22px] h-px bg-white/[0.08]" />
          {/* the sliding active indicator */}
          <span
            aria-hidden="true"
            className="step-indicator absolute bottom-0 left-0 h-[2px] bg-signal"
            style={{ width: `${100 / count}%`, transform: `translateX(${current * 100}%)` }}
          />

          {pipelineSteps.map((step, idx) => {
            const isActive = idx === current;
            const isPast = idx < current;
            return (
              <li key={step.id} className="relative">
                <button
                  type="button"
                  onClick={() => setCurrent(idx)}
                  aria-current={isActive ? 'step' : undefined}
                  className={cn(
                    'step-btn w-full text-left px-4 sm:px-5 pt-3 pb-3.5 transition-colors duration-150',
                    isActive ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]'
                  )}
                >
                  <span className="relative z-[1] flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center justify-center h-5 min-w-[28px] px-1 rounded-[4px] font-mono text-[11px] tabular-nums transition-colors duration-150',
                        isActive
                          ? 'bg-signal text-signal-ink'
                          : isPast
                            ? 'bg-elevated-2 text-slate-300 ring-1 ring-white/[0.08]'
                            : 'bg-elevated text-slate-500 ring-1 ring-white/[0.06]'
                      )}
                    >
                      0{idx + 1}
                    </span>
                  </span>
                  <span className={cn('block mt-2 text-[13px] transition-colors duration-150', isActive ? 'text-white' : 'text-slate-400')}>
                    {step.label}
                  </span>
                  {!compact && <span className="block text-[11px] text-slate-500 truncate mt-0.5">{step.desc}</span>}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};
