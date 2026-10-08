"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap, { ScrollTrigger } from "@/lib/gsap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteData, ProjectDetail } from "@/data/data";

interface ProjectDetailViewProps {
  project: ProjectDetail;
  nextProject?: {
    slug: string;
    title: string;
    code: string;
    coverImageUrl: string;
  } | null;
}

export default function ProjectDetailView({
  project,
  nextProject,
}: ProjectDetailViewProps) {
  const { projectPageUi } = siteData;
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const avionicsRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const logsRef = useRef<HTMLDivElement>(null);
  const weeklyRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        // Hero headline reveal
        gsap.fromTo(
          heroRef.current?.querySelectorAll(".hero-stagger") || [],
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.08,
            ease: "power3.out",
          }
        );

        // Media Parallax Scrub
        const mediaImg = mediaRef.current?.querySelector(".project-hero-img");
        if (mediaImg) {
          gsap.fromTo(
            mediaImg,
            { scale: 1.15, yPercent: -4 },
            {
              scale: 1.0,
              yPercent: 4,
              ease: "none",
              scrollTrigger: {
                trigger: mediaRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        }

        // Stats section reveal
        if (statsRef.current) {
          gsap.fromTo(
            statsRef.current.querySelectorAll(".stat-box") || [],
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.07,
              ease: "power2.out",
              scrollTrigger: {
                trigger: statsRef.current,
                start: "top 85%",
              },
            }
          );
        }

        // Avionics rows reveal
        if (avionicsRef.current) {
          gsap.fromTo(
            avionicsRef.current.querySelectorAll(".avionics-row") || [],
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.06,
              ease: "power2.out",
              scrollTrigger: {
                trigger: avionicsRef.current,
                start: "top 80%",
              },
            }
          );
        }

        // Mission objectives reveal
        if (missionRef.current) {
          gsap.fromTo(
            missionRef.current.querySelectorAll(".mission-card") || [],
            { opacity: 0, y: 25 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.08,
              ease: "power2.out",
              scrollTrigger: {
                trigger: missionRef.current,
                start: "top 80%",
              },
            }
          );
        }

        // Flight logs reveal
        if (logsRef.current) {
          gsap.fromTo(
            logsRef.current.querySelectorAll(".log-row") || [],
            { opacity: 0, x: -15 },
            {
              opacity: 1,
              x: 0,
              duration: 0.5,
              stagger: 0.08,
              ease: "power2.out",
              scrollTrigger: {
                trigger: logsRef.current,
                start: "top 85%",
              },
            }
          );
        }

        // Weekly sprint cards reveal
        if (weeklyRef.current) {
          gsap.fromTo(
            weeklyRef.current.querySelectorAll(".weekly-cadence-card") || [],
            { opacity: 0, y: 25 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.08,
              ease: "power2.out",
              scrollTrigger: {
                trigger: weeklyRef.current,
                start: "top 85%",
              },
            }
          );
        }
      });

      mm.add("(max-width: 767px)", () => {
        // Subtle entrance on mobile without aggressive scrub
        gsap.fromTo(
          heroRef.current?.querySelectorAll(".hero-stagger") || [],
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.05,
            ease: "power2.out",
          }
        );
        ScrollTrigger.normalizeScroll(false);
      });

      return () => mm.revert();
    },
    { scope: containerRef, dependencies: [project.slug] }
  );

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-black text-white selection:bg-[#e2f952] selection:text-black"
    >
      {/* Universal Header with intelligent path-aware anchors */}
      <Header />

      <main className="w-full pt-28 md:pt-32 pb-20">
        {/* HUD Sub-Bar / Telemetry Corridor Breadcrumb */}
        <div className="w-full border-b border-white/10 bg-neutral-950/80 backdrop-blur-md">
          <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-3 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px]">
            <div className="flex items-center gap-3 text-neutral-400">
              <Link
                href="/#projects"
                className="text-[#e2f952] hover:underline flex items-center gap-1.5 uppercase"
              >
                <span>←</span>
                <span>{projectPageUi.backToHangar}</span>
              </Link>
              <span className="text-neutral-600">/</span>
              <span className="text-white uppercase font-bold tracking-wider">
                {project.code || `BUILD // ${project.slug}`}
              </span>
            </div>

            <div className="flex items-center gap-4 text-neutral-400 uppercase text-[10px]">
              <div className="hidden sm:flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#e2f952] animate-pulse" />
                <span>{projectPageUi.coordinates}</span>
              </div>
              <span className="hidden sm:inline text-neutral-600">·</span>
              <span className="px-2 py-0.5 border border-[#e2f952]/40 text-[#e2f952] bg-[#e2f952]/5">
                {project.trlLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Hero Briefing */}
        <section
          ref={heroRef}
          className="max-w-[1800px] mx-auto px-6 md:px-12 pt-12 md:pt-16 pb-12 border-b border-white/15"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-8">
            <div className="max-w-4xl">
              {/* Category & Status Line */}
              <div className="hero-stagger flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-widest text-[#e2f952] mb-4">
                <span className="px-2 py-0.5 border border-[#e2f952] bg-[#e2f952]/10 font-bold">
                  [ {project.status} ]
                </span>
                <span className="text-neutral-400">
                  {project.category}
                </span>
              </div>

              {/* Massive Brutalist Headline */}
              <h1 className="hero-stagger text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-white leading-none">
                {project.title}
              </h1>

              {/* Tactical Subtitle */}
              {project.subtitle && (
                <p className="hero-stagger text-base sm:text-xl md:text-2xl text-neutral-300 font-light mt-6 leading-snug">
                  {project.subtitle}
                </p>
              )}
            </div>

            {/* Quick Metadata Box */}
            <div className="hero-stagger font-mono text-xs text-neutral-400 bg-neutral-950 border border-white/15 p-5 min-w-[280px] space-y-2.5">
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span className="text-neutral-500">PARTNER:</span>
                <span className="text-white text-right max-w-[160px] truncate">
                  {project.partner}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span className="text-neutral-500">DIVISION:</span>
                <span className="text-white text-right max-w-[160px] truncate">
                  {project.leadDivision}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">ROUTER:</span>
                <span className="text-[#e2f952]">/{project.slug}</span>
              </div>
            </div>
          </div>

          {/* Tech Stack Pills */}
          {project.stack && project.stack.length > 0 && (
            <div className="hero-stagger flex flex-wrap items-center gap-2 pt-4 border-t border-white/10">
              <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest mr-2">
                ACTIVE SUBSYSTEMS:
              </span>
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 bg-white/5 border border-white/15 font-mono text-[10px] text-neutral-300 uppercase tracking-wider hover:border-[#e2f952] transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Media Telemetry Viewport */}
        <section
          ref={mediaRef}
          className="max-w-[1800px] mx-auto px-6 md:px-12 py-12 md:py-16 border-b border-white/15"
        >
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-neutral-950 border border-white/20 overflow-hidden group">
            {/* Corner Reticle Marks */}
            <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#e2f952] z-20 pointer-events-none" />
            <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#e2f952] z-20 pointer-events-none" />
            <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#e2f952] z-20 pointer-events-none" />
            <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#e2f952] z-20 pointer-events-none" />

            {/* Crosshair Center Graphic */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 opacity-20">
              <div className="w-12 h-12 border border-white/40 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-[#e2f952] rounded-full" />
              </div>
            </div>

            {/* Project Image */}
            {project.coverImageUrl ? (
              <Image
                src={project.coverImageUrl}
                alt={project.title}
                fill
                priority
                sizes="(max-width: 1800px) 100vw, 1800px"
                unoptimized={Boolean(project.coverImageUrl.startsWith("data:"))}
                className="project-hero-img object-cover object-center will-change-transform brightness-90 contrast-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-mono text-neutral-600 uppercase">
                [ NO MEDIA FEED AVAILABLE ]
              </div>
            )}

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none z-10" />

            {/* Viewport Telemetry Tags */}
            <div className="absolute top-4 left-6 z-20 font-mono text-[10px] text-neutral-400 bg-black/70 px-3 py-1 border border-white/20 backdrop-blur-sm uppercase">
              FEED 01 // TELEMETRY FRAME · {project.code || project.slug}
            </div>

            <div className="absolute bottom-4 right-6 z-20 font-mono text-[10px] text-[#e2f952] bg-black/80 px-3 py-1 border border-[#e2f952]/40 backdrop-blur-sm uppercase">
              STATUS: {project.status} // LIVE
            </div>
          </div>
        </section>

        {/* Section 3: Key Performance Telemetry Metrics */}
        {project.telemetryStats && project.telemetryStats.length > 0 && (
          <section
            ref={statsRef}
            className="max-w-[1800px] mx-auto px-6 md:px-12 py-16 md:py-24 border-b border-white/15"
          >
            <div className="border-b border-white/15 pb-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#e2f952]">
                  [ {projectPageUi.specsSectionNumber} ]
                </span>
                <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mt-2">
                  {projectPageUi.specsHeadline}
                </h2>
              </div>
              <p className="max-w-md font-mono text-xs text-neutral-400">
                {projectPageUi.specsDescription}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.telemetryStats.map((stat) => (
                <div
                  key={stat.label}
                  className="stat-box p-6 bg-neutral-950 border border-white/15 hover:border-[#e2f952] transition-colors relative group"
                >
                  <div className="flex items-center justify-between font-mono text-[10px] text-neutral-500 uppercase tracking-widest pb-3 border-b border-white/10">
                    <span>{stat.label}</span>
                    <span className="group-hover:text-[#e2f952] transition-colors">
                      [ METRIC ]
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white group-hover:text-[#e2f952] transition-colors">
                      {stat.value}
                    </span>
                    {stat.unit && (
                      <span className="font-mono text-sm font-bold text-neutral-400 uppercase">
                        {stat.unit}
                      </span>
                    )}
                  </div>

                  {stat.detail && (
                    <p className="mt-3 font-mono text-xs text-neutral-400 leading-relaxed">
                      {stat.detail}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 4: Operational Blueprint & Mission Narrative */}
        <section
          ref={missionRef}
          className="max-w-[1800px] mx-auto px-6 md:px-12 py-16 md:py-24 border-b border-white/15"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Narrative Overview */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#e2f952]">
                  [ {projectPageUi.missionSectionNumber} ]
                </span>
                <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mt-2">
                  {projectPageUi.missionHeadline}
                </h2>
              </div>

              <div className="font-sans text-base sm:text-lg text-neutral-300 font-light leading-relaxed space-y-4">
                {project.overview && project.overview.length > 0 ? (
                  project.overview.map((para, i) => <p key={i}>{para}</p>)
                ) : (
                  <p>{project.summary || project.title}</p>
                )}
              </div>

              {/* Action Requisition Callouts */}
              <div className="pt-6 flex flex-wrap gap-4 font-mono text-xs uppercase tracking-wider">
                <a
                  href="#avionics"
                  className="px-5 py-3 border border-white/20 hover:border-[#e2f952] hover:text-[#e2f952] transition-colors"
                >
                  [ VIEW AVIONICS MATRIX ↓ ]
                </a>
                <Link
                  href="/#inventory"
                  className="px-5 py-3 bg-[#e2f952] text-black font-bold border border-[#e2f952] hover:bg-white hover:border-white transition-colors"
                >
                  [ {projectPageUi.requestHardwareCta} ]
                </Link>
              </div>
            </div>

            {/* Right Column: Mission Objectives Cards */}
            <div className="lg:col-span-6 space-y-4">
              <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 pb-2 border-b border-white/10">
                PRIMARY ENGINEERING MILESTONES & CAPABILITIES
              </div>

              {project.missionObjectives && project.missionObjectives.length > 0 ? (
                project.missionObjectives.map((obj) => (
                  <div
                    key={obj.id}
                    className="mission-card p-6 bg-neutral-950 border border-white/15 hover:border-white/40 transition-colors"
                  >
                    <div className="flex items-center justify-between font-mono text-xs text-[#e2f952] mb-2">
                      <span className="font-bold">[ {obj.id} ]</span>
                      <span className="text-[10px] text-neutral-500 uppercase">
                        {obj.division}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold uppercase tracking-tight text-white mb-2">
                      {obj.title}
                    </h3>
                    <p className="font-mono text-xs text-neutral-400 leading-relaxed font-light">
                      {obj.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-6 bg-neutral-950 border border-white/15 font-mono text-xs text-neutral-400">
                  {project.summary}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 5: Avionics & Hardware Architecture Matrix */}
        {project.avionicsArchitecture && project.avionicsArchitecture.length > 0 && (
          <section
            id="avionics"
            ref={avionicsRef}
            className="max-w-[1800px] mx-auto px-6 md:px-12 py-16 md:py-24 border-b border-white/15"
          >
            <div className="border-b border-white/15 pb-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#e2f952]">
                  [ {projectPageUi.avionicsSectionNumber} ]
                </span>
                <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mt-2">
                  {projectPageUi.avionicsHeadline}
                </h2>
              </div>
              <p className="max-w-md font-mono text-xs text-neutral-400">
                {projectPageUi.avionicsDescription}
              </p>
            </div>

            {/* Tabular Specification Matrix */}
            <div className="border border-white/15 divide-y divide-white/15 bg-neutral-950 font-mono text-xs">
              <div className="hidden lg:grid grid-cols-12 p-4 bg-white/5 text-[11px] text-neutral-400 uppercase tracking-wider font-bold">
                <div className="col-span-3">Subsystem Layer</div>
                <div className="col-span-3">Component & Model</div>
                <div className="col-span-3">Technical Hardware Specs</div>
                <div className="col-span-3">Role & Firmware Notes</div>
              </div>

              {project.avionicsArchitecture.map((item, idx) => (
                <div
                  key={idx}
                  className="avionics-row grid grid-cols-1 lg:grid-cols-12 p-5 lg:p-4 gap-3 lg:gap-4 items-start hover:bg-white/[0.02] transition-colors"
                >
                  <div className="lg:col-span-3 flex items-center gap-2 text-[#e2f952] font-bold">
                    <span className="text-neutral-600 text-[10px]">
                      0{idx + 1}.
                    </span>
                    <span>{item.subsystem}</span>
                  </div>

                  <div className="lg:col-span-3 text-white font-medium">
                    {item.component}
                  </div>

                  <div className="lg:col-span-3 text-neutral-400">
                    {item.model}
                  </div>

                  <div className="lg:col-span-3 text-neutral-400 text-[11px] leading-relaxed">
                    {item.notes}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 6: Flight Trials & Cadence Logs */}
        {project.flightLogs && project.flightLogs.length > 0 && (
          <section
            ref={logsRef}
            className="max-w-[1800px] mx-auto px-6 md:px-12 py-16 md:py-24 border-b border-white/15"
          >
            <div className="border-b border-white/15 pb-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#e2f952]">
                  [ {projectPageUi.logsSectionNumber} ]
                </span>
                <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mt-2">
                  {projectPageUi.logsHeadline}
                </h2>
              </div>
              <p className="max-w-md font-mono text-xs text-neutral-400">
                {projectPageUi.logsDescription}
              </p>
            </div>

            {/* Logs Timeline */}
            <div className="border-t border-white/15 divide-y divide-white/15">
              {project.flightLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="log-row py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-start hover:bg-white/[0.02] transition-colors font-mono text-xs"
                >
                  <div className="md:col-span-2 text-neutral-500">
                    [ CADENCE 0{idx + 1} ]
                  </div>

                  <div className="md:col-span-4 text-white font-bold text-sm sm:text-base uppercase tracking-tight">
                    {log.phase}
                  </div>

                  <div className="md:col-span-2 text-neutral-400">
                    {log.date}
                  </div>

                  <div className="md:col-span-1">
                    <span className="px-2 py-0.5 border border-[#e2f952]/40 text-[#e2f952] bg-[#e2f952]/10 uppercase text-[10px]">
                      {log.status}
                    </span>
                  </div>

                  <div className="md:col-span-3 text-neutral-400 leading-relaxed font-light">
                    {log.outcome}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 7: Weekly Sprint & Engineering Cadence */}
        {project.weeklyUpdates && project.weeklyUpdates.length > 0 && (
          <section
            ref={weeklyRef}
            className="max-w-[1800px] mx-auto px-6 md:px-12 py-16 md:py-24 border-b border-white/15"
          >
            {/* Header Ribbon */}
            <div className="border-b border-white/15 pb-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#e2f952]">
                  [ {projectPageUi.weeklySectionNumber} ]
                </span>
                <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mt-2">
                  {projectPageUi.weeklyHeadline}
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end gap-6 max-w-lg">
                <p className="font-mono text-xs text-neutral-400">
                  {projectPageUi.weeklyDescription}
                </p>
                <div className="bg-neutral-950 border border-white/15 px-4 py-2 font-mono text-[11px] shrink-0">
                  <span className="text-neutral-500">{projectPageUi.weeklyTotalWeeksLabel}: </span>
                  <span className="text-[#e2f952] font-bold">{project.weeklyUpdates.length}</span>
                </div>
              </div>
            </div>

            {/* Weekly Timeline Cards */}
            <div className="space-y-6">
              {project.weeklyUpdates.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="weekly-cadence-card bg-neutral-950 border border-white/15 hover:border-[#e2f952] transition-all p-6 sm:p-8 relative group"
                >
                  {/* Card Reticle Accents */}
                  <span className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/20 group-hover:border-[#e2f952] transition-colors pointer-events-none" />
                  <span className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/20 group-hover:border-[#e2f952] transition-colors pointer-events-none" />
                  <span className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/20 group-hover:border-[#e2f952] transition-colors pointer-events-none" />
                  <span className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/20 group-hover:border-[#e2f952] transition-colors pointer-events-none" />

                  {/* Top Metadata Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10 font-mono text-xs">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-white/5 border border-white/20 text-white font-bold tracking-wider uppercase">
                        [ {item.weekNumber} ]
                      </span>
                      <span className="text-neutral-400 text-[11px]">
                        // {item.dateRange}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500 text-[10px] uppercase">
                        {projectPageUi.weeklyStatusPrefix}:
                      </span>
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                          item.status === "COMPLETED"
                            ? "border-[#e2f952] text-[#e2f952] bg-[#e2f952]/10"
                            : item.status === "IN_PROGRESS"
                            ? "border-blue-400 text-blue-400 bg-blue-500/10"
                            : item.status === "TESTING"
                            ? "border-purple-400 text-purple-400 bg-purple-500/10"
                            : item.status === "BLOCKED"
                            ? "border-red-400 text-red-400 bg-red-500/10"
                            : "border-neutral-500 text-neutral-300 bg-neutral-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <div className="space-y-3">
                    <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white group-hover:text-[#e2f952] transition-colors">
                      {item.title}
                    </h3>
                    <p className="font-sans text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  {/* Milestones Checklist */}
                  {item.highlights && item.highlights.length > 0 && (
                    <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
                      <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                        [ {projectPageUi.weeklyMilestonesLabel} ]
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 font-mono text-xs">
                        {item.highlights.map((highlight, hIdx) => (
                          <div
                            key={hIdx}
                            className="flex items-start gap-2 text-neutral-300 bg-white/[0.02] p-2.5 border border-white/5"
                          >
                            <span className="text-[#e2f952] font-bold shrink-0">✓</span>
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Telemetry / Metrics & Roadblock Callouts */}
                  {(item.flightHoursOrTests || item.blockersOrRisks) && (
                    <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                      {item.flightHoursOrTests && (
                        <div className="bg-neutral-900/60 border border-white/10 p-3">
                          <span className="text-neutral-500 text-[10px] uppercase block mb-1">
                            {projectPageUi.weeklyTelemetryLabel}
                          </span>
                          <span className="text-[#e2f952] font-semibold">
                            {item.flightHoursOrTests}
                          </span>
                        </div>
                      )}
                      {item.blockersOrRisks && (
                        <div className="bg-amber-950/20 border border-amber-500/20 p-3">
                          <span className="text-amber-400 text-[10px] uppercase block mb-1">
                            {projectPageUi.weeklyBlockersLabel}
                          </span>
                          <span className="text-neutral-300 text-[11px] font-light">
                            {item.blockersOrRisks}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 8: Next Project Runway & Navigation */}
        {nextProject && (
          <section className="max-w-[1800px] mx-auto px-6 md:px-12 py-16 md:py-24">
            <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-6">
              [ {projectPageUi.nextProjectBadge} ]
            </div>

            <Link
              href={`/projects/${nextProject.slug}`}
              className="group block p-8 md:p-12 bg-neutral-950 border border-white/20 hover:border-[#e2f952] transition-all relative overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                <div className="lg:col-span-8 space-y-4">
                  <div className="font-mono text-xs text-[#e2f952] uppercase tracking-wider">
                    {nextProject.code || "UPCOMING CADRE INITIATIVE"}
                  </div>
                  <h3 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white group-hover:text-[#e2f952] transition-colors">
                    {nextProject.title}
                  </h3>
                  <div className="flex items-center gap-2 font-mono text-xs text-neutral-400 group-hover:text-white transition-colors">
                    <span>{projectPageUi.exploreNextProject}</span>
                    <span className="group-hover:translate-x-2 transition-transform duration-200">
                      →
                    </span>
                  </div>
                </div>

                {nextProject.coverImageUrl && (
                  <div className="lg:col-span-4 relative aspect-video bg-neutral-900 border border-white/20 overflow-hidden">
                    <Image
                      src={nextProject.coverImageUrl}
                      alt={nextProject.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 30vw"
                      unoptimized={Boolean(nextProject.coverImageUrl.startsWith("data:"))}
                      className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                    />
                  </div>
                )}
              </div>
            </Link>
          </section>
        )}
      </main>

      {/* Universal Footer */}
      <Footer />
    </div>
  );
}
