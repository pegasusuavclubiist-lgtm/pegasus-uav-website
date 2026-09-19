"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteData } from "@/data/data";

export default function Footer() {
  const { header } = siteData;
  const pathname = usePathname() || "/";
  const isSubpage = pathname !== "/";

  const getHref = (link: string) => {
    const anchor = link.toLowerCase().replace(/\s+/g, "-");
    return isSubpage ? `/#${anchor}` : `#${anchor}`;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-black text-white border-t border-white/15 pt-16 pb-12">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        {/* Top footer row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/15">
          {/* Col 1-6: Big Brand mark */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#e2f952] font-mono text-xs uppercase tracking-widest mb-3">
                <span className="w-2 h-2 rounded-full bg-[#e2f952] animate-pulse" />
                <span>IIST AEROSPACE INNOVATION</span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-white">
                {header.title}
              </h2>
              <p className="mt-4 text-neutral-400 text-sm md:text-base max-w-md font-light leading-relaxed">
                Autonomous aerial robotics engineered for extreme GPS-denied environments.
              </p>
            </div>

            <div className="mt-8 font-mono text-xs text-neutral-500 flex flex-col sm:flex-row sm:items-center gap-4">
              <span>BASE: IIST, TRIVANDRUM</span>
              <span className="hidden sm:inline">·</span>
              <span>COORDS: 8.6277° N, 77.0379° E</span>
            </div>
          </div>

          {/* Col 7-12: Navigation & Subsystems */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-[#e2f952] mb-4">
                [ INDEX ]
              </div>
              <ul className="flex flex-col gap-2.5 font-mono text-xs uppercase text-neutral-400">
                {header.navLinks.slice(0, 4).map((link) => (
                  <li key={link}>
                    <a
                      href={getHref(link)}
                      className="hover:text-white transition-colors hover:translate-x-1 inline-block"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">
                [ NETWORK ]
              </div>
              <ul className="flex flex-col gap-2.5 font-mono text-xs uppercase text-neutral-400">
                {header.navLinks.slice(4).map((link) => (
                  <li key={link}>
                    <a
                      href={getHref(link)}
                      className="hover:text-white transition-colors hover:translate-x-1 inline-block"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">
                [ TERMINAL ]
              </div>
              <div className="p-3 border border-white/15 bg-white/[0.02] font-mono text-[11px] text-neutral-400 flex flex-col gap-2">
                <div className="text-[#e2f952]">// SYSTEM STATUS</div>
                <div>AVIONICS: NOMINAL</div>
                <div>AUTONOMY: READY</div>
                <Link
                  href="/constitution"
                  className="mt-2 text-left text-neutral-400 underline hover:text-[#e2f952] transition-colors"
                >
                  [ CONSTITUTION & CHARTER → ]
                </Link>
                <Link
                  href="/admin"
                  className="mt-1 text-left text-neutral-400 underline hover:text-[#e2f952] transition-colors"
                >
                  [ CADRE ADMIN CONSOLE → ]
                </Link>
                <button
                  onClick={scrollToTop}
                  className="mt-2 text-left text-white underline hover:text-[#e2f952] transition-colors"
                >
                  [ RETURN TOP ↑ ]
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs text-neutral-500">
          <div>
            © {new Date().getFullYear()} PEGASUS UAV CLUB. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[#e2f952]">BRUTALIST AGENCY x AEROSPACE</span>
            <span>INDIAN INSTITUTE OF SPACE SCIENCE AND TECHNOLOGY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
