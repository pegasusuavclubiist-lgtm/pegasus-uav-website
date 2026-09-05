"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap, { ScrollTrigger } from "@/lib/gsap";
import { siteData } from "@/data/data";

export default function Projects() {
  const { projects } = siteData;
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Reveal section header
      gsap.fromTo(
        headerRef.current?.children || [],
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 80%",
          },
        }
      );

      // Media Parallax & Scale on each project image
      const imageContainers = sectionRef.current?.querySelectorAll(".project-media-wrap");
      imageContainers?.forEach((wrap) => {
        const img = wrap.querySelector("img");
        if (img) {
          gsap.fromTo(
            img,
            { scale: 1.25, yPercent: -5 },
            {
              scale: 1.0,
              yPercent: 5,
              ease: "none",
              scrollTrigger: {
                trigger: wrap,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        }
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative w-full bg-black text-white py-24 md:py-36 border-b border-white/15"
    >
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        {/* Section Header with [ 02 ] Numbering */}
        <div ref={headerRef} className="border-b border-white/15 pb-8 mb-12">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs md:text-sm uppercase tracking-widest text-[#e2f952]">
              [ {projects.sectionNumber} ]
            </span>
            <span className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest">
              DEPLOYMENTS // TRL-6+
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter">
              {projects.headline}
            </h2>
            <p className="max-w-md text-sm md:text-base text-neutral-400 font-normal">
              {projects.description}
            </p>
          </div>
        </div>

        {/* Full-Width Project Rows */}
        <div ref={rowsRef} className="flex flex-col divide-y divide-white/15 border-b border-white/15">
          {projects.list.map((project, idx) => (
            <Link
              key={project.title}
              href={project.href}
              data-cursor="project"
              className="group block py-12 md:py-16 hover:bg-white/[0.02] transition-colors duration-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Number & Status */}
                <div className="lg:col-span-1 flex lg:flex-col justify-between items-start gap-2">
                  <span className="font-mono text-xs text-neutral-500">
                    [ 0{idx + 1} ]
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-[#e2f952]/40 text-[#e2f952] bg-[#e2f952]/5">
                    {project.status}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="lg:col-span-6 flex flex-col justify-center">
                  <h3 className="text-2xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white group-hover:text-[#e2f952] transition-colors duration-200">
                    {project.title}
                  </h3>
                  <p className="text-sm md:text-base text-neutral-400 mt-4 leading-relaxed font-light line-clamp-3">
                    {project.description}
                  </p>
                  <div className="mt-6 flex items-center gap-2 font-mono text-xs text-neutral-500 group-hover:text-white transition-colors">
                    <span>EXPLORE SPECS</span>
                    <span className="group-hover:translate-x-1.5 transition-transform duration-200">
                      →
                    </span>
                  </div>
                </div>

                {/* Parallax Thumbnail with scale: 1.2 to 1.0 */}
                <div className="lg:col-span-5">
                  <div className="project-media-wrap relative w-full h-64 sm:h-80 md:h-96 overflow-hidden border border-white/20 bg-neutral-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover will-change-transform brightness-90 contrast-110 group-hover:brightness-105 transition-[filter] duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity" />
                    <div className="absolute bottom-3 right-3 font-mono text-[10px] px-2 py-1 bg-black/80 border border-white/20 text-neutral-300">
                      FIG. 0{idx + 1} // TELEMETRY
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
