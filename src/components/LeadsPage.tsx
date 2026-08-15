"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  X,
  Phone,
  Mail,
  MapPin,
  Home,
  Clock,
  ChevronRight,
  Trash2,
  MessageSquare,
  Calendar,
  PhoneForwarded,
  PhoneCall,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  budget: number;
  budgetCurrency: string;
  propertyType: string;
  preferredLocation: string | null;
  timeline: string;
  qualificationScore: number;
  status: string;
  source: string;
  notes: string | null;
  createdAt: string;
  conversations?: Array<{
    id: string;
    duration: number;
    sentiment: string;
    summary: string | null;
    timestamp: string;
  }>;
  bookings?: Array<{
    id: string;
    propertyName: string;
    date: string;
    time: string;
    status: string;
  }>;
  callTransfers?: Array<{
    id: string;
    transferTo: string;
    reason: string;
    status: string;
    timestamp: string;
  }>;
}

function formatBudget(amount: number) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="text-sm text-slate-300 w-8">{score}</span>
    </div>
  );
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [calling, setCalling] = useState(false);

  async function callNow(leadId: string) {
    setCalling(true);
    try {
      const res = await fetch("/api/voice/bolna/trigger-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to place call");
        return;
      }
      toast.success("Call placed — Bolna is dialing now");
    } catch {
      toast.error("Failed to place call");
    } finally {
      setCalling(false);
    }
  }

  const fetchLeads = () => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (search) params.set("search", search);
    fetch(`/api/leads?${params}`)
      .then((r) => r.json())
      .then((d) => setLeads(d.leads || d))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, search]);

  const openLeadDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`);
      const data = await res.json();
      setSelectedLead(data);
    } catch {
      toast.error("Failed to load lead details");
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Delete this lead? This cannot be undone.")) return;
    try {
      await fetch(`/api/leads/${id}`, { method: "DELETE" });
      toast.success("Lead deleted");
      setLeads(leads.filter((l) => l.id !== id));
      if (selectedLead?.id === id) setSelectedLead(null);
    } catch {
      toast.error("Failed to delete lead");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none appearance-none cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="qualified">Qualified</option>
          <option value="booked">Booked</option>
          <option value="transferred">Transferred</option>
          <option value="closed_lost">Closed Lost</option>
        </select>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus size={16} /> Add Lead
        </Button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">
                  Name
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                  Phone
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">
                  Budget
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">
                  Type
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden xl:table-cell">
                  Location
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">
                  Score
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    No leads found
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => openLeadDetail(lead.id)}
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-white font-medium text-sm">{lead.name}</p>
                      <p className="text-slate-500 text-xs">{lead.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-300 hidden md:table-cell">
                      {lead.phone}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-white font-medium hidden lg:table-cell">
                      {formatBudget(lead.budget)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-300 capitalize hidden lg:table-cell">
                      {lead.propertyType}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-300 hidden xl:table-cell">
                      {lead.preferredLocation || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <ScoreBar score={lead.qualificationScore} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLead(lead.id);
                        }}
                        className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Slide-over */}
      <AnimatePresence>
        {selectedLead && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setSelectedLead(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-[#0d1321] border-l border-white/10 z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">{selectedLead.name}</h2>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="p-2 rounded-lg hover:bg-white/10 text-slate-400"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Lead Info */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-emerald-400" />
                      <span className="text-slate-300">{selectedLead.phone}</span>
                    </div>
                    <button
                      onClick={() => callNow(selectedLead.id)}
                      disabled={calling}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 disabled:opacity-50 transition-colors"
                    >
                      <PhoneCall size={13} />
                      {calling ? "Calling..." : "Call Now"}
                    </button>
                  </div>
                  {selectedLead.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail size={16} className="text-emerald-400" />
                      <span className="text-slate-300">{selectedLead.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Home size={16} className="text-emerald-400" />
                    <span className="text-slate-300 capitalize">
                      {selectedLead.propertyType} · {formatBudget(selectedLead.budget)}
                    </span>
                  </div>
                  {selectedLead.preferredLocation && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin size={16} className="text-emerald-400" />
                      <span className="text-slate-300">{selectedLead.preferredLocation}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Clock size={16} className="text-emerald-400" />
                    <span className="text-slate-300 capitalize">
                      Timeline: {selectedLead.timeline.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={selectedLead.status} />
                    <span className="text-xs text-slate-500 capitalize">
                      via {selectedLead.source.replace("_", " ")}
                    </span>
                  </div>
                  <ScoreBar score={selectedLead.qualificationScore} />
                  {selectedLead.notes && (
                    <div className="p-3 rounded-xl bg-white/5 text-sm text-slate-400">
                      {selectedLead.notes}
                    </div>
                  )}
                </div>

                {/* Conversations */}
                {selectedLead.conversations && selectedLead.conversations.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <MessageSquare size={14} />
                      Conversations ({selectedLead.conversations.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedLead.conversations.map((c) => (
                        <div key={c.id} className="p-3 rounded-xl bg-white/5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-500">
                              {new Date(c.timestamp).toLocaleDateString("en-IN")}
                            </span>
                            <StatusBadge status={c.sentiment} />
                          </div>
                          <p className="text-sm text-slate-300 line-clamp-2">{c.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bookings */}
                {selectedLead.bookings && selectedLead.bookings.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Calendar size={14} />
                      Bookings ({selectedLead.bookings.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedLead.bookings.map((b) => (
                        <div key={b.id} className="p-3 rounded-xl bg-white/5 flex items-center justify-between">
                          <div>
                            <p className="text-sm text-white">{b.propertyName}</p>
                            <p className="text-xs text-slate-500">
                              {b.date} at {b.time}
                            </p>
                          </div>
                          <StatusBadge status={b.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Call Transfers */}
                {selectedLead.callTransfers && selectedLead.callTransfers.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <PhoneForwarded size={14} />
                      Transfers ({selectedLead.callTransfers.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedLead.callTransfers.map((t) => (
                        <div key={t.id} className="p-3 rounded-xl bg-white/5 flex items-center justify-between">
                          <div>
                            <p className="text-sm text-white">{t.transferTo}</p>
                            <p className="text-xs text-slate-500">{t.reason}</p>
                          </div>
                          <StatusBadge status={t.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Lead Dialog */}
      <AnimatePresence>
        {showAddForm && (
          <AddLeadDialog
            onClose={() => setShowAddForm(false)}
            onCreated={() => {
              setShowAddForm(false);
              fetchLeads();
              toast.success("Lead created!");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AddLeadDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    budget: "",
    propertyType: "apartment",
    preferredLocation: "",
    timeline: "1-3 months",
    source: "phone_call",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          budget: parseFloat(form.budget) || 0,
        }),
      });
      if (res.ok) onCreated();
      else toast.error("Failed to create lead");
    } catch {
      toast.error("Failed to create lead");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0d1321] border border-white/10 rounded-2xl z-50 p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Add New Lead</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-400">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <InputField label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
          <InputField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
          <InputField label="Budget (INR)" value={form.budget} onChange={(v) => setForm({ ...form, budget: v })} type="number" required />
          <SelectField
            label="Property Type"
            value={form.propertyType}
            onChange={(v) => setForm({ ...form, propertyType: v })}
            options={["apartment", "villa", "plot", "commercial"]}
          />
          <InputField label="Preferred Location" value={form.preferredLocation} onChange={(v) => setForm({ ...form, preferredLocation: v })} />
          <SelectField
            label="Timeline"
            value={form.timeline}
            onChange={(v) => setForm({ ...form, timeline: v })}
            options={["immediately", "1-3 months", "3-6 months", "6+ months"]}
          />
          <SelectField
            label="Source"
            value={form.source}
            onChange={(v) => setForm({ ...form, source: v })}
            options={["phone_call", "website", "referral"]}
          />
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Creating..." : "Create Lead"}
          </Button>
        </form>
      </motion.div>
    </>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1 block">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none appearance-none"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-[#0d1321]">
            {o.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    </div>
  );
}
