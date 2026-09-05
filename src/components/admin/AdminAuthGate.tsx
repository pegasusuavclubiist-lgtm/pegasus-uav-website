"use client";

import React, { useState } from "react";
import { siteData } from "@/data/data";
import { createClient } from "@/lib/supabase/client";

interface AdminAuthGateProps {
  onAuthenticated: (email?: string) => void;
}

export default function AdminAuthGate({ onAuthenticated }: AdminAuthGateProps) {
  const { admin } = siteData;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const targetEmail = email.trim().toLowerCase();
    const targetPassword = password;

    const isAuthorized =
      targetEmail === "pegasusuavclubiist@gmail.com" && targetPassword === "IIST@456";

    try {
      // Attempt Supabase Auth login as well
      const supabase = createClient();
      await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: targetPassword,
      });
    } catch {
      // Supabase auth attempt fallback
    }

    if (isAuthorized) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pegasus_admin_auth", "true");
        sessionStorage.setItem("pegasus_admin_email", targetEmail);
      }
      setIsSubmitting(false);
      onAuthenticated(targetEmail);
    } else {
      setIsSubmitting(false);
      setError("ACCESS REJECTED // INVALID CADRE EMAIL OR PASSWORD");
      setTimeout(() => setError(null), 3500);
    }
  };

  const handleAutoFill = () => {
    setEmail("pegasusuavclubiist@gmail.com");
    setPassword("IIST@456");
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex items-center justify-center p-6 overflow-hidden selection:bg-[#e2f952] selection:text-black">
      {/* Background Reticle Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e2f952]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Center Tactical Card */}
      <div className="relative z-10 w-full max-w-md bg-neutral-950/90 border border-white/20 p-8 sm:p-10 shadow-2xl backdrop-blur-md">
        {/* Reticles at Corners */}
        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#e2f952]" />
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#e2f952]" />
        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#e2f952]" />
        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#e2f952]" />

        {/* Header telemetry */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#e2f952] animate-pulse" />
            <span className="font-mono text-xs text-[#e2f952] tracking-widest uppercase font-bold">
              [ {admin.code} ]
            </span>
          </div>
          <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
            {admin.callsign}
          </span>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-2">
            {admin.auth.title}
          </h1>
          <p className="font-mono text-xs text-neutral-400">
            {admin.auth.subtitle}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div>
            <label className="block font-mono text-[11px] text-neutral-400 uppercase tracking-widest mb-2">
              Cadre Email ID
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={admin.auth.emailPlaceholder}
              className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-4 py-3 outline-none transition-colors duration-200"
              required
              autoFocus
            />
          </div>

          {/* Password input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block font-mono text-[11px] text-neutral-400 uppercase tracking-widest">
                Access Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="font-mono text-[10px] text-neutral-400 hover:text-[#e2f952] uppercase"
              >
                {showPassword ? "[ HIDE ]" : "[ SHOW ]"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={admin.auth.passwordPlaceholder}
              className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-4 py-3 outline-none transition-colors duration-200 tracking-wider"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 border border-red-500/40 bg-red-950/20 font-mono text-xs text-red-400 uppercase tracking-wide">
              [ {error} ]
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#e2f952] text-black font-mono font-bold text-xs uppercase tracking-widest py-3.5 px-6 hover:bg-[#c8e036] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(226,249,82,0.25)] disabled:opacity-50"
          >
            <span>{isSubmitting ? "AUTHENTICATING..." : admin.auth.submitLabel}</span>
            <span>→</span>
          </button>
        </form>

        {/* Tactical Helper */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleAutoFill}
            className="font-mono text-[11px] text-neutral-400 hover:text-[#e2f952] underline underline-offset-4 text-center tracking-wider uppercase transition-colors"
          >
            [ AUTO-FILL AUTHORIZED CADRE CREDENTIALS ]
          </button>
          <span className="font-mono text-[9px] text-neutral-600 text-center uppercase tracking-widest">
            {admin.auth.securityNotice}
          </span>
        </div>
      </div>
    </div>
  );
}
