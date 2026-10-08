"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "@/lib/gsap";
import { siteData } from "@/data/data";

export default function Team() {
  const { team, teamPage } = siteData;
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".cadre-wing-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="team"
      className="relative w-full bg-black text-white py-24 md:py-36 border-b border-white/15"
    >
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="border-b border-white/15 pb-8 mb-16 md:mb-20">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs md:text-sm uppercase tracking-widest text-[#e2f952]">
              [ {team.sectionNumber} ]
            </span>
            <span className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest">
              FLIGHT CREW // PERSONNEL ROSTER
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter">
                {team.headline}
              </h2>
              <span className="font-mono text-xs sm:text-sm uppercase tracking-widest text-[#e2f952] mt-2 block">
                {"// "}{team.subheadline}
              </span>
            </div>

            <p className="max-w-xl text-neutral-400 text-sm md:text-base leading-relaxed font-light">
              {team.description}
            </p>
          </div>

          {/* Quick Metrics HUD */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
            {team.stats.map((stat) => (
              <div
                key={stat.label}
                className="p-5 bg-neutral-950 border border-white/10 font-mono relative overflow-hidden"
              >
                <span className="absolute top-2 right-2 text-[10px] text-neutral-600">
                  [ METRIC ]
                </span>
                <span className="text-[11px] text-neutral-500 uppercase tracking-widest block">
                  {stat.label}
                </span>
                <span className="text-3xl font-extrabold text-white mt-2 block">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Subsystem Divisions Grid */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-mono text-xs sm:text-sm uppercase tracking-widest text-neutral-400">
              [ SUBSYSTEM DIVISIONS // CADRE ARCHITECTURE ]
            </h3>
            <span className="font-mono text-[11px] text-[#e2f952] uppercase tracking-widest hidden sm:inline">
              IIST VALIAMALA AUTONOMY WINGS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.cadreWings.map((wing) => (
              <div
                key={wing.code}
                className="cadre-wing-card group relative p-6 md:p-8 bg-neutral-950 border border-white/15 hover:border-[#e2f952] hover:bg-white/[0.02] transition-all duration-300 flex flex-col justify-between"
              >
                {/* Corner Reticle Ticks */}
                <span className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />
                <span className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />
                <span className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />
                <span className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs text-[#e2f952] bg-white/[0.04] border border-white/10 px-2.5 py-1">
                      [ {wing.code} ]
                    </span>
                    <span className="font-mono text-[10px] text-neutral-600 group-hover:text-neutral-400 transition-colors">
                      STATUS // ACTIVE
                    </span>
                  </div>

                  <h4 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-white group-hover:text-[#e2f952] transition-colors">
                    {wing.title}
                  </h4>
                  <p className="mt-1 font-mono text-xs uppercase tracking-wider text-neutral-400">
                    {wing.role}
                  </p>
                  <p className="mt-4 text-xs text-neutral-400 leading-relaxed font-light">
                    {wing.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between font-mono text-[10px] text-neutral-500">
                  <span>IIST CADRE WING</span>
                  <span className="group-hover:text-[#e2f952] transition-colors">
                    ACTIVE ↗
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dedicated Team Page CTA Banner */}
        <div className="relative p-8 md:p-14 bg-neutral-950 border-2 border-white/20 hover:border-[#e2f952] transition-colors overflow-hidden">
          {/* Aerospace reticle styling */}
          <span className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#e2f952]" />
          <span className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#e2f952]" />
          <span className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#e2f952]" />
          <span className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#e2f952]" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-[#e2f952] mb-3">
                <span className="w-2 h-2 rounded-full bg-[#e2f952] animate-ping" />
                <span>[ {teamPage.directoryCode} ]</span>
              </div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
                MEET THE COMPLETE STUDENT CADRE
              </h3>
              <p className="mt-3 text-neutral-400 text-sm sm:text-base font-light leading-relaxed">
                Explore the complete personnel roster of student flight controllers, autonomy leads, avionics engineers, and subsystem specialists driving unmanned aviation at IIST.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
              <Link
                href={team.ctaHref}
                className="px-8 py-5 bg-[#e2f952] text-black font-mono text-xs sm:text-sm font-bold uppercase tracking-widest hover:bg-white hover:shadow-[0_0_30px_rgba(226,249,82,0.4)] transition-all flex items-center justify-center gap-3 text-center"
              >
                <span>{team.ctaLabel}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
