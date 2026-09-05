"use client";

import React, { useState, useEffect } from "react";
import { siteData, InventoryItem, InventoryStatus } from "@/data/data";
import {
  fetchInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  checkSupabaseInventoryTable,
} from "@/lib/supabase/inventory";
import {
  fetchInventoryRequests,
  updateInventoryRequestStatus,
  InventoryRequestRecord,
  RequestStatus,
} from "@/lib/supabase/inventory-requests";

export default function AdminInventoryManager() {
  const { admin } = siteData;
  const [subTab, setSubTab] = useState<"catalog" | "requisitions">("catalog");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<InventoryRequestRecord[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"supabase" | "local">("local");
  const [tableMissing, setTableMissing] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form states
  const [formSku, setFormSku] = useState("");
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState(admin.categories[0]);
  const [formQuantity, setFormQuantity] = useState(1);
  const [formMinThreshold, setFormMinThreshold] = useState(1);
  const [formStatus, setFormStatus] = useState<InventoryStatus>("IN_STOCK");
  const [formLocation, setFormLocation] = useState("Lab Bay 1");
  const [formAssignedProject, setFormAssignedProject] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete target modal
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);

  // Notice
  const [alertNotice, setAlertNotice] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Load Inventory Data
  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await fetchInventoryItems();
      setItems(res.items);
      setSource(res.source);
      if (res.tableMissing) setTableMissing(true);

      const tableCheck = await checkSupabaseInventoryTable();
      if (!tableCheck.tableExists) {
        setTableMissing(true);
      }
    } catch (err) {
      console.error("Failed loading inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load Student Requisitions
  const loadRequests = async () => {
    setLoadingRequests(true);
    try {
      const data = await fetchInventoryRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed loading inventory requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    loadInventory();
    loadRequests();
  }, []);

  // Update requisition status (Approve, Dispatch, Return, Reject)
  const handleRequestStatusChange = async (requestId: string, newStatus: RequestStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
    );
    await updateInventoryRequestStatus(requestId, newStatus);
    setAlertNotice({ type: "success", text: `REQUISITION ${requestId} STATUS SET TO ${newStatus}` });
    setTimeout(() => setAlertNotice(null), 3000);
  };

  // Quick Stepper (+/- 1 quantity directly in row)
  const adjustQuantity = async (id: string, delta: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const newQty = Math.max(0, item.quantity + delta);
    let newStatus: InventoryStatus = item.status;

    // Auto-update status if hitting thresholds
    if (newQty === 0) {
      newStatus = "DEPLETED";
    } else if (newQty <= item.minThreshold && item.status !== "MAINTENANCE" && item.status !== "DEPLOYED") {
      newStatus = "LOW_STOCK";
    } else if (newQty > item.minThreshold && (item.status === "LOW_STOCK" || item.status === "DEPLETED")) {
      newStatus = "IN_STOCK";
    }

    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: newQty, status: newStatus } : i))
    );

    await updateInventoryItem(id, { quantity: newQty, status: newStatus });
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingItem(null);
    setFormSku(`PEG-${Date.now().toString().slice(-4)}`);
    setFormName("");
    setFormCategory(admin.categories[0]);
    setFormQuantity(1);
    setFormMinThreshold(1);
    setFormStatus("IN_STOCK");
    setFormLocation("Lab Bay 1");
    setFormAssignedProject("");
    setFormNotes("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormSku(item.sku);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormQuantity(item.quantity);
    setFormMinThreshold(item.minThreshold);
    setFormStatus(item.status);
    setFormLocation(item.location);
    setFormAssignedProject(item.assignedProject || "");
    setFormNotes(item.notes || "");
    setIsModalOpen(true);
  };

  // Save Add / Edit
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSku.trim()) {
      setAlertNotice({ type: "error", text: "NAME AND SKU ARE REQUIRED" });
      return;
    }

    setFormSubmitting(true);

    if (editingItem) {
      // Edit
      const fields = {
        sku: formSku.trim(),
        name: formName.trim(),
        category: formCategory,
        quantity: formQuantity,
        minThreshold: formMinThreshold,
        status: formStatus,
        location: formLocation.trim(),
        assignedProject: formAssignedProject.trim() || null,
        notes: formNotes.trim() || null,
      };

      await updateInventoryItem(editingItem.id, fields);
      setItems((prev) =>
        prev.map((i) => (i.id === editingItem.id ? { ...i, ...fields, updatedAt: new Date().toISOString() } : i))
      );
      setAlertNotice({ type: "success", text: `ITEM ${formSku} UPDATED` });
    } else {
      // Create
      const newItemPayload = {
        sku: formSku.trim(),
        name: formName.trim(),
        category: formCategory,
        quantity: formQuantity,
        minThreshold: formMinThreshold,
        status: formStatus,
        location: formLocation.trim(),
        assignedProject: formAssignedProject.trim() || null,
        notes: formNotes.trim() || null,
      };

      const res = await createInventoryItem(newItemPayload);
      if (res.data) {
        setItems((prev) => [res.data!, ...prev]);
        setAlertNotice({ type: "success", text: `NEW HARDWARE RECORD ${formSku} REGISTERED` });
      }
    }

    setFormSubmitting(false);
    setIsModalOpen(false);
    setTimeout(() => setAlertNotice(null), 3000);
  };

  // Delete item
  const handleDeleteItem = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;

    // Optimistic removal
    setItems((prev) => prev.filter((i) => i.id !== targetId));
    setDeleteTarget(null);

    await deleteInventoryItem(targetId);
    setAlertNotice({ type: "success", text: `RECORD ${deleteTarget.sku} REMOVED FROM CADRE INVENTORY` });
    setTimeout(() => setAlertNotice(null), 3000);
  };

  // Filtering
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase()) ||
      (item.assignedProject && item.assignedProject.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;
    const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate KPIs
  const totalUnits = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const lowStockCount = items.filter(
    (i) => i.quantity <= i.minThreshold && i.status !== "DEPLOYED"
  ).length;
  const deployedCount = items.filter((i) => i.status === "DEPLOYED").length;
  const maintenanceCount = items.filter((i) => i.status === "MAINTENANCE").length;

  const copySqlSnippet = () => {
    const sql = `-- Run in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    min_threshold INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'IN_STOCK',
    location TEXT NOT NULL DEFAULT 'Lab Bay 1',
    assigned_project TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all inventory" ON public.inventory FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);`;

    navigator.clipboard.writeText(sql).then(() => {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    });
  };

  return (
    <div className="space-y-8">
      {/* Alert Notice */}
      {alertNotice && (
        <div
          className={`p-4 border font-mono text-xs uppercase tracking-wider flex items-center justify-between ${
            alertNotice.type === "success"
              ? "bg-[#e2f952]/10 border-[#e2f952] text-[#e2f952]"
              : "bg-red-950/40 border-red-500 text-red-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            <span>[ {alertNotice.text} ]</span>
          </div>
          <button
            onClick={() => setAlertNotice(null)}
            className="text-white hover:underline text-[10px]"
          >
            [ DISMISS ]
          </button>
        </div>
      )}

      {/* Supabase Schema Helper Banner (if table not yet created) */}
      {tableMissing && (
        <div className="p-4 border border-amber-500/40 bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3 text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span>
              [ HYBRID LOCAL PERSISTENCE ACTIVE // SUPABASE INVENTORY TABLE CAN BE PROVISIONED VIA SQL ]
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSqlModal(true)}
              className="px-3 py-1.5 bg-amber-400 text-black font-bold uppercase hover:bg-amber-300 transition-colors"
            >
              VIEW SQL SCRIPT
            </button>
          </div>
        </div>
      )}

      {/* Sub-view Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSubTab("catalog")}
            className={`px-5 py-2.5 font-mono text-xs uppercase tracking-wider border transition-all ${
              subTab === "catalog"
                ? "bg-[#e2f952] text-black border-[#e2f952] font-bold shadow-[0_0_15px_rgba(226,249,82,0.25)]"
                : "bg-neutral-900 text-neutral-400 border-white/15 hover:border-white/40 hover:text-white"
            }`}
          >
            [ 01 // HARDWARE CATALOG ({items.length}) ]
          </button>
          <button
            onClick={() => {
              setSubTab("requisitions");
              loadRequests();
            }}
            className={`px-5 py-2.5 font-mono text-xs uppercase tracking-wider border transition-all flex items-center gap-2 ${
              subTab === "requisitions"
                ? "bg-[#e2f952] text-black border-[#e2f952] font-bold shadow-[0_0_15px_rgba(226,249,82,0.25)]"
                : "bg-neutral-900 text-neutral-400 border-white/15 hover:border-white/40 hover:text-white"
            }`}
          >
            <span>[ 02 // STUDENT REQUISITIONS ({requests.length}) ]</span>
            {requests.filter((r) => r.status === "PENDING").length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>
        </div>

        {subTab === "requisitions" && (
          <button
            onClick={loadRequests}
            className="font-mono text-xs text-[#e2f952] hover:underline uppercase"
          >
            [ ↻ REFRESH REQUISITIONS ]
          </button>
        )}
      </div>

      {subTab === "catalog" ? (
        <>
          {/* Telemetry KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-neutral-950 border border-white/15 p-5 relative overflow-hidden group">
              <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest block mb-1">
                TOTAL HARDWARE ASSETS
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                  {totalUnits}
                </span>
                <span className="font-mono text-xs text-neutral-400">
                  Units ({items.length} SKUs)
                </span>
              </div>
              <div className="absolute top-0 right-0 w-8 h-8 bg-white/5 border-b border-l border-white/10" />
            </div>

            <div className="bg-neutral-950 border border-amber-500/30 p-5 relative overflow-hidden group">
              <span className="font-mono text-[10px] text-amber-400/80 uppercase tracking-widest block mb-1">
                LOW STOCK ALERTS
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono">
                  {lowStockCount}
                </span>
                <span className="font-mono text-xs text-neutral-400">
                  Needs Reorder
                </span>
              </div>
              <div className="absolute top-0 right-0 w-8 h-8 bg-amber-400/10 border-b border-l border-amber-400/20" />
            </div>

            <div className="bg-neutral-950 border border-sky-500/30 p-5 relative overflow-hidden group">
              <span className="font-mono text-[10px] text-sky-400/80 uppercase tracking-widest block mb-1">
                DEPLOYED IN FLIGHT BUILDS
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-sky-400 font-mono">
                  {deployedCount}
                </span>
                <span className="font-mono text-xs text-neutral-400">
                  Active Prototypes
                </span>
              </div>
              <div className="absolute top-0 right-0 w-8 h-8 bg-sky-400/10 border-b border-l border-sky-400/20" />
            </div>

            <div className="bg-neutral-950 border border-purple-500/30 p-5 relative overflow-hidden group">
              <span className="font-mono text-[10px] text-purple-400/80 uppercase tracking-widest block mb-1">
                TEST BENCH / MAINTENANCE
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-purple-400 font-mono">
                  {maintenanceCount}
                </span>
                <span className="font-mono text-xs text-neutral-400">
                  Bench Calibrated
                </span>
              </div>
              <div className="absolute top-0 right-0 w-8 h-8 bg-purple-400/10 border-b border-l border-purple-400/20" />
            </div>
          </div>

          {/* Control Bar: Search, Category & Status filters, Add Button */}
          <div className="bg-neutral-950 border border-white/15 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="SEARCH BY SKU, COMPONENT NAME, LOCATION..."
                  className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white font-mono text-xs px-4 py-2.5 outline-none uppercase tracking-wide"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white font-mono text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-neutral-300 font-mono text-xs px-3 py-2.5 outline-none uppercase"
              >
                <option value="ALL">ALL CATEGORIES</option>
                {admin.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.toUpperCase()}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-neutral-300 font-mono text-xs px-3 py-2.5 outline-none uppercase"
              >
                <option value="ALL">ALL STATUSES</option>
                {admin.statuses.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label.toUpperCase()}
                  </option>
                ))}
              </select>

              {/* Add Hardware Button */}
              <button
                onClick={openCreateModal}
                className="bg-[#e2f952] text-black font-mono font-bold text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-[#c8e036] active:scale-[0.98] transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(226,249,82,0.2)] ml-auto md:ml-0"
              >
                <span>+ REGISTER ITEM</span>
              </button>
            </div>
          </div>

          {/* Main Inventory Table */}
          <div className="bg-neutral-950 border border-white/15 overflow-hidden">
            {loading ? (
              <div className="py-24 text-center font-mono text-xs text-[#e2f952] animate-pulse">
                [ AUDITING CADRE INVENTORY FROM STORE... ]
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-20 text-center font-mono text-xs text-neutral-500 uppercase tracking-widest p-8">
                [ NO HARDWARE ITEMS MATCH THE ACTIVE FILTERS ]
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/15 bg-neutral-900/80 font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
                      <th className="py-3 px-4">SKU / Code</th>
                      <th className="py-3 px-4">Component & Specs</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-center">Stock Count</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Storage Bay</th>
                      <th className="py-3 px-4">Flight Build</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 font-mono text-xs">
                    {filteredItems.map((item) => {
                      const isLow = item.quantity <= item.minThreshold;

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-neutral-900/40 transition-colors group"
                        >
                          {/* SKU */}
                          <td className="py-4 px-4 whitespace-nowrap text-[#e2f952] font-bold font-mono">
                            {item.sku}
                          </td>

                          {/* Name & Notes */}
                          <td className="py-4 px-4 max-w-xs">
                            <div className="font-bold text-white uppercase tracking-tight text-[13px]">
                              {item.name}
                            </div>
                            {item.notes && (
                              <div className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                                {item.notes}
                              </div>
                            )}
                          </td>

                          {/* Category */}
                          <td className="py-4 px-4 whitespace-nowrap text-neutral-300">
                            <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-[10px] uppercase">
                              {item.category}
                            </span>
                          </td>

                          {/* Quantity Stepper */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => adjustQuantity(item.id, -1)}
                                className="w-6 h-6 flex items-center justify-center border border-white/20 hover:border-[#e2f952] text-neutral-300 hover:text-white transition-colors"
                                title="Decrement stock"
                              >
                                -
                              </button>
                              <span
                                className={`min-w-[32px] text-center font-bold text-sm ${
                                  isLow ? "text-amber-400" : "text-white"
                                }`}
                              >
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => adjustQuantity(item.id, 1)}
                                className="w-6 h-6 flex items-center justify-center border border-white/20 hover:border-[#e2f952] text-neutral-300 hover:text-white transition-colors"
                                title="Increment stock"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 text-[10px] font-bold uppercase border ${
                                item.status === "IN_STOCK"
                                  ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400"
                                  : item.status === "DEPLOYED"
                                  ? "bg-sky-950/40 border-sky-500/50 text-sky-400"
                                  : item.status === "LOW_STOCK"
                                  ? "bg-amber-950/40 border-amber-500/50 text-amber-400"
                                  : item.status === "MAINTENANCE"
                                  ? "bg-purple-950/40 border-purple-500/50 text-purple-400"
                                  : "bg-red-950/40 border-red-500/50 text-red-400"
                              }`}
                            >
                              {item.status.replace("_", " ")}
                            </span>
                          </td>

                          {/* Location */}
                          <td className="py-4 px-4 whitespace-nowrap text-neutral-400">
                            {item.location}
                          </td>

                          {/* Assigned Project */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {item.assignedProject ? (
                              <span className="text-[#e2f952] text-[11px]">
                                {item.assignedProject}
                              </span>
                            ) : (
                              <span className="text-neutral-600 text-[11px]">—</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(item)}
                                className="px-2.5 py-1 border border-white/20 hover:border-white/50 text-neutral-300 hover:text-white text-[11px] transition-colors"
                              >
                                EDIT
                              </button>
                              <button
                                onClick={() => setDeleteTarget(item)}
                                className="px-2.5 py-1 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white hover:bg-red-950/40 text-[11px] transition-colors"
                              >
                                DELETE
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Footer / Summary */}
            <div className="p-4 border-t border-white/10 bg-neutral-900/60 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-neutral-400">
              <div>
                SHOWING {filteredItems.length} OF {items.length} HARDWARE ITEMS
              </div>
              <div className="flex items-center gap-4">
                <span>DATA SOURCE: <strong className="text-white uppercase">{source}</strong></span>
                <button
                  onClick={loadInventory}
                  className="text-[#e2f952] hover:underline"
                >
                  [ RE-AUDIT ]
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* =========================================================================
            STUDENT REQUISITIONS BOARD
           ========================================================================= */
        <div className="space-y-6">
          {/* Requisition KPI Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-neutral-950 border border-white/15 p-4">
              <span className="font-mono text-[10px] text-neutral-500 uppercase block mb-1">
                TOTAL REQUISITIONS
              </span>
              <span className="text-2xl font-black font-mono text-white">
                {requests.length}
              </span>
            </div>
            <div className="bg-neutral-950 border border-amber-500/30 p-4">
              <span className="font-mono text-[10px] text-amber-400/80 uppercase block mb-1">
                PENDING REVIEW
              </span>
              <span className="text-2xl font-black font-mono text-amber-400">
                {requests.filter((r) => r.status === "PENDING").length}
              </span>
            </div>
            <div className="bg-neutral-950 border border-sky-500/30 p-4">
              <span className="font-mono text-[10px] text-sky-400/80 uppercase block mb-1">
                ACTIVE CHECKOUTS
              </span>
              <span className="text-2xl font-black font-mono text-sky-400">
                {requests.filter((r) => r.status === "DISPATCHED" || r.status === "APPROVED").length}
              </span>
            </div>
            <div className="bg-neutral-950 border border-emerald-500/30 p-4">
              <span className="font-mono text-[10px] text-emerald-400/80 uppercase block mb-1">
                RETURNED / RESTOCKED
              </span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                {requests.filter((r) => r.status === "RETURNED").length}
              </span>
            </div>
          </div>

          {/* Requisitions List */}
          {loadingRequests ? (
            <div className="py-20 text-center font-mono text-xs text-[#e2f952] animate-pulse">
              [ LOADING STUDENT REQUISITIONS... ]
            </div>
          ) : requests.length === 0 ? (
            <div className="py-20 text-center font-mono text-xs text-neutral-500 uppercase tracking-widest border border-white/10 bg-white/[0.01] p-8">
              [ NO STUDENT HARDWARE REQUISITIONS FILED YET ]
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-neutral-950 border border-white/15 p-6 space-y-4 hover:border-white/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-[#e2f952] font-bold">
                        [{req.id}]
                      </span>
                      <span className="font-mono text-xs text-white font-bold uppercase">
                        {req.name} ({req.studentCode})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-neutral-500">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                          req.status === "PENDING"
                            ? "bg-amber-950/40 border-amber-500 text-amber-400"
                            : req.status === "APPROVED"
                            ? "bg-sky-950/40 border-sky-500 text-sky-400"
                            : req.status === "DISPATCHED"
                            ? "bg-emerald-950/40 border-emerald-500 text-emerald-400"
                            : req.status === "RETURNED"
                            ? "bg-white/10 border-white/30 text-white"
                            : "bg-red-950/40 border-red-500 text-red-400"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase mb-1">
                        PARTS REQUESTED:
                      </span>
                      <ul className="space-y-1">
                        {req.parts.map((p) => (
                          <li key={p.itemId} className="text-[#e2f952]">
                            › {p.name} [{p.sku}] — <strong className="text-white">Qty: {p.quantity}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <div className="flex gap-4 text-[11px]">
                        <span className="text-neutral-500">EMAIL:</span>
                        <a href={`mailto:${req.email}`} className="text-white hover:underline">
                          {req.email}
                        </a>
                      </div>
                      <div className="flex gap-4 text-[11px]">
                        <span className="text-neutral-500">PHONE:</span>
                        <a href={`tel:${req.phone}`} className="text-white hover:underline">
                          {req.phone}
                        </a>
                      </div>
                      {req.purpose && (
                        <div className="pt-1">
                          <span className="text-neutral-500 text-[10px] block">PURPOSE:</span>
                          <p className="text-neutral-300 italic text-[11px] leading-relaxed">
                            &ldquo;{req.purpose}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions for Status Transition */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-white/10 font-mono text-[11px]">
                    <span className="text-neutral-500 text-[10px] uppercase mr-auto">
                      UPDATE STATUS:
                    </span>
                    <button
                      onClick={() => handleRequestStatusChange(req.id, "APPROVED")}
                      className="px-3 py-1 bg-sky-950/60 border border-sky-500/50 hover:border-sky-400 text-sky-300 hover:text-white transition-colors"
                    >
                      [ APPROVE ]
                    </button>
                    <button
                      onClick={() => handleRequestStatusChange(req.id, "DISPATCHED")}
                      className="px-3 py-1 bg-emerald-950/60 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 hover:text-white transition-colors"
                    >
                      [ DISPATCH ]
                    </button>
                    <button
                      onClick={() => handleRequestStatusChange(req.id, "RETURNED")}
                      className="px-3 py-1 bg-white/5 border border-white/20 hover:border-white/40 text-neutral-300 hover:text-white transition-colors"
                    >
                      [ MARK RETURNED ]
                    </button>
                    <button
                      onClick={() => handleRequestStatusChange(req.id, "REJECTED")}
                      className="px-3 py-1 bg-red-950/60 border border-red-500/50 hover:border-red-400 text-red-300 hover:text-white transition-colors"
                    >
                      [ REJECT ]
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          ADD / EDIT ITEM MODAL
         ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-neutral-950 border border-white/20 p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#e2f952]" />
                <h3 className="font-mono text-sm uppercase tracking-wider text-white font-bold">
                  {editingItem ? `[ EDIT ITEM // ${editingItem.sku} ]` : "[ REGISTER HARDWARE ITEM ]"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider mb-1.5">
                    SKU / Part Code *
                  </label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="PEG-FC-001"
                    className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white px-3 py-2 outline-none uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white px-3 py-2 outline-none uppercase"
                  >
                    {admin.categories.map((c) => (
                      <option key={c} value={c}>
                        {c.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 uppercase tracking-wider mb-1.5">
                  Item / Component Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Holybro Pixhawk 6C Autopilot"
                  className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white px-3 py-2 outline-none uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider mb-1.5">
                    Quantity In Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white px-3 py-2 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider mb-1.5">
                    Min Alert Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formMinThreshold}
                    onChange={(e) => setFormMinThreshold(parseInt(e.target.value) || 1)}
                    className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white px-3 py-2 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as InventoryStatus)}
                    className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white px-3 py-2 outline-none uppercase"
                  >
                    {admin.statuses.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider mb-1.5">
                    Storage Location / Bay
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Avionics Rack A1"
                    className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white px-3 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider mb-1.5">
                    Assigned Project (Optional)
                  </label>
                  <input
                    type="text"
                    value={formAssignedProject}
                    onChange={(e) => setFormAssignedProject(e.target.value)}
                    placeholder="e.g. Flying Wings / Agricultural Drone"
                    className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 uppercase tracking-wider mb-1.5">
                  Engineering Notes / Calibration / Specs
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                  placeholder="Firmware versions, protocol settings, calibration notes, or hardware condition"
                  className="w-full bg-neutral-900 border border-white/20 focus:border-[#e2f952] text-white px-3 py-2 outline-none resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-white/20 hover:border-white/40 text-neutral-400 hover:text-white uppercase transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2 bg-[#e2f952] text-black font-bold uppercase hover:bg-[#c8e036] transition-colors shadow-[0_0_15px_rgba(226,249,82,0.3)]"
                >
                  {formSubmitting ? "SAVING..." : editingItem ? "SAVE CHANGES" : "REGISTER RECORD"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE ITEM MODAL
         ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-neutral-950 border border-red-500/50 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 font-mono text-xs uppercase tracking-widest mb-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>[ REMOVE HARDWARE RECORD ]</span>
            </div>

            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-2">
              Expunge from Inventory?
            </h3>
            <p className="font-mono text-xs text-neutral-400 mb-6 leading-relaxed">
              Confirm removal of <strong className="text-white">{deleteTarget.sku}</strong>:
              <br />
              &ldquo;{deleteTarget.name}&rdquo; ({deleteTarget.quantity} units).
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 font-mono text-xs uppercase">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-neutral-400 hover:text-white border border-white/20 hover:border-white/40 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleDeleteItem}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                EXPUNGE RECORD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SQL MIGRATION HELPER MODAL
         ========================================================================= */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-neutral-950 border border-white/20 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <h3 className="font-mono text-sm uppercase tracking-wider text-white font-bold">
                  [ SUPABASE SQL MIGRATION SNIPPET ]
                </h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-neutral-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <p className="font-mono text-xs text-neutral-400 mb-4 leading-relaxed">
              Execute this in your Supabase SQL Editor to create the `inventory` table and configure RLS permissions:
            </p>

            <pre className="bg-neutral-900 p-4 border border-white/15 text-[11px] font-mono text-neutral-300 overflow-x-auto max-h-60 mb-6 custom-scrollbar">
{`CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    min_threshold INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'IN_STOCK',
    location TEXT NOT NULL DEFAULT 'Lab Bay 1',
    assigned_project TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all inventory" ON public.inventory FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);`}
            </pre>

            <div className="flex items-center justify-between gap-4 font-mono text-xs">
              <span className="text-neutral-500 text-[10px]">
                Full script also saved in project root: `supabase_schema.sql`
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={copySqlSnippet}
                  className="px-4 py-2 bg-[#e2f952] text-black font-bold uppercase hover:bg-[#c8e036] transition-colors"
                >
                  {copiedSql ? "COPIED TO CLIPBOARD!" : "COPY SQL"}
                </button>
                <button
                  onClick={() => setShowSqlModal(false)}
                  className="px-4 py-2 border border-white/20 text-neutral-400 hover:text-white uppercase transition-colors"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
