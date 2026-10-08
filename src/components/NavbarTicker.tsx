"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap, { ScrollTrigger } from "@/lib/gsap";
import { siteData } from "@/data/data";
import {
  fetchMarqueeTickerItems,
  MarqueeTickerItem,
  TICKER_CHANGE_EVENT,
} from "@/lib/supabase/updates";

export default function NavbarTicker() {
  const { navbarTicker } = siteData;
  const tickerContainerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const [tickerItems, setTickerItems] = useState<MarqueeTickerItem[]>([
    {
      id: "init",
      badge: navbarTicker.badge,
      highlight: navbarTicker.highlight,
      subtext: navbarTicker.subtext,
      date: navbarTicker.date,
      href: navbarTicker.href || "#join",
    },
  ]);

  // Load live ticker items from Supabase & Admin cache
  useEffect(() => {
    let isMounted = true;
    const loadItems = async () => {
      try {
        const liveItems = await fetchMarqueeTickerItems();
        if (isMounted && liveItems.length > 0) {
          setTickerItems(liveItems);
        }
      } catch (err) {
        console.error("Failed to load marquee ticker items:", err);
      }
    };

    loadItems();

    const handleTickerChange = () => {
      loadItems();
    };

    window.addEventListener(TICKER_CHANGE_EVENT, handleTickerChange);
    window.addEventListener("storage", handleTickerChange);

    return () => {
      isMounted = false;
      window.removeEventListener(TICKER_CHANGE_EVENT, handleTickerChange);
      window.removeEventListener("storage", handleTickerChange);
    };
  }, []);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
        },
        (context) => {
          const { isMobile } = context.conditions as { isMobile: boolean };
          const duration = isMobile ? 20 : 28;

          // Infinite smooth horizontal ticker animation
          const tween = gsap.to(track, {
            xPercent: -50,
            repeat: -1,
            duration: duration,
            ease: "none",
          });
          tweenRef.current = tween;

          // Velocity dynamic response on scroll
          let clampTimeScale: ReturnType<typeof gsap.quickTo> | null = null;
          try {
            clampTimeScale = gsap.quickTo(tween, "timeScale", {
              duration: 0.35,
              ease: "power2.out",
            });
          } catch {
            // fallback if quickTo not available
          }

          ScrollTrigger.create({
            start: "top top",
            end: "max",
            onUpdate: (self) => {
              const velocity = Math.abs(self.getVelocity()) / 300;
              const targetScale = Math.max(1, Math.min(4.5, 1 + velocity));
              if (clampTimeScale) {
                clampTimeScale(targetScale);
              } else {
                tween.timeScale(targetScale);
              }
            },
          });
        }
      );

      return () => mm.revert();
    },
    { scope: tickerContainerRef, dependencies: [tickerItems] }
  );

  const handleMouseEnter = () => {
    if (tweenRef.current) {
      gsap.to(tweenRef.current, { timeScale: 0.2, duration: 0.25 });
    }
  };

  const handleMouseLeave = () => {
    if (tweenRef.current) {
      gsap.to(tweenRef.current, { timeScale: 1, duration: 0.25 });
    }
  };

  // Replicate array to fill marquee seamlessly
  const repeatMultiplier = Math.max(2, Math.ceil(8 / tickerItems.length));
  const renderedItems = Array.from({ length: repeatMultiplier }).flatMap(
    () => tickerItems
  );

  const currentBadge = tickerItems[0]?.badge || navbarTicker.badge;

  return (
    <aside
      ref={tickerContainerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Event Announcement Ticker"
      className="relative w-full h-8 bg-neutral-950/95 backdrop-blur-md border-t border-white/10 border-b border-[#e2f952]/25 flex items-center overflow-hidden z-30 select-none"
    >
      {/* Pinned Tactical Telemetry Badge */}
      <div className="relative z-20 flex items-center gap-2 px-3 sm:px-4 h-full bg-black/95 border-r border-white/15 text-[#e2f952] font-mono text-[9px] sm:text-[10px] tracking-widest uppercase flex-shrink-0 shadow-lg">
        <span className="w-1.5 h-1.5 rounded-full bg-[#e2f952] animate-pulse flex-shrink-0 shadow-[0_0_8px_#e2f952]" />
        <span className="font-bold">{currentBadge}</span>
      </div>

      {/* Cinematic Gradient Edge Masks */}
      <div className="pointer-events-none absolute left-[120px] sm:left-[170px] top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-neutral-950 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-neutral-950 to-transparent z-10" />

      {/* Scrolling Marquee Track */}
      <div className="relative flex-1 overflow-hidden h-full flex items-center">
        <div
          ref={trackRef}
          className="flex whitespace-nowrap will-change-transform w-fit"
        >
          {renderedItems.map((item, i) => (
            <Link
              key={`${item.id}-${i}`}
              href={item.href || "#join"}
              className="group flex items-center font-mono text-[10px] sm:text-[11px] md:text-xs tracking-wider uppercase text-neutral-300 hover:text-white px-5 sm:px-8 cursor-pointer"
            >
              {item.highlight && (
                <span className="text-[#e2f952] font-extrabold group-hover:underline mr-2">
                  {item.highlight}
                </span>
              )}
              <span className="text-neutral-200 group-hover:text-white">
                {item.subtext}
              </span>
              <span className="text-[#e2f952] text-xs font-mono ml-5 sm:ml-8 opacity-70 group-hover:opacity-100">
                ✦
              </span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

