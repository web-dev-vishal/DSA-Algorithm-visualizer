import { useState, useMemo } from "react";
import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { Code2, Zap, ArrowRight, Play, Star, Activity, Users, BookOpen, Search, Download, ChevronUp, ChevronDown } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../hooks/useAuth";

const DAILY_DATA = [
  { day: "Mon", analyses: 12, api: 45 },
  { day: "Tue", analyses: 19, api: 67 },
  { day: "Wed", analyses: 8,  api: 38 },
  { day: "Thu", analyses: 24, api: 89 },
  { day: "Fri", analyses: 31, api: 112 },
  { day: "Sat", analyses: 15, api: 54 },
  { day: "Sun", analyses: 22, api: 78 },
];

const RECENT_ANALYSES = [
  { id: "1", name: "Bubble Sort",     category: "Sorting",        lang: "C++",    time: "2m ago",   complexity: "O(n²)" },
  { id: "2", name: "Binary Search",   category: "Searching",      lang: "Python", time: "1h ago",   complexity: "O(log n)" },
  { id: "3", name: "Merge Sort",      category: "Sorting",        lang: "Java",   time: "3h ago",   complexity: "O(n log n)" },
  { id: "4", name: "Fibonacci DP",    category: "DP",             lang: "Python", time: "yesterday",complexity: "O(n)" },
  { id: "5", name: "Two Sum",         category: "Two Pointers",   lang: "JS",     time: "2d ago",   complexity: "O(n)" },
  { id: "6", name: "Quick Sort",      category: "Sorting",        lang: "Python", time: "3d ago",   complexity: "O(n log n)" },
  { id: "7", name: "DFS Graph",       category: "Graph",          lang: "Java",   time: "4d ago",   complexity: "O(V + E)" },
];

const CATEGORY_DATA = [
  { name: "Sorting",      count: 18, fill: "url(#colorSorting)" },
  { name: "Searching",    count: 12, fill: "url(#colorSearching)" },
  { name: "DP",           count: 9,  fill: "url(#colorDP)" },
  { name: "Two Pointers", count: 7,  fill: "url(#colorPointers)" },
  { name: "Tree",         count: 5,  fill: "url(#colorTree)" },
];

