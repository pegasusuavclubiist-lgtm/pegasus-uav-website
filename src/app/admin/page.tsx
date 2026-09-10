"use client";

import React, { useState, useEffect } from "react";
import AdminAuthGate from "@/components/admin/AdminAuthGate";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminUpdatesManager from "@/components/admin/AdminUpdatesManager";
import AdminInventoryManager from "@/components/admin/AdminInventoryManager";
import AdminMembersManager from "@/components/admin/AdminMembersManager";
import AdminProjectsManager from "@/components/admin/AdminProjectsManager";
import { siteData } from "@/data/data";
import { createClient } from "@/lib/supabase/client";

export default function AdminPage() {
  const { admin } = siteData;
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"updates" | "inventory" | "members" | "projects">("updates");
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);

  // Check auth session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("pegasus_admin_auth");
      const storedEmail = sessionStorage.getItem("pegasus_admin_email");
      if (stored === "true") {
        setIsAuthenticated(true);
        if (storedEmail) setAdminEmail(storedEmail);
      }
    }
  }, []);

  // Probe Supabase connection heartbeat
  useEffect(() => {
    const checkConn = async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("updates").select("id").limit(1);
        setSupabaseConnected(!error || error.code === "42501"); // connected even if RLS protected
      } catch {
        setSupabaseConnected(false);
      }
    };
    checkConn();
  }, []);

  const handleLock = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("pegasus_admin_auth");
      sessionStorage.removeItem("pegasus_admin_email");
    }
    const supabase = createClient();
    supabase.auth.signOut().catch(() => {});
    setIsAuthenticated(false);
    setAdminEmail("");
  };

  if (!isAuthenticated) {
    return (
      <AdminAuthGate
        onAuthenticated={(email) => {
          setIsAuthenticated(true);
          if (email) setAdminEmail(email);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative selection:bg-[#e2f952] selection:text-black">
      {/* Background Reticle Grid */}
      <div className="fixed inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      {/* Admin HUD Header */}
      <AdminHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLock={handleLock}
        supabaseConnected={supabaseConnected}
        adminEmail={adminEmail}
      />

      {/* Main Command Workspace */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 md:px-10 py-8 md:py-12 relative z-10">
        {/* Module Header Banner */}
        <div className="border-b border-white/15 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 font-mono text-xs uppercase tracking-widest text-[#e2f952]">
              <span className="w-2 h-2 rounded-full bg-[#e2f952] animate-pulse" />
              <span>
                [ {activeTab === "updates"
                    ? "MODULE 01 — CADRE MISSION DISPATCHES"
                    : activeTab === "inventory"
                    ? "MODULE 02 — HARDWARE INVENTORY"
                    : activeTab === "members"
                    ? "MODULE 03 — CORE PERSONNEL CADRE"
                    : "MODULE 04 — FLIGHT RESEARCH & PROJECTS"} ]
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
              {activeTab === "updates"
                ? "Cadre Updates & Operational Bulletins"
                : activeTab === "inventory"
                ? "Club Avionics & Hardware Inventory"
                : activeTab === "members"
                ? "Flight Roster & Core Personnel Cadre"
                : "Ongoing Builds & Autonomous Projects"}
            </h2>
          </div>

          <div className="font-mono text-xs text-neutral-400 uppercase tracking-widest flex items-center gap-3">
            <span>TERMINAL CADRE: <strong className="text-white">{admin.callsign}</strong></span>
            <span className="text-neutral-600">·</span>
            <span className="text-[#e2f952]">● ACTIVE FLIGHT SESSION</span>
          </div>
        </div>

        {/* Tab Module Display */}
        {activeTab === "updates" ? (
          <AdminUpdatesManager />
        ) : activeTab === "inventory" ? (
          <AdminInventoryManager />
        ) : activeTab === "members" ? (
          <AdminMembersManager />
        ) : (
          <AdminProjectsManager />
        )}
      </main>

      {/* Tactical Console Footer */}
      <footer className="w-full border-t border-white/10 bg-neutral-950 py-4 px-6 relative z-10 font-mono text-[11px] text-neutral-500">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[#e2f952] font-bold">PEGASUS LAB SYSTEM</span>
            <span>// IIST THIRUVANANTHAPURAM</span>
          </div>
          <div>
            AUTONOMY AT ALTITUDE · ALL RIGHTS RESERVED
          </div>
        </div>
      </footer>
    </div>
  );
}
