"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "@/lib/gsap";
import { siteData } from "@/data/data";
import { fetchMentors, SupabaseMentor } from "@/lib/supabase/mentors";

/**
 * Institutional metadata helper for mentors
 */
function getMentorMeta(mentor: SupabaseMentor, index: number) {
  const name = (mentor.name || "").toLowerCase();
  const title = (mentor.title || "").toLowerCase();

  if (name.includes("rajesh") || title.includes("avionics") || title.includes("iist")) {
    return {
      badge: "ACADEMIC PATRON // IIST",
      institution: "Indian Institute of Space Science and Technology",
      field: "Flight Control Systems & Autonomous Guidance",
      code: "IIST-AVN-01",
    };
  }
  if (name.includes("yashwanth") || title.includes("georgia") || title.includes("nasa") || title.includes("jpl")) {
    return {
      badge: "AUTONOMY ADVISOR // NASA JPL",
      institution: "Georgia Institute of Technology · ex-NASA JPL",
      field: "Space Robotics & Multibody Spacecraft Dynamics",
      code: "JPL-ROB-02",
    };
  }
  if (name.includes("sanjay") || title.includes("nesac") || title.includes("space")) {
    return {
      badge: "SCIENTIFIC ADVISOR // NESAC",
      institution: "North Eastern Space Applications Centre · ISRO/DOS",
      field: "Satcom, UAV Remote Sensing & Multispectral Payloads",
      code: "DOS-SAT-03",
    };
  }
  return {
    badge: `ADVISORY COUNCIL // 0${index + 1}`,
    institution: "Pegasus UAV Advisory Council",
    field: "Aerospace Systems & Autonomous Guidance",
    code: `ADV-COR-0${index + 1}`,
  };
}

interface ActiveTrailMentor extends SupabaseMentor {
  code: string;
  badge: string;
  institution: string;
  field: string;
  categoryTitle: string;
}

