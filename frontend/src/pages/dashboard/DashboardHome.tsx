import { useState, useMemo } from "react";
import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import {
  Code2, Zap, ArrowRight, Play, Star, Activity, Users,
  BookOpen, Search, Download, ChevronUp, ChevronDown, Loader2
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../hooks/useAuth";
import { apiClient } from "../../lib/apiClient";

// ── Types ───────────────────────────────────────────────────────────
interface AnalysisSummary {
  id: string;
  algorithmName: string;
  category: string;
  language: string;
  timeComplexity: string;
  createdAt: string;
}

interface DashboardStats {
  totalAnalyses: number;
  thisMonth: number;
  avgSteps: number;
  uniqueAlgorithms: number;
  dailyData: Array<{ day: string; analyses: number; api: number }>;
  categoryData: Array<{ name: string; count: number }>;
}

// ── Category colors ─────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Sorting: "#6366f1",
  Searching: "#8b5cf6",
  DP: "#06b6d4",
  "Two Pointers": "#10b981",
  Tree: "#f59e0b",
  Graph: "#ef4444",
  Stack: "#ec4899",
  Queue: "#14b8a6"
};

function getColor(name: string) {
  return CATEGORY_COLORS[name] ?? "#94a3b8";
}

// ── Tooltip ─────────────────────────────────────────────────────────
interface TooltipEntry {
  stroke?: string;
  fill?: string;
  name?: string;
  value?: string | number;
}
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950/95 border border-zinc-800 text-white p-3.5 rounded-2xl shadow-xl backdrop-blur-md font-sans text-xs flex flex-col gap-1.5 select-none">
        <p className="font-bold text-zinc-400 border-b border-zinc-800 pb-1 mb-1">{label}</p>
        {payload.map((p, idx) => (
          <p key={idx} className="flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.stroke || p.fill }} />
            <span className="text-zinc-350">{p.name}:</span>
            <span className="font-bold text-white ml-auto">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

// ── Skeleton loader ─────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-zinc-100 dark:border-zinc-850">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-5 py-3.5">
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" style={{ width: `${50 + ((i * 7) % 40)}%` }} />
        </td>
      ))}
    </tr>
  );
}

