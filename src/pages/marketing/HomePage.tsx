import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Play, Zap, Code2, BarChart3, Shield, Users, Star, 
  Sparkles, HelpCircle, ChevronDown
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { ThreeHero } from "../../components/ui/ThreeHero";
import { clsx } from "clsx";

const FEATURES = [
  { 
    icon: Zap, 
    color: "text-indigo-500", 
    bg: "bg-indigo-50 dark:bg-indigo-950/40", 
    title: "AI-Powered Analysis", 
    desc: "Paste any DSA code and get instant Big-O analysis, bug detection, and step-by-step breakdowns powered by advanced LLMs." 
  },
  { 
    icon: Play, 
    color: "text-emerald-500", 
    bg: "bg-emerald-50 dark:bg-emerald-950/40", 
    title: "Live Visualization", 
    desc: "Watch your algorithm execute in real time. Every comparison, swap, and pointer move is animated with full playback control." 
  },
  { 
    icon: Code2, 
    color: "text-violet-500", 
    bg: "bg-violet-50 dark:bg-violet-950/40", 
    title: "15+ Algorithms Demos", 
    desc: "Sorting, searching, two pointers, sliding window, DP, trees, graphs — all with interactive demos and custom inputs." 
  },
  { 
    icon: BarChart3, 
    color: "text-cyan-500", 
    bg: "bg-cyan-50 dark:bg-cyan-950/40", 
    title: "Complexity Metrics", 
    desc: "Automatic asymptotic time and space complexity detection with clear descriptions and mathematical proof checks." 
  },
  { 
    icon: Shield, 
    color: "text-amber-500", 
    bg: "bg-amber-50 dark:bg-amber-950/40", 
    title: "Bug & Edge Case Checks", 
    desc: "The AI flags syntax errors, explains logic bugs, and displays corrected code versions side-by-side with original code." 
  },
  { 
    icon: Users, 
    color: "text-rose-500", 
    bg: "bg-rose-50 dark:bg-rose-950/40", 
    title: "Workspace Shareable Link", 
    desc: "Generate read-only links of execution runs to share code snapshots and pointer states with team members or students." 
  },
];

const TESTIMONIALS = [
  { 
    name: "Priya Sharma", 
    role: "Software Engineer @ Google", 
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Priya", 
    quote: "AlgoViz Pro is the best tool I've used to prep for FAANG interviews. The step-by-step visualization makes complex tree traversals crystal clear.", 
    stars: 5 
  },
  { 
    name: "Marcus Chen", 
    role: "CS Professor @ MIT", 
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Marcus", 
    quote: "I use this in my algorithms class. Students grasp sorting concepts in minutes instead of hours. The AI explanations are pedagogical and accurate.", 
    stars: 5 
  },
  { 
    name: "Aisha Okafor", 
    role: "Senior Dev @ Stripe", 
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Aisha", 
    quote: "The bug detection feature caught a subtle off-by-one pointer error in my quickselect code. Saved me hours of headache.", 
    stars: 5 
  },
];

const STATS = [
  { value: "50,000+", label: "Active Developers" },
  { value: "2M+", label: "Analyses Run" },
  { value: "15+", label: "Pre-loaded Demos" },
  { value: "4.9/5", label: "Lighthouse Rating" },
];

const FAQS = [
  { 
    q: "How does the AI visualize my custom code?", 
    a: "When you enter code and hit analyze, our AI maps execution paths, generates step-by-step array states, assigns pointers (like i, j, left, right), and drafts contextual descriptions explaining exactly what is occurring at each code line." 
  },
  { 
    q: "What programming languages are supported?", 
    a: "We support Python, C++, Java, JavaScript, TypeScript, and Go. The visualizer is language-agnostic and can correctly parse custom logic across all standard formats." 
  },
  { 
    q: "Can I try the visualizer without an account?", 
    a: "Yes! By clicking 'Try it now' you can access our visualizer workspace immediately without signing up. The free plan has limit caps but allows full interactive controls." 
  },
  { 
    q: "How do I hook my team workspace up?", 
    a: "Our Pro and Team workspaces allow sharing. You can save code snippets, pointer state bookmarks, and collaborative notes in libraries that are shared across your team or classroom." 
  }
];

