"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap, { ScrollTrigger } from "@/lib/gsap";
import { siteData } from "@/data/data";

export default function Mission() {
  const { mission } = siteData;
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Reveal header and mission texts
      gsap.fromTo(
        contentRef.current?.children || [],
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        }
      );

      // Reveal feature grid items with stagger
      const cards = featuresRef.current?.querySelectorAll(".feature-card");
      if (cards && cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: featuresRef.current,
              start: "top 80%",
            },
          }
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative w-full bg-black text-white py-24 md:py-36 border-b border-white/15"
    >
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        {/* Section Header with [ 01 ] Numbering */}
        <div className="pb-8 mb-12">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs md:text-sm uppercase tracking-widest text-[#e2f952]">
              [ {mission.sectionNumber} ]
            </span>
            <span className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest">
              {mission.divisionCode}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-[#e2f952] mb-2">
                // AEROSPACE RESEARCH &amp; AUTONOMY
              </p>
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
                {mission.headline}
              </h2>
            </div>
            <div className="flex flex-col md:items-end">
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                {mission.subtitle}
              </span>
              <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest mt-1">
                {mission.institutionTag}
              </span>
            </div>
          </div>
        </div>

        {/* Symmetrical 2-Column Grid: Image & Justified Text (Clean & Borderless) */}
        <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-24 items-start">
          {/* Symmetrical Left Column: IIST Campus Imagery */}
          <div className="flex flex-col">
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-neutral-950">
              <Image
                src={mission.campusImageUrl}
                alt={mission.campusCaption}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out hover:scale-105"
                priority
              />
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] text-neutral-400 mt-3">
              <span className="truncate">{mission.campusCaption}</span>
              <span className="text-[#e2f952] shrink-0 ml-2">{mission.campusTag}</span>
            </div>
          </div>

          {/* Symmetrical Right Column: Vision & About Texts (Justified) */}
          <div className="flex flex-col justify-between h-full gap-8">
            {/* Vision Block */}
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#e2f952] block mb-3">
                // {mission.visionTitle}
              </span>
              <p className="text-base sm:text-lg md:text-xl text-neutral-200 leading-relaxed font-light text-justify hyphens-auto">
                {mission.visionText}
              </p>
            </div>

            {/* About IIST Block */}
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 block mb-3">
                // {mission.aboutTitle}
              </span>
              <p className="text-sm md:text-base text-neutral-400 leading-relaxed font-normal text-justify hyphens-auto">
                {mission.aboutText}
              </p>
            </div>
          </div>
        </div>

        {/* Stark Border-Separated 4-Column Feature Grid (Brutalist Tables) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
              [ CORE CAPABILITIES & DOMAINS ]
            </span>
            <span className="font-mono text-xs text-[#e2f952]">
              {mission.features.length} ACTIVE MODULES
            </span>
          </div>

          <div
            ref={featuresRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-white/20 divide-y md:divide-y-0 md:divide-x divide-white/20 bg-white/[0.01]"
          >
            {mission.features.map((feat, index) => (
              <div
                key={feat.id}
                className="feature-card p-6 md:p-8 flex flex-col justify-between group hover:bg-white/[0.04] transition-colors relative"
              >
                {/* Corner crosshairs marker */}
                <div className="font-mono text-[10px] text-neutral-600 absolute top-2 right-3 group-hover:text-[#e2f952] transition-colors">
                  +
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-6">
                    <span className="font-mono text-sm font-bold text-[#e2f952] tracking-wider px-2 py-0.5 border border-[#e2f952]/40 bg-[#e2f952]/5">
                      {feat.id}
                    </span>
                    <span className="font-mono text-xs text-neutral-600">
                      [ 0{index + 1} ]
                    </span>
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-3 group-hover:text-[#e2f952] transition-colors">
                    {feat.title}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal mt-6 border-t border-white/10 pt-4">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
