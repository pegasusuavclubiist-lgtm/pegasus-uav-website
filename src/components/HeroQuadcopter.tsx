"use client";

import React, { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "@/lib/gsap";

export default function HeroQuadcopter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const droneWrapRef = useRef<HTMLDivElement>(null);
  const droneBodyRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  // Live telemetry state
  const [telemetry, setTelemetry] = useState({
    speed: 0,
    roll: 0,
    pitch: 0,
    altitude: 14.8,
    mode: "VIO-AUTONOMOUS",
    link: "99.4%",
    hudSide: "left",
  });

  const prevPosRef = useRef({ x: 0, y: 0 });
  const isHoveringRef = useRef(false);

  useGSAP(() => {
    const container = containerRef.current;
    const drone = droneWrapRef.current;
    const body = droneBodyRef.current;
    const shadow = shadowRef.current;
    if (!container || !drone || !body) return;

    // Get current container dimensions
    const rect = container.getBoundingClientRect();
    const defaultX = (rect.width > 0 ? rect.width : window.innerWidth) * 0.65;
    const defaultY = (rect.height > 0 ? rect.height : window.innerHeight) * 0.42;

    prevPosRef.current = { x: defaultX, y: defaultY };

    // Initialize GSAP position with centering percentage
    gsap.set(drone, {
      xPercent: -50,
      yPercent: -50,
      x: defaultX,
      y: defaultY,
    });

    if (shadow) {
      gsap.set(shadow, {
        xPercent: -50,
        yPercent: -50,
        x: defaultX,
        y: defaultY + 80,
      });
    }

    // High-performance GSAP quickTo setters for zero-latency 60fps tracking
    const xTo = gsap.quickTo(drone, "x", { duration: 0.35, ease: "power2.out" });
    const yTo = gsap.quickTo(drone, "y", { duration: 0.35, ease: "power2.out" });

    const shadowXTo = shadow
      ? gsap.quickTo(shadow, "x", { duration: 0.45, ease: "power2.out" })
      : null;
    const shadowYTo = shadow
      ? gsap.quickTo(shadow, "y", { duration: 0.45, ease: "power2.out" })
      : null;

    const tiltXTo = gsap.quickTo(body, "rotationX", { duration: 0.25, ease: "power1.out" });
    const tiltYTo = gsap.quickTo(body, "rotationY", { duration: 0.25, ease: "power1.out" });
    const rotZTo = gsap.quickTo(body, "rotation", { duration: 0.3, ease: "power1.out" });

    // Idle floating hover animation
    let idleTween: gsap.core.Tween | null = null;
    const resumeIdleHover = () => {
      if (idleTween) idleTween.kill();
      idleTween = gsap.to(body, {
        y: "+=14",
        rotation: "+=2",
        duration: 2.0,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    };
    resumeIdleHover();

    let idleTimeout: NodeJS.Timeout;

    const onPointerMove = (e: MouseEvent) => {
      const currentContainer = containerRef.current;
      if (!currentContainer) return;

      const bounds = currentContainer.getBoundingClientRect();

      // Check if mouse is hovering inside the Hero section
      const isInside =
        e.clientX >= bounds.left &&
        e.clientX <= bounds.right &&
        e.clientY >= bounds.top &&
        e.clientY <= bounds.bottom;

      if (isInside) {
        isHoveringRef.current = true;
        if (idleTween) idleTween.pause();

        const targetX = e.clientX - bounds.left;
        const targetY = e.clientY - bounds.top;

        // Compute movement vector for dynamic 3D banking
        const dx = targetX - prevPosRef.current.x;
        const dy = targetY - prevPosRef.current.y;
        const speed = Math.min(50, Math.hypot(dx, dy));

        prevPosRef.current = { x: targetX, y: targetY };

        // 3D Banking Physics
        const roll = Math.max(-28, Math.min(28, dx * 1.4));
        const pitch = Math.max(-22, Math.min(22, -dy * 1.3));
        const yaw = Math.max(-18, Math.min(18, dx * 0.7));

        xTo(targetX);
        yTo(targetY);

        if (shadowXTo && shadowYTo) {
          shadowXTo(targetX);
          shadowYTo(targetY + 80 + speed * 0.25);
        }

        tiltXTo(pitch);
        tiltYTo(roll);
        rotZTo(yaw);

        // Update telemetry HUD
        setTelemetry((prev) => ({
          ...prev,
          speed: parseFloat((speed * 0.28).toFixed(1)),
          roll: Math.round(roll),
          pitch: Math.round(pitch),
          altitude: parseFloat((14.0 + (bounds.height - targetY) * 0.02).toFixed(1)),
          hudSide: targetX > bounds.width * 0.55 ? "left" : "right",
        }));

        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(() => {
          tiltXTo(0);
          tiltYTo(0);
          rotZTo(0);
          resumeIdleHover();
        }, 1000);
      } else {
        // Return to patrol station when mouse leaves the hero section
        if (isHoveringRef.current) {
          isHoveringRef.current = false;
          const patrolX = bounds.width * 0.65;
          const patrolY = bounds.height * 0.42;
          xTo(patrolX);
          yTo(patrolY);
          if (shadowXTo && shadowYTo) {
            shadowXTo(patrolX);
            shadowYTo(patrolY + 80);
          }
          tiltXTo(0);
          tiltYTo(0);
          rotZTo(0);
          resumeIdleHover();
        }
      }
    };

    window.addEventListener("mousemove", onPointerMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onPointerMove);
      clearTimeout(idleTimeout);
      if (idleTween) idleTween.kill();
    };
  });

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 z-10 pointer-events-none overflow-hidden select-none"
      style={{ perspective: "1000px" }}
    >
      {/* Background Drone Ground Shadow */}
      <div
        ref={shadowRef}
        className="absolute top-0 left-0 w-48 h-20 bg-black/80 rounded-full blur-xl pointer-events-none will-change-transform"
        style={{
          left: "65%",
          top: "42%",
          transform: "translate(-50%, calc(-50% + 80px))",
        }}
      />

      {/* Main Quadcopter Wrapper */}
      <div
        ref={droneWrapRef}
        className="absolute top-0 left-0 will-change-transform pointer-events-none"
        style={{
          left: "0px",
          top: "0px",
          transform: "translate(65vw, 42vh) translate(-50%, -50%)",
        }}
      >
        {/* Tilting & Banking 3D Chassis */}
        <div
          ref={droneBodyRef}
          className="relative w-64 h-64 flex items-center justify-center will-change-transform"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Forward Scanning LiDAR Cone */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full w-52 h-40 pointer-events-none opacity-40">
            <div className="w-full h-full bg-gradient-to-t from-[#00f0ff]/25 via-[#e2f952]/5 to-transparent clip-triangle" />
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-[#00f0ff] animate-pulse shadow-[0_0_8px_#00f0ff]" />
          </div>

          {/* SVG Vector Quadcopter Aircraft */}
          <svg
            viewBox="0 0 300 300"
            className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="carbonArm" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#333333" />
                <stop offset="50%" stopColor="#1a1a1a" />
                <stop offset="100%" stopColor="#0a0a0a" />
              </linearGradient>
              <linearGradient id="fuselage" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#242424" />
                <stop offset="50%" stopColor="#141414" />
                <stop offset="100%" stopColor="#080808" />
              </linearGradient>
              <radialGradient id="rotorBlur">
                <stop offset="0%" stopColor="rgba(226, 249, 82, 0.35)" />
                <stop offset="70%" stopColor="rgba(255, 255, 255, 0.15)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
              </radialGradient>
            </defs>

            {/* Diagonal Carbon Fiber Arms (X-Configuration) */}
            <path
              d="M60 60 L240 240"
              stroke="url(#carbonArm)"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              d="M60 60 L240 240"
              stroke="#e2f952"
              strokeWidth="1.2"
              strokeOpacity="0.5"
            />

            <path
              d="M240 60 L60 240"
              stroke="url(#carbonArm)"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              d="M240 60 L60 240"
              stroke="#e2f952"
              strokeWidth="1.2"
              strokeOpacity="0.5"
            />

            {/* 4 Brushless Motor Mounts & Nacelles */}
            {/* Motor 1: Front-Left (60, 60) */}
            <circle cx="60" cy="60" r="17" fill="#171717" stroke="#383838" strokeWidth="2" />
            <circle cx="60" cy="60" r="8" fill="#e2f952" fillOpacity="0.25" />
            <circle cx="60" cy="60" r="4" fill="#e2f952" />

            {/* Motor 2: Front-Right (240, 60) */}
            <circle cx="240" cy="60" r="17" fill="#171717" stroke="#383838" strokeWidth="2" />
            <circle cx="240" cy="60" r="8" fill="#e2f952" fillOpacity="0.25" />
            <circle cx="240" cy="60" r="4" fill="#e2f952" />

            {/* Motor 3: Rear-Left (60, 240) */}
            <circle cx="60" cy="240" r="17" fill="#171717" stroke="#383838" strokeWidth="2" />
            <circle cx="60" cy="240" r="8" fill="#e2f952" fillOpacity="0.25" />
            <circle cx="60" cy="240" r="4" fill="#e2f952" />

            {/* Motor 4: Rear-Right (240, 240) */}
            <circle cx="240" cy="240" r="17" fill="#171717" stroke="#383838" strokeWidth="2" />
            <circle cx="240" cy="240" r="8" fill="#e2f952" fillOpacity="0.25" />
            <circle cx="240" cy="240" r="4" fill="#e2f952" />
            {/* Rear Amber Beacon */}
            <circle cx="240" cy="240" r="2.5" fill="#e2f952" className="animate-pulse" />

            {/* High-Speed Rotating Propellers & Wash Discs */}
            {/* Propeller 1: Top-Left (CW) */}
            <g className="origin-[60px_60px] animate-[spin_0.1s_linear_infinite]">
              <circle cx="60" cy="60" r="48" fill="url(#rotorBlur)" />
              <ellipse cx="60" cy="60" rx="46" ry="4" fill="#e2f952" fillOpacity="0.8" />
              <ellipse cx="60" cy="60" rx="4" ry="46" fill="#ffffff" fillOpacity="0.4" />
            </g>

            {/* Propeller 2: Top-Right (CCW) */}
            <g className="origin-[240px_60px] animate-[spin_0.1s_linear_infinite_reverse]">
              <circle cx="240" cy="60" r="48" fill="url(#rotorBlur)" />
              <ellipse cx="240" cy="60" rx="46" ry="4" fill="#e2f952" fillOpacity="0.8" />
              <ellipse cx="240" cy="60" rx="4" ry="46" fill="#ffffff" fillOpacity="0.4" />
            </g>

            {/* Propeller 3: Bottom-Left (CCW) */}
            <g className="origin-[60px_240px] animate-[spin_0.1s_linear_infinite_reverse]">
              <circle cx="60" cy="240" r="48" fill="url(#rotorBlur)" />
              <ellipse cx="60" cy="240" rx="46" ry="4" fill="#ffffff" fillOpacity="0.6" />
              <ellipse cx="60" cy="240" rx="4" ry="46" fill="#e2f952" fillOpacity="0.7" />
            </g>

            {/* Propeller 4: Bottom-Right (CW) */}
            <g className="origin-[240px_240px] animate-[spin_0.1s_linear_infinite]">
              <circle cx="240" cy="240" r="48" fill="url(#rotorBlur)" />
              <ellipse cx="240" cy="240" rx="46" ry="4" fill="#ffffff" fillOpacity="0.6" />
              <ellipse cx="240" cy="240" rx="4" ry="46" fill="#e2f952" fillOpacity="0.7" />
            </g>

            {/* Central Fuselage & Avionics Bay */}
            <polygon
              points="150,75 190,110 190,190 150,225 110,190 110,110"
              fill="url(#fuselage)"
              stroke="#333333"
              strokeWidth="3.5"
            />
            {/* Top Plate Accent Lines */}
            <polygon
              points="150,85 180,115 180,185 150,215 120,185 120,115"
              fill="#141414"
              stroke="#e2f952"
              strokeWidth="1.2"
              strokeDasharray="4 2"
            />

            {/* Edge AI / Jetson Core Plate */}
            <rect
              x="134"
              y="130"
              width="32"
              height="38"
              rx="3"
              fill="#080808"
              stroke="#444"
              strokeWidth="1.5"
            />
            {/* Pegasus Insignia Monogram */}
            <path
              d="M140 148 L150 138 L160 148 M144 154 L150 148 L156 154"
              stroke="#e2f952"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Forward Perception Gimbal / Optical Flow Pod (Nose) */}
            <rect
              x="142"
              y="74"
              width="16"
              height="14"
              rx="4"
              fill="#0a0a0a"
              stroke="#00f0ff"
              strokeWidth="1.5"
            />
            <circle cx="150" cy="81" r="3.5" fill="#00f0ff" className="animate-pulse" />

            {/* Telemetry Status Lights */}
            <circle cx="132" cy="180" r="2" fill="#00ff66" />
            <circle cx="140" cy="180" r="2" fill="#e2f952" />
            <circle cx="148" cy="180" r="2" fill="#00f0ff" />
            <circle cx="156" cy="180" r="2" fill="#e2f952" />
            <circle cx="164" cy="180" r="2" fill="#00ff66" />

            {/* Power Port (Rear) */}
            <rect x="144" y="222" width="12" height="8" rx="1" fill="#ff334b" />
          </svg>

          {/* Dynamic Sleek HUD Telemetry Readout */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-1 p-2.5 border border-white/15 bg-black/80 backdrop-blur-md font-mono text-[9px] uppercase text-neutral-300 w-44 pointer-events-none transition-all duration-200 ${
              telemetry.hudSide === "left"
                ? "right-full mr-5"
                : "left-full ml-5"
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-1 text-[#e2f952] text-[10px]">
              <span className="font-bold tracking-wider">PEGASUS X-4</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#e2f952] animate-pulse" />
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-0.5 text-neutral-400">
              <span>ALT:</span>
              <span className="text-white text-right font-semibold">{telemetry.altitude}M</span>

              <span>SPD:</span>
              <span className="text-white text-right font-semibold">{telemetry.speed} M/S</span>

              <span>ATT:</span>
              <span className="text-white text-right">
                {telemetry.roll > 0 ? `+${telemetry.roll}` : telemetry.roll}° / {telemetry.pitch > 0 ? `+${telemetry.pitch}` : telemetry.pitch}°
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
