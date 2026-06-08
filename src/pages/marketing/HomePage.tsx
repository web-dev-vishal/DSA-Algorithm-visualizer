import { Link } from "react-router-dom";
import { ArrowRight, Play, Zap, Code2, BarChart3, Shield, Users, Star, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

const FEATURES = [
  { icon: Zap, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950", title: "AI-Powered Analysis", desc: "Paste any DSA code and get instant Big-O analysis, bug detection, and step-by-step breakdowns powered by Groq LLMs." },
  { icon: Play, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950", title: "Live Visualization", desc: "Watch your algorithm execute in real time. Every comparison, swap, and pointer move is animated with full playback control." },
  { icon: Code2, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950", title: "15+ Algorithms", desc: "Sorting, searching, two pointers, sliding window, DP, trees, graphs — all with interactive demos and custom inputs." },
  { icon: BarChart3, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950", title: "Complexity Analysis", desc: "Automatic time and space complexity detection with clear explanations and complexity comparisons." },
  { icon: Shield, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950", title: "Bug Detection", desc: "The AI flags bugs in your code, explains what went wrong, and shows a corrected version side by side." },
  { icon: Users, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950", title: "Team Collaboration", desc: "Share analyses with a link, collaborate in team workspaces, and build a shared library of algorithm examples." },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", role: "Software Engineer @ Google", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Priya", quote: "AlgoViz Pro is the best tool I've used to prep for FAANG interviews. The step-by-step visualization makes complex algorithms crystal clear.", stars: 5 },
  { name: "Marcus Chen", role: "CS Professor @ MIT", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Marcus", quote: "I use this in my algorithms class every week. Students grasp sorting concepts in minutes instead of hours. The AI explanations are excellent.", stars: 5 },
  { name: "Aisha Okafor", role: "Senior Dev @ Stripe", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Aisha", quote: "The bug detection feature caught a subtle off-by-one error in my binary search that I'd been staring at for an hour. Saved my day.", stars: 5 },
];

const STATS = [
  { value: "50,000+", label: "Developers" },
  { value: "2M+", label: "Analyses run" },
  { value: "15+", label: "Algorithms" },
  { value: "4.9/5", label: "Average rating" },
];

export function HomePage() {
  return (
    <div className="bg-white dark:bg-zinc-950">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-32 pb-24 px-4">
        {/* Gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
              Now with Llama 3.3 · 70B
            </span>
            <span className="text-indigo-400 dark:text-indigo-600">→</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-6 leading-[1.05]">
            Visualize algorithms
            <br />
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 bg-clip-text text-transparent">
              like never before
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Paste any DSA code. Get AI-powered analysis, step-by-step visualization, Big-O complexity, and bug detection — all in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link to="/signup">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start for free
              </Button>
            </Link>
            <Link to="/app">
              <Button variant="secondary" size="lg" leftIcon={<Play className="w-4 h-4" />}>
                Try it now — no signup
              </Button>
            </Link>
          </div>

          <p className="text-xs text-zinc-400 dark:text-zinc-600">
            No credit card required · Free plan available · Cancel anytime
          </p>
        </div>

        {/* Hero screenshot mockup */}
        <div className="max-w-5xl mx-auto mt-16 relative px-4">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden bg-zinc-950">
            {/* Mockup titlebar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="ml-4 text-xs text-zinc-500 font-mono">AlgoViz Pro — Bubble Sort · O(n²)</span>
            </div>
            {/* Mockup content */}
            <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Array viz mock */}
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Array Visualization</p>
                <div className="flex gap-2 flex-wrap">
                  {[5, 3, 8, 1, 2, 9, 4, 6].map((v, i) => (
                    <div key={i} className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold border font-mono
                      ${i === 1 || i === 2 ? "bg-indigo-500/20 border-indigo-500 text-indigo-300" :
                        i === 7 ? "bg-emerald-500/20 border-emerald-500 text-emerald-300" :
                        "bg-zinc-800 border-zinc-700 text-zinc-300"}`}>
                      {v}
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-zinc-400 font-mono">Comparing arr[1]=3 and arr[2]=8</p>
              </div>
              {/* Metrics mock */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Algorithm", value: "Bubble Sort", color: "text-white" },
                  { label: "Category", value: "Sorting", color: "text-indigo-400" },
                  { label: "Time", value: "O(n²)", color: "text-amber-400" },
                  { label: "Space", value: "O(1)", color: "text-emerald-400" },
                ].map(m => (
                  <div key={m.label} className="bg-zinc-800 rounded-xl p-3 border border-zinc-700">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">{m.label}</p>
                    <p className={`text-base font-bold font-mono ${m.color}`}>{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Glow */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-indigo-500/5 to-transparent rounded-2xl blur-xl" />
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────── */}
      <section className="border-y border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 py-10">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">{s.value}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="primary" className="mb-4">Features</Badge>
            <h2 className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
              Everything you need to master algorithms
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
              From beginner-friendly visualizations to advanced AI analysis — AlgoViz Pro has every tool you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md transition-all duration-200 group">
                <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-bold text-zinc-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="primary" className="mb-4">How it works</Badge>
          <h2 className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
            From code to understanding in 3 steps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left">
            {[
              { step: "01", title: "Paste your code", desc: "Write or paste any DSA algorithm in C++, Python, Java, or JavaScript. Or pick from 15+ built-in demos." },
              { step: "02", title: "AI analyzes it", desc: "Our AI detects the algorithm, finds bugs, calculates complexity, and generates every execution step." },
              { step: "03", title: "Watch it run", desc: "Step through the visualization at your own pace. Every element, pointer, and operation is animated." },
            ].map(s => (
              <div key={s.step} className="relative">
                <div className="text-5xl font-black text-indigo-100 dark:text-indigo-900 mb-3 font-mono">{s.step}</div>
                <h3 className="font-bold text-zinc-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="primary" className="mb-4">Testimonials</Badge>
            <h2 className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
              Trusted by engineers and educators
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing preview ──────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="primary" className="mb-4">Pricing</Badge>
          <h2 className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
            Start free, scale when ready
          </h2>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-8">
            Free plan available. No credit card required. Upgrade anytime.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            {[
              { feature: "10 free analyses/month" },
              { feature: "All visualization features" },
              { feature: "No credit card required" },
            ].map(f => (
              <div key={f.feature} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {f.feature}
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/signup">
              <Button variant="primary" size="lg">Get started for free</Button>
            </Link>
            <Link to="/pricing">
              <Button variant="ghost" size="lg" rightIcon={<ChevronRight className="w-4 h-4" />}>
                View all plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl p-px mb-8">
            <div className="bg-white dark:bg-zinc-950 rounded-[14px] px-8 py-10 w-full">
              <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-4">
                Ready to visualize your first algorithm?
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                Join 50,000+ developers and students using AlgoViz Pro every day.
              </p>
              <Link to="/signup">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Start for free — no credit card
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
