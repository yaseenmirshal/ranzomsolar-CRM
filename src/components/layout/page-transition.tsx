"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";

/** Subtle route-change fade/translate using GSAP (opacity + transform only; respects reduced motion). */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tween = gsap.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.28, ease: "power2.out", clearProps: "transform,opacity" });
    return () => { tween.kill(); };
  }, [pathname]);
  return <div ref={ref}>{children}</div>;
}
