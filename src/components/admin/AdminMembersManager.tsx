"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  fetchTeamMembers,
  addTeamMember,
  deleteTeamMember,
  uploadMemberPhoto,
  SupabaseTeamMember,
} from "@/lib/supabase/team";

export default function AdminMembersManager() {
  const [members, setMembers] = useState<SupabaseTeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [paragraph, setParagraph] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [department, setDepartment] = useState("understudy");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // UI state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState<SupabaseTeamMember | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // RLS SQL Helper state
  const [showSqlHelper, setShowSqlHelper] = useState(false);

  // Load members from Supabase & local cache
  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await fetchTeamMembers();
      setMembers(data);
    } catch (err) {
      console.error("Failed to fetch team members in admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  // Handle local image file upload to Supabase storage bucket
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setStatusMessage({
      type: "info",
      text: "TRANSMITTING OPERATIVE PHOTO TO MEDIA STORAGE...",
    });

    const res = await uploadMemberPhoto(file);
    setUploadingPhoto(false);

    if (res.success && res.publicUrl) {
      setPhotoUrl(res.publicUrl);
      if (res.isRlsFallback) {
        setStatusMessage({
          type: "info",
          text: "PHOTO ATTACHED DIRECTLY (Storage RLS active: image encoded for instant save without bucket errors)",
        });
        setShowSqlHelper(true);
      } else {
        setStatusMessage({
          type: "success",
          text: "PHOTO HOSTED & ATTACHED SUCCESSFULLY",
        });
      }
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setStatusMessage({
        type: "error",
        text: `STORAGE NOTICE: ${res.error || "Upload policy active. You can paste a public photo URL directly."}`,
      });
    }
  };

  // Submit new core member
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setStatusMessage({ type: "error", text: "OPERATIVE NAME IS REQUIRED" });
      return;
    }
    if (!designation.trim()) {
      setStatusMessage({ type: "error", text: "DESIGNATION / ROLE IS REQUIRED" });
      return;
    }
    if (!paragraph.trim()) {
      setStatusMessage({ type: "error", text: "SMALL PARAGRAPH / BIO IS REQUIRED" });
      return;
    }
    if (!photoUrl.trim()) {
      setStatusMessage({ type: "error", text: "OPERATIVE PHOTO IS REQUIRED (UPLOAD OR URL)" });
      return;
    }

    setSubmitting(true);
    setStatusMessage({ type: "info", text: "TRANSMITTING MEMBER TO DATABASE CADRE..." });

    const payload = {
      name: name.trim(),
      role: designation.trim(),
      subsystem: paragraph.trim(),
      photo_url: photoUrl.trim(),
      department: department.trim() || "understudy",
      display_order: members.length + 1,
    };

    const res = await addTeamMember(payload);
    setSubmitting(false);

    if (res.success) {
      setStatusMessage({
        type: "success",
        text: res.isRlsError
          ? "CORE MEMBER ENLISTED (CACHED LOCALLY — RUN RLS SQL SCRIPT IN SUPABASE TO ENABLE DIRECT WRITES)"
          : "CORE MEMBER ENLISTED IN DATABASE ROSTER SUCCESSFULLY",
      });

      if (res.isRlsError) {
        setShowSqlHelper(true);
      }

      // Reset form
      setName("");
      setDesignation("");
      setParagraph("");
      setPhotoUrl("");
      setDepartment("understudy");
      setIsFormOpen(false);

      // Reload
      loadMembers();
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setStatusMessage({
        type: "error",
        text: `ENLISTMENT FAILED: ${res.error || "Unknown database error"}`,
      });
    }
  };

  // Execute member removal
  const executeDelete = async () => {
    if (!deleteTarget) return;

    const targetId = deleteTarget.id;
    setDeletingId(targetId);

    // Optimistically filter out
    setMembers((prev) => prev.filter((m) => m.id !== targetId));

    const res = await deleteTeamMember(targetId);
    setDeletingId(null);
    setDeleteTarget(null);

    if (res.success) {
      setStatusMessage({
        type: "success",
        text: "OPERATIVE EXPUNGED FROM CADRE DATABASE",
      });
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage({
        type: "error",
        text: `DELETION FAILED: ${res.error || "Unable to remove operative"}`,
      });
      loadMembers();
    }
  };

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchQuery =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.subsystem && m.subsystem.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchDept =
        departmentFilter === "all" ||
        (m.department || "understudy").toLowerCase() === departmentFilter.toLowerCase();

      return matchQuery && matchDept;
    });
  }, [members, searchQuery, departmentFilter]);

  const coreCount = members.filter(
    (m) => (m.department || "understudy").toLowerCase() === "understudy"
  ).length;

  return (
    <div className="space-y-8">
      {/* Telemetry Status Bar */}
      {statusMessage && (
        <div
          className={`p-4 border font-mono text-xs uppercase tracking-wider flex items-center justify-between transition-all ${
            statusMessage.type === "success"
              ? "bg-[#e2f952]/10 border-[#e2f952] text-[#e2f952]"
              : statusMessage.type === "error"
              ? "bg-red-950/40 border-red-500 text-red-300"
              : "bg-blue-950/40 border-blue-500 text-blue-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            <span>[ {statusMessage.text} ]</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-white hover:underline text-[10px]"
          >
            [ DISMISS ]
          </button>
        </div>
      )}

      {/* SQL Migration Helper Banner */}
      {showSqlHelper && (
        <div className="border border-amber-500/40 bg-amber-950/20 p-5 rounded-none font-mono text-xs space-y-3">
          <div className="flex items-center justify-between text-amber-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-bold">[ SUPABASE RLS MIGRATION NOTICE ]</span>
            </div>
            <button
              onClick={() => setShowSqlHelper(false)}
              className="text-neutral-400 hover:text-white uppercase text-[10px]"
            >
              [ HIDE ]
            </button>
          </div>
          <p className="text-neutral-300">
            Your new core member and photo are saved in local browser storage and visible immediately. To allow direct, permanent cloud uploads & database writes without RLS errors, execute this snippet in your Supabase SQL Editor:
          </p>
          <pre className="bg-black/80 p-3 border border-white/10 text-[#e2f952] text-[11px] overflow-x-auto selection:bg-[#e2f952] selection:text-black">
{`-- 1. Allow Storage uploads to 'media' bucket:
DROP POLICY IF EXISTS "Allow public uploads to media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read media" ON storage.objects;
CREATE POLICY "Allow public read media" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'media');
CREATE POLICY "Allow public uploads to media" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'media');

-- 2. Allow Database writes to team_members table:
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow public delete team_members" ON public.team_members;
CREATE POLICY "Allow public insert team_members" ON public.team_members FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public delete team_members" ON public.team_members FOR DELETE TO anon, authenticated USING (true);`}
          </pre>
        </div>
      )}

      {/* Cadre Top Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-neutral-950 border border-white/15">
          <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
            CORE MEMBERS CADRE
          </div>
          <div className="text-3xl font-black text-[#e2f952] mt-1 font-mono">
            {coreCount}
          </div>
          <div className="font-mono text-[10px] text-neutral-400 mt-1">
            CATEGORY 04 // UNDERSTUDY
          </div>
        </div>

        <div className="p-4 bg-neutral-950 border border-white/15">
          <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
            TOTAL FLIGHT CADRE
          </div>
          <div className="text-3xl font-black text-white mt-1 font-mono">
            {members.length}
          </div>
          <div className="font-mono text-[10px] text-neutral-400 mt-1">
            ALL DIVISIONS COMBINED
          </div>
        </div>

        <div className="p-4 bg-neutral-950 border border-white/15">
          <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
            DATABASE SYNC
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e2f952] animate-pulse" />
            <span className="font-mono text-sm font-bold text-white">LIVE TELEMETRY</span>
          </div>
          <div className="font-mono text-[10px] text-neutral-400 mt-1">
            SUPABASE // TABLE: team_members
          </div>
        </div>

        <div className="p-4 bg-neutral-950 border border-white/15 flex flex-col justify-between">
          <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
            ACTION CONSOLE
          </div>
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className={`w-full py-2 px-3 font-mono text-xs uppercase tracking-wider font-bold border transition-all mt-2 flex items-center justify-center gap-2 ${
              isFormOpen
                ? "bg-red-950/40 border-red-500 text-red-400 hover:bg-red-900/40"
                : "bg-[#e2f952] border-[#e2f952] text-black hover:bg-white hover:border-white shadow-[0_0_15px_rgba(226,249,82,0.2)]"
            }`}
          >
            <span>{isFormOpen ? "✕ CLOSE ENLISTMENT FORM" : "+ ENLIST CORE MEMBER"}</span>
          </button>
        </div>
      </div>

      {/* Enlistment Modal / Drawer */}
      {isFormOpen && (
        <div className="bg-neutral-950 border-2 border-[#e2f952] p-6 sm:p-8 relative shadow-[0_0_30px_rgba(226,249,82,0.15)] animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#e2f952]" />
              <h3 className="font-mono text-sm uppercase tracking-widest text-[#e2f952] font-black">
                [ ENLIST CORE MEMBER // CADRE INTAKE ]
              </h3>
            </div>
            <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
              DATABASE TABLE: team_members
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider mb-2">
                  Operative Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikramaditya Rao"
                  className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-sm px-4 py-3 outline-none transition-colors uppercase"
                  required
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider mb-2">
                  Designation / Subsystem Role *
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Flight Control Lead / Autonomy Specialist"
                  className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-sm px-4 py-3 outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Small Paragraph / Bio (stored in existing 'subsystem' column) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider">
                  Small Paragraph / Operative Bio *
                </label>
                <span className="font-mono text-[10px] text-[#e2f952]">
                  STORED IN DATABASE FIELD: subsystem
                </span>
              </div>
              <textarea
                value={paragraph}
                onChange={(e) => setParagraph(e.target.value)}
                rows={4}
                placeholder="A concise paragraph detailing the operative's responsibilities, subsystem focus, or technical contributions to Pegasus UAV builds..."
                className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-4 py-3 outline-none transition-colors leading-relaxed resize-y"
                required
              />
            </div>

            {/* Photo Input (Upload or Direct URL) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Upload or URL fields */}
              <div className="md:col-span-8 space-y-4">
                <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider">
                  Operative Photo *
                </label>

                {/* File Upload Box */}
                <div className="relative border border-dashed border-white/20 p-5 hover:border-[#e2f952] transition-colors text-center cursor-pointer bg-neutral-900/60">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="font-mono text-xs text-neutral-400 flex flex-col items-center gap-1.5">
                    <span className="text-[#e2f952] font-bold">
                      {uploadingPhoto ? "UPLOADING PHOTO TO STORAGE..." : "📁 CLICK OR DROP IMAGE FILE"}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      Auto-uploads directly to Supabase storage bucket `media/team/`
                    </span>
                  </div>
                </div>

                {/* Direct Image URL input */}
                <div>
                  <label className="block font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-1">
                    Or paste direct hosted image URL:
                  </label>
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-neutral-900 border border-white/15 focus:border-[#e2f952] text-white font-mono text-xs px-3 py-2 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Photo Preview Tile */}
              <div className="md:col-span-4 bg-neutral-900 border border-white/15 p-4 flex flex-col items-center justify-center min-h-[160px]">
                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-3">
                  PHOTO PREVIEW
                </span>
                {photoUrl ? (
                  <div className="relative w-28 h-28 border border-[#e2f952] overflow-hidden bg-black">
                    <Image
                      src={photoUrl}
                      alt="Operative Preview"
                      fill
                      unoptimized={photoUrl.startsWith("data:")}
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl("")}
                      className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-mono px-1 py-0.5"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="w-28 h-28 border border-white/10 flex flex-col items-center justify-center text-neutral-600 font-mono text-[10px] text-center p-2">
                    <span>[ NO PHOTO ]</span>
                  </div>
                )}
              </div>
            </div>

            {/* Department Selection */}
            <div>
              <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider mb-2">
                Cadre Department Category
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-4 py-3 outline-none transition-colors uppercase"
              >
                <option value="understudy">Core Members (Category 04 — Understudy)</option>
                <option value="technical">Technical Core (Category 02)</option>
                <option value="executive">Executive Board (Category 01)</option>
                <option value="management">Management Core (Category 03)</option>
              </select>
              <p className="mt-1 font-mono text-[10px] text-neutral-500">
                Default: &quot;Core Members&quot; (maps to &apos;understudy&apos; in existing database records).
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-2.5 font-mono text-xs uppercase tracking-wider text-neutral-400 hover:text-white border border-white/15"
              >
                [ CANCEL ]
              </button>

              <button
                type="submit"
                disabled={submitting || uploadingPhoto}
                className="px-8 py-3 bg-[#e2f952] text-black font-mono text-xs uppercase tracking-wider font-bold border border-[#e2f952] hover:bg-white hover:border-white transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(226,249,82,0.3)]"
              >
                {submitting ? "[ ENLISTING OPERATIVE... ]" : "[ ENLIST CORE MEMBER // TRANSMIT TO CADRE ]"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Roster Controls: Search & Category Filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-white/15 pb-6">
        {/* Department Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 font-mono text-xs uppercase">
          {[
            { id: "all", label: "All Cadre" },
            { id: "understudy", label: "Core Members" },
            { id: "technical", label: "Technical Core" },
            { id: "executive", label: "Executive Board" },
            { id: "management", label: "Management Core" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDepartmentFilter(tab.id)}
              className={`px-3 py-1.5 border whitespace-nowrap transition-colors ${
                departmentFilter === tab.id
                  ? "bg-[#e2f952] text-black border-[#e2f952] font-bold"
                  : "bg-neutral-900/60 text-neutral-400 border-white/15 hover:border-white/40 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH BY NAME OR ROLE..."
            className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-3.5 py-2 outline-none uppercase"
          />
        </div>
      </div>

      {/* Cadre Members Grid */}
      {loading ? (
        <div className="p-12 text-center font-mono text-xs text-[#e2f952] uppercase tracking-widest flex items-center justify-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#e2f952] animate-ping" />
          <span>[ RETRIEVING PERSONNEL CADRE FROM SUPABASE... ]</span>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="p-12 border border-white/10 bg-neutral-950 text-center font-mono text-neutral-500 text-xs uppercase tracking-widest">
          [ NO MATCHING PERSONNEL RECORDS IN ROSTER ]
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMembers.map((member, index) => {
            const isDeleting = deletingId === member.id;
            const isCore = (member.department || "understudy").toLowerCase() === "understudy";

            return (
              <div
                key={member.id}
                className="relative bg-neutral-950 border border-white/15 hover:border-[#e2f952] transition-colors p-6 flex flex-col justify-between group min-h-[220px]"
              >
                {/* Corner reticle marks */}
                <span className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-white/30 group-hover:border-[#e2f952] pointer-events-none" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-white/30 group-hover:border-[#e2f952] pointer-events-none" />
                <span className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-white/30 group-hover:border-[#e2f952] pointer-events-none" />
                <span className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-white/30 group-hover:border-[#e2f952] pointer-events-none" />

                <div>
                  {/* Top Bar: Operative Code & Department Tag */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 font-mono text-[10px]">
                    <span className="text-neutral-400 group-hover:text-[#e2f952] transition-colors">
                      [ OP-{isCore ? "04" : "01"}-{String(index + 1).padStart(2, "0")} ]
                    </span>
                    <span
                      className={`px-2 py-0.5 uppercase tracking-wider border text-[9px] ${
                        isCore
                          ? "bg-[#e2f952]/10 border-[#e2f952] text-[#e2f952]"
                          : "bg-white/5 border-white/20 text-neutral-400"
                      }`}
                    >
                      {member.department?.toUpperCase() || "CORE MEMBER"}
                    </span>
                  </div>

                  {/* Operative Header: Photo + Name + Designation */}
                  <div className="flex items-start gap-4">
                    <div className="relative w-16 h-20 bg-neutral-900 border border-white/20 overflow-hidden flex-shrink-0">
                      {member.photo_url ? (
                        <Image
                          src={member.photo_url}
                          alt={member.name}
                          fill
                          sizes="64px"
                          unoptimized={Boolean(member.photo_url?.startsWith("data:"))}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-mono text-[9px] text-neutral-600">
                          AVATAR
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-lg font-bold uppercase tracking-tight text-white group-hover:text-[#e2f952] transition-colors truncate">
                        {member.name}
                      </h4>
                      <p className="font-mono text-xs uppercase tracking-wider text-[#e2f952] mt-0.5">
                        {member.role}
                      </p>
                      <p className="font-mono text-[10px] text-neutral-500 mt-1">
                        ENLISTED: {new Date(member.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Operative Small Paragraph / Bio (from subsystem column) */}
                  {member.subsystem ? (
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-500 mb-1">
                        // OPERATIVE BRIEF:
                      </div>
                      <p className="font-mono text-xs text-neutral-300 line-clamp-3 leading-relaxed">
                        {member.subsystem}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 pt-3 border-t border-white/5 font-mono text-[10px] text-neutral-600 italic">
                      [ No brief paragraph recorded in subsystem column ]
                    </div>
                  )}
                </div>

                {/* Card Footer: Remove Action */}
                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono text-[9px] text-neutral-500 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e2f952]" />
                    <span>STATUS: ACTIVE</span>
                  </div>

                  <button
                    onClick={() => setDeleteTarget(member)}
                    disabled={isDeleting}
                    className="font-mono text-[10px] uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-950/40 px-2 py-1 border border-red-500/30 hover:border-red-500 transition-colors"
                  >
                    {isDeleting ? "[ EXPUNGING... ]" : "[ REMOVE MEMBER ]"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-950 border-2 border-red-500/80 max-w-md w-full p-6 space-y-6 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
            <div className="flex items-center gap-3 border-b border-red-500/30 pb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-red-400">
                [ CONFIRM MEMBER EXPUNGEMENT ]
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs text-neutral-300">
              <p>
                Are you sure you want to permanently remove this operative from the cadre database?
              </p>
              <div className="p-3 bg-red-950/20 border border-red-500/30 space-y-1">
                <div className="text-white font-bold text-sm uppercase">
                  {deleteTarget.name}
                </div>
                <div className="text-[#e2f952] text-[11px] uppercase">
                  {deleteTarget.role}
                </div>
                <div className="text-neutral-500 text-[10px] uppercase">
                  DEPT: {deleteTarget.department}
                </div>
              </div>
              <p className="text-[11px] text-neutral-500">
                This will delete the row from Supabase table <code className="text-white">team_members</code> and update the live public roster.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 font-mono text-xs">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-white/20 text-neutral-300 hover:text-white uppercase"
              >
                [ CANCEL ]
              </button>
              <button
                onClick={executeDelete}
                disabled={deletingId === deleteTarget.id}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold uppercase border border-red-600 transition-colors"
              >
                {deletingId === deleteTarget.id ? "[ EXPUNGING... ]" : "[ CONFIRM EXPUNGE ]"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
