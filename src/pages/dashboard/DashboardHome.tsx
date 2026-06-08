import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";import { Code2, Zap, ArrowRight, Play, Star, Activity } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../hooks/useAuth";

// Mock analytics data
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {greeting}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Here's what's happening with your algorithms today.
          </p>
        </div>
        <Link to="/app">
          <Button variant="primary" leftIcon={<Play className="w-3.5 h-3.5" />}>
            New visualization
          </Button>
        </Link>
      </div>

      {/* Usage limit bar (for free users) */}
      {user?.plan === "free" && (
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">7 of 10 free analyses used this month</p>
            <div className="w-48 h-1.5 bg-indigo-200 dark:bg-indigo-900 rounded-full mt-2">
              <div className="w-[70%] h-full bg-indigo-500 rounded-full" />
            </div>
          </div>
          <Link to="/dashboard/billing">
            <Button variant="primary" size="sm">Upgrade for unlimited</Button>
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(s => (
          <Card key={s.label} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-4.5 h-4.5 ${s.color}`} style={{ width: "1.125rem", height: "1.125rem" }} />
              </div>
              <Badge variant="success" className="text-[10px]">{s.delta}</Badge>
            </div>
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-zinc-900 dark:text-white text-sm">Analyses This Week</h2>
            <Badge variant="primary">Last 7 days</Badge>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={DAILY_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="transparent" tickLine={false} className="text-zinc-500" />
              <YAxis tick={{ fontSize: 11 }} stroke="transparent" tickLine={false} className="text-zinc-500" />
              <Tooltip
                contentStyle={{ background: "var(--tw-prose-body, #fff)", border: "1px solid #e4e4e7", borderRadius: 12, fontSize: 12 }}
              />
              <Area type="monotone" dataKey="analyses" stroke="#6366f1" strokeWidth={2} fill="url(#colorAnalyses)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Category bar chart */}
        <Card className="p-5">
          <h2 className="font-bold text-zinc-900 dark:text-white text-sm mb-4">By Category</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={CATEGORY_DATA} layout="vertical" margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="transparent" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="transparent" width={80} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11 }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent analyses */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="font-bold text-zinc-900 dark:text-white text-sm">Recent Analyses</h2>
          <Link to="/dashboard/history" className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
          {RECENT_ANALYSES.map(a => (
            <div key={a.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center flex-shrink-0">
                <Code2 className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{a.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{a.category} · {a.lang}</p>
              </div>
              <Badge variant="default" className="hidden sm:flex">{a.complexity}</Badge>
              <p className="text-xs text-zinc-400 whitespace-nowrap">{a.time}</p>
              <Link to="/app" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon">
                  <Play className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick start */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: "⚡", title: "Run a visualization", desc: "Analyze any algorithm instantly", href: "/app", cta: "Open visualizer" },
          { icon: "👥", title: "Invite your team", desc: "Collaborate on algorithms together", href: "/dashboard/team", cta: "Invite members" },
          { icon: "📖", title: "Read the docs", desc: "Learn about all features and the API", href: "/docs", cta: "View docs" },
        ].map(q => (
          <Card key={q.title} hover className="p-5">
            <div className="text-3xl mb-3">{q.icon}</div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-sm mb-1">{q.title}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">{q.desc}</p>
            <Link to={q.href}>
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                {q.cta}
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
