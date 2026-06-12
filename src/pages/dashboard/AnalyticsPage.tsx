import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
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
  { stage: "Page views",    value: 1240, pct: 100 },
  { stage: "Visualizer opened", value: 748, pct: 60 },
  { stage: "Code pasted",   value: 412, pct: 33 },
  { stage: "Analyzed",      value: 247, pct: 20 },
  { stage: "Shared",        value: 64,  pct: 5 },
];

const STAT_CARDS = [
  { label: "Total analyses",  value: "247",   delta: "+12%", icon: Zap,         color: "text-indigo-500",  bg: "bg-indigo-50 dark:bg-indigo-950/50" },
  { label: "Active users",    value: "1,248", delta: "+8%",  icon: Users,       color: "text-violet-500",  bg: "bg-violet-50 dark:bg-violet-950/50" },
  { label: "Avg session",     value: "4m 32s",delta: "+3%",  icon: Clock,       color: "text-cyan-500",    bg: "bg-cyan-50 dark:bg-cyan-950/50" },
  { label: "Retention (30d)", value: "68%",   delta: "+5%",  icon: TrendingUp,  color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
];

export function AnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Usage metrics and growth insights.</p>
        </div>
        <Badge variant="primary">Last 30 days</Badge>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(s => (
          <Card key={s.label} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <Badge variant="success" className="text-[10px]">{s.delta}</Badge>
            </div>
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Area chart — 30 day trend */}
      <Card className="p-5">
        <h2 className="font-bold text-zinc-900 dark:text-white text-sm mb-4">Analyses — Last 30 Days</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={MONTHLY} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="grad30" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="transparent" interval={4} />
            <YAxis tick={{ fontSize: 10 }} stroke="transparent" />
            <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11 }} />
            <Area type="monotone" dataKey="analyses" stroke="#6366f1" strokeWidth={2} fill="url(#grad30)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly breakdown */}
        <Card className="lg:col-span-2 p-5">
          <h2 className="font-bold text-zinc-900 dark:text-white text-sm mb-4">Weekly Breakdown</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={WEEKLY} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="transparent" />
              <YAxis tick={{ fontSize: 11 }} stroke="transparent" />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11 }} />
              <Bar dataKey="analyses" fill="#6366f1" radius={[4, 4, 0, 0]} name="Analyses" />
              <Bar dataKey="apiCalls" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="API Calls" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie chart — by category */}
        <Card className="p-5">
          <h2 className="font-bold text-zinc-900 dark:text-white text-sm mb-4">By Category</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {PIE_DATA.map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.fill }} />
                  <span className="text-xs text-zinc-600 dark:text-zinc-300">{d.name}</span>
                </div>
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{d.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Funnel */}
      <Card className="p-5">
        <h2 className="font-bold text-zinc-900 dark:text-white text-sm mb-5">Conversion Funnel</h2>
        <div className="space-y-3">
          {FUNNEL.map((f, i) => (
            <div key={f.stage}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-zinc-700 dark:text-zinc-200">{f.stage}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">{f.value.toLocaleString()}</span>
                  <span className="text-xs text-zinc-400 w-10 text-right">{f.pct}%</span>
                </div>
              </div>
              <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${f.pct}%`, background: `hsl(${240 - i * 30}, 80%, 60%)` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Retention cohort hint */}
      <Card className="p-5">
        <h2 className="font-bold text-zinc-900 dark:text-white text-sm mb-4">User Retention (Week-over-Week)</h2>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={WEEKLY} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="transparent" />
            <YAxis tick={{ fontSize: 11 }} stroke="transparent" />
            <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11 }} />
            <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} name="Active Users" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
