"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "@/lib/gsap";
import { siteData, TeamCategory, TeamMember } from "@/data/data";
import { fetchTeamCategories } from "@/lib/supabase/team";

interface ActiveTrailMember extends TeamMember {
  operativeId: string;
  categoryTitle: string;
}

export default function Team() {
  const { team } = siteData;
  const sectionRef = useRef<HTMLElement>(null);
  const floatingTrailRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<TeamCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMember, setActiveMember] = useState<ActiveTrailMember | null>(null);

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
        setError("Telemetry offline: Unable to load personnel roster.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
      // Smart positioning: flip to left if near right edge
      const targetX =
        e.clientX > window.innerWidth - 320
          ? e.clientX - 270
          : e.clientX + 30;
      const targetY = Math.max(30, Math.min(window.innerHeight - 360, e.clientY - 170));

      xToRef.current(targetX);
      yToRef.current(targetY);

      // Aerodynamic banking tilt based on cursor movement
      const tilt = ((e.movementX || 0) / 8) * 3;
      rotateToRef.current(Math.max(-10, Math.min(10, tilt)));
    }
  };

  useGSAP(
    () => {
      if (loading || categories.length === 0) return;

      // Reveal each category section and its member tiles
      const categoryBlocks = gsap.utils.toArray<HTMLElement>(".team-category-block");

      categoryBlocks.forEach((block) => {
        const tiles = block.querySelectorAll(".member-tile");
        gsap.fromTo(
          tiles,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: "power3.out",
            scrollTrigger: {
              trigger: block,
              start: "top 85%",
            },
          }
        );
      });
    },
    { scope: sectionRef, dependencies: [categories, loading] }
  );

  return (
    <section
      ref={sectionRef}
      id="team"
      onMouseMove={handleMouseMove}
      className="relative w-full bg-black text-white py-24 md:py-36 border-b border-white/15"
    >
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="border-b border-white/15 pb-8 mb-16 md:mb-24">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs md:text-sm uppercase tracking-widest text-[#e2f952]">
              [ {team.sectionNumber} ]
            </span>
            <span className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest">
              FLIGHT CREW // PERSONNEL ROSTER
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter">
              {team.headline}
            </h2>
            <span className="font-mono text-xs sm:text-sm uppercase tracking-widest text-neutral-400">
              {"// "}{team.subheadline}
            </span>
          </div>
        </div>

        {/* Categories Container / Dynamic Supabase Roster */}
        {loading ? (
          <div className="space-y-12">
            {/* Aerospace Telemetry Loading Header */}
            <div className="flex items-center gap-3 font-mono text-xs text-[#e2f952] uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-[#e2f952] animate-ping" />
              <span>[ SYNCHRONIZING SUPABASE TELEMETRY // RETRIEVING PERSONNEL CADRE ]</span>
            </div>

            {/* Skeleton Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="relative p-6 md:p-7 bg-neutral-950/80 border border-white/10 min-h-[140px] md:min-h-[155px] flex flex-col justify-between animate-pulse"
                >
                  <span className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-white/20" />
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-white/20" />
                  <span className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-white/20" />
                  <span className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-white/20" />

                  <div className="flex justify-between items-center mb-4">
                    <div className="h-3 w-20 bg-white/10 rounded" />
                    <div className="h-3 w-3 bg-white/10 rounded" />
                  </div>

                  <div className="space-y-2">
                    <div className="h-6 w-3/4 bg-white/15 rounded" />
                    <div className="h-3 w-1/2 bg-white/10 rounded" />
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <div className="h-2 w-24 bg-white/5 rounded" />
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="p-8 border border-red-500/30 bg-red-950/20 font-mono text-center space-y-2">
            <span className="text-red-400 text-sm uppercase tracking-widest">[ {error} ]</span>
            <p className="text-xs text-neutral-500">Check Supabase network connection or credentials.</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 border border-white/10 bg-neutral-950 text-center font-mono text-neutral-500 text-xs uppercase tracking-widest">
            [ NO ACTIVE PERSONNEL RECORDS FOUND IN SUPABASE ]
          </div>
        ) : (
          <div className="space-y-16 md:space-y-24">
            {categories.map((category) => (
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
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white">
                      {category.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-neutral-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e2f952]" />
                    <span>
                      [ 0{category.members.length} {category.members.length === 1 ? "OPERATIVE" : "OPERATIVES"} ]
                    </span>
                  </div>
                </div>

                {/* Minimalist Grid of Name & Designation Only */}
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
                        className="member-tile group relative p-6 md:p-7 bg-neutral-950 border border-white/15 hover:border-[#e2f952] hover:bg-white/[0.03] transition-all duration-200 flex flex-col justify-between min-h-[140px] md:min-h-[155px] cursor-pointer select-none"
                      >
                        {/* Aerospace Corner Reticle Ticks */}
                        <span className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />
                        <span className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />
                        <span className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />

                        {/* Header Row: Operative Code & Reticle Arrow */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-mono text-[11px] text-neutral-500 group-hover:text-[#e2f952] transition-colors">
                            [ {operativeId} ]
                          </span>
                          <span className="font-mono text-xs text-neutral-600 group-hover:text-[#e2f952] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                            ↗
                          </span>
                        </div>

                        {/* Name & Designation */}
                        <div>
                          <h4 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-white group-hover:text-[#e2f952] transition-colors">
                            {member.name}
                          </h4>
                          <p className="mt-1.5 font-mono text-xs uppercase tracking-wider text-neutral-400">
                            {member.role}
                          </p>
                        </div>

                        {/* Bottom Active Status Line */}
                        <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between font-mono text-[10px] text-neutral-600">
                          <span className="uppercase tracking-widest group-hover:text-neutral-400 transition-colors">
                            CADRE // ACTIVE
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
      </div>

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
            {/* Top Tactical Bar */}
            <div className="bg-black/90 px-3 py-1.5 border-b border-white/15 flex items-center justify-between font-mono text-[10px] uppercase">
              <span className="text-[#e2f952] font-semibold">{activeMember.operativeId}</span>
              <span className="text-neutral-400">{activeMember.categoryTitle}</span>
            </div>

            {/* Member Photo */}
            <div className="relative aspect-[4/5] w-full bg-black overflow-hidden">
              <Image
                src={activeMember.imageUrl}
                alt={activeMember.name}
                fill
                sizes="250px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />
            </div>

            {/* Bottom Personnel Details HUD */}
            <div className="p-3 bg-black/95 border-t border-white/20">
              <p className="font-display text-sm font-bold uppercase tracking-tight text-white">
                {activeMember.name}
              </p>
              <p className="font-mono text-[11px] uppercase tracking-wider text-[#e2f952] mt-0.5">
                {activeMember.role}
              </p>
              <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between font-mono text-[9px] text-neutral-400 uppercase tracking-widest">
                <span>IIST UAV // CADRE</span>
                <span className="text-[#e2f952]">VERIFIED</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
