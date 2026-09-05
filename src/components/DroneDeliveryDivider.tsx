"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "@/lib/gsap";
import { siteData } from "@/data/data";

export default function DroneDeliveryDivider() {
  const { flightDivider } = siteData;
  const containerRef = useRef<HTMLDivElement>(null);
  const droneRef = useRef<HTMLDivElement>(null);
  const parcelRef = useRef<SVGGElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const glowTrailRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const container = containerRef.current;
    const drone = droneRef.current;
    const trail = trailRef.current;
    const glowTrail = glowTrailRef.current;
    const parcel = parcelRef.current;

    if (!container || !drone || !trail) return;

    // Fixed scroll pinning: locks section in place until the delivery flight completes
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "center center", // Locks in viewport center
        end: "+=130%", // Scroll distance required to complete transit
        pin: true,
        pinSpacing: true,
        scrub: 1, // Smooth, controlled response directly tied to scroll
        anticipatePin: 1,
        onUpdate: (self) => {
          if (progressTextRef.current) {
            const pct = Math.round(self.progress * 100);
            progressTextRef.current.textContent = `${pct}% TRANSIT`;
          }
        },
      },
    });

    // 1. Drone traverses across the screen width (-15vw to 112vw)
    tl.fromTo(
      drone,
      {
        x: "-15vw",
        y: 8,
        rotation: -2,
      },
      {
        x: "112vw",
        y: -6,
        rotation: 4,
        ease: "none",
      },
      0
    );

    // 2. Trailing Dividing Line extends synchronously across
    tl.fromTo(
      trail,
      { scaleX: 0 },
      { scaleX: 1, ease: "none" },
      0
    );

    if (glowTrail) {
      tl.fromTo(
        glowTrail,
        { scaleX: 0 },
        { scaleX: 1, ease: "none" },
        0
      );
    }

    // 3. Subtle cargo pendulum inertia (natural aerodynamic drag on cables)
    if (parcel) {
      tl.fromTo(
        parcel,
        { rotation: 4, transformOrigin: "top center" },
        { rotation: -6, transformOrigin: "top center", ease: "none" },
        0
      );
    }
  });

  return (
    <div
      ref={containerRef}
      aria-label="Flight Corridor Transition"
      className="relative w-full h-64 sm:h-72 md:h-80 overflow-hidden bg-black select-none pointer-events-none border-y border-white/10 flex items-center"
    >
      {/* Background Flight Grid & Corridor Telemetry */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      {/* Top Technical Flight Status Readouts */}
      <div className="absolute top-6 left-6 md:left-12 flex items-center gap-3 font-mono text-[10px] sm:text-xs uppercase tracking-widest text-neutral-500">
        <span className="w-1.5 h-1.5 rounded-full bg-[#e2f952]" />
        <span className="text-[#e2f952]">{flightDivider.flightCorridor}</span>
        <span className="hidden sm:inline text-neutral-600">//</span>
        <span className="hidden sm:inline">{flightDivider.status}</span>
      </div>

      <div className="absolute top-6 right-6 md:right-12 flex items-center gap-4 font-mono text-[10px] sm:text-xs uppercase tracking-widest text-neutral-500">
        <span ref={progressTextRef} className="text-white font-semibold">
          0% TRANSIT
        </span>
        <span className="text-neutral-600 hidden sm:inline">
          {flightDivider.origin} → {flightDivider.destination}
        </span>
      </div>

      {/* Center Reference Guide Line (Faint base wire) */}
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/[0.08] -translate-y-1/2 pointer-events-none" />

      {/* Active Glowing Dividing Trail Line drawn behind the drone */}
      <div
        ref={glowTrailRef}
        className="absolute top-1/2 left-0 w-full h-[4px] -translate-y-1/2 origin-left will-change-transform pointer-events-none bg-gradient-to-r from-transparent via-[#e2f952]/40 to-[#e2f952] blur-[3px]"
      />
      <div
        ref={trailRef}
        className="absolute top-1/2 left-0 w-full h-[2px] -translate-y-1/2 origin-left will-change-transform pointer-events-none bg-gradient-to-r from-white/20 via-[#e2f952] to-[#e2f952] shadow-[0_0_8px_#e2f952]"
      />

      {/* Static Waypoint Markers along the Dividing Trail */}
      <div className="absolute top-1/2 left-[25%] -translate-x-1/2 -translate-y-1/2 font-mono text-[9px] text-neutral-600">
        + WP-01
      </div>
      <div className="absolute top-1/2 left-[50%] -translate-x-1/2 -translate-y-1/2 font-mono text-[9px] text-neutral-600">
        + MIDPOINT // FL-45
      </div>
      <div className="absolute top-1/2 left-[75%] -translate-x-1/2 -translate-y-1/2 font-mono text-[9px] text-neutral-600">
        + WP-02
      </div>

      {/* Autonomous Delivery Drone & Parcel Airframe */}
      <div
        ref={droneRef}
        className="absolute top-1/2 left-0 -translate-y-1/2 will-change-transform pointer-events-none"
        style={{ width: "240px", height: "140px" }}
      >
        <svg
          viewBox="0 0 240 140"
          className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="droneFuselage" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2e2e2e" />
              <stop offset="50%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>
            <linearGradient id="parcelGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#222222" />
              <stop offset="100%" stopColor="#0d0d0d" />
            </linearGradient>
          </defs>

          {/* Forward LiDAR Optical Beacon */}
          <polygon
            points="170,45 220,38 220,52"
            fill="#e2f952"
            fillOpacity="0.08"
          />

          {/* Landing Skid Struts */}
          <path
            d="M80 50 L70 70 M140 50 L150 70"
            stroke="#404040"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M60 70 L160 70"
            stroke="#555555"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Motor Arms & Rotor Towers */}
          <path
            d="M50 35 L170 35"
            stroke="#1c1c1c"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M50 35 L170 35"
            stroke="#e2f952"
            strokeWidth="1"
            strokeOpacity="0.5"
          />

          {/* Motor Nacelles */}
          <rect x="42" y="24" width="16" height="12" rx="2" fill="#141414" stroke="#444" strokeWidth="1.5" />
          <rect x="85" y="22" width="16" height="14" rx="2" fill="#141414" stroke="#444" strokeWidth="1.5" />
          <rect x="125" y="22" width="16" height="14" rx="2" fill="#141414" stroke="#444" strokeWidth="1.5" />
          <rect x="162" y="24" width="16" height="12" rx="2" fill="#141414" stroke="#444" strokeWidth="1.5" />

          {/* Precision Static Composite Rotor Blades (No flashy spinning motion blur) */}
          {/* Motor 1 Propeller */}
          <g transform="translate(50, 22)">
            <path
              d="M-26 -1.2 C-14 -2.5 14 -2.5 26 -1.2 C26 1.2 14 2.5 -26 1.2 Z"
              fill="#242424"
              stroke="#e2f952"
              strokeWidth="0.8"
              strokeOpacity="0.8"
            />
            <circle cx="0" cy="0" r="2.5" fill="#e2f952" />
          </g>

          {/* Motor 2 Propeller */}
          <g transform="translate(93, 20)">
            <path
              d="M-28 -1.2 C-15 -2.5 15 -2.5 28 -1.2 C28 1.2 15 2.5 -28 1.2 Z"
              fill="#242424"
              stroke="#e2f952"
              strokeWidth="0.8"
              strokeOpacity="0.8"
            />
            <circle cx="0" cy="0" r="2.5" fill="#e2f952" />
          </g>

          {/* Motor 3 Propeller */}
          <g transform="translate(133, 20)">
            <path
              d="M-28 -1.2 C-15 -2.5 15 -2.5 28 -1.2 C28 1.2 15 2.5 -28 1.2 Z"
              fill="#242424"
              stroke="#e2f952"
              strokeWidth="0.8"
              strokeOpacity="0.8"
            />
            <circle cx="0" cy="0" r="2.5" fill="#e2f952" />
          </g>

          {/* Motor 4 Propeller */}
          <g transform="translate(170, 22)">
            <path
              d="M-26 -1.2 C-14 -2.5 14 -2.5 26 -1.2 C26 1.2 14 2.5 -26 1.2 Z"
              fill="#242424"
              stroke="#e2f952"
              strokeWidth="0.8"
              strokeOpacity="0.8"
            />
            <circle cx="0" cy="0" r="2.5" fill="#e2f952" />
          </g>

          {/* Central Aerodynamic Fuselage Pod */}
          <path
            d="M60 45 C60 38 75 32 110 32 C145 32 165 38 165 45 C165 52 145 56 110 56 C75 56 60 52 60 45 Z"
            fill="url(#droneFuselage)"
            stroke="#3a3a3a"
            strokeWidth="1.5"
          />

          {/* Fuselage Accent Strip */}
          <path
            d="M80 44 L145 44"
            stroke="#e2f952"
            strokeWidth="1.8"
            strokeDasharray="8 4"
          />

          {/* Forward Perception Camera */}
          <circle cx="164" cy="45" r="3.5" fill="#00f0ff" />

          {/* Rear Strobe */}
          <circle cx="61" cy="45" r="2" fill="#e2f952" />

          {/* Heavy-Duty Suspension Cables & Cargo Parcel */}
          <g ref={parcelRef}>
            {/* High-Tensile Suspension Harness Cables */}
            <line x1="85" y1="70" x2="95" y2="92" stroke="#666" strokeWidth="1.5" />
            <line x1="135" y1="70" x2="125" y2="92" stroke="#666" strokeWidth="1.5" />

            {/* Cargo Parcel Box Container */}
            <rect
              x="82"
              y="92"
              width="56"
              height="36"
              rx="4"
              fill="url(#parcelGrad)"
              stroke="#e2f952"
              strokeWidth="1.5"
            />

            {/* High-Vis Hazard Diagonal Stripes on Parcel */}
            <path
              d="M90 92 L82 100 M102 92 L82 112 M114 92 L86 120 M126 92 L98 120 M138 92 L110 120 M138 104 L122 120 M138 116 L134 120"
              stroke="#e2f952"
              strokeWidth="2"
              strokeOpacity="0.4"
            />

            {/* Parcel Center Label */}
            <rect x="96" y="103" width="28" height="14" rx="2" fill="#000" stroke="#444" strokeWidth="1" />
            <text
              x="110"
              y="113"
              fill="#e2f952"
              fontSize="7"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
              letterSpacing="0.5"
            >
              IIST-UAV
            </text>

            {/* Cargo Lock Indicator */}
            <circle cx="132" cy="98" r="1.5" fill="#e2f952" />
          </g>
        </svg>
      </div>
    </div>
  );
}
