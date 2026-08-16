"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Plus,
  X,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Property {
  id: string;
  name: string;
  type: string;
  priceMin: number;
  priceMax: number;
  priceCurrency: string;
  location: string;
  description: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqft: number | null;
  status: string;
  reraId: string | null;
}

function formatPrice(amount: number) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(0)} L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/properties")
      .then((r) => r.json())
      .then((d) => setProperties(d.properties || d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
          Properties ({properties.length})
        </h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Property
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {properties.map((prop) => (
          <motion.div
            key={prop.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5 hover:border-emerald-500/20 transition-colors"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Building2 size={18} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{prop.name}</p>
                  <p className="text-slate-500 text-xs capitalize">{prop.type}</p>
                </div>
              </div>
              <StatusBadge status={prop.status} />
            </div>

            {/* Price */}
            <p className="text-xl font-bold text-emerald-400 mb-3">
              {formatPrice(prop.priceMin)} — {formatPrice(prop.priceMax)}
            </p>

            {/* Details */}
            <div className="flex items-center gap-4 mb-3 text-sm text-slate-400">
              {prop.bedrooms && (
                <span className="flex items-center gap-1">
                  <BedDouble size={14} /> {prop.bedrooms} Bed
                </span>
              )}
              {prop.bathrooms && (
                <span className="flex items-center gap-1">
                  <Bath size={14} /> {prop.bathrooms} Bath
                </span>
              )}
              {prop.areaSqft && (
                <span className="flex items-center gap-1">
                  <Maximize size={14} /> {prop.areaSqft} sqft
                </span>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-slate-300 mb-3">
              <MapPin size={14} className="text-emerald-400" />
              {prop.location}
            </div>

            {/* Description */}
            {prop.description && (
              <p className="text-xs text-slate-500 line-clamp-2 mb-3">{prop.description}</p>
            )}

            {/* RERA */}
            {prop.reraId && (
              <p className="text-xs text-slate-600">RERA: {prop.reraId}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Add Property Dialog */}
      <AnimatePresence>
        {showForm && (
          <PropertyForm
            onClose={() => setShowForm(false)}
            onCreated={() => {
              setShowForm(false);
              fetch("/api/properties").then((r) => r.json()).then((d) => setProperties(d.properties || d));
              toast.success("Property added!");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PropertyForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    type: "apartment",
    priceMin: "",
    priceMax: "",
    location: "",
    description: "",
    bedrooms: "",
    bathrooms: "",
    areaSqft: "",
    status: "available",
    reraId: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          priceMin: parseFloat(form.priceMin) || 0,
          priceMax: parseFloat(form.priceMax) || 0,
          bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
          bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
          areaSqft: form.areaSqft ? parseInt(form.areaSqft) : null,
          description: form.description || null,
          reraId: form.reraId || null,
        }),
      });
      if (res.ok) onCreated();
      else toast.error("Failed to add property");
    } catch {
      toast.error("Failed to add property");
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    key: keyof typeof form,
    type = "text",
    required = false,
  ) => (
    <div>
      <label className="text-xs text-slate-400 mb-1 block">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        required={required}
        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50"
      />
    </div>
  );

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
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0a0d13] border border-white/10 rounded-2xl z-50 p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Add Property</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-400">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {field("Property Name", "name", "text", true)}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none appearance-none"
            >
              {["apartment", "villa", "plot", "commercial"].map((t) => (
                <option key={t} value={t} className="bg-[#0a0d13]">{t}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field("Min Price (INR)", "priceMin", "number", true)}
            {field("Max Price (INR)", "priceMax", "number", true)}
          </div>
          {field("Location", "location", "text", true)}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {field("Beds", "bedrooms", "number")}
            {field("Baths", "bathrooms", "number")}
            {field("Area (sqft)", "areaSqft", "number")}
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none appearance-none"
            >
              {["available", "sold", "under_construction"].map((s) => (
                <option key={s} value={s} className="bg-[#0a0d13]">{s.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          {field("RERA ID", "reraId")}
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Adding..." : "Add Property"}
          </Button>
        </form>
      </motion.div>
    </>
  );
}
