"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  fetchProjects,
  addProject,
  updateProject,
  deleteProject,
  uploadProjectCover,
  generateProjectSlug,
  SupabaseProject,
} from "@/lib/supabase/projects";

export default function AdminProjectsManager() {
  const [projects, setProjects] = useState<SupabaseProject[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states strictly mapping to database columns
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("active");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [stackInput, setStackInput] = useState("");
  const [slug, setSlug] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // UI state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState<SupabaseProject | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit modal states
  const [editingProject, setEditingProject] = useState<SupabaseProject | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [editSummary, setEditSummary] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCoverImageUrl, setEditCoverImageUrl] = useState("");
  const [editStackInput, setEditStackInput] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDisplayOrder, setEditDisplayOrder] = useState<number>(0);
  const [uploadingEditCover, setUploadingEditCover] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // RLS SQL Helper state
  const [showSqlHelper, setShowSqlHelper] = useState(false);

  // Load projects from Supabase & local cache
  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects in admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Automatically update slug when title changes unless user manually edited slug
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!slug || slug === generateProjectSlug(title)) {
      setSlug(generateProjectSlug(newTitle));
    }
  };

  // Handle local image file upload to Supabase storage bucket 'media/projects/'
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setStatusMessage({
      type: "info",
      text: "TRANSMITTING PROJECT COVER TO MEDIA STORAGE...",
    });

    const res = await uploadProjectCover(file);
    setUploadingCover(false);

    if (res.success && res.publicUrl) {
      setCoverImageUrl(res.publicUrl);
      if (res.isRlsFallback) {
        setStatusMessage({
          type: "info",
          text: "COVER ATTACHED DIRECTLY (Storage RLS active: image encoded for instant save without bucket errors)",
        });
        setShowSqlHelper(true);
      } else {
        setStatusMessage({
          type: "success",
          text: "COVER HOSTED & ATTACHED SUCCESSFULLY",
        });
      }
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setStatusMessage({
        type: "error",
        text: `STORAGE NOTICE: ${res.error || "Upload policy active. You can paste a public cover image URL directly."}`,
      });
    }
  };

  // Submit new project
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setStatusMessage({ type: "error", text: "PROJECT TITLE IS REQUIRED" });
      return;
    }
    if (!summary.trim()) {
      setStatusMessage({ type: "error", text: "PROJECT SUMMARY IS REQUIRED" });
      return;
    }
    if (!description.trim()) {
      setStatusMessage({ type: "error", text: "PROJECT DESCRIPTION IS REQUIRED" });
      return;
    }
    if (!coverImageUrl.trim()) {
      setStatusMessage({ type: "error", text: "PROJECT COVER IMAGE IS REQUIRED (UPLOAD OR URL)" });
      return;
    }

    setSubmitting(true);
    setStatusMessage({ type: "info", text: "TRANSMITTING PROJECT TO DATABASE CADRE..." });

    // Parse comma-separated tech stack
    const stackArray = stackInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      title: title.trim(),
      status: status.trim() || "active",
      summary: summary.trim(),
      description: description.trim(),
      cover_image_url: coverImageUrl.trim(),
      stack: stackArray,
      slug: slug.trim() || generateProjectSlug(title),
      display_order: projects.length,
    };

    const res = await addProject(payload);
    setSubmitting(false);

    if (res.success) {
      setStatusMessage({
        type: "success",
        text: res.isRlsError
          ? "PROJECT SAVED (CACHED LOCALLY — RUN RLS SQL SCRIPT IN SUPABASE TO ENABLE DIRECT WRITES)"
          : "ONGOING PROJECT LAUNCHED & RECORDED IN DATABASE SUCCESSFULLY",
      });

      if (res.isRlsError) {
        setShowSqlHelper(true);
      }

      // Reset form
      setTitle("");
      setStatus("active");
      setSummary("");
      setDescription("");
      setCoverImageUrl("");
      setStackInput("");
      setSlug("");
      setIsFormOpen(false);

      // Reload
      loadProjects();
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setStatusMessage({
        type: "error",
        text: `PROJECT LAUNCH FAILED: ${res.error || "Unknown database error"}`,
      });
    }
  };

  // Open Edit Modal with preloaded project details
  const openEditModal = (project: SupabaseProject) => {
    setEditingProject(project);
    setEditTitle(project.title || "");
    setEditStatus((project.status || "active").toLowerCase());
    setEditSummary(project.summary || "");
    setEditDescription(project.description || "");
    setEditCoverImageUrl(project.cover_image_url || "");
    setEditStackInput((project.stack || []).join(", "));
    setEditSlug(project.slug || "");
    setEditDisplayOrder(project.display_order ?? 0);
  };

  const closeEditModal = () => {
    if (savingEdit) return;
    setEditingProject(null);
    setUploadingEditCover(false);
  };

  // Upload cover specifically in edit modal
  const handleEditCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingEditCover(true);
    setStatusMessage({
      type: "info",
      text: "TRANSMITTING UPDATED COVER TO MEDIA STORAGE...",
    });

    const res = await uploadProjectCover(file);
    setUploadingEditCover(false);

    if (res.success && res.publicUrl) {
      setEditCoverImageUrl(res.publicUrl);
      if (res.isRlsFallback) {
        setStatusMessage({
          type: "info",
          text: "COVER ATTACHED DIRECTLY (Storage RLS active: image encoded for instant save)",
        });
        setShowSqlHelper(true);
      } else {
        setStatusMessage({
          type: "success",
          text: "UPDATED COVER HOSTED & ATTACHED SUCCESSFULLY",
        });
      }
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setStatusMessage({
        type: "error",
        text: `STORAGE NOTICE: ${res.error || "Upload policy active. You can paste a public cover image URL directly."}`,
      });
    }
  };

  // Save changes to project specification
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    if (!editTitle.trim()) {
      setStatusMessage({ type: "error", text: "PROJECT TITLE IS REQUIRED" });
      return;
    }
    if (!editSummary.trim()) {
      setStatusMessage({ type: "error", text: "PROJECT SUMMARY IS REQUIRED" });
      return;
    }
    if (!editDescription.trim()) {
      setStatusMessage({ type: "error", text: "PROJECT DESCRIPTION IS REQUIRED" });
      return;
    }
    if (!editCoverImageUrl.trim()) {
      setStatusMessage({ type: "error", text: "PROJECT COVER IMAGE IS REQUIRED (UPLOAD OR URL)" });
      return;
    }

    setSavingEdit(true);
    setStatusMessage({
      type: "info",
      text: "TRANSMITTING SPECIFICATION UPDATES TO DATABASE...",
    });

    const stackArray = editStackInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      title: editTitle.trim(),
      status: editStatus.trim() || "active",
      summary: editSummary.trim(),
      description: editDescription.trim(),
      cover_image_url: editCoverImageUrl.trim(),
      stack: stackArray,
      slug: editSlug.trim() || generateProjectSlug(editTitle),
      display_order: editDisplayOrder,
    };

    // Optimistically update React state
    setProjects((prev) =>
      prev.map((p) =>
        p.id === editingProject.id
          ? {
              ...p,
              ...payload,
              stack: stackArray,
            }
          : p
      )
    );

    const res = await updateProject(editingProject.id, payload);
    setSavingEdit(false);

    if (res.success) {
      setStatusMessage({
        type: "success",
        text: res.isRlsError
          ? "PROJECT UPDATES SAVED (CACHED LOCALLY — RUN RLS SQL SCRIPT IN SUPABASE TO ENABLE DIRECT WRITES)"
          : "PROJECT SPECIFICATIONS UPDATED & SAVED IN DATABASE SUCCESSFULLY",
      });
      if (res.isRlsError) {
        setShowSqlHelper(true);
      }
      setEditingProject(null);
      loadProjects();
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setStatusMessage({
        type: "error",
        text: `UPDATE FAILED: ${res.error || "Database error"}`,
      });
      loadProjects();
    }
  };

  // Execute project removal
  const executeDelete = async () => {
    if (!deleteTarget) return;

    const targetId = deleteTarget.id;
    setDeletingId(targetId);

    // Optimistically filter out
    setProjects((prev) => prev.filter((p) => p.id !== targetId));

    const res = await deleteProject(targetId);
    setDeletingId(null);
    setDeleteTarget(null);

    if (res.success) {
      setStatusMessage({
        type: "success",
        text: "PROJECT EXPUNGED FROM CADRE DATABASE",
      });
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage({
        type: "error",
        text: `DELETION FAILED: ${res.error || "Unable to remove project"}`,
      });
      loadProjects();
    }
  };

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchQuery =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.stack && p.stack.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchStatus =
        statusFilter === "all" ||
        (p.status || "active").toLowerCase() === statusFilter.toLowerCase();

      return matchQuery && matchStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const activeCount = projects.filter(
    (p) => (p.status || "active").toLowerCase() === "active"
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
              <span className="font-bold">[ SUPABASE PROJECTS RLS MIGRATION NOTICE ]</span>
            </div>
            <button
              onClick={() => setShowSqlHelper(false)}
              className="text-neutral-400 hover:text-white uppercase text-[10px]"
            >
              [ HIDE ]
            </button>
          </div>
          <p className="text-neutral-300">
            Your project is saved in local browser storage and visible immediately on the landing page. To allow direct, permanent writes to Postgres without RLS errors, execute this snippet in your Supabase SQL Editor:
          </p>
          <pre className="bg-black/80 p-3 border border-white/10 text-[#e2f952] text-[11px] overflow-x-auto selection:bg-[#e2f952] selection:text-black">
{`-- Run in Supabase SQL Editor:
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read projects" ON public.projects;
DROP POLICY IF EXISTS "Allow public insert projects" ON public.projects;
DROP POLICY IF EXISTS "Allow public update projects" ON public.projects;
DROP POLICY IF EXISTS "Allow public delete projects" ON public.projects;
CREATE POLICY "Allow public read projects" ON public.projects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert projects" ON public.projects FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public update projects" ON public.projects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete projects" ON public.projects FOR DELETE TO anon, authenticated USING (true);`}
          </pre>
        </div>
      )}

      {/* Projects Top Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-neutral-950 border border-white/15">
          <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
            ACTIVE BUILDS
          </div>
          <div className="text-3xl font-black text-[#e2f952] mt-1 font-mono">
            {activeCount}
          </div>
          <div className="font-mono text-[10px] text-neutral-400 mt-1">
            DEPLOYMENT PHASE // TRL-6+
          </div>
        </div>

        <div className="p-4 bg-neutral-950 border border-white/15">
          <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
            TOTAL INITIATIVES
          </div>
          <div className="text-3xl font-black text-white mt-1 font-mono">
            {projects.length}
          </div>
          <div className="font-mono text-[10px] text-neutral-400 mt-1">
            RESEARCH & DEFENCE BUILDS
          </div>
        </div>

        <div className="p-4 bg-neutral-950 border border-white/15">
          <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
            DATABASE TELEMETRY
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e2f952] animate-pulse" />
            <span className="font-mono text-sm font-bold text-white">LIVE REPOSITORY</span>
          </div>
          <div className="font-mono text-[10px] text-neutral-400 mt-1">
            SUPABASE // TABLE: projects
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
            <span>{isFormOpen ? "✕ CLOSE COMPOSER" : "+ LAUNCH NEW PROJECT"}</span>
          </button>
        </div>
      </div>

      {/* Project Composer Form / Drawer */}
      {isFormOpen && (
        <div className="bg-neutral-950 border-2 border-[#e2f952] p-6 sm:p-8 relative shadow-[0_0_30px_rgba(226,249,82,0.15)] animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#e2f952]" />
              <h3 className="font-mono text-sm uppercase tracking-widest text-[#e2f952] font-black">
                [ LAUNCH ONGOING PROJECT // SPECIFICATION INTAKE ]
              </h3>
            </div>
            <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
              DATABASE TABLE: projects
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Flying Wings: National Defence Hackathon"
                  className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-sm px-4 py-3 outline-none transition-colors"
                  required
                />
              </div>

              {/* Status */}
              <div>
                <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider mb-2">
                  Project Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-4 py-3 outline-none transition-colors uppercase"
                >
                  <option value="active">Active (Flight Ready / Deployed)</option>
                  <option value="ongoing">Ongoing (In Development)</option>
                  <option value="completed">Completed (Archived / Success)</option>
                  <option value="research">Research (Conceptual / Lab)</option>
                </select>
              </div>
            </div>

            {/* Summary (Brief Overview) */}
            <div>
              <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider mb-2">
                Project Summary *
              </label>
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="e.g. Engineering a GPS-denied quadcopter capable of autonomous waypoint navigation..."
                className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-4 py-3 outline-none transition-colors"
                required
              />
            </div>

            {/* Detailed Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider">
                  Full Technical Description & Mission Objectives *
                </label>
                <span className="font-mono text-[10px] text-neutral-500">
                  STORED IN DATABASE FIELD: description
                </span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Comprehensive technical breakdown, operational parameters, sensors used, payload configurations, and milestones..."
                className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-4 py-3 outline-none transition-colors leading-relaxed resize-y"
                required
              />
            </div>

            {/* Cover Image Upload / URL */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-8 space-y-4">
                <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider">
                  Project Cover Image *
                </label>

                {/* File Upload Box */}
                <div className="relative border border-dashed border-white/20 p-5 hover:border-[#e2f952] transition-colors text-center cursor-pointer bg-neutral-900/60">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    disabled={uploadingCover}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="font-mono text-xs text-neutral-400 flex flex-col items-center gap-1.5">
                    <span className="text-[#e2f952] font-bold">
                      {uploadingCover ? "UPLOADING COVER TO CLOUD STORAGE..." : "📁 CLICK OR DROP PROJECT IMAGE"}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      Uploads directly to Supabase storage bucket `media/projects/`
                    </span>
                  </div>
                </div>

                {/* Direct Image URL input */}
                <div>
                  <label className="block font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-1">
                    Or paste direct hosted cover image URL:
                  </label>
                  <input
                    type="url"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-neutral-900 border border-white/15 focus:border-[#e2f952] text-white font-mono text-xs px-3 py-2 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Cover Preview Tile */}
              <div className="md:col-span-4 bg-neutral-900 border border-white/15 p-4 flex flex-col items-center justify-center min-h-[160px]">
                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-3">
                  COVER PREVIEW
                </span>
                {coverImageUrl ? (
                  <div className="relative w-full aspect-video border border-[#e2f952] overflow-hidden bg-black">
                    <Image
                      src={coverImageUrl}
                      alt="Project Preview"
                      fill
                      unoptimized={coverImageUrl.startsWith("data:")}
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl("")}
                      className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-mono px-1 py-0.5"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="w-full aspect-video border border-white/10 flex flex-col items-center justify-center text-neutral-600 font-mono text-[10px] text-center p-2">
                    <span>[ NO COVER IMAGE ]</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tech Stack & URL Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stack */}
              <div>
                <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider mb-2">
                  Subsystem Tech Stack (Comma-Separated)
                </label>
                <input
                  type="text"
                  value={stackInput}
                  onChange={(e) => setStackInput(e.target.value)}
                  placeholder="e.g. Pixhawk 6C, Jetson Orin Nano, OpenCV, ROS2, LiDAR"
                  className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-4 py-3 outline-none transition-colors"
                />
                <p className="mt-1 font-mono text-[10px] text-neutral-500">
                  Separated by commas — stored in database column `stack`.
                </p>
              </div>

              {/* Slug */}
              <div>
                <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider mb-2">
                  URL Route Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. autonomous-swarm-formation"
                  className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-4 py-3 outline-none transition-colors"
                />
                <p className="mt-1 font-mono text-[10px] text-neutral-500">
                  Auto-slugified identifier for linking specs.
                </p>
              </div>
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
                disabled={submitting || uploadingCover}
                className="px-8 py-3 bg-[#e2f952] text-black font-mono text-xs uppercase tracking-wider font-bold border border-[#e2f952] hover:bg-white hover:border-white transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(226,249,82,0.3)]"
              >
                {submitting ? "[ LAUNCHING PROJECT... ]" : "[ LAUNCH PROJECT // TRANSMIT SPECIFICATION ]"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-white/15 pb-6">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 font-mono text-xs uppercase">
          {[
            { id: "all", label: "All Projects" },
            { id: "active", label: "Active" },
            { id: "ongoing", label: "Ongoing" },
            { id: "completed", label: "Completed" },
            { id: "research", label: "Research" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 border whitespace-nowrap transition-colors ${
                statusFilter === tab.id
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
            placeholder="SEARCH BY TITLE, TECH OR KEYWORDS..."
            className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-3.5 py-2 outline-none uppercase"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="p-12 text-center font-mono text-xs text-[#e2f952] uppercase tracking-widest flex items-center justify-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#e2f952] animate-ping" />
          <span>[ RETRIEVING ONGOING BUILDS FROM SUPABASE... ]</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 border border-white/10 bg-neutral-950 text-center font-mono text-neutral-500 text-xs uppercase tracking-widest">
          [ NO MATCHING PROJECTS FOUND IN REPOSITORY ]
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project, index) => {
            const isDeleting = deletingId === project.id;

            return (
              <div
                key={project.id}
                className="relative bg-neutral-950 border border-white/15 hover:border-[#e2f952] transition-colors p-6 sm:p-7 flex flex-col justify-between group"
              >
                {/* Corner reticle marks */}
                <span className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-white/30 group-hover:border-[#e2f952] pointer-events-none" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-white/30 group-hover:border-[#e2f952] pointer-events-none" />
                <span className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-white/30 group-hover:border-[#e2f952] pointer-events-none" />
                <span className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-white/30 group-hover:border-[#e2f952] pointer-events-none" />

                <div>
                  {/* Top Bar: Build Index & Status */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 font-mono text-[10px]">
                    <span className="text-neutral-400 group-hover:text-[#e2f952] transition-colors">
                      [ BUILD-0{index + 1} // {project.slug} ]
                    </span>
                    <span className="px-2 py-0.5 uppercase tracking-wider border border-[#e2f952]/40 text-[#e2f952] bg-[#e2f952]/5 text-[9px]">
                      {project.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Cover Image */}
                  <div className="relative w-full aspect-video bg-neutral-900 border border-white/15 overflow-hidden mb-4">
                    {project.cover_image_url ? (
                      <Image
                        src={project.cover_image_url}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        unoptimized={Boolean(project.cover_image_url?.startsWith("data:"))}
                        className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 contrast-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-mono text-xs text-neutral-600">
                        [ NO MEDIA ATTACHED ]
                      </div>
                    )}
                  </div>

                  {/* Title & Summary */}
                  <div>
                    <h4 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-white group-hover:text-[#e2f952] transition-colors">
                      {project.title}
                    </h4>
                    <p className="font-mono text-xs text-neutral-300 mt-2 leading-relaxed font-light">
                      {project.summary}
                    </p>
                  </div>

                  {/* Technical Description Preview */}
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <p className="font-mono text-[11px] text-neutral-500 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Tech Stack Tags */}
                  {project.stack && project.stack.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-1.5">
                      {project.stack.map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-white/5 border border-white/10 font-mono text-[9px] text-neutral-400 uppercase"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer: Metadata & Actions */}
                <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px]">
                  <span className="text-neutral-500">
                    RECORDED: {new Date(project.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(project)}
                      className="uppercase tracking-wider text-[#e2f952] hover:text-black hover:bg-[#e2f952] px-2.5 py-1 border border-[#e2f952]/40 hover:border-[#e2f952] transition-colors font-semibold"
                    >
                      [ EDIT PROJECT ]
                    </button>
                    <button
                      onClick={() => setDeleteTarget(project)}
                      disabled={isDeleting}
                      className="uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-950/40 px-2.5 py-1 border border-red-500/30 hover:border-red-500 transition-colors"
                    >
                      {isDeleting ? "[ EXPUNGING... ]" : "[ REMOVE ]"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Project Specification Modal */}
      {editingProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEditModal();
          }}
        >
          <div className="bg-neutral-950 border-2 border-[#e2f952] max-w-4xl w-full p-6 sm:p-8 my-auto relative shadow-[0_0_50px_rgba(226,249,82,0.2)] animate-in fade-in duration-200">
            {/* Corner Reticle Accents */}
            <span className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[#e2f952] pointer-events-none" />
            <span className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-[#e2f952] pointer-events-none" />
            <span className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-[#e2f952] pointer-events-none" />
            <span className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-[#e2f952] pointer-events-none" />

            <div className="flex items-start justify-between pb-4 mb-6 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e2f952] animate-pulse" />
                  <h3 className="font-mono text-sm sm:text-base uppercase tracking-widest text-[#e2f952] font-black">
                    [ EDIT PROJECT SPECIFICATIONS // {editingProject.title.toUpperCase()} ]
                  </h3>
                </div>
                <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
                  DATABASE ID: <span className="text-white">{editingProject.id}</span> · TABLE: projects · SLUG: <span className="text-[#e2f952]">{editingProject.slug}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={savingEdit}
                className="text-neutral-400 hover:text-white font-mono text-sm uppercase px-2 py-1 border border-white/10 hover:border-white/40 transition-colors"
                title="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-6">
              {/* Row 1: Title & Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="e.g. Flying Wings: National Defence Hackathon"
                    className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs sm:text-sm px-4 py-3 outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider mb-2">
                    Operational Status *
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs sm:text-sm px-4 py-3 outline-none transition-colors uppercase"
                  >
                    <option value="active">ACTIVE (In Build)</option>
                    <option value="ongoing">ONGOING (Flight Testing)</option>
                    <option value="completed">COMPLETED (Mission Proven)</option>
                    <option value="research">RESEARCH (Feasibility)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Summary */}
              <div>
                <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider mb-2">
                  Project Summary *
                </label>
                <input
                  type="text"
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  placeholder="e.g. Engineering a GPS-denied quadcopter capable of autonomous waypoint navigation..."
                  className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-4 py-3 outline-none transition-colors"
                  required
                />
              </div>

              {/* Row 3: Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider">
                    Full Technical Description & Mission Objectives *
                  </label>
                  <span className="font-mono text-[10px] text-neutral-500">
                    COLUMN: description
                  </span>
                </div>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={5}
                  placeholder="Comprehensive technical breakdown, operational parameters, sensors used, payload configurations..."
                  className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-4 py-3 outline-none transition-colors leading-relaxed resize-y"
                  required
                />
              </div>

              {/* Row 4: Cover Image Upload & Preview */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-8 space-y-4">
                  <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider">
                    Project Cover Image *
                  </label>

                  {/* File Upload Box */}
                  <div className="relative border border-dashed border-white/20 p-5 hover:border-[#e2f952] transition-colors text-center cursor-pointer bg-neutral-900/60">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditCoverUpload}
                      disabled={uploadingEditCover}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="font-mono text-xs text-neutral-400 flex flex-col items-center gap-1.5">
                      <span className="text-[#e2f952] font-bold">
                        {uploadingEditCover ? "UPLOADING COVER TO CLOUD STORAGE..." : "📁 CLICK OR DROP REPLACEMENT COVER IMAGE"}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        Uploads directly to Supabase storage bucket `media/projects/`
                      </span>
                    </div>
                  </div>

                  {/* Direct Image URL input */}
                  <div>
                    <label className="block font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-1">
                      Or paste direct hosted cover image URL:
                    </label>
                    <input
                      type="url"
                      value={editCoverImageUrl}
                      onChange={(e) => setEditCoverImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-neutral-900 border border-white/15 focus:border-[#e2f952] text-white font-mono text-xs px-3 py-2 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Cover Preview Tile */}
                <div className="md:col-span-4 bg-neutral-900 border border-white/15 p-4 flex flex-col items-center justify-center min-h-[160px]">
                  <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-3">
                    COVER PREVIEW
                  </span>
                  {editCoverImageUrl ? (
                    <div className="relative w-full aspect-video border border-[#e2f952] overflow-hidden bg-black">
                      <Image
                        src={editCoverImageUrl}
                        alt="Project Preview"
                        fill
                        unoptimized={editCoverImageUrl.startsWith("data:")}
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setEditCoverImageUrl("")}
                        className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-mono px-1 py-0.5"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="w-full aspect-video border border-white/10 flex flex-col items-center justify-center text-neutral-600 font-mono text-[10px] text-center p-2">
                      <span>[ NO COVER IMAGE ]</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 5: Tech Stack, Slug & Display Order */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider mb-2">
                    Subsystem Tech Stack (Comma-Separated)
                  </label>
                  <input
                    type="text"
                    value={editStackInput}
                    onChange={(e) => setEditStackInput(e.target.value)}
                    placeholder="e.g. Pixhawk 6C, Jetson Orin Nano, OpenCV, ROS2"
                    className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-4 py-3 outline-none transition-colors"
                  />
                  {/* Real-time Stack Preview */}
                  {editStackInput.trim() && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {editStackInput
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((s, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 bg-[#e2f952]/10 border border-[#e2f952]/30 text-[#e2f952] font-mono text-[9px] uppercase"
                          >
                            {s}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider mb-2">
                    URL Route Slug *
                  </label>
                  <input
                    type="text"
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    placeholder="e.g. flying-wings-defense"
                    className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-4 py-3 outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider mb-2">
                    Display Priority Order
                  </label>
                  <input
                    type="number"
                    value={editDisplayOrder}
                    onChange={(e) => setEditDisplayOrder(parseInt(e.target.value) || 0)}
                    min={0}
                    className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-4 py-3 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10 font-mono text-xs">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={savingEdit}
                  className="px-6 py-2.5 uppercase tracking-wider text-neutral-400 hover:text-white border border-white/15 transition-colors disabled:opacity-50"
                >
                  [ CANCEL ]
                </button>

                <button
                  type="submit"
                  disabled={savingEdit || uploadingEditCover}
                  className="px-8 py-3 bg-[#e2f952] text-black uppercase tracking-wider font-bold border border-[#e2f952] hover:bg-white hover:border-white transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(226,249,82,0.3)]"
                >
                  {savingEdit ? "[ TRANSMITTING SPECIFICATIONS... ]" : "[ SAVE SPECIFICATIONS // UPDATE RECORD ]"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-950 border-2 border-red-500/80 max-w-md w-full p-6 space-y-6 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
            <div className="flex items-center gap-3 border-b border-red-500/30 pb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-red-400">
                [ CONFIRM PROJECT EXPUNGEMENT ]
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs text-neutral-300">
              <p>
                Are you sure you want to permanently remove this ongoing project from the database?
              </p>
              <div className="p-3 bg-red-950/20 border border-red-500/30 space-y-1">
                <div className="text-white font-bold text-sm uppercase">
                  {deleteTarget.title}
                </div>
                <div className="text-[#e2f952] text-[11px] uppercase">
                  STATUS: {deleteTarget.status}
                </div>
                <div className="text-neutral-500 text-[10px]">
                  SLUG: {deleteTarget.slug}
                </div>
              </div>
              <p className="text-[11px] text-neutral-500">
                This will delete the row from Supabase table <code className="text-white">projects</code> and immediately remove it from the public landing page.
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