/* ─── MiniVisualizer ─── */
function MiniVisualizer() {
  const [arr, setArr] = useState([7, 3, 9, 2, 5]);
  const [activeIdxs, setActiveIdxs] = useState<number[]>([]);
  const [swapIdxs, setSwapIdxs] = useState<number[]>([]);
  const [doneIdxs, setDoneIdxs] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [msg, setMsg] = useState("Click 'Run Preview' to start Bubble Sort");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startBubbleSort = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setDoneIdxs([]);
    setActiveIdxs([]);
    setSwapIdxs([]);
    
    const stepsQueue: Array<{ arr: number[]; act: number[]; swp: number[]; dn: number[]; msg: string }> = [];
    const a = [...arr];
    const n = a.length;
    const currentDone: number[] = [];
    
    // Generate queue
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        stepsQueue.push({
          arr: [...a],
          act: [j, j + 1],
          swp: [],
          dn: [...currentDone],
          msg: `Comparing elements: ${a[j]} and ${a[j+1]}`
        });
        if (a[j]! > a[j + 1]!) {
          const temp = a[j]!;
          a[j] = a[j + 1]!;
          a[j + 1] = temp;
          stepsQueue.push({
            arr: [...a],
            act: [],
            swp: [j, j + 1],
            dn: [...currentDone],
            msg: `Swap: ${temp} > ${a[j]}. Swapping elements.`
          });
        }
      }
      currentDone.push(n - 1 - i);
    }
    currentDone.push(0);
    stepsQueue.push({
      arr: [...a],
      act: [],
      swp: [],
      dn: [...currentDone],
      msg: `Bubble Sort complete! Sorted: ${JSON.stringify(a)}`
    });

    let currentStep = 0;
    const nextTick = () => {
      if (currentStep >= stepsQueue.length) {
        setIsPlaying(false);
        return;
      }
      const step = stepsQueue[currentStep]!;
      setArr(step.arr);
      setActiveIdxs(step.act);
      setSwapIdxs(step.swp);
      setDoneIdxs(step.dn);
      setMsg(step.msg);
      currentStep++;
      timerRef.current = setTimeout(nextTick, 1000);
    };

    nextTick();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPlaying(false);
    setArr([7, 3, 9, 2, 5]);
    setActiveIdxs([]);
    setSwapIdxs([]);
    setDoneIdxs([]);
    setMsg("Preview reset. Click 'Run Preview' to start");
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 bg-zinc-50 dark:bg-zinc-900/60 shadow-sm flex flex-col gap-3 font-sans text-left">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">Interactive Sandbox Preview</span>
        <div className="flex gap-1.5">
          <button
            onClick={startBubbleSort}
            disabled={isPlaying}
            className="text-[10px] font-bold px-2 py-1 rounded bg-indigo-650 hover:bg-indigo-700 text-white disabled:opacity-50 cursor-pointer select-none transition-colors"
          >
            Run Preview
          </button>
          <button
            onClick={reset}
            className="text-[10px] font-bold px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer select-none transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
      
      <div className="flex justify-center items-end gap-2.5 h-14 py-1 select-none">
        {arr.map((val, idx) => {
          const isActive = activeIdxs.includes(idx);
          const isSwapping = swapIdxs.includes(idx);
          const isDone = doneIdxs.includes(idx);
          
          let cellCls = "bg-white border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-850 dark:text-zinc-350";
          if (isSwapping) {
            cellCls = "bg-purple-500/10 border-purple-500 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300";
          } else if (isActive) {
            cellCls = "bg-blue-500/10 border-blue-500 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300";
          } else if (isDone) {
            cellCls = "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300";
          }

          return (
            <motion.div
              layout
              key={`mini-cell-${idx}-${val}`}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={clsx(
                "w-10 h-10 border-2 rounded-lg flex items-center justify-center font-black text-sm",
                cellCls
              )}
            >
              {val}
            </motion.div>
          );
        })}
      </div>
      
      <p className="text-[11px] text-zinc-500 dark:text-zinc-450 leading-relaxed font-mono min-h-[1.5rem] bg-white dark:bg-zinc-950/50 p-2 rounded-lg border border-zinc-200/50 dark:border-zinc-850/50">
        {msg}
      </p>
    </div>
  );
}

