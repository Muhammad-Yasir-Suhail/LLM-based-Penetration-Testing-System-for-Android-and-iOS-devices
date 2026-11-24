'use client';

/**
 * Lightweight, dependency-free motion primitives (IntersectionObserver + CSS).
 * All animation work happens on transform / opacity / filter so it stays on the GPU.
 */

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/* useInView                                                                  */
/* -------------------------------------------------------------------------- */

export function useInView<T extends Element>(options?: IntersectionObserverInit & { once?: boolean }) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const once = options?.once ?? true;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: options?.threshold ?? 0.15, rootMargin: options?.rootMargin ?? '0px 0px -8% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [once]);

  return { ref, inView };
}

/* -------------------------------------------------------------------------- */
/* Reveal — fade / blur / slide in when scrolled into view                    */
/* -------------------------------------------------------------------------- */

type RevealProps = {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  delay?: number;
  variant?: 'up' | 'scale' | 'left' | 'right';
  style?: React.CSSProperties;
};

export function Reveal({ children, as = 'div', className, delay = 0, variant = 'up', style }: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>();
  const Tag = as as any;
  return (
    <Tag
      ref={ref}
      data-reveal={variant === 'up' ? '' : variant}
      className={cn(inView && 'is-visible', className)}
      style={{ ...style, ['--reveal-delay' as any]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/* -------------------------------------------------------------------------- */
/* Spotlight — cursor-following glowing border                               */
/* -------------------------------------------------------------------------- */

export function Spotlight({
  children,
  className,
  as = 'div',
  ...rest
}: { children: React.ReactNode; className?: string; as?: keyof JSX.IntrinsicElements } & React.HTMLAttributes<HTMLElement>) {
  const Tag = as as any;
  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <Tag onMouseMove={onMove} className={cn('spotlight', className)} {...rest}>
      {children}
    </Tag>
  );
}

/* -------------------------------------------------------------------------- */
/* Magnetic — element is gently pulled toward the cursor                     */
/* -------------------------------------------------------------------------- */

export function Magnetic({ children, strength = 0.25, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const onMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = 'translate3d(0,0,0)';
  };
  return (
    <span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn('inline-flex transition-transform duration-300 ease-rc will-change-transform', className)}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* WordReveal — words light up as the block scrolls through the viewport     */
/* -------------------------------------------------------------------------- */

export function WordReveal({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [lit, setLit] = useState(0);
  const words = text.split(' ');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // progress 0 when block top hits 85% of viewport, 1 when bottom reaches 45%
      const start = vh * 0.85;
      const end = vh * 0.45;
      const p = (start - r.top) / (start - end + r.height);
      const clamped = Math.max(0, Math.min(1, p));
      setLit(Math.round(clamped * words.length));
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
  }, [words.length]);

  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={i} className={cn('reveal-word', i < lit && 'is-lit')}>
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </p>
  );
}

/* -------------------------------------------------------------------------- */
/* TypedLines — terminal output that types itself once visible              */
/* -------------------------------------------------------------------------- */

export function TypedLines({
  lines,
  className,
  lineClassName,
  speed = 14,
}: {
  lines: { text: string; className?: string }[];
  className?: string;
  lineClassName?: string;
  speed?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [chars, setChars] = useState(0);
  const total = lines.reduce((n, l) => n + l.text.length, 0);

  useEffect(() => {
    if (!inView) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setChars(total);
      return;
    }
    const id = setInterval(() => {
      setChars((c) => {
        if (c >= total) {
          clearInterval(id);
          return c;
        }
        return c + 2;
      });
    }, speed);
    return () => clearInterval(id);
  }, [inView, total, speed]);

  // Index of the line currently being typed (caret position).
  let acc = 0;
  let current = lines.length - 1;
  for (let i = 0; i < lines.length; i++) {
    acc += lines[i].text.length;
    if (chars < acc) {
      current = i;
      break;
    }
  }

  let start = 0;
  return (
    <div ref={ref} className={className}>
      {lines.map((l, i) => {
        const shown = Math.max(0, Math.min(l.text.length, chars - start));
        start += l.text.length;
        if (i > current) {
          return (
            <div key={i} className={cn(lineClassName, 'opacity-0')} aria-hidden>
              {l.text || ' '}
            </div>
          );
        }
        return (
          <div key={i} className={cn(lineClassName, l.className, i === current && 'blink-caret')}>
            {l.text.slice(0, shown)}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* CountUp — numeric counter that animates when visible                      */
/* -------------------------------------------------------------------------- */

export function CountUp({ to, duration = 1200, suffix = '', className }: { to: number; duration?: number; suffix?: string; className?: string }) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return (
    <span ref={ref} className={className}>
      {v}
      {suffix}
    </span>
  );
}
