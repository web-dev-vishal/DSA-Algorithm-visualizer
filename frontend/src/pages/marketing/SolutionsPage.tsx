import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Users, ShieldCheck, ArrowRight, Play, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

const SOLUTIONS = [
  {
    id: "students",
    icon: GraduationCap,
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    tag: "For Students & Learners",
    title: "Master Data Structures & Ace Technical Interviews",
    desc: "Stop trying to memorize code patterns. Visually step through dynamic comparisons, assignments, and pointers to build a lasting mental model. Perfect for computer science coursework and LeetCode preparation.",
    features: [
      "Step-by-step playback with 5 speed controls",
      "Line-by-line code annotations and AI descriptions",
      "Detailed Big-O time and space complexity calculators",
      "Instant share links to get help from peers or mentors"
    ],
    cta: "Start Studying Free"
  },
  {
    id: "educators",
    icon: BookOpen,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    tag: "For Educators & Academics",
    title: "Enrich Lectures with Interactive Visual Demonstrations",
    desc: "Explain complex tree traversals, dynamic programming tables, and graph searches with clarity. Save lecture prep time by letting the AI instantly build visualization steps for any custom script.",
    features: [
      "Classroom presentation playback controls",
      "Generate static step-by-step PDF slide links",
      "Support for custom code input and arrays",
      "Ad-free workspace with community solutions feed"
    ],
    cta: "Get Academic Plan"
  },
  {
    id: "teams",
    icon: Users,
    color: "text-sky-500",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    tag: "For Engineering Teams",
    title: "Standardize Best Practices & Code Reviews",
    desc: "Review algorithm efficiency, compare recursive call trees, and debug structural issues collaboratively. Share state-preserving workspaces and preserve search logs across team libraries.",
    features: [
      "Shared collaborative algorithm workspaces",
      "Interactive code history and analytics logging",
      "Role selection matrices for secure adjustments",
      "API integrations for automated script analysis"
    ],
    cta: "Start Team Trial"
  },
  {
    id: "enterprise",
    icon: ShieldCheck,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    tag: "For Enterprise Organizations",
    title: "Scale Integrations with High-Performance API Keys",
    desc: "Integrate automatic Big-O analysis and runtime logic checks directly into your CI pipeline. Receive guaranteed SLAs, SSO integrations, webhook events list, and dedicated support lines.",
    features: [
      "Production-ready secure REST API keys",
      "CI linting hooks and Slack message integrations",
      "Guaranteed uptime SLAs & private hosting options",
      "Single Sign-On (SSO) and SOC2 security standards"
    ],
    cta: "Contact Enterprise Sales"
  }
];

export function SolutionsPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [location]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 }
    }
  } as const;

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 min-h-screen pt-24 font-sans transition-colors duration-300">
      
      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section className="py-16 px-4 text-center max-w-4xl mx-auto relative z-10">
        <Badge variant="primary" className="mb-4">Use Cases & Solutions</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-5 leading-tight">
          Visual CS Concepts Tailored for{" "}
          <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 bg-clip-text text-transparent">
            Every Developer
          </span>
        </h1>
        <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          Explore customized workflows built to optimize learning, streamline computer science instruction, and scale enterprise code linting.
        </p>
      </section>

      {/* ── SOLUTIONS LISTING ────────────────────────────────────── */}
      <section className="px-4 pb-24 relative z-10">
        <div className="max-w-5xl mx-auto space-y-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-16"
          >
            {SOLUTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.id}
                  id={s.id}
                  variants={itemVariants}
                  className="scroll-mt-24 p-8 sm:p-10 rounded-2xl glass-card border border-zinc-200/60 dark:border-zinc-850/60 shadow-md flex flex-col lg:flex-row gap-10 items-stretch"
                >
                  {/* Left Column: Visual graphic container */}
                  <div className="w-full lg:w-2/5 flex flex-col justify-between items-center bg-zinc-100/50 dark:bg-zinc-900/35 border border-zinc-200/50 dark:border-zinc-850/50 rounded-xl p-8 relative overflow-hidden min-h-[220px]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className={`w-16 h-16 rounded-2xl ${s.bg} flex items-center justify-center shadow-sm z-10`}>
                      <Icon className={`w-8 h-8 ${s.color}`} />
                    </div>

                    <div className="text-center z-10 mt-6">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest block mb-1.5">Typical Role</span>
                      <span className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200">{s.tag}</span>
                    </div>
                  </div>

                  {/* Right Column: Text and features */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Badge variant="primary" className="mb-3">{s.tag}</Badge>
                      <h2 className="text-2xl font-black text-zinc-900 dark:text-white leading-snug mb-3">
                        {s.title}
                      </h2>
                      <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                        {s.desc}
                      </p>

                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
                        {s.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-650 dark:text-zinc-350">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <Link to="/signup">
                        <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                          {s.cta}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── CALL TO ACTION ─────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-zinc-900/35 border-t border-zinc-200/50 dark:border-zinc-850/50 text-center relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-4">
            Accelerate Your Computer Science Journey
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl mx-auto mb-8">
            Experience step-by-step live code simulation and instant Big-O analysis today. Free to get started, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Get Started Free
              </Button>
            </Link>
            <Link to="/app" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full" leftIcon={<Play className="w-3.5 h-3.5 fill-current text-indigo-500" />}>
                Open Interactive Visualizer
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
