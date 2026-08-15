"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PhoneForwarded, Clock } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";

interface CallTransfer {
  id: string;
  transferTo: string;
  transferPhone: string | null;
  reason: string;
  status: string;
  duration: number | null;
  timestamp: string;
  lead: { name: string; phone: string };
}

export default function CallTransfersPage() {
  const [transfers, setTransfers] = useState<CallTransfer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/call-transfers")
      .then((r) => r.json())
      .then((d) => setTransfers(d.transfers || d))
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
      <h2 className="text-lg font-semibold text-white">
        Call Transfers ({transfers.length})
      </h2>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Lead</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Transferred To</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Reason</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Duration</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((t) => (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <p className="text-white font-medium text-sm">{t.lead.name}</p>
                    <p className="text-slate-500 text-xs">{t.lead.phone}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
                        <PhoneForwarded size={14} />
                      </div>
                      <div>
                        <p className="text-white text-sm">{t.transferTo}</p>
                        {t.transferPhone && (
                          <p className="text-slate-500 text-xs">{t.transferPhone}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-300 hidden md:table-cell max-w-xs truncate">
                    {t.reason}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    {t.duration ? (
                      <div className="flex items-center gap-1 text-sm text-slate-300">
                        <Clock size={12} />
                        {Math.floor(t.duration / 60)}m {t.duration % 60}s
                      </div>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-400">
                    {new Date(t.timestamp).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
