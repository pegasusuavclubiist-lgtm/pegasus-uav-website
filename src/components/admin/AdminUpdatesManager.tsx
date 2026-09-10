"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  fetchUpdates,
  createUpdate,
  deleteUpdate,
  uploadUpdateMedia,
  SupabaseUpdate,
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

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState<SupabaseUpdate | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // SQL Helper modal state
  const [showSqlHelper, setShowSqlHelper] = useState(false);

  // Load existing dispatches
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

                    {/* Delete Action Button */}
                    <div className="flex sm:flex-col justify-end gap-2 border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-4">
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
