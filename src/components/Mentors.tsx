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
  const spotlightRef = useRef<HTMLDivElement>(null);

  const [mentors, setMentors] = useState<SupabaseMentor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<SupabaseMentor | null>(null);

  // GSAP quickTo setters for zero-latency 60fps cursor spotlight following
  const spotlightX = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const spotlightY = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  useEffect(() => {
    if (!spotlightRef.current) return;
    spotlightX.current = gsap.quickTo(spotlightRef.current, "x", {
      duration: 0.35,
      ease: "power2.out",
    });
    spotlightY.current = gsap.quickTo(spotlightRef.current, "y", {
      duration: 0.35,
      ease: "power2.out",
    });
  }, []);

  // Track cursor spotlight across the section
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (spotlightX.current && spotlightY.current) {
      spotlightX.current(x);
      spotlightY.current(y);
    }
  };

  // Local spotlight for individual card border & sheen illumination
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

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
        setError("Unable to retrieve advisory council records.");
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

  // GSAP Entrance reveal on scroll
  useGSAP(
    () => {
      if (loading || mentors.length === 0 || !sectionRef.current) return;

      const cards = gsap.utils.toArray<HTMLElement>(".mentor-spotlight-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
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
        onMouseMove={handleMouseMove}
        className="relative w-full bg-black text-white py-24 md:py-36 border-b border-white/15 overflow-hidden"
      >
        {/* Subtle Background Tactical Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

        {/* Dynamic Cursor Spotlight Beam */}
        <div
          ref={spotlightRef}
          className="pointer-events-none absolute -top-[350px] -left-[350px] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(226,249,82,0.12)_0%,rgba(226,249,82,0.04)_40%,transparent_70%)] blur-3xl will-change-transform z-0"
        />

        <div className="relative z-10 max-w-[1700px] mx-auto px-6 md:px-12">
          {/* Section Header */}
          <div className="border-b border-white/15 pb-8 mb-16 md:mb-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#e2f952] animate-pulse" />
                  <span className="font-mono text-xs uppercase tracking-widest text-[#e2f952]">
                    [ {mentorsMeta?.sectionNumber || "05 — COUNCIL"} ]
                  </span>
                  <span className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest hidden sm:inline">
                    ADVISORY DIRECTORS // SPOTLIGHT TELEMETRY
                  </span>
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-white">
                  {mentorsMeta?.headline || "Distinguished Mentors"}
                </h2>
              </div>

              <div className="font-mono text-xs text-neutral-400 uppercase tracking-widest flex items-center gap-3">
                <span className="text-neutral-500 hidden md:inline">HOVER TO ILLUMINATE //</span>
                <span className="text-[#e2f952] bg-white/[0.04] border border-white/15 px-3 py-1.5">
                  0{mentors.length || 3} PATRONS VERIFIED
                </span>
              </div>
            </div>
          </div>

          {/* Mentors Cards Grid - Centered with Generous Spacing */}
          {loading ? (
            <div className="py-24 flex items-center justify-center gap-4">
              <div className="flex items-center gap-3 font-mono text-xs text-[#e2f952] uppercase tracking-widest animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#e2f952]" />
                <span>[ SYNCHRONIZING SPOTLIGHT // RETRIEVING PATRON TELEMETRY ]</span>
              </div>
            </div>
          ) : error ? (
            <div className="py-16 flex justify-center">
              <div className="p-8 border border-red-500/30 bg-red-950/20 font-mono text-center max-w-xl">
                <span className="text-red-400 text-sm uppercase tracking-widest">[ {error} ]</span>
              </div>
            </div>
          ) : mentors.length === 0 ? (
            <div className="py-16 font-mono text-neutral-500 text-xs uppercase tracking-widest text-center">
              [ NO ADVISORY COUNCIL RECORDS FOUND ]
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12 justify-center items-stretch">
              {mentors.map((mentor, index) => {
                const meta = getMentorMeta(mentor, index);

                return (
                  <div
                    key={mentor.id}
                    onMouseMove={handleCardMouseMove}
                    className="mentor-spotlight-card group relative bg-neutral-950/90 border border-white/15 hover:border-[#e2f952] transition-colors duration-300 flex flex-col justify-between p-6 sm:p-8 overflow-hidden shadow-2xl"
                  >
                    {/* Spotlight Card Radial Border Glow */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
                      style={{
                        background: `radial-gradient(450px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(226, 249, 82, 0.28), transparent 45%)`,
                      }}
                    />

                    {/* Spotlight Card Surface Sheen */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
                      style={{
                        background: `radial-gradient(350px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(226, 249, 82, 0.06), transparent 60%)`,
                      }}
                    />

                    {/* Aerospace Corner Reticles */}
                    <span className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-white/30 group-hover:border-[#e2f952] transition-colors duration-300 pointer-events-none z-10" />
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-white/30 group-hover:border-[#e2f952] transition-colors duration-300 pointer-events-none z-10" />
                    <span className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-white/30 group-hover:border-[#e2f952] transition-colors duration-300 pointer-events-none z-10" />
                    <span className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-white/30 group-hover:border-[#e2f952] transition-colors duration-300 pointer-events-none z-10" />

                    {/* Card Content */}
                    <div className="relative z-10 flex flex-col">
                      {/* Top Header Tag */}
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs text-[#e2f952] bg-white/[0.04] border border-white/15 px-2.5 py-1">
                            [ 0{index + 1} ]
                          </span>
                          <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
                            {meta.badge}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-neutral-500 group-hover:text-[#e2f952] transition-colors">
                          {meta.code}
                        </span>
                      </div>

                      {/* Portrait Image with Spotlight Hover Reveal */}
                      <div className="relative aspect-[4/5] w-full bg-neutral-900 border border-white/15 group-hover:border-[#e2f952]/60 transition-colors duration-300 overflow-hidden mb-6 shadow-xl">
                        <Image
                          src={mentor.photo_url}
                          alt={mentor.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover object-top filter grayscale contrast-110 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />

                        {/* Tactical Corner Ref Tag */}
                        <div className="absolute bottom-2.5 right-2.5 font-mono text-[9px] text-[#e2f952] bg-black/90 px-2 py-0.5 border border-white/20 pointer-events-none">
                          REF // 0{index + 1}
                        </div>
                      </div>

                      {/* Mentor Names and Credentials */}
                      <div className="mb-4">
                        <span className="font-mono text-[10px] text-[#e2f952] uppercase tracking-widest block mb-1">
                          {meta.institution}
                        </span>
                        <h3 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white group-hover:text-[#e2f952] transition-colors leading-tight">
                          {mentor.name}
                        </h3>
                        <p className="mt-2 font-mono text-xs text-neutral-300 uppercase tracking-wide leading-relaxed">
                          {mentor.title}
                        </p>
                        <div className="mt-2.5 inline-block font-mono text-[10px] text-neutral-400 bg-white/[0.03] border border-white/10 px-2.5 py-1">
                          SPECS // {meta.field}
                        </div>
                      </div>

                      {/* Biography Snippet */}
                      <div className="pt-3 border-t border-white/[0.08] mb-6">
                        <p className="text-xs sm:text-sm text-neutral-400 line-clamp-3 leading-relaxed font-sans">
                          {mentor.bio}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setSelectedMentor(mentor)}
                        className="inline-flex items-center gap-3 font-mono text-xs text-white group-hover:text-black bg-white/[0.04] group-hover:bg-[#e2f952] border border-white/15 group-hover:border-[#e2f952] px-4 py-2.5 transition-all duration-300 uppercase tracking-wider font-semibold"
                      >
                        <span>VIEW CITATION RECORD</span>
                        <span className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                          ↗
                        </span>
                      </button>

                      <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest hidden sm:inline">
                        IIST FELLOW
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Telemetry Bar */}
          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e2f952]" />
              <span>COORDINATES: LAT 08°31&apos;N · LON 76°57&apos;E (VALIAMALA, KERALA)</span>
            </div>
            <span className="text-neutral-400">
              PEGASUS UAV ADVISORY COUNCIL · ALL CITATIONS VERIFIED
            </span>
          </div>
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
              <div className="relative w-full sm:w-44 aspect-[4/5] bg-neutral-900 border border-white/20 flex-shrink-0 shadow-xl">
                <Image
                  src={selectedMentor.photo_url}
                  alt={selectedMentor.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 200px"
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
