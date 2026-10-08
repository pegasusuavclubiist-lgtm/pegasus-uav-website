"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  fetchUpdates,
  createUpdate,
  updateUpdate,
  deleteUpdate,
  uploadUpdateMedia,
  SupabaseUpdate,
  TickerBroadcastConfig,
  getStoredTickerBroadcast,
  saveStoredTickerBroadcast,
  DEFAULT_TICKER_BROADCAST,
} from "@/lib/supabase/updates";

export default function AdminUpdatesManager() {
  const [updates, setUpdates] = useState<SupabaseUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Marquee Ticker Broadcast State
  const [tickerConfig, setTickerConfig] = useState<TickerBroadcastConfig>(DEFAULT_TICKER_BROADCAST);
  const [savingTicker, setSavingTicker] = useState(false);
  const [tickerPanelOpen, setTickerPanelOpen] = useState(true);

  // Edit Dispatch State
  const [editingPost, setEditingPost] = useState<SupabaseUpdate | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editBadge, setEditBadge] = useState("LIVE MISSION UPDATE");
  const [uploadingEditFile, setUploadingEditFile] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState<SupabaseUpdate | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // SQL Helper modal state
  const [showSqlHelper, setShowSqlHelper] = useState(false);

  // Load existing dispatches & ticker config
  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await fetchUpdates();
      setUpdates(data);
    } catch (err) {
      console.error("Failed to fetch updates in admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
    const stored = getStoredTickerBroadcast();
    setTickerConfig(stored);
  }, []);

  // Handle local file selection and upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadingFile(true);
    setStatusMessage({ type: "info", text: "UPLOADING ATTACHMENT TO MEDIA STORAGE..." });

    const res = await uploadUpdateMedia(file);
    setUploadingFile(false);

    if (res.success && res.publicUrl) {
      setImageUrl(res.publicUrl);
      setStatusMessage({
        type: "success",
        text: res.isRlsFallback
          ? "IMAGE OPTIMIZED & ATTACHED (LOCAL HYBRID FALLBACK)"
          : "IMAGE ATTACHED & HOSTED SUCCESSFULLY",
      });
      setTimeout(() => setStatusMessage(null), 3500);
    } else {
      setStatusMessage({
        type: "error",
        text: `IMAGE UPLOAD ERROR: ${res.error || "Storage rejected upload. You can paste an image URL instead."}`,
      });
    }
  };

  // Submit new update post
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setStatusMessage({ type: "error", text: "TITLE AND DISPATCH CONTENT ARE REQUIRED" });
      return;
    }

    setSubmitting(true);
    setStatusMessage({ type: "info", text: "TRANSMITTING CADRE OPERATIONAL DISPATCH..." });

    const payload = {
      title: title.trim(),
      content: content.trim(),
      image_url: imageUrl.trim() || null,
    };

    const res = await createUpdate(payload);
    setSubmitting(false);

    if (res.success) {
      setStatusMessage({
        type: "success",
        text: res.isRlsError
          ? "DISPATCH SAVED (CACHED LOCALLY — RUN SQL MIGRATION TO SYNC POSTGRES RLS)"
          : "CADRE DISPATCH LOGGED & TRANSMITTED SUCCESSFULLY",
      });

      // Reset form
      setTitle("");
      setContent("");
      setImageUrl("");
      setSelectedFile(null);

      // Reload updates
      loadPosts();

      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setStatusMessage({
        type: "error",
        text: `FAILED TO DISPATCH: ${res.error || "Unknown transmission error"}`,
      });
    }
  };

  // Save Marquee Ticker Broadcast settings
  const handleSaveTicker = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTicker(true);
    const updated: TickerBroadcastConfig = {
      ...tickerConfig,
      updated_at: new Date().toISOString(),
    };
    const ok = saveStoredTickerBroadcast(updated);
    setSavingTicker(false);
    if (ok) {
      setTickerConfig(updated);
      setStatusMessage({
        type: "success",
        text: "BROADCAST TRANSMITTED TO ALL MARQUEE TICKERS ACROSS THE ENTIRE WEBSITE",
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setStatusMessage({
        type: "error",
        text: "FAILED TO TRANSMIT TICKER BROADCAST",
      });
    }
  };

  // Open Edit Dispatch modal
  const openEditModal = (post: SupabaseUpdate) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditImageUrl(post.image_url || "");
    setEditBadge(post.ticker_badge || "LIVE MISSION UPDATE");
  };

  // Upload attachment for edited dispatch
  const handleEditFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingEditFile(true);
    const res = await uploadUpdateMedia(file);
    setUploadingEditFile(false);
    if (res.success && res.publicUrl) {
      setEditImageUrl(res.publicUrl);
    }
  };

  // Submit edited dispatch
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    if (!editTitle.trim() || !editContent.trim()) {
      setStatusMessage({ type: "error", text: "TITLE AND DISPATCH CONTENT ARE REQUIRED" });
      return;
    }

    setSavingEdit(true);
    const res = await updateUpdate(editingPost.id, {
      title: editTitle.trim(),
      content: editContent.trim(),
      image_url: editImageUrl.trim() || null,
      ticker_badge: editBadge.trim() || "LIVE MISSION UPDATE",
    });
    setSavingEdit(false);

    if (res.success) {
      setStatusMessage({
        type: "success",
        text: "CADRE DISPATCH UPDATED & LIVE TICKERS SYNCHRONIZED",
      });
      setEditingPost(null);
      loadPosts();
      setTimeout(() => setStatusMessage(null), 3500);
    } else {
      setStatusMessage({
        type: "error",
        text: `FAILED TO UPDATE: ${res.error || "Unknown transmission error"}`,
      });
    }
  };

  // Confirm and execute delete
  const executeDelete = async () => {
    if (!deleteTarget) return;

    const targetId = deleteTarget.id;
    setDeletingId(targetId);

    // Optimistic removal from UI
    setUpdates((prev) => prev.filter((p) => p.id !== targetId));

    const res = await deleteUpdate(targetId);
    setDeletingId(null);
    setDeleteTarget(null);

    if (res.success) {
      setStatusMessage({ type: "success", text: "DISPATCH EXPUNGED FROM CADRE LOGS" });
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage({
        type: "error",
        text: `DELETE REJECTED: ${res.error || "Check Supabase delete policy"}`,
      });
      loadPosts();
    }
  };

  const filteredUpdates = updates.filter((post) => {
    const q = searchQuery.toLowerCase();
    return post.title.toLowerCase().includes(q) || post.content.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-10">
      {/* Header telemetry and SQL helper button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#e2f952]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#e2f952] font-bold">
              [ APEX CONTROL // CADRE DISPATCH MATRIX ]
            </span>
          </div>
          <p className="font-mono text-xs text-neutral-400 mt-1">
            Internal console for operational flight bulletins, cadence debriefs, and technical logs (Admin Exclusive).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSqlHelper(true)}
            className="px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-amber-400 hover:text-white bg-amber-950/30 border border-amber-500/40 hover:border-amber-400 transition-colors"
          >
            [ SQL RLS HELPER ]
          </button>
        </div>
      </div>

      {/* Status Bar */}
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

      {/* =========================================================================
          LIVE MARQUEE TICKER BROADCAST CONTROLLER (Full Width)
         ========================================================================= */}
      <section className="bg-neutral-950 border border-[#e2f952]/40 p-6 sm:p-8 relative shadow-[0_0_30px_rgba(226,249,82,0.06)]">
        {/* Reticle ticks */}
        <span className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[#e2f952]" />
        <span className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-[#e2f952]" />
        <span className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-[#e2f952]" />
        <span className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-[#e2f952]" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e2f952] animate-pulse shadow-[0_0_8px_#e2f952]" />
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-mono text-sm sm:text-base uppercase tracking-widest text-[#e2f952] font-black">
                  [ 00 // LIVE MARQUEE TICKER BROADCAST CONTROL ]
                </h2>
                <button
                  type="button"
                  onClick={() => setTickerPanelOpen(!tickerPanelOpen)}
                  className="font-mono text-[10px] text-neutral-400 hover:text-white underline uppercase"
                >
                  {tickerPanelOpen ? "[ MINIMIZE ]" : "[ EXPAND CONTROLS ]"}
                </button>
              </div>
              <p className="font-mono text-[11px] text-neutral-400 mt-0.5">
                Edit active scrolling broadcasts across all top navbar and brutalist marquees in real time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 border border-[#e2f952]/50 bg-[#e2f952]/10 text-[#e2f952]">
              ● TRANSMITTING TO ALL MARQUEES
            </span>
          </div>
        </div>

        {/* Live Simulation Preview Track */}
        <div className="mb-6 border border-white/15 bg-black/90 p-3 overflow-hidden">
          <div className="flex items-center justify-between font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-2 px-1">
            <span>LIVE SIMULATION PREVIEW:</span>
            <span className="text-[#e2f952]">TARGET: TOP NAVBAR & SECTION MARQUEES</span>
          </div>
          <div className="flex items-center gap-3 bg-neutral-950 px-4 py-2 border border-white/10 font-mono text-xs overflow-x-auto whitespace-nowrap">
            <span className="px-2 py-0.5 bg-[#e2f952] text-black font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
              {tickerConfig.badge || "FLIGHT OPS ALERT"}
            </span>
            {tickerConfig.highlight && (
              <span className="text-[#e2f952] font-bold">
                {tickerConfig.highlight}
              </span>
            )}
            <span className="text-white">
              {tickerConfig.subtext || tickerConfig.headline}
            </span>
            <span className="text-neutral-500 text-xs">✦</span>
            <span className="text-neutral-400">
              + {updates.length} LIVE CADRE DISPATCHES AUTO-STREAMING
            </span>
          </div>
        </div>

        {/* Broadcast Form */}
        {tickerPanelOpen && (
          <form onSubmit={handleSaveTicker} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Mode Selector */}
              <div>
                <label className="block font-mono text-[11px] text-neutral-400 uppercase tracking-wider mb-2">
                  Marquee Feed Mode *
                </label>
                <select
                  value={tickerConfig.mode}
                  onChange={(e) =>
                    setTickerConfig((prev) => ({
                      ...prev,
                      mode: e.target.value as "hybrid" | "stream_updates" | "custom",
                    }))
                  }
                  className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-3 py-2.5 outline-none uppercase"
                >
                  <option value="hybrid">HYBRID (ALERT + ALL LIVE DISPATCHES)</option>
                  <option value="stream_updates">AUTO-STREAM ALL LIVE DISPATCHES</option>
                  <option value="custom">CUSTOM ANNOUNCEMENT ONLY (PINNED)</option>
                </select>
              </div>

              {/* Badge Title */}
              <div>
                <label className="block font-mono text-[11px] text-neutral-400 uppercase tracking-wider mb-2">
                  Alert Badge Tag *
                </label>
                <input
                  type="text"
                  value={tickerConfig.badge}
                  onChange={(e) =>
                    setTickerConfig((prev) => ({ ...prev, badge: e.target.value }))
                  }
                  placeholder="e.g. FLIGHT OPS ALERT, LIVE UPDATE"
                  className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-3 py-2.5 outline-none uppercase"
                  required
                />
              </div>

              {/* Highlight Prefix */}
              <div>
                <label className="block font-mono text-[11px] text-neutral-400 uppercase tracking-wider mb-2">
                  Highlight Prefix Word
                </label>
                <input
                  type="text"
                  value={tickerConfig.highlight}
                  onChange={(e) =>
                    setTickerConfig((prev) => ({ ...prev, highlight: e.target.value }))
                  }
                  placeholder="e.g. ORION-, URGENT:, FLIGHT TEST:"
                  className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-3 py-2.5 outline-none uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Broadcast Subtext / Message */}
              <div className="md:col-span-2">
                <label className="block font-mono text-[11px] text-neutral-400 uppercase tracking-wider mb-2">
                  Broadcast Announcement Message *
                </label>
                <input
                  type="text"
                  value={tickerConfig.subtext}
                  onChange={(e) =>
                    setTickerConfig((prev) => ({ ...prev, subtext: e.target.value, headline: e.target.value }))
                  }
                  placeholder="e.g. ORION- Drone hackathon from 10th - 11th October"
                  className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-3 py-2.5 outline-none"
                  required
                />
              </div>

              {/* Link Destination */}
              <div>
                <label className="block font-mono text-[11px] text-neutral-400 uppercase tracking-wider mb-2">
                  Link Destination (URL / Anchor)
                </label>
                <input
                  type="text"
                  value={tickerConfig.href}
                  onChange={(e) =>
                    setTickerConfig((prev) => ({ ...prev, href: e.target.value }))
                  }
                  placeholder="e.g. #join, /team, /about-iist"
                  className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-3 py-2.5 outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <span className="font-mono text-[11px] text-neutral-500">
                MODIFICATIONS PROPAGATE INSTANTLY ACROSS ALL SESSIONS & MARQUEES
              </span>
              <button
                type="submit"
                disabled={savingTicker}
                className="w-full sm:w-auto bg-[#e2f952] hover:bg-[#c8e036] text-black font-mono font-bold text-xs uppercase tracking-widest px-6 py-3 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(226,249,82,0.3)]"
              >
                <span>{savingTicker ? "TRANSMITTING BROADCAST..." : "BROADCAST TO ALL MARQUEE TICKERS"}</span>
                <span>✦</span>
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Grid: Left column = Post Composer, Right column = Current Dispatches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* =========================================================================
            POST COMPOSER (5 Cols)
           ========================================================================= */}
        <div className="lg:col-span-5 bg-neutral-950 border border-white/15 p-6 sm:p-8 relative">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#e2f952]" />
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#e2f952] font-bold">
                [ 01 // TRANSMIT CADRE DISPATCH ]
              </h2>
            </div>
            <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
              CADRE INTERNAL INTAKE
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block font-mono text-[11px] text-neutral-400 uppercase tracking-wider mb-2">
                Dispatch Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. SEMESTER BUILD BLUEPRINT OR FLIGHT LOG"
                className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-sm px-4 py-3 outline-none transition-colors uppercase"
                required
              />
            </div>

            {/* Content Body */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
                  Dispatch Content & Telemetry *
                </label>
                <span className="font-mono text-[10px] text-neutral-500">
                  URLS AUTO-LINKED
                </span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="Detailed flight bulletin, test results, or links to internal CADRE documents (e.g. https://drive.google.com/...)"
                className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-4 py-3 outline-none transition-colors resize-y leading-relaxed"
                required
              />
            </div>

            {/* Media Attachment Options */}
            <div>
              <label className="block font-mono text-[11px] text-neutral-400 uppercase tracking-wider mb-2">
                Media Attachment (Optional)
              </label>

              {/* Upload Input */}
              <div className="space-y-3">
                <div className="relative border border-dashed border-white/20 p-4 hover:border-white/40 transition-colors text-center cursor-pointer bg-neutral-900/40">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploadingFile}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="font-mono text-xs text-neutral-400 flex flex-col items-center gap-1">
                    <span className="text-[#e2f952]">
                      {uploadingFile ? "UPLOADING TO STORAGE..." : "CHOOSE OR DROP IMAGE FILE"}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      PNG, JPG, WEBP (STORED IN PEGASUS MEDIA BUCKET)
                    </span>
                  </div>
                </div>

                {/* Direct Image URL input */}
                <div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="OR PASTE DIRECT IMAGE URL (https://...)"
                    className="w-full bg-neutral-900 border border-white/15 focus:border-[#e2f952] text-white font-mono text-xs px-3 py-2 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Image Preview */}
              {imageUrl && (
                <div className="mt-3 relative border border-white/20 p-2 bg-neutral-900 flex items-center gap-3">
                  <div className="relative w-16 h-16 bg-neutral-950 flex-shrink-0 border border-white/10 overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt="Attachment Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="font-mono text-[10px] text-neutral-400 overflow-hidden text-ellipsis flex-1">
                    <span className="text-[#e2f952] block font-bold">ATTACHED MEDIA:</span>
                    <span className="break-all">{imageUrl}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl("");
                      setSelectedFile(null);
                    }}
                    className="text-red-400 hover:text-red-300 font-mono text-xs px-2 py-1"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || uploadingFile}
              className="w-full bg-[#e2f952] text-black font-mono font-bold text-xs uppercase tracking-widest py-3.5 px-6 hover:bg-[#c8e036] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(226,249,82,0.2)]"
            >
              <span>{submitting ? "TRANSMITTING DISPATCH..." : "LOG CADRE DISPATCH"}</span>
              <span>→</span>
            </button>
          </form>
        </div>

        {/* =========================================================================
            DISPATCHES ROSTER / LIST (7 Cols)
           ========================================================================= */}
        <div className="lg:col-span-7 bg-neutral-950 border border-white/15 p-6 sm:p-8 flex flex-col">
          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-widest text-[#e2f952] font-bold">
                  [ 02 // CADRE OPERATIONAL LOGS ]
                </span>
                <span className="font-mono text-xs text-neutral-500">
                  ({updates.length} DISPATCHES)
                </span>
              </div>
              <p className="font-mono text-[11px] text-neutral-400 mt-1">
                Internal operational bulletins and flight briefings for authorized personnel
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH DISPATCHES..."
                className="bg-neutral-900 border border-white/15 focus:border-[#e2f952] text-white font-mono text-xs px-3 py-1.5 outline-none uppercase"
              />
              <button
                onClick={loadPosts}
                title="Refresh from Supabase"
                className="p-1.5 border border-white/15 hover:border-[#e2f952] text-neutral-400 hover:text-white transition-colors"
              >
                ↻
              </button>
            </div>
          </div>

          {/* Posts List */}
          {loading ? (
            <div className="py-20 text-center font-mono text-xs text-[#e2f952] animate-pulse">
              [ SYNCHRONIZING WITH SUPABASE POSTGRES... ]
            </div>
          ) : filteredUpdates.length === 0 ? (
            <div className="py-20 text-center border border-white/10 bg-white/[0.01] p-8 font-mono text-xs text-neutral-500 uppercase tracking-widest">
              [ NO MATCHING DISPATCHES FOUND ]
            </div>
          ) : (
            <div className="space-y-4 max-h-[720px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredUpdates.map((post) => {
                const dateObj = new Date(post.created_at);
                const dateStr = isNaN(dateObj.getTime())
                  ? post.created_at
                  : `${dateObj.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })} · ${dateObj.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}`;

                return (
                  <article
                    key={post.id}
                    className="p-5 border border-white/10 hover:border-white/30 bg-neutral-900/60 transition-all flex flex-col sm:flex-row gap-5 justify-between group"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e2f952]" />
                        <span>{dateStr}</span>
                        {post.id.startsWith("local-post-") && (
                          <span className="text-amber-400">[ LOCAL CACHE ]</span>
                        )}
                      </div>

                      <h3 className="font-mono font-bold text-sm text-white uppercase tracking-tight group-hover:text-[#e2f952] transition-colors">
                        {post.title}
                      </h3>

                      <p className="font-mono text-xs text-neutral-400 line-clamp-3 leading-relaxed break-words">
                        {post.content}
                      </p>

                      {post.image_url && (
                        <div className="pt-2">
                          <a
                            href={post.image_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 font-mono text-[11px] text-[#e2f952] hover:underline"
                          >
                            <span>[ VIEW ATTACHED IMAGE ]</span>
                            <span>↗</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Thumbnail if present */}
                    {post.image_url && (
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-neutral-950 border border-white/10 flex-shrink-0 overflow-hidden self-start">
                        <Image
                          src={post.image_url}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                      </div>
                    )}

                    {/* Actions: Edit & Delete */}
                    <div className="flex sm:flex-col justify-end gap-2 border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-4">
                      <button
                        onClick={() => openEditModal(post)}
                        className="px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-[#e2f952] hover:text-black hover:bg-[#e2f952] border border-[#e2f952]/40 transition-colors whitespace-nowrap self-end"
                      >
                        [ EDIT DISPATCH ]
                      </button>
                      <button
                        onClick={() => setDeleteTarget(post)}
                        className="px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-red-400 hover:text-white hover:bg-red-950/60 border border-red-500/30 hover:border-red-500 transition-colors whitespace-nowrap self-end"
                      >
                        [ DELETE ]
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          EDIT DISPATCH MODAL
         ========================================================================= */}
      {editingPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-neutral-950 border border-[#e2f952]/50 p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#e2f952] animate-pulse" />
                <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-[#e2f952]">
                  [ EDIT CADRE DISPATCH & TICKER ITEM ]
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="text-neutral-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-5">
              {/* Edit Title */}
              <div>
                <label className="block font-mono text-[11px] text-neutral-400 uppercase tracking-wider mb-2">
                  Dispatch Title *
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-sm px-4 py-3 outline-none uppercase"
                  required
                />
              </div>

              {/* Edit Content */}
              <div>
                <label className="block font-mono text-[11px] text-neutral-400 uppercase tracking-wider mb-2">
                  Dispatch Content & Telemetry *
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={5}
                  className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-4 py-3 outline-none resize-y leading-relaxed"
                  required
                />
              </div>

              {/* Edit Ticker Badge */}
              <div>
                <label className="block font-mono text-[11px] text-neutral-400 uppercase tracking-wider mb-2">
                  Marquee Ticker Badge
                </label>
                <input
                  type="text"
                  value={editBadge}
                  onChange={(e) => setEditBadge(e.target.value)}
                  placeholder="e.g. LIVE MISSION UPDATE, FLIGHT OPS ALERT"
                  className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-3 py-2 outline-none uppercase"
                />
              </div>

              {/* Media URL / Upload */}
              <div>
                <label className="block font-mono text-[11px] text-neutral-400 uppercase tracking-wider mb-2">
                  Media Attachment URL
                </label>
                <input
                  type="url"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-3 py-2 outline-none"
                />
                <div className="mt-2 relative border border-dashed border-white/20 p-2.5 hover:border-white/40 text-center cursor-pointer bg-neutral-900/40">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditFileChange}
                    disabled={uploadingEditFile}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <span className="font-mono text-[11px] text-[#e2f952]">
                    {uploadingEditFile ? "UPLOADING NEW IMAGE..." : "OR UPLOAD REPLACEMENT IMAGE"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 font-mono text-xs uppercase">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2 text-neutral-400 hover:text-white border border-white/20"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={savingEdit || uploadingEditFile}
                  className="px-6 py-2.5 bg-[#e2f952] hover:bg-[#c8e036] text-black font-bold transition-all shadow-[0_0_15px_rgba(226,249,82,0.3)]"
                >
                  {savingEdit ? "SAVING CHANGES..." : "SAVE & BROADCAST"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONFIRM DELETE MODAL
         ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-neutral-950 border border-red-500/50 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 font-mono text-xs uppercase tracking-widest mb-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>[ CONFIRM DELETION ACTION ]</span>
            </div>

            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-2">
              Expunge Cadre Dispatch?
            </h3>
            <p className="font-mono text-xs text-neutral-400 mb-6 leading-relaxed">
              Are you sure you want to permanently delete:
              <br />
              <span className="text-white font-bold block mt-1">
                &ldquo;{deleteTarget.title}&rdquo;
              </span>
              This will permanently purge this dispatch from the cadre flight log.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 font-mono text-xs uppercase">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-neutral-400 hover:text-white border border-white/20 hover:border-white/40 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={executeDelete}
                disabled={deletingId === deleteTarget.id}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                {deletingId === deleteTarget.id ? "DELETING..." : "CONFIRM DELETE"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SQL RLS HELPER MODAL
         ========================================================================= */}
      {showSqlHelper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-950 border border-[#e2f952]/40 max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-[0_0_50px_rgba(226,249,82,0.15)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#e2f952]" />
                <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-[#e2f952]">
                  [ SUPABASE RLS POLICIES FOR UPDATES TABLE ]
                </h3>
              </div>
              <button
                onClick={() => setShowSqlHelper(false)}
                className="text-neutral-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="font-mono text-xs text-neutral-300 space-y-3 leading-relaxed">
              <p>
                To enable uninhibited insert and delete operations directly in Supabase Postgres (bypassing RLS error 42501), run this in your Supabase SQL Editor:
              </p>

              <pre className="bg-neutral-900 border border-white/15 p-4 text-[11px] text-[#e2f952] overflow-x-auto select-all">
{`-- Enable RLS and grant read/write on updates table:
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read updates" ON public.updates;
DROP POLICY IF EXISTS "Allow public insert updates" ON public.updates;
DROP POLICY IF EXISTS "Allow public delete updates" ON public.updates;

CREATE POLICY "Allow public read updates" ON public.updates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert updates" ON public.updates FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public delete updates" ON public.updates FOR DELETE TO anon, authenticated USING (true);

-- Storage bucket media policies:
CREATE POLICY "Allow public uploads to media" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'media');
CREATE POLICY "Allow public read media" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'media');`}
              </pre>

              <p className="text-neutral-400 text-[11px]">
                Note: Local offline caching and automatic sync are always active, ensuring no dispatches are lost even if RLS is strict.
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setShowSqlHelper(false)}
                className="px-5 py-2 bg-[#e2f952] text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-[#c8e036]"
              >
                [ CLOSE ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
