"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  PhoneForwarded,
  Building2,
  Settings,
  Menu,
  X,
  Mic,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";

export type Tab =
  | "dashboard"
  | "leads"
  | "bookings"
  | "conversations"
  | "transfers"
  | "properties"
  | "config"
  | "test";

const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { id: "leads", label: "Leads", icon: <Users size={20} /> },
  { id: "bookings", label: "Bookings", icon: <Calendar size={20} /> },
  { id: "conversations", label: "Conversations", icon: <MessageSquare size={20} /> },
  { id: "transfers", label: "Call Transfers", icon: <PhoneForwarded size={20} /> },
  { id: "properties", label: "Properties", icon: <Building2 size={20} /> },
  { id: "config", label: "Agent Config", icon: <Settings size={20} /> },
  { id: "test", label: "Test Agent", icon: <Mic size={20} /> },
];

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden glass-card p-2"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setCollapsed(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed top-0 left-0 h-full z-40 flex flex-col py-6 px-3 transition-all duration-300
          ${collapsed ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-64"}
          bg-[#050507] border-r border-white/5`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 mb-8">
          <img src="/logo.jpeg" alt="nulify logo" className="w-10 h-10 rounded-xl object-cover" />
          <div>
            <h1 className="text-lg font-bold text-white">nulify</h1>
            <p className="text-xs text-slate-500">Voice Agent Dashboard</p>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setCollapsed(false);
                }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "text-white"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-emerald-500/15 border border-emerald-500/20 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className={`relative z-10 ${isActive ? "text-emerald-400" : ""}`}>
                  {item.icon}
                </span>
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pt-4 border-t border-white/5 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={18} />
            <span>Log out</span>
          </button>
          <p className="text-xs text-slate-600 px-3">nulify Voice AI v1.0</p>
        </div>
      </motion.aside>
    </>
  );
}
