"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { siteData } from "@/data/data";
import NavbarTicker from "@/components/NavbarTicker";

export default function Header() {
  const { header, projectPageUi } = siteData;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname() || "/";
  const isSubpage = pathname !== "/";

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-black/80 backdrop-blur-md">
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Brand / Title */}
        <Link
          href="/"
          className="group flex items-center gap-3 font-mono text-xs md:text-sm tracking-wider uppercase text-white hover:text-[#e2f952] transition-colors"
        >
          <div className="relative w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden flex-shrink-0 border border-white/20 group-hover:border-[#e2f952]/80 group-hover:scale-105 transition-all duration-300 bg-black/40">
            <Image
              src={header.logoUrl}
              alt="Pegasus UAV Club Emblem"
              width={36}
              height={36}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <span>{header.title}</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {header.navLinks.map((link, idx) => {
            const anchor = `#${link.toLowerCase().replace(/\s+/g, "-")}`;
            const href = isSubpage ? `/${anchor}` : anchor;
            return (
              <a
                key={link}
                href={href}
                className="group relative font-mono text-xs uppercase tracking-widest text-neutral-400 hover:text-white py-1 transition-colors"
              >
                <span className="text-neutral-600 mr-1 text-[10px]">
                  0{idx + 1}
                </span>
                {link}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#e2f952] transition-all duration-200 group-hover:w-full" />
              </a>
            );
          })}
        </nav>

        {/* Action / Telemetry Tag */}
        <div className="hidden sm:flex items-center gap-3">
          {isSubpage ? (
            <Link
              href="/"
              className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 border border-[#e2f952]/60 bg-[#e2f952]/10 text-[#e2f952] hover:bg-[#e2f952] hover:text-black transition-all flex items-center gap-1.5"
            >
              <span>←</span>
              <span>{pathname.includes("constitution") ? "RETURN TO FLIGHT OPS" : projectPageUi.backToHangar}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/constitution"
                className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 border border-white/20 hover:border-[#e2f952] bg-white/5 hover:text-[#e2f952] text-neutral-300 transition-all flex items-center gap-1"
              >
                <span>[ CHARTER ↗ ]</span>
              </Link>
              <div className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 border border-white/20 bg-white/5 text-neutral-300">
                [ LOC: IIST // LAT: 8.6°N ]
              </div>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden font-mono text-xs uppercase tracking-widest text-white px-3 py-1.5 border border-white/20 hover:border-[#e2f952]"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? "[ CLOSE ]" : "[ MENU ]"}
        </button>
      </div>

      {/* Marquee Ticker just below the navbar */}
      <NavbarTicker />

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl px-6 py-8 flex flex-col gap-4">
          {isSubpage && (
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="font-mono text-sm tracking-widest uppercase text-[#e2f952] flex items-center justify-between border-b border-white/10 pb-2"
            >
              <span>← {pathname.includes("constitution") ? "RETURN TO FLIGHT OPS" : projectPageUi.backToHangar}</span>
              <span className="text-neutral-500 text-xs">[ 00 ]</span>
            </Link>
          )}
          <Link
            href="/constitution"
            onClick={() => setMobileMenuOpen(false)}
            className="font-mono text-sm tracking-widest uppercase text-[#e2f952] flex items-center justify-between border-b border-white/10 pb-2"
          >
            <span>CONSTITUTION & CHARTER</span>
            <span className="text-[#e2f952] text-xs">[ DOC ]</span>
          </Link>
          {header.navLinks.map((link, idx) => {
            const anchor = `#${link.toLowerCase().replace(/\s+/g, "-")}`;
            const href = isSubpage ? `/${anchor}` : anchor;
            return (
              <a
                key={link}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-mono text-sm tracking-widest uppercase text-neutral-300 hover:text-[#e2f952] flex items-center justify-between border-b border-white/10 pb-2"
              >
                <span>{link}</span>
                <span className="text-neutral-600 text-xs">[ 0{idx + 1} ]</span>
              </a>
            );
          })}
        </div>
      )}
    </header>
  );
}
