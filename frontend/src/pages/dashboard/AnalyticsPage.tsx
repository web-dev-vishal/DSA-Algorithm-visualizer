import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { TrendingUp, Users, Zap, Clock } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

const WEEKLY = [
  { day: "Mon", analyses: 12, apiCalls: 45, users: 3 },
  { day: "Tue", analyses: 19, apiCalls: 67, users: 5 },
  { day: "Wed", analyses: 8,  apiCalls: 38, users: 2 },
  { day: "Thu", analyses: 24, apiCalls: 89, users: 7 },
  { day: "Fri", analyses: 31, apiCalls: 112,users: 9 },
  { day: "Sat", analyses: 15, apiCalls: 54, users: 4 },
  { day: "Sun", analyses: 22, apiCalls: 78, users: 6 },
];

const MONTHLY = Array.from({ length: 30 }, (_, i) => ({
  day: `Jun ${i + 1}`,
  analyses: Math.floor(Math.random() * 30) + 5,
}));

const PIE_DATA = [
  { name: "Sorting",       value: 38, fill: "#6366f1" },
  { name: "DP",            value: 22, fill: "#8b5cf6" },
  { name: "Searching",     value: 18, fill: "#06b6d4" },
  { name: "Two Pointers",  value: 12, fill: "#10b981" },
  { name: "Tree/Graph",    value: 10, fill: "#f59e0b" },
];

const FUNNEL = [
  { stage: "Page Views",    value: 1240, pct: 100 },
  { stage: "Visualizer Opened", value: 748, pct: 60 },
  { stage: "Code Pasted",   value: 412, pct: 33 },
  { stage: "Analyzed Successfully",      value: 247, pct: 20 },
  { stage: "Runs Shared",        value: 64,  pct: 5 },
];

const STAT_CARDS = [
  { label: "Total Analyses",  value: "247",   delta: "+12%", icon: Zap,         color: "text-indigo-500",  bg: "bg-indigo-50 dark:bg-indigo-950/60" },
  { label: "Active Users",    value: "1,248", delta: "+8%",  icon: Users,       color: "text-violet-500",  bg: "bg-violet-50 dark:bg-violet-950/60" },
  { label: "Avg Session",     value: "4m 32s",delta: "+3%",  icon: Clock,       color: "text-cyan-500",    bg: "bg-cyan-50 dark:bg-cyan-950/60" },
  { label: "Retention (30d)", value: "68%",   delta: "+5%",  icon: TrendingUp,  color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/60" },
];

export function AnalyticsPage() {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 14 } }
  } as const;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto space-y-6"
    >
      {/* Title Header */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-850 pb-5"
      >
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">System Analytics</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-455 mt-1 font-medium">Usage logs, metrics, and compilation conversion funnels.</p>
        </div>
        <Badge variant="primary" className="shadow-sm font-semibold w-fit">Last 30 Days</Badge>
      </motion.div>

      {/* KPI Cards */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
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

      {/* 30 Day Trend Graph */}
      <motion.div variants={itemVariants}>
        <Card className="p-5 glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm">
          <h2 className="font-extrabold text-zinc-850 dark:text-white text-sm tracking-tight uppercase select-none mb-5">Analyses Trend line</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="grad30" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-zinc-850" />
              <XAxis dataKey="day" tick={{ fontSize: 9, fontWeight: 500 }} stroke="transparent" interval={4} className="text-zinc-400" />
              <YAxis tick={{ fontSize: 9, fontWeight: 500 }} stroke="transparent" className="text-zinc-400" />
              <Tooltip
                contentStyle={{ 
                  background: "rgba(255, 255, 255, 0.9)", 
                  border: "1px solid #e4e4e7", 
                  borderRadius: 12, 
                  fontSize: 11,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                }}
              />
              <Area type="monotone" dataKey="analyses" stroke="#6366f1" strokeWidth={2.5} fill="url(#grad30)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Grid: Weekly & Category */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Weekly breakdown */}
        <Card className="lg:col-span-2 p-5 glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm">
          <h2 className="font-extrabold text-zinc-850 dark:text-white text-sm tracking-tight uppercase select-none mb-5">Weekly API vs Analysis Execution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WEEKLY} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-zinc-850" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 500 }} stroke="transparent" className="text-zinc-400" />
              <YAxis tick={{ fontSize: 10, fontWeight: 500 }} stroke="transparent" className="text-zinc-400" />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 11 }} />
              <Bar dataKey="analyses" fill="#6366f1" radius={[4, 4, 0, 0]} name="Analyses" />
              <Bar dataKey="apiCalls" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="API Calls" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie chart — by category */}
        <Card className="p-5 glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-extrabold text-zinc-850 dark:text-white text-sm tracking-tight uppercase select-none mb-4">Algorithm Categorization</h2>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={42} outerRadius={65} dataKey="value" paddingAngle={2}>
                  {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {PIE_DATA.map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.fill }} />
                  <span className="text-[11px] font-semibold text-zinc-550 dark:text-zinc-400">{d.name}</span>
                </div>
                <span className="text-xs font-black text-zinc-850 dark:text-zinc-200">{d.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Conversion Funnel */}
      <motion.div variants={itemVariants}>
        <Card className="p-5 glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm">
          <h2 className="font-extrabold text-zinc-850 dark:text-white text-sm tracking-tight uppercase select-none mb-6">User Conversion Funnel</h2>
          <div className="space-y-4">
            {FUNNEL.map((f) => (
              <div key={f.stage}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">{f.stage}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white">{f.value.toLocaleString()}</span>
                    <span className="text-xs font-bold text-zinc-400 w-10 text-right">{f.pct}%</span>
                  </div>
                </div>
                <div className="h-2.5 bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${f.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full shadow"
                    style={{ background: `linear-gradient(90deg, #6366f1, #8b5cf6)` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* User Retention Weekly Line graph */}
      <motion.div variants={itemVariants}>
        <Card className="p-5 glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm">
          <h2 className="font-extrabold text-zinc-850 dark:text-white text-sm tracking-tight uppercase select-none mb-4">User Activity Retention (WoW)</h2>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={WEEKLY} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-zinc-850" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 500 }} stroke="transparent" className="text-zinc-400" />
              <YAxis tick={{ fontSize: 10, fontWeight: 500 }} stroke="transparent" className="text-zinc-400" />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 11 }} />
              <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: "#10b981" }} name="Active Users" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>
    </motion.div>
  );
}
