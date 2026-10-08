"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Marquee from "@/components/Marquee";
import RequestInventory from "@/components/RequestInventory";
import { siteData } from "@/data/data";

export default function RequestHardwarePage() {
  const { inventoryRequest } = siteData;

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-[#e2f952] selection:text-black">
      <Header />

      <main className="pt-24 md:pt-32">
        {/* Tactical Subpage Header / Breadcrumb HUD */}
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-6 mb-8 font-mono text-xs uppercase tracking-widest">
            <div className="flex items-center gap-3 text-neutral-400">
              <Link href="/" className="hover:text-[#e2f952] transition-colors">
                FLIGHT OPS
              </Link>
              <span>/</span>
              <span className="text-[#e2f952]">HARDWARE REQUISITION</span>
            </div>

            <div className="flex items-center gap-4 text-neutral-500">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e2f952] animate-ping" />
              <span>[ AVIONICS BAY // IIST VALIAMALA ]</span>
            </div>
          </div>
        </div>

        {/* The Requisition Component */}
        <RequestInventory />
      </main>

      {/* Marquee Ticker */}
      <Marquee outline text={siteData.marquee?.cadreText || "PEGASUS UAV CLUB · IIST"} />

      <Footer />
    </div>
  );
}