const STAT_CARDS = [
  { label: "Total Analyses",   value: "247",   delta: "+12%", icon: Code2,     color: "text-indigo-500",  bg: "bg-indigo-50 dark:bg-indigo-950/60" },
  { label: "This Month",       value: "51",    delta: "+8%",  icon: Activity,  color: "text-violet-500",  bg: "bg-violet-50 dark:bg-violet-950/60" },
  { label: "Avg. Steps/Run",   value: "43",    delta: "+5%",  icon: Zap,       color: "text-cyan-500",    bg: "bg-cyan-50 dark:bg-cyan-950/60" },
  { label: "Algorithms Used",  value: "12",    delta: "of 15",icon: Star,      color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-950/60" },
];

interface TooltipPayloadEntry {
  stroke?: string;
  fill?: string;
  name?: string;
  value?: string | number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
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

export function DashboardHome(): ReactElement {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Data table state variables
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"name" | "category" | "lang" | "complexity" | "time">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedAnalyses = useMemo(() => {
    let result = [...RECENT_ANALYSES];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        item =>
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.lang.toLowerCase().includes(q) ||
          item.complexity.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const valA = a[sortField].toLowerCase();
      const valB = b[sortField].toLowerCase();
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [searchQuery, sortField, sortDirection]);

  const exportToCSV = () => {
    const headers = ["ID", "Name", "Category", "Language", "Time", "Complexity"];
    const rows = filteredAndSortedAnalyses.map(a => [
      a.id,
      a.name,
      a.category,
      a.lang,
      a.time,
      a.complexity
    ]);
    const csvContent = 
      "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `algoviz_analyses_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 14 } }
  } as const;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto space-y-6"
    >
      {/* Greeting Header */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-850 pb-5"
      >
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

      {/* Usage limit bar (for free users) */}
      {user?.plan === "free" && (
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border border-indigo-200/50 dark:border-indigo-900/40 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
        >
          <div>
            <p className="text-sm font-bold text-indigo-750 dark:text-indigo-300">7 of 10 free analyses used this month</p>
            <div className="w-56 h-2 bg-indigo-200/50 dark:bg-indigo-900/60 rounded-full mt-2.5 overflow-hidden">
              <div className="w-[70%] h-full bg-indigo-500 rounded-full" />
            </div>
          </div>
          <Link to="/dashboard/billing">
            <Button variant="primary" size="sm" className="shadow-sm">Upgrade for Unlimited</Button>
          </Link>
        </motion.div>
      )}

      {/* Stat cards */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {STAT_CARDS.map(s => (
          <motion.div variants={itemVariants} key={s.label}>
            <Card className="p-5 glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm relative overflow-hidden group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <Badge variant="success" className="text-[10px] font-bold select-none">{s.delta}</Badge>
              </div>
              <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">{s.value}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-1.5 select-none">{s.label}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts row */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Area chart */}
        <Card className="lg:col-span-2 p-5 glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold text-zinc-850 dark:text-white text-sm tracking-tight uppercase select-none">Analyses & API Trends</h2>
            <div className="flex gap-2 select-none">
              <Badge variant="primary" className="bg-indigo-500/10 border-indigo-500/30 text-indigo-500">Analyses</Badge>
              <Badge variant="primary" className="bg-cyan-500/10 border-cyan-500/30 text-cyan-500">API Calls</Badge>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={DAILY_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
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
              <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 550 }} stroke="transparent" tickLine={false} className="text-zinc-405" />
              <YAxis tick={{ fontSize: 10, fontWeight: 550 }} stroke="transparent" tickLine={false} className="text-zinc-405" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" name="Analyses Run" dataKey="analyses" stroke="#6366f1" strokeWidth={3} fill="url(#colorAnalyses)" />
              <Area type="monotone" name="API Requests" dataKey="api" stroke="#06b6d4" strokeWidth={3} fill="url(#colorApi)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Category bar chart */}
        <Card className="p-5 glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm">
          <h2 className="font-extrabold text-zinc-850 dark:text-white text-sm tracking-tight uppercase select-none mb-5">Category Split</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CATEGORY_DATA} layout="vertical" margin={{ top: 0, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSorting" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="colorSearching" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="colorDP" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0891b2" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="colorPointers" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <linearGradient id="colorTree" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="transparent" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fontWeight: 550 }} stroke="transparent" width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {CATEGORY_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Recent analyses Grid table */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm flex flex-col">
          {/* Header & Search / Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 border-b border-zinc-150 dark:border-zinc-850">
            <div>
              <h2 className="font-extrabold text-zinc-850 dark:text-white text-sm tracking-tight uppercase select-none">Recent Analyses Database</h2>
              <p className="text-[11px] text-zinc-450 dark:text-zinc-500 font-medium mt-0.5">Filter, sort, and export visual snapshots.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="search"
                  placeholder="Filter database..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-350 transition-all font-mono shadow-inner"
                />
              </div>

              {/* Export button */}
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="text-xs font-bold border-zinc-200 flex items-center gap-1.5 shadow-sm"
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Export CSV
              </Button>
            </div>
          </div>

          {/* Interactive Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-150 dark:border-zinc-850 select-none text-zinc-400 font-bold uppercase tracking-wider font-mono">
                  <th 
                    onClick={() => toggleSort("name")}
                    className="px-5 py-3 cursor-pointer hover:bg-zinc-100/40 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Algorithm</span>
                      {sortField === "name" && (sortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort("category")}
                    className="px-5 py-3 cursor-pointer hover:bg-zinc-100/40 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Category</span>
                      {sortField === "category" && (sortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort("lang")}
                    className="px-5 py-3 cursor-pointer hover:bg-zinc-100/40 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Language</span>
                      {sortField === "lang" && (sortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort("complexity")}
                    className="px-5 py-3 cursor-pointer hover:bg-zinc-100/40 dark:hover:bg-zinc-800/40 transition-colors animate-scale"
                  >
                    <div className="flex items-center gap-1">
                      <span>Complexity</span>
                      {sortField === "complexity" && (sortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort("time")}
                    className="px-5 py-3 cursor-pointer hover:bg-zinc-100/40 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Triggered</span>
                      {sortField === "time" && (sortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                    </div>
                  </th>
                  <th className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                {filteredAndSortedAnalyses.map(a => (
                  <tr key={a.id} className="hover:bg-zinc-100/40 dark:hover:bg-zinc-900/40 transition-colors group">
                    <td className="px-5 py-3.5 font-bold text-zinc-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-500">
                          <Code2 className="w-3.5 h-3.5" />
                        </div>
                        <span>{a.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400 font-semibold">{a.category}</td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-zinc-450 dark:text-zinc-500">{a.lang}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant="default" className="text-[10px] font-mono">{a.complexity}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-405 font-medium">{a.time}</td>
                    <td className="px-5 py-3.5 text-center">
                      <Link to="/app">
                        <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-indigo-500/10">
                          <Play className="w-3 h-3 fill-current text-indigo-500" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredAndSortedAnalyses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-zinc-450 dark:text-zinc-500 font-bold">
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Quick start */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
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
                <Button variant="outline" size="sm" className="w-full text-xs font-bold border-zinc-200 hover:border-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/30 flex items-center justify-center gap-1.5" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
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
