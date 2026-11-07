"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

/** Animated numeric counter (GSAP). Falls back to the final value for reduced motion. */
export function CountUp({ value, format }: { value: number; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = format ?? ((n: number) => Math.round(n).toLocaleString("en-IN"));
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = fmt(value); return; }
    const state = { n: 0 };
    const tween = gsap.to(state, { n: value, duration: 0.9, ease: "power2.out", onUpdate: () => { el.textContent = fmt(state.n); } });
    return () => { tween.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <span ref={ref}>{fmt(value)}</span>;
}
