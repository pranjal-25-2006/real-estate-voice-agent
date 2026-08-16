"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar, { type Tab } from "@/components/Sidebar";
import DashboardPage from "@/components/DashboardPage";
import LeadsPage from "@/components/LeadsPage";
import BookingsPage from "@/components/BookingsPage";
import ConversationsPage from "@/components/ConversationsPage";
import CallTransfersPage from "@/components/CallTransfersPage";
import PropertiesPage from "@/components/PropertiesPage";
import AgentConfigPage from "@/components/AgentConfigPage";
import VoiceTestPage from "@/components/VoiceTestPage";

const TAB_TITLES: Record<Tab, string> = {
  dashboard: "Dashboard",
  leads: "Leads Pipeline",
  bookings: "Site Visits & Bookings",
  conversations: "Voice Conversations",
  transfers: "Call Transfers",
  properties: "Properties",
  config: "Agent Configuration",
  test: "Test Voice Agent",
};

function TabContent({ tab }: { tab: Tab }) {
  switch (tab) {
    case "dashboard":
      return <DashboardPage />;
    case "leads":
      return <LeadsPage />;
    case "bookings":
      return <BookingsPage />;
    case "conversations":
      return <ConversationsPage />;
    case "transfers":
      return <CallTransfersPage />;
    case "properties":
      return <PropertiesPage />;
    case "config":
      return <AgentConfigPage />;
    case "test":
      return <VoiceTestPage />;
  }
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <div className="min-h-screen flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-4 bg-black/60 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="pl-12 lg:pl-0">
              <h2 className="text-xl font-bold text-white">{TAB_TITLES[activeTab]}</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                nulify — AI Voice Agent
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium">Agent Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TabContent tab={activeTab} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="px-4 sm:px-6 lg:px-8 py-4 border-t border-white/5 bg-black/60">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>© 2026 nulify. All rights reserved.</span>
            <span>Powered by AI Voice Agent</span>
          </div>
        </footer>
      </main>
    </div>
  );
}