export function HomePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 100, damping: 15 } 
    }
  } as const;

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 overflow-x-hidden min-h-screen">
      {/* ── HERO SECTION ─────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-20 px-4 aurora-bg">
        {/* React Three Fiber 3D Background */}
        <ThreeHero />

        {/* Floating geometric decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <div className="absolute top-[20%] left-[10%] w-24 h-24 rounded-3xl bg-indigo-500/10 dark:bg-indigo-500/5 blur-xl animate-float" />
          <div className="absolute bottom-[30%] right-[10%] w-32 h-32 rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-xl animate-float" style={{ animationDelay: "2s" }} />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 glass-card px-4 py-1.5 rounded-full mb-8 shadow-sm border border-indigo-150/40"
          >
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-650 dark:text-indigo-400 tracking-wide">
              Transforming DSA Learning with AI
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, type: "spring", stiffness: 80 }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-6 leading-[1.08]"
          >
            Understand Algorithms,
            <br />
            <span className="text-gradient-purple-indigo">
              One Frame at a Time
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-zinc-650 dark:text-zinc-400 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Paste your code in C++, Python, Java, or JavaScript. Watch our interactive engine visualize execution arrays, trace pointers, and flag runtime bugs instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full sm:w-auto"
          >
            <Link to="/signup" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-indigo-500/25 shadow-lg flex items-center justify-center gap-2 group">
                Get Started Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/app" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto flex items-center justify-center gap-2 glass">
                <Play className="w-4 h-4 fill-current text-indigo-500" /> Live Visualizer
              </Button>
            </Link>
          </motion.div>

          {/* Editor Sandbox Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, type: "spring", stiffness: 60 }}
            className="w-full max-w-4xl mx-auto rounded-2xl border border-zinc-200 dark:border-zinc-850 shadow-2xl overflow-hidden bg-white dark:bg-zinc-950 text-left"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-850 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-3 text-xs text-zinc-500 dark:text-zinc-550 font-mono">quickselect.py</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                Python 3
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 font-mono text-xs sm:text-sm leading-relaxed p-6 gap-6">
              <div className="md:col-span-7 flex flex-col text-zinc-700 dark:text-zinc-450 overflow-x-auto">
                {[
                  "def partition(arr, low, high):",
                  "    pivot = arr[high]",
                  "    i = low - 1",
                  "    for j in range(low, high):",
                  "        if arr[j] <= pivot:",
                  "            i += 1",
                  "            arr[i], arr[j] = arr[j], arr[i]",
                  "    arr[i+1], arr[high] = arr[high], arr[i+1]",
                  "    return i + 1"
                ].map((line, idx) => {
                  const active = idx === 6;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start px-2 py-0.5 rounded border-l-2 ${
                        active 
                          ? "bg-indigo-500/10 border-indigo-500 text-indigo-650 dark:text-indigo-300 font-semibold" 
                          : "border-transparent"
                      }`}
                    >
                      <span className="w-5 text-right text-zinc-400 dark:text-zinc-650 pr-3 select-none text-[11px]">{idx + 1}</span>
                      <span className="whitespace-pre">{line}</span>
                    </div>
                  );
                })}
              </div>

              <div className="md:col-span-5 flex flex-col justify-center border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-850 pt-4 md:pt-0 md:pl-6">
                <MiniVisualizer />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scrolling Marquee Logo Cloud */}
      <div className="overflow-hidden py-10 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-850 select-none">
        <div className="max-w-6xl mx-auto px-4 mb-6 text-center">
          <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Empowering students and engineers from global scale CS hubs</p>
        </div>
        <div className="relative flex w-full overflow-hidden">
          <div className="animate-marquee flex items-center gap-16 whitespace-nowrap">
            {["Google", "MIT", "Stripe", "Stanford", "Meta", "Apple", "Vercel", "Microsoft", "Netflix", "Amazon"].map((logo, idx) => (
              <span key={idx} className="text-base sm:text-lg font-black text-zinc-450/40 dark:text-zinc-650/30 tracking-wider">
                {logo}
              </span>
            ))}
            {/* Double for continuous scroll */}
            {["Google", "MIT", "Stripe", "Stanford", "Meta", "Apple", "Vercel", "Microsoft", "Netflix", "Amazon"].map((logo, idx) => (
              <span key={`dup-${idx}`} className="text-base sm:text-lg font-black text-zinc-450/40 dark:text-zinc-650/30 tracking-wider">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS SECTION ────────────────────────────────────────────── */}
      <section className="border-y border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900/30 py-12 relative z-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {STATS.map((s, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                className="text-center group"
              >
                <p className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight group-hover:scale-105 transition-transform duration-250">
                  {s.value}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-450 mt-1 select-none font-medium">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES SECTION ─────────────────────────────────────────── */}
      <section className="py-24 px-4 relative z-20" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="primary" className="mb-4 shadow-sm">Core Platform Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
              Everything Needed to Master Complex Algorithms
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
              Skip static visualizers. Learn visually with responsive animations powered by advanced structural models.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map((f, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="p-6 rounded-2xl glass-card border border-zinc-200/60 dark:border-zinc-850/60 flex flex-col shadow-sm hover:shadow-indigo-500/5 hover:-translate-y-1 hover:border-indigo-400/30 transition-all duration-300 group"
              >
                <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4 transition-colors group-hover:bg-indigo-600`}>
                  <f.icon className={`w-5 h-5 ${f.color} group-hover:text-white transition-colors`} />
                </div>
                <h3 className="font-bold text-zinc-900 dark:text-white mb-2 text-base">{f.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed flex-1">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ─────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white dark:bg-zinc-900/30 border-y border-zinc-200/50 dark:border-zinc-850/50 relative z-20">
        <div className="max-w-5xl mx-auto text-center">
          <Badge variant="primary" className="mb-4">Workflow</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-16">
            From Code to Visual Concept in 3 Steps
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
            {[
              { 
                step: "01", 
                title: "Input Code or Load Demo", 
                desc: "Paste your sorting, searching, DP, or tree code in your preferred programming language, or load from our responsive demos library." 
              },
              { 
                step: "02", 
                title: "AI Analysis Execution", 
                desc: "Our model validates code correctness, runs logical checks, evaluates complexity metrics, and outputs standard execution indices." 
              },
              { 
                step: "03", 
                title: "Interactive Visualization", 
                desc: "Trace lines, watch indices swap dynamically, slow down speed, skip loops, and inspect variables frame-by-frame." 
              },
            ].map((s, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="relative bg-zinc-50 dark:bg-zinc-900/40 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-850 shadow-sm"
              >
                <div className="text-5xl font-black text-indigo-150 dark:text-indigo-900/60 mb-4 font-mono select-none">{s.step}</div>
                <h3 className="font-bold text-zinc-900 dark:text-white mb-2 text-base">{s.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ─────────────────────────────────────── */}
      <section className="py-24 px-4 relative z-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="primary" className="mb-4">Wall of Love</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
              Trusted by Engineers, Students & CS Tutors
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-6 rounded-2xl glass-card border border-zinc-200/70 dark:border-zinc-850/70 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex gap-0.5 mb-4 select-none">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-zinc-650 dark:text-zinc-300 leading-relaxed mb-6 italic">"{t.quote}"</p>
                </div>
                <div className="flex items-center gap-3 border-t border-zinc-100 dark:border-zinc-800/60 pt-4">
                  <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200/50" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">{t.name}</p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ──────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white dark:bg-zinc-900/30 border-t border-zinc-250/50 dark:border-zinc-850/50 relative z-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="primary" className="mb-4">FAQs</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx}
                  className="border border-zinc-200 dark:border-zinc-850 rounded-xl overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/20"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-semibold text-zinc-900 dark:text-white hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30 transition-colors"
                  >
                    <span className="flex items-center gap-3 text-sm sm:text-base">
                      <HelpCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="p-5 pt-0 text-sm text-zinc-500 dark:text-zinc-450 border-t border-zinc-150 dark:border-zinc-850 leading-relaxed font-sans">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA SECTION ────────────────────────────────────────── */}
      <section className="py-24 px-4 relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-8 sm:p-12 rounded-3xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900/40 shadow-xl relative overflow-hidden"
          >
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />

            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mb-4 leading-tight">
              Ready to Visualize Your First Algorithm?
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-xl mx-auto text-sm sm:text-base">
              Join 50,000+ developers, teachers, and computer science students learning algorithms visually.
            </p>
            <Link to="/signup">
              <Button variant="primary" size="lg" className="shadow-lg shadow-indigo-500/20 px-8 flex items-center justify-center gap-2 mx-auto">
                Start for Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
