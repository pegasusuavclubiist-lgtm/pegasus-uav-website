"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "@/lib/gsap";
import { siteData, TeamCategory, TeamMember } from "@/data/data";
import { fetchTeamCategories } from "@/lib/supabase/team";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Marquee from "@/components/Marquee";

interface ActiveTrailMember extends TeamMember {
  operativeId: string;
  categoryTitle: string;
}

export default function TeamPage() {
  const { teamPage } = siteData;
  const pageRef = useRef<HTMLDivElement>(null);
  const floatingTrailRef = useRef<HTMLDivElement>(null);

  const [categories, setCategories] = useState<TeamCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMember, setActiveMember] = useState<ActiveTrailMember | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  useEffect(() => {
    let isMounted = true;
    fetchTeamCategories()
      .then((remoteCategories) => {
        if (!isMounted) return;
        setCategories(remoteCategories);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to fetch team categories from Supabase:", err);
        setError(teamPage.errorTelemetry);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [teamPage.errorTelemetry]);

  // GSAP quickTo setters for zero-latency physics-driven image trail
  const xToRef = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const yToRef = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const rotateToRef = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  useEffect(() => {
    if (!floatingTrailRef.current) return;

    xToRef.current = gsap.quickTo(floatingTrailRef.current, "x", {
      duration: 0.3,
      ease: "power3.out",
    });
    yToRef.current = gsap.quickTo(floatingTrailRef.current, "y", {
      duration: 0.3,
      ease: "power3.out",
    });
    rotateToRef.current = gsap.quickTo(floatingTrailRef.current, "rotation", {
      duration: 0.35,
      ease: "power3.out",
    });
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (xToRef.current && yToRef.current && rotateToRef.current) {
      const targetX =
        e.clientX > window.innerWidth - 320
          ? e.clientX - 270
          : e.clientX + 30;
      const targetY = Math.max(30, Math.min(window.innerHeight - 360, e.clientY - 170));

      xToRef.current(targetX);
      yToRef.current(targetY);

      const tilt = ((e.movementX || 0) / 8) * 3;
      rotateToRef.current(Math.max(-10, Math.min(10, tilt)));
    }
  };

  // Filter categories and their members based on search and selected category tab
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return categories
      .filter((cat) => selectedCategoryId === "all" || cat.id === selectedCategoryId)
      .map((cat) => {
        if (!q) return cat;

        const matchingMembers = cat.members.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.role.toLowerCase().includes(q) ||
            (m.subsystem && m.subsystem.toLowerCase().includes(q))
        );

        return {
          ...cat,
          members: matchingMembers,
        };
      })
      .filter((cat) => cat.members.length > 0);
  }, [categories, searchQuery, selectedCategoryId]);

  const totalOperatives = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.members.length, 0);
  }, [categories]);

  const filteredTotal = useMemo(() => {
    return filteredCategories.reduce((sum, cat) => sum + cat.members.length, 0);
  }, [filteredCategories]);

  useGSAP(
    () => {
      if (loading || filteredCategories.length === 0) return;

      const categoryBlocks = gsap.utils.toArray<HTMLElement>(".team-category-block");
      categoryBlocks.forEach((block) => {
        const tiles = block.querySelectorAll(".member-tile");
        gsap.fromTo(
          tiles,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.04,
            ease: "power3.out",
            scrollTrigger: {
              trigger: block,
              start: "top 90%",
            },
          }
        );
      });
    },
    { scope: pageRef, dependencies: [filteredCategories, loading] }
  );

  return (
    <div
      ref={pageRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-black text-white selection:bg-[#e2f952] selection:text-black"
    >
      <Header />

      <main className="pt-28 md:pt-36 pb-24 md:pb-36">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
          {/* Breadcrumb & Navigation HUD */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-6 mb-12 font-mono text-xs uppercase tracking-widest">
            <div className="flex items-center gap-3 text-neutral-400">
              <Link href="/" className="hover:text-[#e2f952] transition-colors">
                FLIGHT OPS
              </Link>
              <span>/</span>
              <span className="text-[#e2f952]">{teamPage.telemetryCode}</span>
            </div>

            <div className="flex items-center gap-4 text-neutral-500">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e2f952] animate-ping" />
              <span>[ CADRE MATRIX // LIVE DATABASE ]</span>
            </div>
          </div>

          {/* Section Hero Header */}
          <div className="mb-14 md:mb-20">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs md:text-sm uppercase tracking-widest text-[#e2f952]">
                [ {teamPage.sectionNumber} ]
              </span>
              <span className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest">
                {teamPage.directoryCode}
              </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/15">
              <div>
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter">
                  {teamPage.headline}
                </h1>
                <p className="mt-3 font-mono text-xs sm:text-sm uppercase tracking-widest text-[#e2f952]">
                  {"// "}{teamPage.subheadline}
                </p>
              </div>

              <p className="max-w-xl text-neutral-400 text-sm md:text-base leading-relaxed font-light">
                {teamPage.description}
              </p>
            </div>

            {/* Quick Metrics HUD */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="p-4 bg-neutral-950 border border-white/10 font-mono">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">
                  {teamPage.statsTotalLabel}
                </span>
                <span className="text-2xl font-bold text-white mt-1 block">
                  {loading ? "--" : totalOperatives}
                </span>
              </div>
              <div className="p-4 bg-neutral-950 border border-white/10 font-mono">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">
                  {teamPage.statsCadresLabel}
                </span>
                <span className="text-2xl font-bold text-[#e2f952] mt-1 block">
                  {loading ? "--" : categories.length}
                </span>
              </div>
              <div className="p-4 bg-neutral-950 border border-white/10 font-mono">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">
                  BASE
                </span>
                <span className="text-sm font-semibold text-neutral-300 mt-2 block">
                  IIST VALIAMALA
                </span>
              </div>
              <div className="p-4 bg-neutral-950 border border-white/10 font-mono">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">
                  STATUS
                </span>
                <span className="text-sm font-semibold text-[#e2f952] mt-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e2f952]" />
                  ACTIVE OPS
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Tactical Filtering HUD */}
          <div className="mb-12 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              {/* Real-time Search Input */}
              <div className="relative flex-1 max-w-xl">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-neutral-500 pointer-events-none">
                  🔍
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={teamPage.searchPlaceholder}
                  className="w-full bg-neutral-950 border border-white/15 focus:border-[#e2f952] focus:bg-white/[0.02] pl-10 pr-4 py-2.5 font-mono text-xs uppercase tracking-wider text-white placeholder:text-neutral-600 transition-colors outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-neutral-400 hover:text-white px-1.5 py-0.5 border border-white/20"
                  >
                    CLEAR
                  </button>
                )}
              </div>

              {/* Counter Readout */}
              <div className="font-mono text-xs uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e2f952]" />
                <span>
                  [ {String(filteredTotal).padStart(2, "0")}{" "}
                  {filteredTotal === 1 ? teamPage.operativeLabel : teamPage.operativesLabel} IDENTIFIED ]
                </span>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => setSelectedCategoryId("all")}
                className={`px-3 py-1.5 font-mono text-xs uppercase tracking-widest border transition-all ${
                  selectedCategoryId === "all"
                    ? "bg-[#e2f952] text-black border-[#e2f952] font-semibold"
                    : "bg-neutral-950 text-neutral-400 border-white/15 hover:border-white/40 hover:text-white"
                }`}
              >
                [ {teamPage.filterAll} ]
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`px-3 py-1.5 font-mono text-xs uppercase tracking-widest border transition-all ${
                    selectedCategoryId === category.id
                      ? "bg-[#e2f952] text-black border-[#e2f952] font-semibold"
                      : "bg-neutral-950 text-neutral-400 border-white/15 hover:border-white/40 hover:text-white"
                  }`}
                >
                  [ {category.categoryCode} ] {category.title} ({category.members.length})
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Cadre Member Grid */}
          {loading ? (
            <div className="space-y-12">
              <div className="flex items-center gap-3 font-mono text-xs text-[#e2f952] uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-[#e2f952] animate-ping" />
                <span>[ {teamPage.loadingTelemetry} ]</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="relative p-6 md:p-7 bg-neutral-950/80 border border-white/10 min-h-[155px] flex flex-col justify-between animate-pulse"
                  >
                    <div className="h-3 w-20 bg-white/10 rounded mb-4" />
                    <div className="space-y-2">
                      <div className="h-6 w-3/4 bg-white/15 rounded" />
                      <div className="h-3 w-1/2 bg-white/10 rounded" />
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/[0.06] h-2 w-24 bg-white/5 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="p-8 border border-red-500/30 bg-red-950/20 font-mono text-center space-y-2">
              <span className="text-red-400 text-sm uppercase tracking-widest">[ {error} ]</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 border border-white/10 bg-neutral-950 text-center font-mono text-neutral-500 text-xs uppercase tracking-widest">
              [ {teamPage.emptyRecordsState} ]
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-12 border border-white/15 bg-neutral-950 text-center font-mono space-y-4">
              <p className="text-neutral-400 text-xs uppercase tracking-widest">
                [ {teamPage.emptySearchState} ]
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategoryId("all");
                }}
                className="px-4 py-2 border border-[#e2f952] text-[#e2f952] hover:bg-[#e2f952] hover:text-black font-mono text-xs uppercase tracking-widest transition-all"
              >
                RESET FILTERS
              </button>
            </div>
          ) : (
            <div className="space-y-16 md:space-y-24">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="team-category-block border-t border-white/15 pt-8 md:pt-12"
                >
                  {/* Category Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-10">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs md:text-sm text-[#e2f952] bg-white/[0.04] border border-white/10 px-2.5 py-1">
                        [ {category.categoryCode} ]
                      </span>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white">
                        {category.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-neutral-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e2f952]" />
                      <span>
                        [ {String(category.members.length).padStart(2, "0")}{" "}
                        {category.members.length === 1
                          ? teamPage.operativeLabel
                          : teamPage.operativesLabel}{" "}
                        ]
                      </span>
                    </div>
                  </div>

                  {/* Operatives Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {category.members.map((member, index) => {
                      const operativeId = `OP-${category.categoryCode}-${String(index + 1).padStart(2, "0")}`;
                      return (
                        <div
                          key={member.name}
                          data-cursor="hover"
                          onMouseEnter={() =>
                            setActiveMember({
                              ...member,
                              operativeId,
                              categoryTitle: category.title,
                            })
                          }
                          onMouseLeave={() => setActiveMember(null)}
                          className="member-tile group relative p-6 md:p-7 bg-neutral-950 border border-white/15 hover:border-[#e2f952] hover:bg-white/[0.03] transition-all duration-200 flex flex-col justify-between min-h-[155px] cursor-pointer select-none"
                        >
                          {/* Corner Reticles */}
                          <span className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />
                          <span className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />
                          <span className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />
                          <span className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />

                          {/* Operative ID */}
                          <div className="flex items-center justify-between mb-4">
                            <span className="font-mono text-[11px] text-neutral-500 group-hover:text-[#e2f952] transition-colors">
                              [ {operativeId} ]
                            </span>
                            <span className="font-mono text-xs text-neutral-600 group-hover:text-[#e2f952] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                              ↗
                            </span>
                          </div>

                          {/* Name & Role */}
                          <div>
                            <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-white group-hover:text-[#e2f952] transition-colors">
                              {member.name}
                            </h3>
                            <p className="mt-1.5 font-mono text-xs uppercase tracking-wider text-neutral-400">
                              {member.role}
                            </p>
                            {member.subsystem && (
                              <p className="mt-2 font-mono text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
                                {member.subsystem}
                              </p>
                            )}
                          </div>

                          {/* Active Status Footer */}
                          <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between font-mono text-[10px] text-neutral-600">
                            <span className="uppercase tracking-widest group-hover:text-neutral-400 transition-colors">
                              {teamPage.activeStatus}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-700 group-hover:bg-[#e2f952] transition-colors" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recruitment Callout Banner */}
          <div className="mt-24 p-8 md:p-12 border border-white/20 bg-neutral-950 relative overflow-hidden">
            <span className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#e2f952]" />
            <span className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#e2f952]" />
            <span className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#e2f952]" />
            <span className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#e2f952]" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#e2f952] block mb-2">
                  [ RECRUITMENT CALL ]
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
                  {teamPage.recruitmentPrompt}
                </h3>
              </div>

              <Link
                href={teamPage.recruitmentHref}
                className="px-6 py-3.5 bg-[#e2f952] text-black font-mono text-xs font-bold uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2 flex-shrink-0"
              >
                <span>{teamPage.recruitmentCta}</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Marquee Divider */}
      <Marquee outline text={siteData.marquee?.cadreText || "PEGASUS UAV CLUB · IIST"} />

      {/* Floating Image Trail Element for Cursor Hover */}
      <div
        ref={floatingTrailRef}
        aria-hidden="true"
        className={`hidden md:block fixed top-0 left-0 pointer-events-none z-50 transition-opacity duration-200 ${
          activeMember ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        style={{ width: "250px" }}
      >
        {activeMember && (
          <div className="relative bg-neutral-900 border border-white/30 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden">
            <div className="bg-black/90 px-3 py-1.5 border-b border-white/15 flex items-center justify-between font-mono text-[10px] uppercase">
              <span className="text-[#e2f952] font-semibold">{activeMember.operativeId}</span>
              <span className="text-neutral-400">{activeMember.categoryTitle}</span>
            </div>

            <div className="relative aspect-[4/5] w-full bg-black overflow-hidden">
              <Image
                src={activeMember.imageUrl}
                alt={activeMember.name}
                fill
                sizes="250px"
                unoptimized={Boolean(activeMember.imageUrl?.startsWith("data:"))}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />
            </div>

            <div className="p-3 bg-black/95 border-t border-white/20">
              <p className="font-display text-sm font-bold uppercase tracking-tight text-white">
                {activeMember.name}
              </p>
              <p className="font-mono text-[11px] uppercase tracking-wider text-[#e2f952] mt-0.5">
                {activeMember.role}
              </p>
              {activeMember.subsystem && (
                <p className="mt-2 pt-1.5 border-t border-white/10 font-mono text-[10px] text-neutral-300 leading-relaxed line-clamp-3">
                  {activeMember.subsystem}
                </p>
              )}
              <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between font-mono text-[9px] text-neutral-400 uppercase tracking-widest">
                <span>{teamPage.cadreBadge}</span>
                <span className="text-[#e2f952]">{teamPage.verifiedBadge}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
