"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectDetailView from "@/components/project/ProjectDetailView";
import { siteData, ProjectDetail } from "@/data/data";
import { fetchProjectBySlug } from "@/lib/supabase/projects";

interface ProjectPageClientProps {
  slug: string;
  initialProject?: ProjectDetail | null;
  initialNextProject?: {
    slug: string;
    title: string;
    code: string;
    coverImageUrl: string;
  } | null;
}

export default function ProjectPageClient({
  slug,
  initialProject = null,
  initialNextProject = null,
}: ProjectPageClientProps) {
  const { projectPageUi, projectDetails, projects } = siteData;
  const [project, setProject] = useState<ProjectDetail | null>(initialProject);
  const [nextProject, setNextProject] = useState<{
    slug: string;
    title: string;
    code: string;
    coverImageUrl: string;
  } | null>(initialNextProject);
  const [loading, setLoading] = useState<boolean>(!initialProject);

  useEffect(() => {
    // If we already have the curated project from server, check nextProject
    if (initialProject) {
      setProject(initialProject);
      if (!initialNextProject) {
        computeNextProject(initialProject.slug);
      }
      setLoading(false);
      return;
    }

    // Check if static projectDetails has it
    if (projectDetails[slug]) {
      const p = projectDetails[slug];
      setProject(p);
      computeNextProject(p.slug);
      setLoading(false);
      return;
    }

    // Otherwise, attempt client-side / Supabase / local storage lookup
    let isMounted = true;
    fetchProjectBySlug(slug)
      .then((remote) => {
        if (!isMounted) return;
        if (remote) {
          const dynamicProject: ProjectDetail = {
            slug: remote.slug || slug,
            code: `BUILD // ${remote.slug?.toUpperCase() || "CADRE"}`,
            title: remote.title,
            subtitle: remote.summary || "Autonomous Aerial Systems Engineering Initiative",
            status: (remote.status || "active").toUpperCase(),
            trlLevel: "TRL-6 // LAB PROTOTYPE",
            category: "Autonomous Aerospace & Robotics Build",
            partner: "IIST Pegasus UAV Club // Dept. of Space",
            leadDivision: "Flight Autonomy & Avionics Cadre",
            summary: remote.summary || remote.description,
            overview: remote.description
              ? remote.description.split("\n\n").filter(Boolean)
              : [remote.summary],
            coverImageUrl: remote.cover_image_url || "",
            telemetryStats: [
              {
                label: "Deployment Phase",
                value: remote.status?.toUpperCase() || "ACTIVE",
                detail: "Current operational readiness tier",
              },
              {
                label: "Subsystems Integrated",
                value: `${remote.stack?.length || 4}`,
                unit: "Modules",
                detail: "Embedded sensors & controllers",
              },
              {
                label: "Repository Telemetry",
                value: "LIVE",
                detail: "Synchronized with Supabase cadre database",
              },
            ],
            avionicsArchitecture: (remote.stack || []).map((tech, i) => ({
              subsystem: `Subsystem 0${i + 1}`,
              component: tech,
              model: "Custom Payload / Hardware Module",
              notes: "Integrated with flight controller and telemetry link.",
            })),
            missionObjectives: [
              {
                id: "OBJ-01",
                title: "Autonomous Mission Execution",
                description: remote.description || remote.summary,
                division: "Autonomous Systems",
              },
            ],
            flightLogs: [
              {
                phase: "Project Inception & Assembly",
                date: remote.created_at
                  ? new Date(remote.created_at).toLocaleDateString()
                  : "2026 Cadre",
                status: "VERIFIED",
                outcome: "Recorded in active Pegasus projects roster.",
              },
            ],
            stack: remote.stack || [],
          };
          setProject(dynamicProject);
          computeNextProject(dynamicProject.slug);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load project by slug:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug, initialProject, initialNextProject]);

  const computeNextProject = (currentSlug: string) => {
    const list = projects.list;
    if (!list || list.length === 0) return;

    const currentIndex = list.findIndex(
      (p) => p.href.replace("/projects/", "") === currentSlug
    );

    const nextIndex =
      currentIndex !== -1 ? (currentIndex + 1) % list.length : 0;
    const nextItem = list[nextIndex];

    if (nextItem) {
      const nextSlug = nextItem.href.replace("/projects/", "");
      const detail = projectDetails[nextSlug];
      setNextProject({
        slug: nextSlug,
        title: nextItem.title,
        code: detail?.code || `PROJECT 0${nextIndex + 1}`,
        coverImageUrl: nextItem.imageUrl,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-[#e2f952] selection:text-black">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-32 px-6">
          <div className="flex items-center gap-3 font-mono text-sm text-[#e2f952] tracking-widest uppercase">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e2f952] animate-ping" />
            <span>[ RETRIEVING FLIGHT SPECS // {slug} ]</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-[#e2f952] selection:text-black">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-6 py-32 flex flex-col items-center justify-center text-center">
          <div className="font-mono text-xs text-red-400 uppercase tracking-widest px-3 py-1 border border-red-500/40 bg-red-950/20 mb-6">
            [ 404 // TELEMETRY LINK OFFLINE ]
          </div>

          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-white mb-4">
            {projectPageUi.notFoundTitle}
          </h1>

          <p className="font-mono text-xs sm:text-sm text-neutral-400 max-w-lg mb-8 leading-relaxed">
            {projectPageUi.notFoundMessage} (Identifier: <code className="text-[#e2f952]">{slug}</code>)
          </p>

          <Link
            href="/#projects"
            className="px-8 py-3.5 bg-[#e2f952] text-black font-mono text-xs uppercase tracking-wider font-bold border border-[#e2f952] hover:bg-white hover:border-white transition-all shadow-[0_0_20px_rgba(226,249,82,0.3)]"
          >
            [ {projectPageUi.returnHomeButton} ]
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return <ProjectDetailView project={project} nextProject={nextProject} />;
}
