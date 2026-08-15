"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  Clock,
  MessageSquare,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { StatusBadge } from "@/components/ui/badge";

interface DashboardData {
  totalLeads: number;
  qualifiedLeads: number;
  bookedVisits: number;
  conversionRate: number;
  callVolume: { date: string; count: number }[];
  leadsByStatus: { status: string; count: number }[];
  topLocations: { location: string; count: number }[];
  avgQualificationScore: number;
  recentConversations: Array<{
    id: string;
    leadName: string;
    duration: number;
    sentiment: string;
    timestamp: string;
    summary: string;
  }>;
  upcomingBookings: Array<{
    id: string;
    leadName: string;
    propertyName: string;
    date: string;
    time: string;
    status: string;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  new: "#3b82f6",
  qualified: "#10b981",
  booked: "#8b5cf6",
  transferred: "#f59e0b",
  closed_lost: "#f43f5e",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((json) => {
        if (json?.error) {
          console.error("Dashboard API error:", json.error);
          setData(null);
        } else {
          setData(json);
        }
      })
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

  if (!data) return <p className="text-slate-400">Failed to load dashboard data.</p>;

  const kpis = [
    {
      label: "Total Leads",
      value: data.totalLeads,
      icon: <Users size={22} />,
      trend: "+12%",
      trendUp: true,
      color: "emerald",
    },
    {
      label: "Qualified Leads",
      value: data.qualifiedLeads,
      icon: <UserCheck size={22} />,
      trend: "+8%",
      trendUp: true,
      color: "emerald",
    },
    {
      label: "Site Visits Booked",
      value: data.bookedVisits,
      icon: <CalendarCheck size={22} />,
      trend: "+15%",
      trendUp: true,
      color: "emerald",
    },
    {
      label: "Conversion Rate",
      value: `${data.conversionRate.toFixed(1)}%`,
      icon: <TrendingUp size={22} />,
      trend: data.conversionRate > 20 ? "+5%" : "-3%",
      trendUp: data.conversionRate > 20,
      color: "emerald",
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <motion.div
            key={kpi.label}
            variants={item}
            className="glass-card p-5 hover:border-emerald-500/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-sm">{kpi.label}</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                {kpi.icon}
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{kpi.value}</div>
            <div className="flex items-center gap-1 text-sm">
              {kpi.trendUp ? (
                <TrendingUp size={14} className="text-emerald-400" />
              ) : (
                <TrendingDown size={14} className="text-rose-400" />
              )}
              <span className={kpi.trendUp ? "text-emerald-400" : "text-rose-400"}>
                {kpi.trend}
              </span>
              <span className="text-slate-500">vs last week</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart - Call Volume */}
        <motion.div variants={item} className="glass-card p-5 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Call Volume (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.callVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#e2e8f0",
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart - Leads by Status */}
        <motion.div variants={item} className="glass-card p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Leads by Status</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.leadsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="count"
                  nameKey="status"
                  paddingAngle={3}
                >
                  {data.leadsByStatus.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status] || "#64748b"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#e2e8f0",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {data.leadsByStatus.map((s) => (
              <div key={s.status} className="flex items-center gap-1.5 text-xs">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: STATUS_COLORS[s.status] || "#64748b" }}
                />
                <span className="text-slate-400 capitalize">{s.status.replace("_", " ")}</span>
                <span className="text-white font-medium">{s.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Conversations */}
        <motion.div variants={item} className="glass-card p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare size={18} className="text-emerald-400" />
            Recent Conversations
          </h3>
          <div className="space-y-3">
            {data.recentConversations.map((conv) => (
              <div
                key={conv.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{conv.leadName}</p>
                  <p className="text-slate-500 text-xs truncate mt-0.5">{conv.summary}</p>
                </div>
                <div className="flex items-center gap-3 ml-3 shrink-0">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={12} />
                      {Math.floor(conv.duration / 60)}m {conv.duration % 60}s
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {new Date(conv.timestamp).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <StatusBadge status={conv.sentiment} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Bookings */}
        <motion.div variants={item} className="glass-card p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CalendarCheck size={18} className="text-emerald-400" />
            Upcoming Bookings
          </h3>
          <div className="space-y-3">
            {data.upcomingBookings.map((bk) => (
              <div
                key={bk.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0">
                  <CalendarCheck size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{bk.leadName}</p>
                  <p className="text-slate-500 text-xs">{bk.propertyName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white text-sm">
                    {new Date(bk.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                  <p className="text-slate-500 text-xs">{bk.time}</p>
                </div>
                <StatusBadge status={bk.status} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
