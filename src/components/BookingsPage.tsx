"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Booking {
  id: string;
  leadId: string;
  propertyName: string;
  propertyId: string | null;
  date: string;
  time: string;
  status: string;
  notes: string | null;
  lead: { id: string; name: string; phone: string };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchBookings = () => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings || d))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Booking ${status}`);
        fetchBookings();
      }
    } catch {
      toast.error("Failed to update booking");
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    try {
      await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      toast.success("Booking deleted");
      fetchBookings();
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          All Bookings ({bookings.length})
        </h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} /> Schedule Booking
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {bookings.map((bk) => (
          <motion.div
            key={bk.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5 hover:border-emerald-500/20 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-white font-semibold">{bk.lead.name}</p>
                <p className="text-slate-500 text-xs">{bk.lead.phone}</p>
              </div>
              <StatusBadge status={bk.status} />
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <MapPin size={14} className="text-emerald-400" />
                {bk.propertyName}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Calendar size={14} className="text-emerald-400" />
                {new Date(bk.date).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Clock size={14} className="text-emerald-400" />
                {bk.time}
              </div>
            </div>

            {bk.notes && (
              <p className="text-xs text-slate-500 mb-4 line-clamp-2">{bk.notes}</p>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-white/5">
              {bk.status === "scheduled" && (
                <>
                  <button
                    onClick={() => updateStatus(bk.id, "confirmed")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs hover:bg-emerald-500/20 transition-colors"
                  >
                    <CheckCircle size={12} /> Confirm
                  </button>
                  <button
                    onClick={() => updateStatus(bk.id, "cancelled")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 text-xs hover:bg-rose-500/20 transition-colors"
                  >
                    <XCircle size={12} /> Cancel
                  </button>
                </>
              )}
              {bk.status === "confirmed" && (
                <button
                  onClick={() => updateStatus(bk.id, "completed")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 text-xs hover:bg-violet-500/20 transition-colors"
                >
                  <CheckCircle size={12} /> Complete
                </button>
              )}
              <button
                onClick={() => deleteBooking(bk.id)}
                className="ml-auto p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors"
              >
                <XCircle size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Schedule Booking Dialog */}
      <AnimatePresence>
        {showForm && (
          <BookingForm
            onClose={() => setShowForm(false)}
            onCreated={() => {
              setShowForm(false);
              fetchBookings();
              toast.success("Booking scheduled!");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function BookingForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [leads, setLeads] = useState<Array<{ id: string; name: string }>>([]);
  const [properties, setProperties] = useState<Array<{ id: string; name: string }>>([]);
  const [form, setForm] = useState({
    leadId: "",
    propertyName: "",
    propertyId: "",
    date: "",
    time: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/leads").then((r) => r.json()).then(d => d.leads || d),
      fetch("/api/properties").then((r) => r.json()).then(d => d.properties || d),
    ]).then(([l, p]) => {
      setLeads(l);
      setProperties(p);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) onCreated();
      else toast.error("Failed to create booking");
    } catch {
      toast.error("Failed to create booking");
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
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0d1321] border border-white/10 rounded-2xl z-50 p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Schedule Booking</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-400">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Lead</label>
            <select
              value={form.leadId}
              onChange={(e) => setForm({ ...form, leadId: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none appearance-none"
            >
              <option value="" className="bg-[#0d1321]">Select lead...</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id} className="bg-[#0d1321]">{l.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Property</label>
            <select
              value={form.propertyId}
              onChange={(e) => {
                const prop = properties.find((p) => p.id === e.target.value);
                setForm({ ...form, propertyId: e.target.value, propertyName: prop?.name || "" });
              }}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none appearance-none"
            >
              <option value="" className="bg-[#0d1321]">Select property...</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0d1321]">{p.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Time</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none resize-none"
            />
          </div>
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Scheduling..." : "Schedule Booking"}
          </Button>
        </form>
      </motion.div>
    </>
  );
}
