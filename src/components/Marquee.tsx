"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap, { ScrollTrigger } from "@/lib/gsap";

interface MarqueeProps {
  text?: string;
  outline?: boolean;
  reverse?: boolean;
}

export default function Marquee({
  text = "INNOVATE. BUILD. FLY.",
  outline = false,
  reverse = false,
}: MarqueeProps) {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;

      // Base infinite horizontal ticker animation
      const direction = reverse ? 1 : -1;
      const tween = gsap.to(track, {
        xPercent: direction * 50,
        repeat: -1,
        duration: 18,
        ease: "none",
      });

      // Tie ScrollTrigger velocity to marquee timeScale
      let clampTimeScale: ReturnType<typeof gsap.quickTo> | null = null;
      try {
        clampTimeScale = gsap.quickTo(tween, "timeScale", {
          duration: 0.5,
          ease: "power2.out",
        });
      } catch {
        // fallback
      }

      ScrollTrigger.create({
        trigger: marqueeRef.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const velocity = self.getVelocity() / 300;
          const targetScale = Math.max(0.5, Math.min(6, 1 + Math.abs(velocity)));
          if (clampTimeScale) {
            clampTimeScale(targetScale * (self.direction === -1 ? -1 : 1));
          } else {
            tween.timeScale(targetScale * (self.direction === -1 ? -1 : 1));
          }
        },
      });
    },
    { scope: marqueeRef }
  );

  // Duplicate items 6 times to ensure seamless infinite looping
  const items = Array.from({ length: 6 });

  return (
    <div
      ref={marqueeRef}
      className="relative w-full overflow-hidden py-4 md:py-6 border-y border-white/15 bg-black select-none pointer-events-none"
    >
      <div
        ref={trackRef}
        className="flex whitespace-nowrap will-change-transform w-fit"
      >
        {items.map((_, i) => (
          <div key={i} className="flex items-center">
            <span
              className={`text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter px-6 ${
                outline ? "text-stroke-white" : "text-white"
              }`}
            >
              {text}
            </span>
            <span className="text-[#e2f952] text-2xl md:text-4xl font-mono mx-4">
              ✦
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
