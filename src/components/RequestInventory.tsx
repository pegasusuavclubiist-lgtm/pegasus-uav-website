"use client";

import React, { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "@/lib/gsap";
import { siteData, InventoryItem } from "@/data/data";
import { fetchInventoryItems } from "@/lib/supabase/inventory";
import {
  submitInventoryRequest,
  RequestedPart,
} from "@/lib/supabase/inventory-requests";

export default function RequestInventory() {
  const { inventoryRequest } = siteData;
  const sectionRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);

  // Available inventory options from admin inventory
  const [availableInventory, setAvailableInventory] = useState<InventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);

  // Form input states
  const [name, setName] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");

  // Parts cart / requested list
  const [selectedPartId, setSelectedPartId] = useState<string>("");
  const [selectedPartQty, setSelectedPartQty] = useState<number>(1);
  const [requestedParts, setRequestedParts] = useState<RequestedPart[]>([]);

  // Submission lifecycle states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState<{
    id: string;
    name: string;
    studentCode: string;
    parts: RequestedPart[];
    timestamp: string;
  } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch available inventory on mount
  useEffect(() => {
    let isMounted = true;
    fetchInventoryItems()
      .then((res) => {
        if (!isMounted) return;
        setAvailableInventory(res.items);
        if (res.items.length > 0) {
          setSelectedPartId(res.items[0].id);
        }
        setLoadingInventory(false);
      })
      .catch((err) => {
        console.error("Failed to load inventory for request form:", err);
        setLoadingInventory(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // GSAP scroll entrance animation
  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      tl.fromTo(
        leftColRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      ).fromTo(
        formCardRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        "-=0.4"
      );
    },
    { scope: sectionRef }
  );

  // Add part to requested list
  const handleAddPart = () => {
    if (!selectedPartId) return;
    const invItem = availableInventory.find((i) => i.id === selectedPartId);
    if (!invItem) return;

    // Check if already in list
    const existingIndex = requestedParts.findIndex((p) => p.itemId === selectedPartId);
    if (existingIndex !== -1) {
      // Update quantity
      const updated = [...requestedParts];
      updated[existingIndex].quantity = Math.min(
        invItem.quantity,
        updated[existingIndex].quantity + selectedPartQty
      );
      setRequestedParts(updated);
    } else {
      // Add new
      setRequestedParts((prev) => [
        ...prev,
        {
          itemId: invItem.id,
          sku: invItem.sku,
          name: invItem.name,
          quantity: Math.min(invItem.quantity, selectedPartQty),
        },
      ]);
    }

    setFormError(null);
  };

  // Remove part from requested list
  const handleRemovePart = (itemId: string) => {
    setRequestedParts((prev) => prev.filter((p) => p.itemId !== itemId));
  };

  // Handle requisition submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!name.trim()) {
      setFormError("FULL NAME IS REQUIRED");
      return;
    }
    if (!studentCode.trim()) {
      setFormError("STUDENT CODE / ROLL NUMBER IS REQUIRED");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setFormError("VALID INSTITUTE EMAIL IS REQUIRED");
      return;
    }
    if (!phone.trim()) {
      setFormError("CONTACT PHONE NUMBER IS REQUIRED");
      return;
    }
    if (requestedParts.length === 0) {
      setFormError("PLEASE ADD AT LEAST ONE HARDWARE PART TO YOUR REQUISITION");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await submitInventoryRequest({
        name: name.trim(),
        studentCode: studentCode.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        parts: requestedParts,
        purpose: purpose.trim() || undefined,
      });

      if (res.success && res.id) {
        setSubmittedReceipt({
          id: res.id,
          name: name.trim(),
          studentCode: studentCode.trim().toUpperCase(),
          parts: requestedParts,
          timestamp: new Date().toUTCString(),
        });
        // Reset form
        setName("");
        setStudentCode("");
        setEmail("");
        setPhone("");
        setPurpose("");
        setRequestedParts([]);
      } else {
        setFormError(res.error || "FAILED TO TRANSMIT REQUISITION");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "TRANSMISSION ERROR";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSelectedItem = availableInventory.find((i) => i.id === selectedPartId);

  return (
    <section
      ref={sectionRef}
      id="request-inventory"
      className="relative w-full bg-black text-white py-24 md:py-36 border-b border-white/15 overflow-hidden"
    >
      {/* Background Reticle Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* =========================================================================
              LEFT COLUMN: REQUISITION PROTOCOLS & OVERVIEW (5 Cols)
             ========================================================================= */}
          <div ref={leftColRef} className="lg:col-span-5 space-y-8">
            {/* Header Tag */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#e2f952] animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-widest text-[#e2f952]">
                  [ {inventoryRequest.sectionNumber} ]
                </span>
                <span className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest">
                  // HARDWARE LAB ACCESS
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-white">
                {inventoryRequest.headline}
              </h2>
              <p className="font-mono text-xs uppercase tracking-wider text-neutral-400 mt-2">
                {inventoryRequest.subheadline}
              </p>
            </div>

            {/* Description */}
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed font-light">
              {inventoryRequest.description}
            </p>

            {/* Protocols / Rules Box */}
            <div className="border border-white/15 bg-neutral-950 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-xs text-[#e2f952] uppercase tracking-wider font-bold">
                  // REQUISITION PROTOCOLS
                </span>
                <span className="font-mono text-[10px] text-neutral-500">IIST UAV LAB</span>
              </div>

              <ul className="space-y-3 font-mono text-xs text-neutral-400">
                {inventoryRequest.protocols.map((protocol, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-[#e2f952] select-none font-bold">›</span>
                    <span className="leading-relaxed">{protocol}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lab Base & Available Stock Count */}
            <div className="p-6 border border-white/10 bg-white/[0.02] space-y-4">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-neutral-400">LAB DISPATCH BAY:</span>
                <span className="text-white font-bold text-right">AVIONICS RACK 01</span>
              </div>
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-neutral-400">REGISTERED ASSETS:</span>
                <span className="text-[#e2f952] font-bold">
                  {availableInventory.length} HARDWARE SKUS
                </span>
              </div>
              <div className="flex items-center justify-between font-mono text-xs pt-2 border-t border-white/10">
                <span className="text-neutral-400">LOCATION:</span>
                <span className="text-neutral-300 text-right text-[11px]">
                  {inventoryRequest.labLocation}
                </span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: INTERACTIVE REQUISITION FORM (7 Cols)
             ========================================================================= */}
          <div ref={formCardRef} className="lg:col-span-7">
            {submittedReceipt ? (
              /* Receipt Success Card */
              <div className="relative bg-neutral-950 border-2 border-[#e2f952] p-8 sm:p-12 shadow-[0_0_50px_rgba(226,249,82,0.15)]">
                {/* Corner Reticles */}
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#e2f952]" />
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#e2f952]" />
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#e2f952]" />
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#e2f952]" />

                <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/15">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-[#e2f952] animate-ping" />
                    <span className="font-mono text-xs text-[#e2f952] tracking-widest uppercase font-bold">
                      [ REQUISITION TRANSMITTED // ID: {submittedReceipt.id} ]
                    </span>
                  </div>
                  <span className="font-mono text-xs text-neutral-500 uppercase">
                    STATUS: PENDING DISPATCH
                  </span>
                </div>

                <div className="space-y-4 font-mono text-xs mb-8">
                  <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-4">
                    Equipment Checkout Request Logged
                  </h3>
                  <p className="text-neutral-400 leading-relaxed">
                    Cadre telemetry has received your hardware requisition. Please present your IIST ID card at the Avionics Lab to complete equipment pickup.
                  </p>

                  <div className="border border-white/15 bg-neutral-900/80 p-5 space-y-3 mt-6">
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-neutral-400">REQUISITION REF:</span>
                      <span className="text-[#e2f952] font-bold">{submittedReceipt.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-neutral-400">STUDENT CODE:</span>
                      <span className="text-white font-bold">{submittedReceipt.studentCode}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-neutral-400">REQUESTER NAME:</span>
                      <span className="text-white">{submittedReceipt.name}</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-neutral-400 block mb-2 font-bold">
                        REQUESTED HARDWARE PIECES:
                      </span>
                      <ul className="space-y-1 pl-2">
                        {submittedReceipt.parts.map((p) => (
                          <li key={p.itemId} className="text-[#e2f952] flex justify-between">
                            <span>› {p.name} ({p.sku})</span>
                            <span className="font-bold">× {p.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSubmittedReceipt(null)}
                  className="w-full bg-[#e2f952] text-black font-mono font-bold text-xs uppercase tracking-widest py-3.5 px-6 hover:bg-[#c8e036] transition-all"
                >
                  [ FILE ANOTHER REQUISITION ]
                </button>
              </div>
            ) : (
              /* Main Form */
              <div className="relative bg-neutral-950 border border-white/20 p-6 sm:p-10 shadow-2xl">
                {/* Corner Reticles */}
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#e2f952]" />
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#e2f952]" />
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#e2f952]" />
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#e2f952]" />

                <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#e2f952]" />
                    <span className="font-mono text-xs uppercase tracking-widest text-[#e2f952] font-bold">
                      [ REQUISITION DOSSIER // FORM 07-A ]
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                    LAB DISPATCH
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Row 1: Name & Student Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[11px] text-neutral-400 uppercase tracking-wider mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. ARYA SHARMA"
                        className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-sm px-4 py-3 outline-none transition-colors uppercase"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] text-neutral-400 uppercase tracking-wider mb-2">
                        Student Code / Roll No *
                      </label>
                      <input
                        type="text"
                        value={studentCode}
                        onChange={(e) => setStudentCode(e.target.value)}
                        placeholder="e.g. SC22B045"
                        className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-sm px-4 py-3 outline-none transition-colors uppercase tracking-wider"
                        required
                      />
                    </div>
                  </div>

                  {/* Row 2: Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[11px] text-neutral-400 uppercase tracking-wider mb-2">
                        Institute Email *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@iist.ac.in"
                        className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-sm px-4 py-3 outline-none transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] text-neutral-400 uppercase tracking-wider mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-sm px-4 py-3 outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Row 3: Parts Requested (Interactive Picker connected to Admin Inventory) */}
                  <div className="border border-white/15 bg-neutral-900/50 p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <label className="font-mono text-[11px] text-[#e2f952] uppercase tracking-wider font-bold">
                        Select Parts Requested (Live Club Inventory) *
                      </label>
                      <span className="font-mono text-[10px] text-neutral-400">
                        {availableInventory.length} ITEMS CATALOGED
                      </span>
                    </div>

                    {loadingInventory ? (
                      <div className="py-4 text-center font-mono text-xs text-[#e2f952] animate-pulse">
                        [ SYNCHRONIZING WITH CLUB INVENTORY... ]
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          {/* Part Selector Dropdown */}
                          <div className="sm:col-span-8">
                            <select
                              value={selectedPartId}
                              onChange={(e) => setSelectedPartId(e.target.value)}
                              className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-3 py-2.5 outline-none uppercase"
                            >
                              {availableInventory.map((item) => (
                                <option
                                  key={item.id}
                                  value={item.id}
                                  disabled={item.quantity === 0}
                                >
                                  {item.name} ({item.sku}) — [{item.quantity} IN STOCK]
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Quantity Selector */}
                          <div className="sm:col-span-2">
                            <input
                              type="number"
                              min="1"
                              max={currentSelectedItem?.quantity || 1}
                              value={selectedPartQty}
                              onChange={(e) =>
                                setSelectedPartQty(
                                  Math.max(1, parseInt(e.target.value) || 1)
                                )
                              }
                              className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-3 py-2.5 outline-none text-center"
                              title="Quantity"
                            />
                          </div>

                          {/* Add Button */}
                          <div className="sm:col-span-2">
                            <button
                              type="button"
                              onClick={handleAddPart}
                              className="w-full bg-white text-black font-mono font-bold text-xs uppercase py-2.5 px-3 hover:bg-[#e2f952] transition-colors"
                            >
                              + ADD
                            </button>
                          </div>
                        </div>

                        {/* Inventory item specs note */}
                        {currentSelectedItem && (
                          <div className="font-mono text-[10px] text-neutral-400 flex items-center gap-3">
                            <span>BAY: <strong className="text-neutral-200">{currentSelectedItem.location}</strong></span>
                            <span>·</span>
                            <span>CATEGORY: <strong className="text-neutral-200">{currentSelectedItem.category}</strong></span>
                            {currentSelectedItem.notes && (
                              <>
                                <span>·</span>
                                <span className="italic text-neutral-500 line-clamp-1">{currentSelectedItem.notes}</span>
                              </>
                            )}
                          </div>
                        )}

                        {/* Selected Parts List Container */}
                        <div className="pt-2 border-t border-white/10">
                          <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider block mb-2">
                            ITEMS CURRENTLY IN REQUISITION:
                          </span>

                          {requestedParts.length === 0 ? (
                            <div className="font-mono text-[11px] text-neutral-500 py-2 italic">
                              [ No parts added yet. Select a component above and click + ADD ]
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {requestedParts.map((part) => (
                                <div
                                  key={part.itemId}
                                  className="flex items-center justify-between p-2.5 bg-neutral-900 border border-white/10 font-mono text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-[#e2f952] font-bold">[{part.sku}]</span>
                                    <span className="text-white">{part.name}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[#e2f952] font-bold">QTY: {part.quantity}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemovePart(part.itemId)}
                                      className="text-red-400 hover:text-red-300 font-bold px-1.5"
                                      title="Remove part"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Row 4: Purpose / Notes */}
                  <div>
                    <label className="block font-mono text-[11px] text-neutral-400 uppercase tracking-wider mb-2">
                      Project Purpose / Checkout Rationale (Optional)
                    </label>
                    <textarea
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      rows={3}
                      placeholder="e.g. SLAM navigation flight tests for B.Tech project, competition quadcopter build..."
                      className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-4 py-3 outline-none transition-colors resize-y leading-relaxed"
                    />
                  </div>

                  {/* Error Notification */}
                  {formError && (
                    <div className="p-3 border border-red-500/40 bg-red-950/20 font-mono text-xs text-red-400 uppercase tracking-wide">
                      [ {formError} ]
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#e2f952] text-black font-mono font-bold text-xs uppercase tracking-widest py-4 px-6 hover:bg-[#c8e036] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(226,249,82,0.25)]"
                  >
                    <span>{isSubmitting ? "TRANSMITTING REQUISITION..." : "TRANSMIT REQUISITION DOSSIER"}</span>
                    <span>→</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
