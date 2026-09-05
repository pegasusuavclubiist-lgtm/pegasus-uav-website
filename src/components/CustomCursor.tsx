"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "@/lib/gsap";

export type CursorMode = "default" | "video" | "project" | "hover" | "drone";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [cursorMode, setCursorMode] = useState<CursorMode>("default");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on desktop fine pointer devices
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const cursor = cursorRef.current;
    if (!cursor) return;

    // Use gsap.quickTo for instant, 60fps tracking without layout recalculation
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.15, ease: "power2.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.15, ease: "power2.out" });

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      xTo(e.clientX);
      yTo(e.clientY);

      // Check hovered element for data-cursor attributes
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const cursorTarget = target.closest("[data-cursor]") as HTMLElement | null;
      if (cursorTarget) {
        const mode = cursorTarget.getAttribute("data-cursor") as CursorMode;
        if (mode === "video" || mode === "project" || mode === "hover" || mode === "drone") {
          setCursorMode(mode);
          return;
        }
      }

      // Check interactive elements (buttons, links)
      if (target.closest("a, button, [role='button']")) {
        setCursorMode("hover");
        return;
      }

      setCursorMode("default");
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isVisible]);

  // Mode specific styling & animations
  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className={`custom-cursor-element fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {cursorMode === "default" && (
        <div className="relative flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-[#e2f952] shadow-[0_0_12px_rgba(226,249,82,0.8)]" />
          <div className="absolute w-8 h-8 rounded-full border border-white/30 animate-ping opacity-30" />
        </div>
      )}

      {cursorMode === "hover" && (
        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-[#e2f952] bg-[#e2f952]/10 backdrop-blur-[1px] transition-transform duration-200 scale-125">
          <div className="w-1.5 h-1.5 rounded-full bg-[#e2f952]" />
        </div>
      )}

      {cursorMode === "drone" && (
        <div className="relative flex items-center justify-center w-8 h-8">
          <div className="absolute inset-0 border border-[#e2f952]/50 rounded-full animate-spin [animation-duration:12s]" />
          <div className="absolute w-full h-[1px] bg-[#e2f952]/40" />
          <div className="absolute h-full w-[1px] bg-[#e2f952]/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#e2f952] shadow-[0_0_6px_#e2f952]" />
        </div>
      )}

      {cursorMode === "video" && (
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-[#e2f952] text-black font-mono font-bold text-xs tracking-widest uppercase shadow-[0_0_30px_rgba(226,249,82,0.4)] animate-in fade-in zoom-in-75 duration-200">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            PLAY
          </span>
        </div>
      )}

      {cursorMode === "project" && (
        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#e2f952] text-black font-mono font-bold text-xs tracking-wider uppercase shadow-[0_0_25px_rgba(226,249,82,0.4)] animate-in fade-in zoom-in-75 duration-200">
          <span>VIEW</span>
          <span className="text-base leading-none">→</span>
        </div>
      )}
    </div>
  );
}
