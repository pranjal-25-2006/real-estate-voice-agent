const statusColors: Record<string, string> = {
  // Lead statuses
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  qualified: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  booked: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  transferred: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  closed_lost: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  // Appointment statuses
  scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  confirmed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  completed: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  cancelled: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  no_show: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  // Property statuses
  available: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  sold: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  under_construction: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  // General
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  connected: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  failed: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  missed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  // Sentiment
  positive: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  neutral: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  negative: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

export function StatusBadge({ status }: { status: string }) {
  const colorClass =
    statusColors[status] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