export function DashboardHome(): ReactElement {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"algorithmName" | "category" | "language" | "timeComplexity" | "createdAt">("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // ── Data fetching ──────────────────────────────────────────────────
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiClient.get<DashboardStats>("/analyses/stats"),
    staleTime: 60_000,
    placeholderData: {
      totalAnalyses: 0,
      thisMonth: 0,
      avgSteps: 0,
      uniqueAlgorithms: 0,
      dailyData: [],
      categoryData: []
    }
  });

  const { data: historyData, isLoading: historyLoading } = useQuery<{
    items: AnalysisSummary[];
    total: number;
  }>({
    queryKey: ["dashboard-history"],
    queryFn: () => apiClient.get<{ items: AnalysisSummary[]; total: number }>("/analyses/history?limit=10"),
    staleTime: 30_000,
    placeholderData: { items: [], total: 0 }
  });

  const analyses = useMemo(() => historyData?.items ?? [], [historyData?.items]);

  function toggleSort(field: typeof sortField) {
    if (sortField === field) {
      setSortDirection(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  const filteredAndSorted = useMemo(() => {
    let result = [...analyses];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.algorithmName?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q) ||
        a.language?.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const valA = String(a[sortField] ?? "").toLowerCase();
      const valB = String(b[sortField] ?? "").toLowerCase();
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [analyses, searchQuery, sortField, sortDirection]);

  function exportToCSV() {
    const headers = ["ID", "Algorithm", "Category", "Language", "Complexity", "Date"];
    const rows = filteredAndSorted.map(a => [
      a.id, a.algorithmName, a.category, a.language,
      a.timeComplexity, new Date(a.createdAt).toLocaleDateString()
    ]);
    const csv = "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `algoviz_export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const STAT_CARDS = [
    { label: "Total Analyses", value: stats?.totalAnalyses ?? 0, delta: "", icon: Code2, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/60" },
    { label: "This Month", value: stats?.thisMonth ?? 0, delta: "", icon: Activity, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/60" },
    { label: "Avg. Steps/Run", value: stats?.avgSteps ?? 0, delta: "", icon: Zap, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/60" },
    { label: "Algorithms Used", value: stats?.uniqueAlgorithms ?? 0, delta: "", icon: Star, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/60" },
  ];

  const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } } as const;
  const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 14 } } } as const;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-850 pb-5">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            {greeting}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-450 mt-1.5 font-medium">
            Here's what's happening with your algorithms workspace today.
          </p>
        </div>
        <Link to="/app">
          <Button variant="primary" className="shadow-lg shadow-indigo-500/10 flex items-center gap-1.5" leftIcon={<Play className="w-4 h-4 fill-current" />}>
            New Visualization
          </Button>
        </Link>
      </motion.div>

      {/* Free plan usage banner */}
      {user?.plan === "free" && (
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border border-indigo-200/50 dark:border-indigo-900/40 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <p className="text-sm font-bold text-indigo-750 dark:text-indigo-300">
              {stats?.thisMonth ?? 0} of 10 free analyses used this month
            </p>
            <div className="w-56 h-2 bg-indigo-200/50 dark:bg-indigo-900/60 rounded-full mt-2.5 overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${Math.min(100, ((stats?.thisMonth ?? 0) / 10) * 100)}%` }} />
            </div>
          </div>
          <Link to="/dashboard/billing">
            <Button variant="primary" size="sm" className="shadow-sm">Upgrade for Unlimited</Button>
          </Link>
        </motion.div>
      )}

      {/* Stat cards */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(s => (
          <motion.div variants={itemVariants} key={s.label}>
            <Card className="p-5 glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                {statsLoading && <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin" />}
              </div>
              <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                {statsLoading ? <span className="inline-block w-10 h-6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" /> : s.value}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-1.5">{s.label}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5 glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold text-zinc-850 dark:text-white text-sm tracking-tight uppercase select-none">Analyses & API Trends</h2>
            <div className="flex gap-2 select-none">
              <Badge variant="primary" className="bg-indigo-500/10 border-indigo-500/30 text-indigo-500">Analyses</Badge>
              <Badge variant="primary" className="bg-cyan-500/10 border-cyan-500/30 text-cyan-500">API Calls</Badge>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats?.dailyData ?? []} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorApi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-zinc-850" opacity={0.3} />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="transparent" tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} stroke="transparent" tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" name="Analyses Run" dataKey="analyses" stroke="#6366f1" strokeWidth={3} fill="url(#colorAnalyses)" />
              <Area type="monotone" name="API Requests" dataKey="api" stroke="#06b6d4" strokeWidth={3} fill="url(#colorApi)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm">
          <h2 className="font-extrabold text-zinc-850 dark:text-white text-sm tracking-tight uppercase select-none mb-5">Category Split</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.categoryData ?? []} layout="vertical" margin={{ top: 0, right: 5, left: -25, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="transparent" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="transparent" width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {(stats?.categoryData ?? []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Analyses table */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 border-b border-zinc-150 dark:border-zinc-850">
            <div>
              <h2 className="font-extrabold text-zinc-850 dark:text-white text-sm tracking-tight uppercase select-none">Recent Analyses</h2>
              <p className="text-[11px] text-zinc-450 dark:text-zinc-500 font-medium mt-0.5">
                {historyData?.total ?? 0} total analyses
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="search"
                  placeholder="Filter analyses..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-350 transition-all"
                />
              </div>
              <Button variant="outline" size="sm" onClick={exportToCSV} className="text-xs font-bold border-zinc-200 flex items-center gap-1.5" leftIcon={<Download className="w-3.5 h-3.5" />} disabled={analyses.length === 0}>
                Export CSV
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-150 dark:border-zinc-850 select-none text-zinc-400 font-bold uppercase tracking-wider font-mono">
                  {[
                    { key: "algorithmName", label: "Algorithm" },
                    { key: "category", label: "Category" },
                    { key: "language", label: "Language" },
                    { key: "timeComplexity", label: "Complexity" },
                    { key: "createdAt", label: "Date" }
                  ].map(col => (
                    <th key={col.key} onClick={() => toggleSort(col.key as typeof sortField)} className="px-5 py-3 cursor-pointer hover:bg-zinc-100/40 dark:hover:bg-zinc-800/40 transition-colors">
                      <div className="flex items-center gap-1">
                        <span>{col.label}</span>
                        {sortField === col.key && (sortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                      </div>
                    </th>
                  ))}
                  <th className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                {historyLoading ? (
                  [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                ) : filteredAndSorted.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-zinc-450 dark:text-zinc-500 font-bold">
                      {searchQuery ? "No matching analyses found." : "No analyses yet — run your first visualization!"}
                    </td>
                  </tr>
                ) : (
                  filteredAndSorted.map(a => (
                    <tr key={a.id} className="hover:bg-zinc-100/40 dark:hover:bg-zinc-900/40 transition-colors group">
                      <td className="px-5 py-3.5 font-bold text-zinc-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-500">
                            <Code2 className="w-3.5 h-3.5" />
                          </div>
                          <span>{a.algorithmName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400 font-semibold">{a.category}</td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-zinc-450 dark:text-zinc-500">{a.language}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant="default" className="text-[10px] font-mono">{a.timeComplexity}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-405 font-medium text-[11px]">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <Link to="/app">
                          <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-indigo-500/10">
                            <Play className="w-3 h-3 fill-current text-indigo-500" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Quick start cards */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: "⚡", title: "Run Visualizer", desc: "Compile code, map indices and visualize step-by-step executions.", href: "/app", cta: "Open Visualizer", iconComp: Play },
          { icon: "👥", title: "Team Collaboration", desc: "Invite colleagues and build custom code bookmark libraries.", href: "/dashboard/team", cta: "Invite Members", iconComp: Users },
          { icon: "📖", title: "Read Documentation", desc: "Learn custom execution mappings, API limits, and integrations.", href: "/docs", cta: "View Docs", iconComp: BookOpen },
        ].map((q, idx) => (
          <motion.div variants={itemVariants} key={idx}>
            <Card hover className="p-5 glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm flex flex-col justify-between h-full relative overflow-hidden group">
              <div>
                <div className="text-4xl mb-4 select-none">{q.icon}</div>
                <h3 className="font-extrabold text-zinc-900 dark:text-white text-sm mb-1.5">{q.title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed mb-5">{q.desc}</p>
              </div>
              <Link to={q.href}>
                <Button variant="outline" size="sm" className="w-full text-xs font-bold border-zinc-200 hover:border-indigo-400 flex items-center justify-center gap-1.5" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  {q.cta}
                </Button>
              </Link>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
