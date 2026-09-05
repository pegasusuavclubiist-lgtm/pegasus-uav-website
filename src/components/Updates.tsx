"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "@/lib/gsap";
import { siteData } from "@/data/data";
import { fetchUpdates, SupabaseUpdate } from "@/lib/supabase/updates";

/**
 * Format upload timestamp for a clean social media post header & timestamp
 */
function formatPostTime(dateString: string) {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return { display: dateString, iso: dateString, relative: "Recently" };

    // Human-friendly date and time
    const dateFormatted = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const timeFormatted = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });

    return {
      display: `${dateFormatted} · ${timeFormatted} UTC`,
      iso: d.toISOString(),
      dateOnly: dateFormatted,
    };
  } catch {
    return { display: dateString, iso: dateString, dateOnly: dateString };
  }
}

/**
 * Render plain text content with clickable inline text links (social media style)
 */
function renderPlainTextWithLinks(content: string) {
  if (!content) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);

  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#e2f952] hover:underline underline-offset-2 break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

export default function Updates() {
  const { updates: updatesMeta } = siteData;
  const sectionRef = useRef<HTMLElement>(null);
  const [updates, setUpdates] = useState<SupabaseUpdate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch updates live from Supabase (ordered latest first)
  useEffect(() => {
    let isMounted = true;
    fetchUpdates()
      .then((data) => {
        if (!isMounted) return;
        setUpdates(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to fetch updates from Supabase:", err);
        setError("Unable to load updates feed.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Toggle like reaction
  const toggleLike = (id: string) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Copy post link
  const copyPostLink = (id: string) => {
    const url = `${window.location.origin}/#updates`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // GSAP Entrance animation on scroll
  useGSAP(
    () => {
      if (loading || updates.length === 0 || !sectionRef.current) return;

      const posts = gsap.utils.toArray<HTMLElement>(".social-post-card");
      gsap.fromTo(
        posts,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );
    },
    { scope: sectionRef, dependencies: [updates, loading] }
  );

  return (
    <section
      ref={sectionRef}
      id="updates"
      className="relative w-full bg-black text-white py-24 md:py-36 border-b border-white/15 overflow-hidden"
    >
      {/* Subtle Background Coordinate Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="border-b border-white/15 pb-8 mb-12 md:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#e2f952] animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-widest text-[#e2f952]">
                  [ {updatesMeta?.sectionNumber || "06 — UPDATES"} ]
                </span>
                <span className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest hidden sm:inline">
                  // OFFICIAL CLUB FEED
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-white">
                {updatesMeta?.headline || "Club Updates"}
              </h2>
            </div>

            <div className="font-mono text-xs text-neutral-400 uppercase tracking-widest flex items-center gap-2">
              <span className="text-[#e2f952]">● LIVE FEED</span>
              <span className="text-neutral-600">·</span>
              <span>LATEST FIRST</span>
            </div>
          </div>
        </div>

        {/* Feed Posts Container */}
        {loading ? (
          <div className="py-24 flex items-center justify-center gap-4">
            <div className="flex items-center gap-3 font-mono text-xs text-[#e2f952] uppercase tracking-widest animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#e2f952]" />
              <span>[ LOADING CLUB FEED // SYNCHRONIZING UPDATES ]</span>
            </div>
          </div>
        ) : error ? (
          <div className="py-16 flex justify-center">
            <div className="p-8 border border-red-500/30 bg-red-950/20 font-mono text-center max-w-xl">
              <span className="text-red-400 text-sm uppercase tracking-widest">[ {error} ]</span>
            </div>
          </div>
        ) : updates.length === 0 ? (
          <div className="py-20 border border-white/10 bg-white/[0.02] p-10 text-center font-mono text-neutral-500 text-xs uppercase tracking-widest max-w-2xl mx-auto">
            [ NO UPDATES POSTED YET ]
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
            {updates.map((update, index) => {
              const timeData = formatPostTime(update.created_at);
              const isLiked = !!likedPosts[update.id];

              return (
                <article
                  key={update.id}
                  className="social-post-card group relative bg-neutral-950 border border-white/15 hover:border-white/30 transition-all duration-300 p-6 sm:p-8 overflow-hidden shadow-2xl"
                >
                  {/* Subtle Corner Reticles */}
                  <span className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />
                  <span className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />
                  <span className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />
                  <span className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/30 group-hover:border-[#e2f952] transition-colors pointer-events-none" />

                  {/* 1. Author Header + Upload Timestamp */}
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative w-10 h-10 rounded-full bg-neutral-900 border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
                        <span className="font-display font-black text-sm text-[#e2f952]">P</span>
                        <div className="absolute inset-0 bg-[#e2f952]/10 pointer-events-none" />
                      </div>

                      {/* Name & Handle */}
                      <div>
                        <div className="flex items-center gap-1.5 leading-none">
                          <span className="font-sans font-bold text-sm sm:text-base text-white">
                            Pegasus UAV Club
                          </span>
                          <span
                            title="Verified Club Account"
                            className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#e2f952] text-black text-[9px] font-bold"
                          >
                            ✓
                          </span>
                        </div>
                        <span className="font-mono text-xs text-neutral-500 block mt-0.5">
                          @pegasus_iist
                        </span>
                      </div>
                    </div>

                    {/* Time of Uploading */}
                    <div className="text-right">
                      <time
                        dateTime={timeData.iso}
                        className="font-mono text-xs text-neutral-400 hover:text-white transition-colors"
                        title={timeData.iso}
                      >
                        {timeData.display}
                      </time>
                      {index === 0 && (
                        <span className="block font-mono text-[9px] text-[#e2f952] uppercase tracking-widest mt-0.5">
                          LATEST
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 2. Title of the Post */}
                  <h3 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight leading-snug mb-3">
                    {update.title}
                  </h3>

                  {/* 3. Plain Text Content */}
                  <div className="text-sm sm:text-base text-neutral-300 font-sans leading-relaxed whitespace-pre-wrap break-words">
                    {renderPlainTextWithLinks(update.content)}
                  </div>

                  {/* 4. Image Payload (Only rendered if present) */}
                  {update.image_url && (
                    <div className="relative aspect-[16/9] w-full bg-neutral-900 border border-white/15 overflow-hidden mt-5 shadow-lg">
                      <Image
                        src={update.image_url}
                        alt={update.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 700px"
                        className="object-cover hover:scale-[1.02] transition-transform duration-500"
                      />
                    </div>
                  )}

                  {/* 5. Social Post Footer Bar (Clean interactive reactions, no link buttons) */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-neutral-500 font-mono text-xs">
                    <div className="flex items-center gap-6">
                      {/* Like Reaction */}
                      <button
                        type="button"
                        onClick={() => toggleLike(update.id)}
                        className={`flex items-center gap-1.5 transition-colors ${
                          isLiked ? "text-[#e2f952]" : "hover:text-white"
                        }`}
                        aria-label="Like update"
                      >
                        <span>{isLiked ? "♥" : "♡"}</span>
                        <span>{isLiked ? 1 : 0}</span>
                      </button>

                      {/* Share / Copy Link */}
                      <button
                        type="button"
                        onClick={() => copyPostLink(update.id)}
                        className="flex items-center gap-1.5 hover:text-white transition-colors"
                        title="Copy link to post"
                      >
                        <span>↗</span>
                        <span>{copiedId === update.id ? "COPIED" : "SHARE"}</span>
                      </button>
                    </div>

                    <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                      IIST // DISPATCH #{index + 1}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
