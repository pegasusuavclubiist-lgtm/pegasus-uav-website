"use client";

import React from "react";
import Link from "next/link";
import { siteData } from "@/data/data";
import Footer from "@/components/Footer";

export default function ConstitutionPage() {
  const { constitution } = siteData;

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-[#e2f952] selection:text-black font-sans">
      {/* Tactical Coordinate Grid Overlay */}
      <div className="fixed inset-0 z-0 bg-grid-pattern opacity-15 pointer-events-none" />

      {/* ================= STICKY TACTICAL HEADER ================= */}
      <header className="sticky top-0 z-40 w-full bg-black/90 backdrop-blur-md border-b border-white/15">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#e2f952] hover:text-white px-3 py-1.5 border border-[#e2f952]/40 bg-[#e2f952]/5 hover:bg-[#e2f952]/15 transition-all"
            >
              <span>←</span>
              <span>RETURN TO FLIGHT OPS</span>
            </Link>

            <span className="hidden md:inline font-mono text-xs text-neutral-500 uppercase tracking-widest">
              [ {constitution.edition} ]
            </span>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex items-center gap-3">
            <a
              href={constitution.pdfUrl}
              download={constitution.downloadFileName}
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-semibold text-black bg-[#e2f952] hover:bg-[#cbe33e] px-3.5 py-1.5 transition-colors border border-[#e2f952]"
            >
              <span>DOWNLOAD PDF</span>
              <span>↓</span>
            </a>

            <a
              href={constitution.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-neutral-300 hover:text-white px-3 py-1.5 border border-white/20 hover:border-white transition-colors"
            >
              <span>OPEN FULLSCREEN</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* ================= HERO INTRO ================= */}
        <section className="relative w-full border-b border-white/15 pt-12 pb-12 overflow-hidden">
          {/* Subtle Radar Ring Background Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-white/[0.03] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] rounded-full border border-white/[0.02] pointer-events-none" />

          <div className="max-w-[1800px] mx-auto px-6 md:px-12">
            {/* Top Eyebrow Tag */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-[#e2f952]">
                <span className="w-2 h-2 rounded-full bg-[#e2f952] animate-pulse" />
                <span>[ 00 -- GOVERNING CHARTER // OPERATIONAL BLUEPRINT ]</span>
              </div>
              <span className="font-mono text-xs text-neutral-500 uppercase tracking-widest">
                DEPARTMENT OF SPACE · GOVT. OF INDIA
              </span>
            </div>

            {/* Headline & Subtitle */}
            <div className="max-w-5xl">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter leading-[0.95]">
                {constitution.title}
              </h1>

              <div className="mt-3 inline-block font-mono text-xs sm:text-sm md:text-base text-[#e2f952] tracking-wider uppercase bg-[#e2f952]/10 border border-[#e2f952]/30 px-3 py-1">
                {constitution.fullName}
              </div>

              <p className="mt-4 text-sm sm:text-base md:text-lg text-neutral-300 font-normal leading-relaxed max-w-3xl border-l-2 border-[#e2f952] pl-4">
                {constitution.subtitle}
              </p>
            </div>

            {/* Document Telemetry Strip & Download Options */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-white/10">
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-wider">
                <div className="px-3 py-1.5 bg-white/[0.04] border border-white/15 text-neutral-300">
                  <span className="text-neutral-500 mr-2">PAGES //</span>
                  <span className="text-white font-semibold">{constitution.pageCount} PAGES</span>
                </div>
                <div className="px-3 py-1.5 bg-white/[0.04] border border-white/15 text-neutral-300">
                  <span className="text-neutral-500 mr-2">ASSET //</span>
                  <span className="text-[#e2f952] font-semibold">{constitution.fileSize} PDF</span>
                </div>
                <div className="px-3 py-1.5 bg-white/[0.04] border border-white/15 text-neutral-300">
                  <span className="text-neutral-500 mr-2">MOTTO //</span>
                  <span className="text-white font-semibold">&ldquo;{constitution.motto}&rdquo;</span>
                </div>
              </div>

              {/* Download Action Buttons */}
              <div className="flex items-center gap-3">
                <a
                  href={constitution.pdfUrl}
                  download={constitution.downloadFileName}
                  className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-bold text-black bg-[#e2f952] hover:bg-[#cbe33e] px-5 py-2.5 transition-all shadow-[0_0_25px_rgba(226,249,82,0.3)] hover:shadow-[0_0_35px_rgba(226,249,82,0.5)] cursor-pointer"
                >
                  <span>DOWNLOAD PDF ({constitution.fileSize})</span>
                  <span>↓</span>
                </a>

                <a
                  href={constitution.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-neutral-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/20 hover:border-white px-4 py-2.5 transition-all"
                >
                  <span>FULLSCREEN</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 1. THE PDF VIEWER ================= */}
        <section className="max-w-[1800px] mx-auto px-6 md:px-12 py-10">
          <div className="relative bg-neutral-950 border border-white/20 shadow-2xl p-4 sm:p-6">
            {/* Corner Reticles */}
            <span className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-[#e2f952]" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-[#e2f952]" />
            <span className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-[#e2f952]" />
            <span className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-[#e2f952]" />

            {/* Viewer Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-white/15 font-mono text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#e2f952]" />
                <span className="text-white font-semibold">
                  {constitution.downloadFileName}
                </span>
                <span className="text-neutral-500 hidden sm:inline">
                  [ {constitution.pageCount} PAGES · {constitution.fileSize} ]
                </span>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={constitution.pdfUrl}
                  download={constitution.downloadFileName}
                  className="text-[#e2f952] hover:underline uppercase tracking-wider"
                >
                  DOWNLOAD PDF [ ↓ ]
                </a>
                <span className="text-neutral-600">|</span>
                <a
                  href={constitution.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white uppercase tracking-wider"
                >
                  OPEN IN SEPARATE TAB [ ↗ ]
                </a>
              </div>
            </div>

            {/* Embedded Document Frame */}
            <div className="relative w-full h-[85vh] bg-neutral-900 overflow-hidden border border-white/10">
              <iframe
                src={`${constitution.pdfUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full"
                title="Constitution of P.E.G.A.S.U.S. PDF Viewer"
              />
            </div>

            {/* Telemetry Footer of Viewer */}
            <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between text-neutral-500 font-mono text-[11px]">
              <span>
                Document rendered via browser PDF pipeline. If your browser restricts embedded viewing, use the download button above.
              </span>
              <span className="text-[#e2f952]">VERIFIED OFFICIAL RELEASE</span>
            </div>
          </div>
        </section>

        {/* ================= 2. FOUNDING MEMBERS SECTION ================= */}
        <section className="max-w-[1800px] mx-auto px-6 md:px-12 py-16 border-t border-white/15">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs md:text-sm uppercase tracking-widest text-[#e2f952]">
              [ 01 -- HISTORICAL CADRE ]
            </span>
            <span className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest">
              RATIFIED FOUNDING ROSTER
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
            Founding Members
          </h2>
          <p className="font-mono text-xs text-neutral-400 uppercase tracking-widest max-w-2xl mb-10">
            Honouring the 14 founding student engineers and founding faculty in charge whose vision and pioneering work gave flight to Pegasus UAV Club.
          </p>

          {/* Founding Cadre Grid */}
          <div className="bg-neutral-950 border border-white/20 p-6 sm:p-12 relative">
            <span className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-[#e2f952]" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-[#e2f952]" />
            <span className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-[#e2f952]" />
            <span className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-[#e2f952]" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 max-w-3xl mx-auto py-4">
              {constitution.foundingMembers.map((member, i) => (
                <div
                  key={member.name}
                  className="flex items-center justify-between p-3.5 bg-black/50 border border-white/10 hover:border-[#e2f952]/60 transition-colors"
                >
                  <span className="font-mono text-sm sm:text-base font-semibold text-white">
                    {member.name}
                  </span>
                  <span className="font-mono text-[10px] text-neutral-500 uppercase">
                    [ FND-0{i + 1} ]
                  </span>
                </div>
              ))}
            </div>

            {/* Founding Faculty in Charge */}
            <div className="mt-12 pt-8 border-t border-white/15 text-center max-w-xl mx-auto">
              <div className="inline-block font-mono text-[11px] text-[#e2f952] uppercase tracking-widest bg-white/[0.04] border border-white/15 px-3 py-1 mb-2">
                {constitution.foundingFaculty.title}
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white">
                {constitution.foundingFaculty.name}
              </h3>
              <p className="font-mono text-xs text-neutral-400 mt-1 uppercase tracking-wider">
                {constitution.foundingFaculty.department}
              </p>
            </div>
          </div>

          {/* Bottom Direct Download Banner */}
          <div className="mt-12 p-8 bg-neutral-950 border border-[#e2f952]/40 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-[#e2f952] uppercase tracking-widest mb-1">
                <span className="w-2 h-2 rounded-full bg-[#e2f952]" />
                <span>OFFICIAL RATIFIED DOCUMENT AVAILABLE</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                Download the Complete 33-Page Constitution
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-mono">
                Format: PDF · Size: {constitution.fileSize} · Edition: {constitution.edition}
              </p>
            </div>

            <a
              href={constitution.pdfUrl}
              download={constitution.downloadFileName}
              className="font-mono text-xs uppercase tracking-wider font-bold text-black bg-[#e2f952] hover:bg-[#cbe33e] px-6 py-3.5 transition-colors whitespace-nowrap border border-[#e2f952]"
            >
              DOWNLOAD PDF NOW ↓
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
