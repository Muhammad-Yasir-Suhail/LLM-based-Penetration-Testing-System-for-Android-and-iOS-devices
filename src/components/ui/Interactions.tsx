'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUp } from 'lucide-react';

const INTERACTIVE = 'a, button, [role="button"], [role="tab"], [role="menuitem"], select, summary, label[for], input[type="checkbox"], input[type="radio"]';
const TEXT_FIELDS = 'input:not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]';
const REVEAL_TARGETS = '.app-main .card, .app-main .surface-flat, .app-main .panel, .app-main table tbody tr, .app-main h1, .app-main h2';

/**
 * Site-wide interaction layer, monochrome:
 *  - a cursor signifier (a ring that follows the mouse and reacts to clickable things)
 *  - a scroll progress bar
 *  - reveal-on-scroll for cards, sections and table rows below the fold
 *  - a back-to-top button once the page is scrolled
 * Everything is skipped for touch input and under prefers-reduced-motion.
 */
export function Interactions() {
  const pathname = usePathname();
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);

  /* ---------------- Cursor signifier ---------------- */
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;

    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let raf = 0;
    let visible = false;

    const loop = () => {
      // The ring eases toward the pointer; the dot sits exactly on it.
      rx += (x - rx) * 0.2;
      ry += (y - ry) * 0.2;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        visible = true;
        rx = x;
        ry = y;
        document.documentElement.classList.add('cursor-visible');
      }
      const t = e.target as Element | null;
      const interactive = !!t?.closest?.(INTERACTIVE);
      const text = !interactive && !!t?.closest?.(TEXT_FIELDS);
      document.documentElement.classList.toggle('cursor-hover', interactive);
      document.documentElement.classList.toggle('cursor-text', text);
    };
    const onDown = () => document.documentElement.classList.add('cursor-down');
    const onUp = () => document.documentElement.classList.remove('cursor-down');
    const onLeave = () => {
      visible = false;
      document.documentElement.classList.remove('cursor-visible');
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.documentElement.classList.remove('cursor-visible', 'cursor-hover', 'cursor-text', 'cursor-down');
    };
  }, []);

  /* ---------------- Scroll progress + back to top ---------------- */
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
      setShowTop(window.scrollY > 400);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pathname]);

  /* ---------------- Reveal on scroll ---------------- */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            el.classList.add('sr-in');
            io.unobserve(el);
            // Drop the helper classes after the transition so hover transforms work normally.
            window.setTimeout(() => el.classList.remove('sr', 'sr-in'), 700);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    const seen = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll<HTMLElement>(REVEAL_TARGETS).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        // Only hide what is below the fold right now; what is on screen stays visible.
        const r = el.getBoundingClientRect();
        if (r.top > window.innerHeight * 0.92) {
          el.classList.add('sr');
          io.observe(el);
        }
      });
    };

    // Content arrives after navigation, view switches and data loads: rescan on DOM changes.
    let pending = 0;
    const mo = new MutationObserver(() => {
      window.clearTimeout(pending);
      pending = window.setTimeout(scan, 80);
    });
    const t = window.setTimeout(scan, 120);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(t);
      window.clearTimeout(pending);
      mo.disconnect();
      io.disconnect();
      document.querySelectorAll('.sr').forEach((el) => el.classList.remove('sr', 'sr-in'));
    };
  }, [pathname]);

  return (
    <>
      {/* Scroll progress */}
      <div className="scroll-progress" aria-hidden="true">
        <div ref={progressRef} className="scroll-progress__bar" />
      </div>

      {/* Cursor signifier */}
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />

      {/* Back to top */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`to-top ${showTop ? 'is-shown' : ''}`}
        aria-label="Back to top"
        tabIndex={showTop ? 0 : -1}
      >
        <ArrowUp className="w-4 h-4" aria-hidden="true" />
      </button>
    </>
  );
}
