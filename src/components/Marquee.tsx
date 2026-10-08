"use client";

import React, { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap, { ScrollTrigger } from "@/lib/gsap";
import { siteData } from "@/data/data";
import {
  fetchMarqueeTickerItems,
  MarqueeTickerItem,
  TICKER_CHANGE_EVENT,
} from "@/lib/supabase/updates";

interface MarqueeProps {
  text?: string;
  outline?: boolean;
  reverse?: boolean;
  useLiveUpdates?: boolean;
}

export default function Marquee({
  text = siteData.marquee?.defaultText || "INNOVATE. BUILD. FLY.",
  outline = false,
  reverse = false,
  useLiveUpdates = true,
}: MarqueeProps) {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [tickerPhrases, setTickerPhrases] = useState<string[]>([text]);

  useEffect(() => {
    if (!useLiveUpdates) {
      setTickerPhrases([text]);
      return;
    }

    let isMounted = true;
    const loadLivePhrases = async () => {
      try {
        const items: MarqueeTickerItem[] = await fetchMarqueeTickerItems();
        if (!isMounted) return;

        const liveDispatches = items
          .filter((it) => it.subtext && it.subtext.trim().length > 0)
          .map((it) => {
            const highlight = it.highlight ? `${it.highlight} ` : "";
            return `${highlight}${it.subtext}`;
          });

        if (liveDispatches.length > 0) {
          // Interleave club mottos with live dispatches
          const phrases: string[] = [];
          phrases.push(siteData.marquee?.defaultText || "INNOVATE. BUILD. FLY.");
          phrases.push(`[LIVE UPDATE] ${liveDispatches[0]}`);
          phrases.push(siteData.marquee?.secondaryText || "AUTONOMY AT ALTITUDE");

          if (liveDispatches.length > 1) {
            phrases.push(`[DISPATCH] ${liveDispatches[1]}`);
          }
          if (liveDispatches.length > 2) {
            phrases.push(`[BULLETIN] ${liveDispatches[2]}`);
          }

          setTickerPhrases(phrases);
        } else {
          setTickerPhrases([
            text,
            siteData.marquee?.secondaryText || "AUTONOMY AT ALTITUDE",
            siteData.marquee?.cadreText || "PEGASUS UAV CLUB · IIST",
          ]);
        }
      } catch (err) {
        console.error("Failed to load marquee live updates:", err);
        if (isMounted) setTickerPhrases([text]);
      }
    };

    loadLivePhrases();

    const handleUpdate = () => {
      loadLivePhrases();
    };

    window.addEventListener(TICKER_CHANGE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener(TICKER_CHANGE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [useLiveUpdates, text]);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;

      // Base infinite horizontal ticker animation
      const direction = reverse ? 1 : -1;
      const tween = gsap.to(track, {
        xPercent: direction * 50,
        repeat: -1,
        duration: 22,
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
    { scope: marqueeRef, dependencies: [tickerPhrases, reverse] }
  );

  // Duplicate phrases to ensure seamless infinite looping
  const repeatMultiplier = Math.max(2, Math.ceil(6 / tickerPhrases.length));
  const renderedPhrases = Array.from({ length: repeatMultiplier }).flatMap(
    () => tickerPhrases
  );

  return (
    <div
      ref={marqueeRef}
      className="relative w-full overflow-hidden py-4 md:py-6 border-y border-white/15 bg-black select-none pointer-events-none"
    >
      <div
        ref={trackRef}
        className="flex whitespace-nowrap will-change-transform w-fit"
      >
        {renderedPhrases.map((phrase, i) => (
          <div key={`${phrase}-${i}`} className="flex items-center">
            <span
              className={`text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter px-6 ${
                outline ? "text-stroke-white" : "text-white"
              }`}
            >
              {phrase}
            </span>
            <span className="text-[#e2f952] text-xl md:text-3xl font-mono mx-4">
              ✦
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

