import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Code2, Zap, ArrowRight, Play, Star, Activity, Users, BookOpen } from "lucide-react";
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
];

const CATEGORY_DATA = [
  { name: "Sorting",      count: 18, fill: "#6366f1" },
  { name: "Searching",    count: 12, fill: "#8b5cf6" },
  { name: "DP",           count: 9,  fill: "#06b6d4" },
  { name: "Two Pointers", count: 7,  fill: "#10b981" },
  { name: "Tree",         count: 5,  fill: "#f59e0b" },
];

const STAT_CARDS = [
  { label: "Total Analyses",   value: "247",   delta: "+12%", icon: Code2,     color: "text-indigo-500",  bg: "bg-indigo-50 dark:bg-indigo-950/60" },
  { label: "This Month",       value: "51",    delta: "+8%",  icon: Activity,  color: "text-violet-500",  bg: "bg-violet-50 dark:bg-violet-950/60" },
  { label: "Avg. Steps/Run",   value: "43",    delta: "+5%",  icon: Zap,       color: "text-cyan-500",    bg: "bg-cyan-50 dark:bg-cyan-950/60" },
  { label: "Algorithms Used",  value: "12",    delta: "of 15",icon: Star,      color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-950/60" },
];

export function DashboardHome() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

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
            <h2 className="font-extrabold text-zinc-850 dark:text-white text-sm tracking-tight uppercase select-none">Analyses Trends</h2>
            <Badge variant="primary">Last 7 Days</Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={DAILY_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-zinc-850" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 500 }} stroke="transparent" tickLine={false} className="text-zinc-400" />
              <YAxis tick={{ fontSize: 10, fontWeight: 500 }} stroke="transparent" tickLine={false} className="text-zinc-400" />
              <Tooltip
                contentStyle={{ 
                  background: "rgba(255, 255, 255, 0.9)", 
                  border: "1px solid #e4e4e7", 
                  borderRadius: 12, 
                  fontSize: 11,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                }}
              />
              <Area type="monotone" dataKey="analyses" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorAnalyses)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Category bar chart */}
        <Card className="p-5 glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm">
          <h2 className="font-extrabold text-zinc-850 dark:text-white text-sm tracking-tight uppercase select-none mb-5">Category Split</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CATEGORY_DATA} layout="vertical" margin={{ top: 0, right: 5, left: -25, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="transparent" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fontWeight: 500 }} stroke="transparent" width={80} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11 }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Recent analyses */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-150 dark:border-zinc-850">
            <h2 className="font-extrabold text-zinc-850 dark:text-white text-sm tracking-tight uppercase select-none">Recent Analyses</h2>
            <Link to="/dashboard/history" className="text-xs text-indigo-500 hover:text-indigo-650 dark:text-indigo-400 font-semibold flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-850">
            {RECENT_ANALYSES.map(a => (
              <div key={a.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-100/40 dark:hover:bg-zinc-900/40 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center flex-shrink-0">
                  <Code2 className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{a.name}</p>
                  <p className="text-[11px] text-zinc-450 dark:text-zinc-500 font-medium">{a.category} · {a.lang}</p>
                </div>
                <Badge variant="default" className="hidden sm:flex text-[10px] font-mono">{a.complexity}</Badge>
                <p className="text-[11px] text-zinc-400 font-medium whitespace-nowrap">{a.time}</p>
                <Link to="/app" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <Play className="w-3.5 h-3.5 fill-current text-indigo-500" />
                  </Button>
                </Link>
              </div>
            ))}
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
