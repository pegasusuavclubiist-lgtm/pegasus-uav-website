"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "@/lib/gsap";
import { siteData } from "@/data/data";
import NavbarTicker from "@/components/NavbarTicker";
import Footer from "@/components/Footer";

export default function AboutIistPage() {
  const { aboutIist } = siteData;
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Reveal blocks on scroll
      const blocks = gsap.utils.toArray<HTMLElement>(".iist-reveal-block");
      blocks.forEach((block) => {
        gsap.fromTo(
          block,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: block,
              start: "top 85%",
            },
          }
        );
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-black text-white selection:bg-[#e2f952] selection:text-black font-sans"
    >
      {/* Background Reticle Grid */}
      <div className="fixed inset-0 z-0 bg-grid-pattern opacity-10 pointer-events-none" />

      {/* ================= STICKY TACTICAL HEADER ================= */}
      <header className="sticky top-0 z-40 w-full bg-black/90 backdrop-blur-md border-b border-white/15">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#e2f952] hover:text-white px-3 py-1.5 border border-[#e2f952]/40 bg-[#e2f952]/5 hover:bg-[#e2f952]/15 transition-all"
            >
              <span>←</span>
              <span>{aboutIist.returnCta}</span>
            </Link>

            <span className="hidden md:inline font-mono text-xs text-neutral-500 uppercase tracking-widest">
              [ {aboutIist.campusTag} ]
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/constitution"
              className="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-neutral-300 hover:text-white px-3 py-1.5 border border-white/20 hover:border-white transition-colors"
            >
              <span>PEGASUS CHARTER</span>
              <span>↗</span>
            </Link>

            <Link
              href="/team"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-semibold text-black bg-[#e2f952] hover:bg-[#cbe33e] px-3.5 py-1.5 transition-colors border border-[#e2f952]"
            >
              <span>CADRE ROSTER</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Global Live Navbar Ticker */}
        <NavbarTicker />
      </header>

      <main className="relative z-10">
        {/* ================= HERO SECTION ================= */}
        <section className="relative w-full border-b border-white/15 pt-16 md:pt-24 pb-16 overflow-hidden">
          <div className="max-w-[1800px] mx-auto px-6 md:px-12">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-[#e2f952]">
                <span className="w-2 h-2 rounded-full bg-[#e2f952] animate-pulse" />
                <span>[ {aboutIist.sectionNumber} ]</span>
              </div>
              <span className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest">
                ISRO RESEARCH NODE // DEPT OF SPACE
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] max-w-5xl mb-6">
              {aboutIist.headline}
            </h1>

            <p className="font-mono text-xs sm:text-sm md:text-base text-neutral-400 max-w-3xl leading-relaxed uppercase mb-12">
              {aboutIist.subheadline}
            </p>

            {/* Brutalist 4-Item Telemetry Matrix */}
            <div className="grid grid-cols-2 md:grid-cols-4 border border-white/20 divide-y md:divide-y-0 md:divide-x divide-white/20 bg-white/[0.02]">
              {aboutIist.stats.map((stat, idx) => (
                <div key={idx} className="p-6 md:p-8 flex flex-col justify-between">
                  <span className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest mb-2 block">
                    // {stat.label}
                  </span>
                  <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#e2f952]">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CAMPUS IMAGERY ================= */}
        <section className="iist-reveal-block relative w-full border-b border-white/15 bg-neutral-950 py-12 md:py-20">
          <div className="max-w-[1800px] mx-auto px-6 md:px-12">
            <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden border border-white/20 bg-black">
              <Image
                src={aboutIist.campusImageUrl}
                alt={aboutIist.campusCaption}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 font-mono text-[11px] sm:text-xs text-white bg-black/80 px-3 sm:px-4 py-2 border border-white/20">
                <span className="text-[#e2f952] font-bold mr-2">VALIAMALA CAMPUS:</span>
                <span>{aboutIist.campusCaption}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= GENESIS & ISRO SYNERGY ================= */}
        <section className="iist-reveal-block relative w-full border-b border-white/15 py-20 md:py-28">
          <div className="max-w-[1800px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              {/* Left Column: Genesis & Pegasus Affiliation */}
              <div className="space-y-12">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-[#e2f952]" />
                    <span className="font-mono text-xs uppercase tracking-widest text-[#e2f952]">
                      // {aboutIist.genesisTitle}
                    </span>
                  </div>
                  <p className="text-base sm:text-lg text-neutral-200 leading-relaxed font-light text-justify">
                    {aboutIist.genesisText}
                  </p>
                </div>

                <div className="p-8 border border-white/15 bg-neutral-950 relative">
                  <span className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-[#e2f952]" />
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-[#e2f952]" />
                  <span className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-[#e2f952]" />
                  <span className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-[#e2f952]" />

                  <span className="font-mono text-xs uppercase tracking-widest text-[#e2f952] block mb-3">
                    // {aboutIist.pegasusTiesTitle}
                  </span>
                  <p className="text-sm md:text-base text-neutral-300 leading-relaxed font-normal text-justify">
                    {aboutIist.pegasusTiesText}
                  </p>
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between font-mono text-xs">
                    <span className="text-neutral-500">PARENT INSTITUTE AEGIS</span>
                    <Link
                      href="/"
                      className="text-[#e2f952] hover:underline uppercase flex items-center gap-1"
                    >
                      <span>EXPLORE PEGASUS BUILDS</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column: ISRO Synergy & Centers Table */}
              <div className="space-y-10">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-[#e2f952]" />
                    <span className="font-mono text-xs uppercase tracking-widest text-[#e2f952]">
                      // {aboutIist.isroSynergyTitle}
                    </span>
                  </div>
                  <p className="text-base sm:text-lg text-neutral-200 leading-relaxed font-light text-justify">
                    {aboutIist.isroSynergyText}
                  </p>
                </div>


              </div>
            </div>
          </div>
        </section>


      </main>

      <Footer />
    </div>
  );
}
