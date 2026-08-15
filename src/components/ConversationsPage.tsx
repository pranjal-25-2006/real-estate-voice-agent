"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Clock, User, Bot, ChevronDown, ChevronUp } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";

interface Conversation {
  id: string;
  leadId: string;
  duration: number;
  sentiment: string;
  summary: string | null;
  timestamp: string;
  lead: { name: string };
  messages: Array<{
    id: string;
    role: string;
    content: string;
    timestamp: string;
  }>;
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations || d))
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
          Voice Conversations ({conversations.length})
        </h2>
      </div>

      <div className="space-y-3">
        {conversations.map((conv) => (
          <motion.div
            key={conv.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card overflow-hidden"
          >
            {/* Header */}
            <button
              onClick={() => setExpanded(expanded === conv.id ? null : conv.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <MessageSquare size={18} />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium text-sm">{conv.lead.name}</p>
                  <p className="text-slate-500 text-xs line-clamp-1">{conv.summary}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock size={12} />
                    {Math.floor(conv.duration / 60)}m {conv.duration % 60}s
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {new Date(conv.timestamp).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <StatusBadge status={conv.sentiment} />
                {expanded === conv.id ? (
                  <ChevronUp size={16} className="text-slate-500" />
                ) : (
                  <ChevronDown size={16} className="text-slate-500" />
                )}
              </div>
            </button>

            {/* Expanded content */}
            <AnimatePresence>
              {expanded === conv.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 border-t border-white/5 pt-4">
                    {/* AI Summary */}
                    {conv.summary && (
                      <div className="mb-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                        <p className="text-xs text-emerald-400 font-medium mb-1">AI Summary</p>
                        <p className="text-sm text-slate-300">{conv.summary}</p>
                      </div>
                    )}

                    {/* Transcript */}
                    <div className="space-y-3">
                      {conv.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${msg.role === "user" ? "" : "flex-row-reverse"}`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              msg.role === "user"
                                ? "bg-blue-500/10 text-blue-400"
                                : "bg-emerald-500/10 text-emerald-400"
                            }`}
                          >
                            {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                          </div>
                          <div
                            className={`max-w-[80%] p-3 rounded-xl text-sm ${
                              msg.role === "user"
                                ? "bg-blue-500/10 text-slate-200 rounded-tl-none"
                                : "bg-white/5 text-slate-300 rounded-tr-none"
                            }`}
                          >
                            <p className="text-xs font-medium mb-1 opacity-60 capitalize">
                              {msg.role === "user" ? conv.lead.name : "nulify AI"}
                            </p>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
