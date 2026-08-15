"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings, Save, Bot, Mic, Phone, Target, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ConfigItem {
  id: string;
  key: string;
  value: string;
  label: string;
  type: string;
  category: string;
}

const CATEGORY_META: Record<string, { icon: React.ReactNode; label: string; description: string }> = {
  general: { icon: <Bot size={18} />, label: "General", description: "Company name, greeting message, and AI behavior" },
  voice: { icon: <Mic size={18} />, label: "Voice Settings", description: "Text-to-speech voice, speed, and language" },
  twilio: { icon: <Phone size={18} />, label: "Twilio Integration", description: "Phone system configuration (Coming Soon)" },
  qualification: { icon: <Target size={18} />, label: "Qualification Rules", description: "Budget thresholds and lead scoring rules" },
};

export default function AgentConfigPage() {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/agent-config")
      .then((r) => r.json())
      .then((data: ConfigItem[]) => {
        setConfigs(data);
        const vals: Record<string, string> = {};
        data.forEach((c) => (vals[c.key] = c.value));
        setEditValues(vals);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = configs.map((c) => ({ key: c.key, value: editValues[c.key] || "" }));
      const res = await fetch("/api/agent-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) toast.success("Configuration saved!");
      else toast.error("Failed to save config");
    } catch {
      toast.error("Failed to save config");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const categories = Object.keys(CATEGORY_META);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Settings size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Agent Configuration</h2>
            <p className="text-sm text-slate-500">Configure your AI voice agent behavior and integrations</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving..." : "Save All"}
        </Button>
      </div>

      {categories.map((cat) => {
        const meta = CATEGORY_META[cat];
        const items = configs.filter((c) => c.category === cat);
        if (items.length === 0) return null;

        return (
          <motion.div
            key={cat}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                {meta.icon}
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">{meta.label}</h3>
                <p className="text-slate-500 text-xs">{meta.description}</p>
              </div>
              {cat === "twilio" && (
                <span className="ml-auto px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Coming Soon
                </span>
              )}
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.key}>
                  <label className="text-xs text-slate-400 mb-1.5 block font-medium">
                    {item.label}
                  </label>
                  {item.type === "textarea" ? (
                    <textarea
                      value={editValues[item.key] || ""}
                      onChange={(e) =>
                        setEditValues({ ...editValues, [item.key]: e.target.value })
                      }
                      rows={item.key === "system_prompt" ? 12 : 3}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 resize-y font-mono leading-relaxed"
                    />
                  ) : (
                    <input
                      type={item.type === "number" ? "number" : "text"}
                      value={editValues[item.key] || ""}
                      onChange={(e) =>
                        setEditValues({ ...editValues, [item.key]: e.target.value })
                      }
                      disabled={cat === "twilio"}
                      className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 ${
                        cat === "twilio" ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      placeholder={cat === "twilio" ? "Configure when Twilio is connected" : ""}
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}