export default function Mentors() {
  const { mentors: mentorsMeta } = siteData;
  const sectionRef = useRef<HTMLElement>(null);
  const floatingTrailRef = useRef<HTMLDivElement>(null);

  const [mentors, setMentors] = useState<SupabaseMentor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMentor, setActiveMentor] = useState<ActiveTrailMentor | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<SupabaseMentor | null>(null);

  // Fetch mentors live from Supabase
  useEffect(() => {
    let isMounted = true;
    fetchMentors()
      .then((data) => {
        if (!isMounted) return;
        setMentors(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to fetch mentors from Supabase:", err);
        setError("Telemetry offline: Unable to load advisory council roster.");
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

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedMentor(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // GSAP Entrance reveal on scroll matching Team.tsx
  useGSAP(
    () => {
      if (loading || mentors.length === 0) return;

      const categoryBlocks = gsap.utils.toArray<HTMLElement>(".mentors-category-block");

      categoryBlocks.forEach((block) => {
        const tiles = block.querySelectorAll(".mentor-tile");
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
    { scope: sectionRef, dependencies: [mentors, loading] }
  );

  return (
    <>
      <section
        ref={sectionRef}
        id="mentors"
        onMouseMove={handleMouseMove}
        className="relative w-full bg-black text-white py-24 md:py-36 border-b border-white/15"
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
          {/* Section Header matching Team.tsx structure */}
          <div className="border-b border-white/15 pb-8 mb-16 md:mb-24">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs md:text-sm uppercase tracking-widest text-[#e2f952]">
                [ {mentorsMeta?.sectionNumber || "05 — Council"} ]
              </span>
              <span className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest">
                ADVISORY DIRECTORS // FACULTY & SCIENTIFIC PATRONS
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter">
                {mentorsMeta?.headline || "Distinguished Mentors"}
              </h2>
              <span className="font-mono text-xs sm:text-sm uppercase tracking-widest text-neutral-400">
                {"// "}{mentorsMeta?.subheadline || "Academic & Aerospace Advisory"}
              </span>
            </div>
          </div>

          {/* Mentors Container / Dynamic Supabase Roster */}
          {loading ? (
            <div className="space-y-12">
              {/* Aerospace Telemetry Loading Header */}
              <div className="flex items-center gap-3 font-mono text-xs text-[#e2f952] uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-[#e2f952] animate-ping" />
                <span>[ SYNCHRONIZING SUPABASE TELEMETRY // RETRIEVING ADVISORY COUNCIL ]</span>
              </div>

              {/* Skeleton Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {[...Array(3)].map((_, i) => (
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
          ) : mentors.length === 0 ? (
            <div className="p-8 border border-white/10 bg-neutral-950 text-center font-mono text-neutral-500 text-xs uppercase tracking-widest">
              [ NO ACTIVE ADVISORY COUNCIL RECORDS FOUND IN SUPABASE ]
            </div>
          ) : (
            <div className="space-y-16 md:space-y-24">
              <div className="mentors-category-block border-t border-white/15 pt-8 md:pt-12">
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-10">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs md:text-sm text-[#e2f952] bg-white/[0.04] border border-white/10 px-2.5 py-1">
                      [ ADV ]
                    </span>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white">
                      Faculty & Scientific Advisory Council
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-neutral-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e2f952]" />
                    <span>
                      [ 0{mentors.length} {mentors.length === 1 ? "ADVISOR" : "ADVISORS"} ]
                    </span>
                  </div>
                </div>

                {/* Minimalist Grid of Name & Designation Only matching Team.tsx */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {mentors.map((mentor, index) => {
                    const meta = getMentorMeta(mentor, index);
                    return (
                      <div
                        key={mentor.id || mentor.name}
                        data-cursor="hover"
                        onClick={() => setSelectedMentor(mentor)}
                        onMouseEnter={() =>
                          setActiveMentor({
                            ...mentor,
                            code: meta.code,
                            badge: meta.badge,
                            institution: meta.institution,
                            field: meta.field,
                            categoryTitle: "ADVISORY COUNCIL",
                          })
                        }
                        onMouseLeave={() => setActiveMentor(null)}
                        className="mentor-tile group relative p-6 md:p-7 bg-neutral-950 border border-white/15 hover:border-[#e2f952] hover:bg-white/[0.03] transition-all duration-200 flex flex-col justify-between min-h-[140px] md:min-h-[155px] cursor-pointer select-none"
                      >
                        {/* Aerospace Corner Reticle Ticks */}
                        <span className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />
                        <span className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />
                        <span className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />

                        {/* Header Row: Advisor Code & Reticle Arrow */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-mono text-[11px] text-neutral-500 group-hover:text-[#e2f952] transition-colors">
                            [ {meta.code} ]
                          </span>
                          <span className="font-mono text-xs text-neutral-600 group-hover:text-[#e2f952] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                            ↗
                          </span>
                        </div>

                        {/* Name & Designation */}
                        <div>
                          <h4 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-white group-hover:text-[#e2f952] transition-colors">
                            {mentor.name}
                          </h4>
                          <p className="mt-1.5 font-mono text-xs uppercase tracking-wider text-neutral-400">
                            {mentor.title}
                          </p>
                          <p className="mt-2 font-mono text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
                            {meta.institution}
                          </p>
                        </div>

                        {/* Bottom Active Status Line */}
                        <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between font-mono text-[10px] text-neutral-600">
                          <span className="uppercase tracking-widest group-hover:text-neutral-400 transition-colors">
                            ADVISORY // ACTIVE
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-700 group-hover:bg-[#e2f952] transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Image Trail Element for Cursor Hover matching Team.tsx */}
        <div
          ref={floatingTrailRef}
          aria-hidden="true"
          className={`hidden md:block fixed top-0 left-0 pointer-events-none z-50 transition-opacity duration-200 ${
            activeMentor ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          style={{ width: "250px" }}
        >
          {activeMentor && (
            <div className="relative bg-neutral-900 border border-white/30 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden">
              {/* Top Tactical Bar */}
              <div className="bg-black/90 px-3 py-1.5 border-b border-white/15 flex items-center justify-between font-mono text-[10px] uppercase">
                <span className="text-[#e2f952] font-semibold">{activeMentor.code}</span>
                <span className="text-neutral-400">{activeMentor.categoryTitle}</span>
              </div>

              {/* Mentor Photo */}
              <div className="relative aspect-[4/5] w-full bg-black overflow-hidden">
                <Image
                  src={activeMentor.photo_url}
                  alt={activeMentor.name}
                  fill
                  sizes="250px"
                  unoptimized={Boolean(activeMentor.photo_url?.startsWith("data:"))}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />
              </div>

              {/* Bottom Personnel Details HUD */}
              <div className="p-3 bg-black/95 border-t border-white/20">
                <p className="font-display text-sm font-bold uppercase tracking-tight text-white">
                  {activeMentor.name}
                </p>
                <p className="font-mono text-[11px] uppercase tracking-wider text-[#e2f952] mt-0.5">
                  {activeMentor.title}
                </p>
                <p className="mt-2 pt-1.5 border-t border-white/10 font-mono text-[10px] text-neutral-300 leading-relaxed line-clamp-2">
                  {activeMentor.institution}
                </p>
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between font-mono text-[9px] text-neutral-400 uppercase tracking-widest">
                  <span>IIST UAV // ADVISOR</span>
                  <span className="text-[#e2f952]">VERIFIED</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================= FULL CITATION ARCHIVE MODAL ================= */}
      {selectedMentor && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedMentor(null)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-neutral-950 border border-white/20 shadow-[0_0_80px_rgba(0,0,0,0.95)] p-6 sm:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Corner Reticles */}
            <span className="absolute top-3 left-3 w-3 h-3 border-t border-l border-[#e2f952]" />
            <span className="absolute top-3 right-3 w-3 h-3 border-t border-r border-[#e2f952]" />
            <span className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[#e2f952]" />
            <span className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#e2f952]" />

            {/* Header / Close button */}
            <div className="flex items-center justify-between border-b border-white/15 pb-5 mb-8">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#e2f952]" />
                <span className="font-mono text-xs text-[#e2f952] uppercase tracking-widest font-semibold">
                  ACADEMIC & AEROSPACE CITATION RECORD
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMentor(null)}
                className="font-mono text-xs text-neutral-400 hover:text-white border border-white/20 hover:border-white px-3 py-1.5 transition-colors uppercase tracking-widest"
              >
                CLOSE [ ESC ]
              </button>
            </div>

            {/* Content Body */}
            <div className="flex flex-col sm:flex-row gap-8 items-start mb-8">
              <div className="relative w-full sm:w-44 aspect-[4/5] bg-neutral-900 border border-white/20 flex-shrink-0 shadow-xl overflow-hidden">
                <Image
                  src={selectedMentor.photo_url}
                  alt={selectedMentor.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 200px"
                  unoptimized={Boolean(selectedMentor.photo_url?.startsWith("data:"))}
                  className="object-cover object-top filter grayscale contrast-110"
                />
              </div>

              <div>
                <span className="font-mono text-[11px] text-[#e2f952] uppercase tracking-widest">
                  COUNCIL PATRON
                </span>
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1 mb-2">
                  {selectedMentor.name}
                </h3>
                <p className="font-mono text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  {selectedMentor.title}
                </p>

                {selectedMentor.linkedin_url && (
                  <a
                    href={selectedMentor.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 font-mono text-xs text-[#e2f952] hover:underline underline-offset-4"
                  >
                    <span>VERIFY ON LINKEDIN</span>
                    <span>↗</span>
                  </a>
                )}
              </div>
            </div>

            {/* Full Biography */}
            <div className="border-t border-white/10 pt-6">
              <h4 className="font-mono text-xs uppercase tracking-widest text-[#e2f952] mb-3">
                OFFICIAL COMMENDATION // CITATION
              </h4>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed whitespace-pre-line font-serif">
                {selectedMentor.bio}
              </p>
            </div>

            {/* Bottom Seal */}
            <div className="mt-8 pt-4 border-t border-white/15 flex items-center justify-between font-mono text-[10px] text-neutral-500">
              <span>IIST PEGASUS UAV // ADVISORY ARCHIVE</span>
              <span className="text-[#e2f952]">STATUS // ACTIVE MENTOR</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
