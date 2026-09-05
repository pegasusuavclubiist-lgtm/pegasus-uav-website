"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "@/lib/gsap";
import { siteData } from "@/data/data";
import HeroQuadcopter from "@/components/HeroQuadcopter";

export default function Hero() {
  const { hero } = siteData;
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Cinematic text reveal animation for Hero content
      const headlineWords = headlineRef.current?.querySelectorAll(".reveal-item");
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(
        eyebrowRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.2 }
      );

      if (headlineWords && headlineWords.length > 0) {
        tl.fromTo(
          headlineWords,
          { y: "115%", rotate: 2, opacity: 0 },
          {
            y: "0%",
            rotate: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.1,
          },
          "-=0.5"
        );
      }

      tl.fromTo(
        descRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.9 },
        "-=0.7"
      );

      tl.fromTo(
        statsRef.current?.children || [],
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },
        "-=0.6"
      );
    });

  // Split headline words for cinematic staggered reveal
  const headlineWords = hero.headline.split(" ");

  return (
    <section
      ref={containerRef}
      id="hero"
      data-cursor="drone"
      className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-black text-white pt-24 pb-8"
    >
      {/* Tactical Aerospace Flight Grid Backdrop */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Subtle coordinate grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-25" />

        {/* Tactical radar rings & flight path crosshairs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/[0.04] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full border border-white/[0.03] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1600px] h-[1600px] rounded-full border border-white/[0.02] pointer-events-none" />

        {/* Ambient aerospace glow */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#e2f952]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#00f0ff]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Vignette gradients for extreme contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
      </div>

      {/* Interactive Cursor-Following Quadcopter Drone */}
      <HeroQuadcopter />

      {/* Top telemetry & Eyebrow */}
      <div className="relative z-10 max-w-[1800px] mx-auto w-full px-6 md:px-12 flex flex-col gap-3 pointer-events-none">
        <div
          ref={eyebrowRef}
          className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-[#e2f952]"
        >
          <span className="w-1.5 h-1.5 bg-[#e2f952] rounded-full animate-pulse" />
          <span>{hero.eyebrow}</span>
        </div>
      </div>

      {/* Massive Brutalist Headline & Description */}
      <div className="relative z-10 max-w-[1800px] mx-auto w-full px-6 md:px-12 my-auto py-12 pointer-events-none">
        <div className="max-w-4xl">
          <h1
            ref={headlineRef}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold uppercase tracking-tighter leading-[0.88] select-none"
          >
            {headlineWords.map((word, index) => (
              <span
                key={index}
                className="inline-block overflow-hidden mr-3 md:mr-6"
              >
                <span className="reveal-item inline-block will-change-transform">
                  {word}
                </span>
              </span>
            ))}
          </h1>

          <div className="mt-8 max-w-2xl">
            <p
              ref={descRef}
              className="text-base sm:text-lg md:text-xl text-neutral-300 font-normal leading-relaxed border-l-2 border-[#e2f952] pl-4 will-change-transform"
            >
              {hero.description}
            </p>
          </div>
        </div>
      </div>

      {/* Monospace Brutalist Stats Grid anchored at bottom */}
      <div className="relative z-10 max-w-[1800px] mx-auto w-full px-6 md:px-12">
        <div
          ref={statsRef}
          className="grid grid-cols-1 md:grid-cols-3 border border-white/20 bg-black/60 backdrop-blur-md divide-y md:divide-y-0 md:divide-x divide-white/20"
        >
          {hero.stats.map((stat, i) => (
            <div
              key={stat.label}
              className="p-4 md:p-6 flex flex-col justify-between group hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center justify-between text-neutral-400 font-mono text-[11px] uppercase tracking-widest mb-2">
                <span>{stat.label}</span>
                <span className="text-neutral-600">[ 0{i + 1} ]</span>
              </div>
              <div className="font-mono text-2xl md:text-3xl font-bold tracking-tight text-white group-hover:text-[#e2f952] transition-colors">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
