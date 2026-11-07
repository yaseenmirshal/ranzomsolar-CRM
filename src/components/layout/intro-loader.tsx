"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { BrandLogo } from "@/components/shared/brand-logo";

/** Short logo reveal shown once per browser session (~1s). */
export function IntroLoader() {
  const [show, setShow] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem("ranzom-intro") || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    sessionStorage.setItem("ranzom-intro", "1");
    setShow(true);
  }, []);

  useEffect(() => {
    if (!show || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.timeline({ onComplete: () => setShow(false) })
        .from("[data-logo]", { opacity: 0, y: 10, scale: 0.96, duration: 0.45, ease: "power2.out" })
        .from("[data-bar]", { scaleX: 0, duration: 0.5, ease: "power1.inOut" }, "<0.1")
        .to(root.current, { opacity: 0, duration: 0.3, ease: "power1.in" }, "+=0.15");
    }, root);
    return () => ctx.revert();
  }, [show]);

  if (!show) return null;
  return (
    <div ref={root} className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-[#0b1724]" aria-hidden>
      <div data-logo><BrandLogo /></div>
      <div className="h-[2px] w-40 overflow-hidden rounded-full bg-white/10"><div data-bar className="h-full origin-left bg-brand" /></div>
    </div>
  );
}
