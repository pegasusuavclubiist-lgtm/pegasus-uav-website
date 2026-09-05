"use client";

import React, { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "@/lib/gsap";
import { siteData } from "@/data/data";
import { submitApplication } from "@/lib/supabase/applications";

export default function JoinUs() {
  const { recruitment } = siteData;
  const sectionRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);

  // Form input states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("");
  const [message, setMessage] = useState("");

  // Submission lifecycle states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    id?: string;
    name: string;
    email: string;
    interest: string;
    timestamp: string;
  } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [rlsNotice, setRlsNotice] = useState<boolean>(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // GSAP scroll entrance animation
  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      tl.fromTo(
        leftColRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      ).fromTo(
        formCardRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        "-=0.4"
      );
    },
    { scope: sectionRef }
  );

  // Copy contact email
  const copyEmail = () => {
    navigator.clipboard.writeText(recruitment.contactEmail).then(() => {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setRlsNotice(false);

    // Validation
    if (!fullName.trim()) {
      setFormError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setFormError("Please enter a valid institute email address.");
      return;
    }
    if (!interest.trim()) {
      setFormError("Please select your primary area of interest.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitApplication({
        name: fullName,
        email,
        interest,
        message,
      });

      if (result.success) {
        setSubmittedData({
          id: result.id,
          name: fullName.trim(),
          email: email.trim(),
          interest: interest.trim(),
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            timeZoneName: "short",
          }),
        });
        // Reset form inputs
        setFullName("");
        setEmail("");
        setInterest("");
        setMessage("");
      } else {
        if (result.isRlsError) {
          setRlsNotice(true);
        }
        setFormError(
          result.error || "Unable to submit application. Please try again or reach out directly."
        );
      }
    } catch (err) {
      console.error("Submission error:", err);
      setFormError("An unexpected network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="join-us"
      className="relative w-full bg-black text-white py-24 md:py-36 border-b border-white/15 overflow-hidden"
    >
      {/* Background Tactical Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <div className="relative z-10 max-w-[1700px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* ================= LEFT COLUMN: MISSION RECRUITMENT INFO ================= */}
          <div ref={leftColRef} className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Section Header Tag */}
              <div className="flex items-center gap-3 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#e2f952] animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-widest text-[#e2f952]">
                  // {recruitment.sectionNumber}
                </span>
                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest hidden sm:inline">
                  OPEN SELECTION CYCLE
                </span>
              </div>

              {/* Big Title */}
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none mb-6">
                {recruitment.headline}
              </h2>

              {/* Description */}
              <p className="text-neutral-300 text-base sm:text-lg leading-relaxed font-sans max-w-lg mb-8">
                {recruitment.description}
              </p>

              {/* Subsystems Tags (Clickable to auto-select in form) */}
              <div className="mb-10">
                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest block mb-3">
                  ACTIVE TECHNICAL SUBSYSTEMS:
                </span>
                <div className="flex flex-wrap gap-2">
                  {recruitment.subsystems.map((subsystem) => (
                    <button
                      key={subsystem}
                      type="button"
                      onClick={() => setInterest(subsystem)}
                      className={`font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 transition-all duration-200 border text-left ${
                        interest === subsystem
                          ? "bg-[#e2f952] text-black border-[#e2f952] font-semibold"
                          : "bg-white/[0.03] border-white/15 text-neutral-400 hover:border-[#e2f952] hover:text-white"
                      }`}
                    >
                      {subsystem}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Contact & Coordinates */}
            <div className="pt-8 border-t border-white/15 font-mono text-xs text-neutral-400 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-neutral-500">Contact —</span>
                <a
                  href={`mailto:${recruitment.contactEmail}`}
                  className="text-white hover:text-[#e2f952] transition-colors underline underline-offset-4"
                >
                  {recruitment.contactEmail}
                </a>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="text-[10px] text-neutral-500 hover:text-[#e2f952] border border-white/15 px-2 py-0.5 ml-1 transition-colors uppercase"
                >
                  {copiedEmail ? "COPIED" : "COPY"}
                </button>
              </div>

              <div className="text-neutral-500 text-[11px] leading-relaxed">
                {recruitment.location}
              </div>

              <div className="text-[10px] text-neutral-600 flex items-center gap-2 pt-1">
                <span>IIST BASE: LAT 08°31&apos;N · LON 76°57&apos;E</span>
                <span>·</span>
                <span className="text-[#e2f952]">INTAKE ACTIVE</span>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: ENHANCED APPLICATION FORM ================= */}
          <div ref={formCardRef} className="lg:col-span-7">
            {submittedData ? (
              /* Success Confirmation Dossier */
              <div className="relative bg-neutral-950 border border-[#e2f952] p-8 sm:p-12 shadow-[0_0_80px_rgba(226,249,82,0.15)] overflow-hidden">
                {/* Corner Reticles */}
                <span className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#e2f952]" />
                <span className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#e2f952]" />
                <span className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#e2f952]" />
                <span className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#e2f952]" />

                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e2f952] animate-ping" />
                  <span className="font-mono text-xs uppercase tracking-widest text-[#e2f952] font-semibold">
                    [ APPLICATION TRANSMITTED // DOSSIER LOGGED ]
                  </span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mb-4">
                  Welcome to the Flight Queue, {submittedData.name.split(" ")[0]}.
                </h3>

                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed mb-8 font-sans">
                  Your application for the <strong className="text-white font-semibold">{submittedData.interest}</strong> subsystem has been registered in the Pegasus UAV telemetry database. Our subsystem leads will review your profile and reach out via your institute email.
                </p>

                {/* Candidate Telemetry Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.03] border border-white/10 p-5 mb-8 font-mono text-xs">
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">CANDIDATE</span>
                    <span className="text-white font-semibold">{submittedData.name}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">DISPATCH EMAIL</span>
                    <span className="text-white font-semibold">{submittedData.email}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">SUBSYSTEM</span>
                    <span className="text-[#e2f952] font-semibold">{submittedData.interest}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">TIME OF TRANSMISSION</span>
                    <span className="text-neutral-300">{submittedData.timestamp}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
                  <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                    REF ID: {submittedData.id || "LOGGED-LOCAL"} // VERIFIED
                  </span>

                  <button
                    type="button"
                    onClick={() => setSubmittedData(null)}
                    className="font-mono text-xs text-neutral-400 hover:text-[#e2f952] border border-white/20 hover:border-[#e2f952] px-4 py-2 transition-colors uppercase tracking-wider"
                  >
                    [ SUBMIT ANOTHER APPLICATION ↺ ]
                  </button>
                </div>
              </div>
            ) : (
              /* Main Enhanced Application Form */
              <div className="relative bg-neutral-950 border border-white/15 p-6 sm:p-10 shadow-2xl overflow-hidden group">
                {/* Tactical Corner Reticles */}
                <span className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />
                <span className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />
                <span className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />
                <span className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />

                {/* Form Top Status */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e2f952]" />
                    <span className="font-mono text-xs uppercase tracking-widest text-[#e2f952]">
                      RECRUITMENT APPLICATION FORM
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest">
                    ALL FIELDS REQUIRED *
                  </span>
                </div>

                {/* Error Banner */}
                {formError && (
                  <div className="mb-6 p-4 border border-red-500/40 bg-red-950/30 text-red-300 font-mono text-xs leading-relaxed">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <span>⚠ TRANSMISSION ALERT:</span>
                    </div>
                    <div>{formError}</div>
                    {rlsNotice && (
                      <div className="mt-2.5 pt-2.5 border-t border-red-500/30 text-[11px] text-neutral-400">
                        <span className="text-[#e2f952]">Supabase Notice:</span> To enable public applications in Supabase, execute this SQL in your project editor:
                        <code className="block mt-1 p-2 bg-black text-[#e2f952] border border-white/15 select-all">
                          CREATE POLICY &quot;Enable insert for all users&quot; ON &quot;public&quot;.&quot;applications&quot; FOR INSERT WITH CHECK (true);
                        </code>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Row 1: Full name & Institute email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Full Name Input */}
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block font-mono text-[11px] text-neutral-400 uppercase tracking-wider mb-2"
                      >
                        [ 01 // FULL NAME * ]
                      </label>
                      <div className="relative">
                        <input
                          id="fullName"
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Full name"
                          className="w-full bg-neutral-900/90 border border-white/20 focus:border-[#e2f952] text-white placeholder-neutral-500 px-4 py-3.5 text-sm sm:text-base font-sans outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Institute Email Input */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block font-mono text-[11px] text-neutral-400 uppercase tracking-wider mb-2"
                      >
                        [ 02 // INSTITUTE EMAIL * ]
                      </label>
                      <div className="relative">
                        <input
                          id="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Institute email (e.g. rollno@iist.ac.in)"
                          className="w-full bg-neutral-900/90 border border-white/20 focus:border-[#e2f952] text-white placeholder-neutral-500 px-4 py-3.5 text-sm sm:text-base font-sans outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Area of interest (Select dropdown) */}
                  <div>
                    <label
                      htmlFor="interest"
                      className="block font-mono text-[11px] text-neutral-400 uppercase tracking-wider mb-2"
                    >
                      [ 03 // AREA OF INTEREST * ]
                    </label>
                    <div className="relative">
                      <select
                        id="interest"
                        required
                        value={interest}
                        onChange={(e) => setInterest(e.target.value)}
                        className={`w-full bg-neutral-900/90 border border-white/20 focus:border-[#e2f952] px-4 py-3.5 text-sm sm:text-base font-sans outline-none transition-colors appearance-none cursor-pointer ${
                          interest ? "text-white" : "text-neutral-500"
                        }`}
                      >
                        <option value="" disabled className="bg-neutral-950 text-neutral-500">
                          Area of interest
                        </option>
                        {recruitment.subsystems.map((sub) => (
                          <option key={sub} value={sub} className="bg-neutral-950 text-white py-1">
                            {sub}
                          </option>
                        ))}
                      </select>

                      {/* Custom Chevron Icon */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                        <svg
                          className="w-4 h-4 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Anything you've built before (optional) */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block font-mono text-[11px] text-neutral-400 uppercase tracking-wider mb-2"
                    >
                      [ 04 // PRIOR BUILDS & PROJECTS (OPTIONAL) ]
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Anything you've built before? (optional) — software, RC planes, quadcopters, CAD models, electronics, or relevant links..."
                      className="w-full bg-neutral-900/90 border border-white/20 focus:border-[#e2f952] text-white placeholder-neutral-500 px-4 py-3.5 text-sm sm:text-base font-sans outline-none transition-colors resize-y leading-relaxed"
                    />
                  </div>

                  {/* Row 4: Submit button */}
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-4 px-6 text-center font-mono text-sm sm:text-base font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 select-none ${
                        isSubmitting
                          ? "bg-neutral-800 text-neutral-400 cursor-not-allowed border border-white/10"
                          : "bg-[#e2f952] hover:bg-white text-black shadow-[0_0_30px_rgba(226,249,82,0.25)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-neutral-400 animate-ping" />
                          <span>TRANSMITTING DOSSIER...</span>
                        </>
                      ) : (
                        <>
                          <span>SUBMIT APPLICATION</span>
                          <span className="text-black font-bold">↗</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Form Bottom Privacy & Telemetry Footnote */}
                <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] text-neutral-500">
                  <span>DATA DISPATCH // DIRECT TO PEGASUS RECRUITMENT DESK</span>
                  <span>ENCRYPTED VIA SUPABASE SSL</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
