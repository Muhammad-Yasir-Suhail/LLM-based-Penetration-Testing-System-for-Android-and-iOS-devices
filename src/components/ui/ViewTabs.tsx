'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface ViewDef {
  id: string;
  label: string;
  /** Optional small count shown after the label (e.g. number of findings). */
  count?: number | string;
  content: React.ReactNode;
}

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Progressive disclosure for busy screens: one row of views, one view on screen at a time.
 * The selected view lives in the URL (?view=…) so it survives refresh and can be linked.
 * Nothing is removed; every section stays one click away.
 */
export function ViewTabs({
  views,
  param = 'view',
  className,
  label = 'Sections',
  keepMounted = false,
}: {
  views: ViewDef[];
  param?: string;
  className?: string;
  label?: string;
  /** Keep inactive views in the DOM (hidden) so their local state survives switching. */
  keepMounted?: boolean;
}) {
  const [active, setActive] = useState(views[0]?.id);
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{ x: number; w: number } | null>(null);

  // Read the initial view from the URL.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get(param);
    if (fromUrl && views.some((v) => v.id === fromUrl)) setActive(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = useCallback(
    (id: string) => {
      setActive(id);
      const url = new URL(window.location.href);
      if (id === views[0]?.id) url.searchParams.delete(param);
      else url.searchParams.set(param, id);
      window.history.replaceState(window.history.state, '', url.toString());
    },
    [param, views]
  );

  // Move the sliding indicator under the active tab.
  const measure = useCallback(() => {
    const el = active ? tabRefs.current[active] : null;
    const list = listRef.current;
    if (!el || !list) return;
    setIndicator({ x: el.offsetLeft, w: el.offsetWidth });
  }, [active]);
  useIsoLayoutEffect(measure, [measure]);
  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = views.findIndex((v) => v.id === active);
    let next = -1;
    if (e.key === 'ArrowRight') next = (i + 1) % views.length;
    if (e.key === 'ArrowLeft') next = (i - 1 + views.length) % views.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = views.length - 1;
    if (next >= 0) {
      e.preventDefault();
      select(views[next].id);
      tabRefs.current[views[next].id]?.focus();
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="overflow-x-auto -mx-1 px-1">
        <div
          ref={listRef}
          role="tablist"
          aria-label={label}
          onKeyDown={onKeyDown}
          className="view-tabs relative inline-flex items-center gap-1 border-b border-white/[0.08] min-w-full"
        >
          {views.map((v) => {
            const isActive = v.id === active;
            return (
              <button
                key={v.id}
                ref={(el) => {
                  tabRefs.current[v.id] = el;
                }}
                id={`tab-${param}-${v.id}`}
                role="tab"
                type="button"
                aria-selected={isActive}
                aria-controls={`panel-${param}-${v.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => select(v.id)}
                className={cn(
                  'view-tab relative h-10 px-3.5 text-[13px] whitespace-nowrap transition-colors duration-150',
                  isActive ? 'text-white' : 'text-slate-500 hover:text-slate-200'
                )}
              >
                {v.label}
                {v.count !== undefined && (
                  <span className={cn('ml-2 font-mono text-[11px] tabular-nums', isActive ? 'text-slate-300' : 'text-slate-600')}>
                    {v.count}
                  </span>
                )}
              </button>
            );
          })}
          {indicator && (
            <span
              aria-hidden="true"
              className="view-tabs__indicator absolute -bottom-px left-0 h-[2px] bg-white"
              style={{ width: indicator.w, transform: `translateX(${indicator.x}px)` }}
            />
          )}
        </div>
      </div>

      {views.map((v) => {
        const isActive = v.id === active;
        if (!isActive && !keepMounted) return null;
        return (
          <div
            key={v.id}
            id={`panel-${param}-${v.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${param}-${v.id}`}
            hidden={!isActive}
            className={cn('space-y-6', isActive && 'view-panel-in')}
          >
            {v.content}
          </div>
        );
      })}
    </div>
  );
}
