"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { siteData } from "@/data/data";

interface AdminHeaderProps {
  activeTab: "updates" | "inventory" | "members" | "projects";
  onTabChange: (tab: "updates" | "inventory" | "members" | "projects") => void;
  onLock: () => void;
  supabaseConnected: boolean;
  adminEmail?: string;
}

export default function AdminHeader({
  activeTab,
  onTabChange,
  onLock,
  supabaseConnected,
  adminEmail,
}: AdminHeaderProps) {
  const { admin } = siteData;
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utc = now.toUTCString().split(" ").slice(4, 5)[0];
      const dateStr = now.toISOString().split("T")[0];
      setCurrentTime(`${dateStr} · ${utc} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-black/90 backdrop-blur-md border-b border-white/15">
      {/* Top Telemetry Ticker Bar */}
      <div className="w-full border-b border-white/10 bg-neutral-950 px-6 py-2">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-neutral-400">
          <div className="flex items-center gap-4">
            <span className="text-[#e2f952] font-bold">PEGASUS UAV CLUB // IIST</span>
            <span className="text-neutral-600 hidden sm:inline">|</span>
            <span className="hidden sm:inline text-neutral-300">{admin.callsign}</span>
            <span className="text-neutral-600 hidden sm:inline">|</span>
            <span className="text-neutral-400">{currentTime}</span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  supabaseConnected ? "bg-[#e2f952] animate-pulse" : "bg-amber-400"
                }`}
              />
              <span className={supabaseConnected ? "text-[#e2f952]" : "text-amber-400"}>
                {supabaseConnected ? "SUPABASE LIVE" : "LOCAL HYBRID SYNC"}
              </span>
            </div>

            {adminEmail && (
              <span className="text-neutral-400 hidden lg:inline font-mono text-[10px]">
                OFFICER: <strong className="text-neutral-200">{adminEmail}</strong>
              </span>
            )}

            <Link
              href="/"
              className="hover:text-[#e2f952] underline underline-offset-4 transition-colors"
            >
              ← RETURN TO PUBLIC SITE
            </Link>

            <button
              onClick={onLock}
              className="text-red-400 hover:text-red-300 transition-colors uppercase"
            >
              [ LOGOUT / LOCK ]
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar with Branding and Tabs */}
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#e2f952] uppercase tracking-widest font-bold">
              [ {admin.code} ]
            </span>
            <span className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest hidden sm:inline">
              // ADMIN CONTROL CENTER
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
            {admin.title}
          </h1>
        </div>

        {/* Tab Controls */}
        <nav className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0" aria-label="Admin Navigation Tabs">
          {admin.tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-3 px-5 py-2.5 font-mono text-xs uppercase tracking-wider transition-all duration-200 border whitespace-nowrap ${
                  isActive
                    ? "bg-[#e2f952] text-black border-[#e2f952] font-bold shadow-[0_0_15px_rgba(226,249,82,0.3)]"
                    : "bg-neutral-900/60 text-neutral-400 border-white/15 hover:border-white/40 hover:text-white"
                }`}
              >
                <span className={isActive ? "text-neutral-900 font-black" : "text-neutral-500"}>
                  [ {tab.code} ]
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
