"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
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

        {/* Symmetrical 2-Column Grid: Image & Justified Text */}
        <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-20 items-start">
          {/* Symmetrical Left Column: Pegasus Imagery & Parent Institution Card */}
          <div className="flex flex-col gap-6">
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-neutral-950 border border-white/15">
              <Image
                src={mission.campusImageUrl}
                alt={mission.campusCaption}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-8 transition-transform duration-700 ease-out hover:scale-105"
                priority
              />
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] text-neutral-400">
              <span className="truncate">{mission.campusCaption}</span>
              <span className="text-[#e2f952] shrink-0 ml-2">{mission.campusTag}</span>
            </div>

            {/* Parent Institution Card linking to /about-iist */}
            <div className="p-6 border border-white/15 bg-neutral-950/80 relative group hover:border-[#e2f952] transition-colors">
              <div className="flex items-center justify-between mb-2 font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                <span>[ {mission.iistCardTitle} ]</span>
                <span className="text-[#e2f952]">ISRO COLLABORATION</span>
              </div>
              <h4 className="text-lg font-bold text-white uppercase tracking-tight mb-2">
                {mission.iistCardSubtitle}
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed font-normal mb-4">
                {mission.iistCardDescription}
              </p>
              <Link
                href={mission.iistCardHref}
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#e2f952] hover:underline font-semibold"
              >
                <span>{mission.iistCardCta}</span>
                <span>↗</span>
              </Link>
            </div>
          </div>

          {/* Symmetrical Right Column: Vision & About Pegasus Texts */}
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

            {/* About PEGASUS Block */}
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#e2f952] block mb-3">
                // {mission.aboutTitle}
              </span>
              <p className="text-sm md:text-base text-neutral-300 leading-relaxed font-normal text-justify hyphens-auto">
                {mission.aboutText}
              </p>
            </div>

            {/* Mini Telemetry Highlights */}

          </div>
        </div>

        {/* Stark Border-Separated 4-Column Feature Grid (Brutalist Tables) */}

      </div>
    </section>
  );
}

