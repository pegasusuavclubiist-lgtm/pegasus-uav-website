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

export default function Mentors() {
  const { mentors: mentorsMeta } = siteData;
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const [mentors, setMentors] = useState<SupabaseMentor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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

  // GSAP Entrance reveal on scroll for mentor cards
  useGSAP(
    () => {
      if (loading || mentors.length === 0 || !cardsContainerRef.current) return;

      const cards = cardsContainerRef.current.querySelectorAll(".mentor-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardsContainerRef.current,
            start: "top 80%",
          },
        }
      );
    },
    { scope: sectionRef, dependencies: [mentors, loading] }
  );

  return (
    <>
      <section
        ref={sectionRef}
        id="mentors"
        className="relative w-full bg-black text-white py-24 md:py-36 border-b border-white/15"
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
          {/* Section Header */}
          <div className="border-b border-white/15 pb-8 mb-16 md:mb-20">
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

            <p className="mt-4 max-w-2xl text-neutral-400 text-sm md:text-base font-light leading-relaxed">
              {mentorsMeta?.description}
            </p>
          </div>

          {/* Mentors Container / Loading / Error / Cards Grid */}
          {loading ? (
            <div className="space-y-12">
              <div className="flex items-center gap-3 font-mono text-xs text-[#e2f952] uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-[#e2f952] animate-ping" />
                <span>[ SYNCHRONIZING SUPABASE TELEMETRY // RETRIEVING ADVISORY COUNCIL ]</span>
              </div>

              {/* Skeleton Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="p-6 bg-neutral-950 border border-white/10 min-h-[420px] flex flex-col justify-between animate-pulse"
                  >
                    <div className="h-4 w-28 bg-white/10 rounded mb-4" />
                    <div className="aspect-[4/5] w-full bg-white/5 rounded mb-4" />
                    <div className="space-y-2">
                      <div className="h-6 w-3/4 bg-white/15 rounded" />
                      <div className="h-3 w-1/2 bg-white/10 rounded" />
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
            <div ref={cardsContainerRef} className="space-y-12">
              {/* Category Header Readout */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-[#e2f952]">
                  <span>[ ADV ]</span>
                  <span className="text-white font-semibold">Faculty & Scientific Advisory Council</span>
                </div>
                <div className="font-mono text-xs text-neutral-500 uppercase tracking-widest">
                  [ 0{mentors.length} {mentors.length === 1 ? "ADVISOR" : "ADVISORS"} ]
                </div>
              </div>

              {/* Pure Mentor Cards Grid (No trailing animation) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {mentors.map((mentor, index) => {
                  const meta = getMentorMeta(mentor, index);
                  return (
                    <div
                      key={mentor.id || mentor.name}
                      onClick={() => setSelectedMentor(mentor)}
                      className="mentor-card group relative p-6 md:p-8 bg-neutral-950 border border-white/15 hover:border-[#e2f952] hover:bg-white/[0.02] transition-all duration-300 flex flex-col justify-between cursor-pointer select-none"
                    >
                      {/* Aerospace Corner Reticle Ticks */}
                      <span className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />
                      <span className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />
                      <span className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />
                      <span className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />

                      <div>
                        {/* Top Metadata Bar */}
                        <div className="flex items-center justify-between mb-4 font-mono text-[11px]">
                          <span className="text-neutral-500 group-hover:text-[#e2f952] transition-colors">
                            [ {meta.code} ]
                          </span>
                          <span className="text-[#e2f952] bg-white/[0.04] border border-white/10 px-2 py-0.5 text-[10px] tracking-wider uppercase">
                            {meta.badge}
                          </span>
                        </div>

                        {/* Direct Mentor Photo Card */}
                        <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-900 border border-white/10 group-hover:border-[#e2f952]/60 mb-6 transition-colors">
                          <Image
                            src={mentor.photo_url}
                            alt={mentor.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            unoptimized={Boolean(mentor.photo_url?.startsWith("data:"))}
                            className="object-cover object-top filter  contrast-110 group-hover:scale-105 group-hover:filter-none transition-all duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                          <div className="absolute bottom-3 left-3 right-3 font-mono text-[10px] text-neutral-300 uppercase tracking-widest flex items-center justify-between">


                          </div>
                        </div>

                        {/* Name & Academic Title */}
                        <div>
                          <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white group-hover:text-[#e2f952] transition-colors">
                            {mentor.name}
                          </h3>
                          <p className="mt-1.5 font-mono text-xs uppercase tracking-wider text-[#e2f952]">
                            {mentor.title}
                          </p>
                          <p className="mt-2 font-mono text-xs text-neutral-400">
                            {meta.institution}
                          </p>
                          <p className="mt-3 text-xs text-neutral-400 font-light leading-relaxed line-clamp-3">
                            {mentor.bio || meta.field}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer: Status & Trigger */}
                      <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between font-mono text-[10px] text-neutral-500">
                        <span className="uppercase tracking-widest group-hover:text-neutral-300 transition-colors flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#e2f952]" />
                          ADVISORY // ACTIVE
                        </span>
                        <span className="text-neutral-400 group-hover:text-[#e2f952] transition-colors flex items-center gap-1">
                          <span>FULL CITATION</span>
                          <span>↗</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
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
