"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap, { ScrollTrigger } from "@/lib/gsap";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Mission from "@/components/Mission";
import DroneDeliveryDivider from "@/components/DroneDeliveryDivider";
import Projects from "@/components/Projects";
import Team from "@/components/Team";
import Mentors from "@/components/Mentors";
import Updates from "@/components/Updates";
import RequestInventory from "@/components/RequestInventory";
import JoinUs from "@/components/JoinUs";
import Footer from "@/components/Footer";

export default function Home() {
  const mainRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Mobile adaptation
      mm.add("(max-width: 1023px)", () => {
        // Ensure standard touch scroll performance on smaller screens
        ScrollTrigger.normalizeScroll(false);
      });

      return () => mm.revert();
    },
    { scope: mainRef }
  );

  return (
    <div ref={mainRef} className="relative min-h-screen bg-black text-white selection:bg-[#e2f952] selection:text-black">
      <Header />
      <main className="w-full flex flex-col">
        <Hero />
        <Marquee text="INNOVATE. BUILD. FLY." />
        <Mission />
        <DroneDeliveryDivider />
        <Projects />
        <Team />
        <Mentors />
        <Updates />
        <RequestInventory />
        <JoinUs />
      </main>
      <Footer />
    </div>
  );
}
