import { Link } from "react-router-dom";
import { Zap, BarChart3, Shield, Share2, Cpu, ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

const FEATURES = [
  {
    icon: Zap, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950",
    tag: "AI Engine", title: "AI-Powered Algorithm Analysis",
    desc: "Powered by Groq's ultra-fast inference with Llama 3.3 70B. Paste any DSA code — in C++, Python, Java, or JavaScript — and get instant analysis. The AI identifies the algorithm, category, time/space complexity, and generates every execution step.",
    highlights: ["Groq LLM inference < 1s", "Supports C++, Python, Java, JS", "Detects 30+ algorithm patterns", "Custom array input support"],
  },
  {
    icon: Play, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950",
    tag: "Visualization", title: "Step-by-Step Animation Engine",
    desc: "Every comparison, swap, assignment, and pointer movement is broken down into individual steps. Play, pause, step forward/back, seek to any point, and control playback speed. Pointers are labeled and colored for instant clarity.",
    highlights: ["5 playback speeds", "Step forward/backward", "Seek to any step", "Color-coded cell states"],
  },
  {
    icon: Shield, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950",
    tag: "Bug Detection", title: "Intelligent Bug Detection",
    desc: "The AI doesn't just visualize — it reviews your code for logical errors, off-by-one mistakes, infinite loops, and incorrect comparisons. When bugs are found, it shows the corrected version side by side with a clear explanation.",
    highlights: ["Detects off-by-one errors", "Infinite loop detection", "Side-by-side diff view", "Runs simulation on fixed code"],
  },
  {
    icon: BarChart3, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950",
    tag: "Complexity", title: "Big-O Complexity Analysis",
    desc: "Automatic time and space complexity detection for every algorithm. Complexity is color-coded — green for efficient (O(1), O(log n), O(n)), amber for moderate (O(n log n)), and red for inefficient (O(n²), O(n³)). Includes line-by-line explanations.",
    highlights: ["Time complexity per algorithm", "Space complexity analysis", "Color-coded efficiency rating", "Line-by-line code annotations"],
  },
  {
    icon: Share2, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950",
    tag: "Sharing", title: "Shareable Algorithm Links",
    desc: "Share any visualization with a single link. The URL encodes your code and custom input, so recipients see exactly the same state you're looking at. Perfect for teaching, code reviews, and interview prep.",
    highlights: ["URL-encoded share links", "Custom input preserved", "No account needed to view", "Copy to clipboard"],
  },
  {
    icon: Cpu, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950",
    tag: "Multi-Model", title: "Choose Your AI Model",
    desc: "Select from 5 Groq-hosted LLMs. Use Llama 3.3 70B for the most accurate analysis, or switch to Llama 3 8B for faster turnaround when you need quick results. All models return consistent, structured JSON output.",
    highlights: ["Llama 3.3 70B (default)", "Mixtral 8x7B", "Gemma 2 9B", "Llama 3 8B (fast)"],
  },
];

export function FeaturesPage() {
  return (
    <div className="bg-white dark:bg-zinc-950 pt-24">
      {/* Hero */}
      <section className="py-16 px-4 text-center">
        <Badge variant="primary" className="mb-4">Features</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
          Built for engineers who want<br />to truly understand algorithms
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
          Every feature in AlgoViz Pro was designed around one goal: making complex algorithms immediately understandable.
        </p>
      </section>

      {/* Feature blocks */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto space-y-16">
          {FEATURES.map((f, i) => (
            <div key={f.title} className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-start gap-10`}>
              {/* Visual block */}
              <div className="w-full md:w-1/2 flex-shrink-0">
                <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-8 flex items-center justify-center min-h-[200px]">
                  <div className={`w-20 h-20 rounded-2xl ${f.bg} flex items-center justify-center`}>
                    <f.icon className={`w-10 h-10 ${f.color}`} />
                  </div>
                </div>
              </div>
              {/* Text */}
              <div className="flex-1">
                <Badge variant="primary" className="mb-3">{f.tag}</Badge>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">{f.title}</h2>
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">{f.desc}</p>
                <ul className="space-y-1.5">
                  {f.highlights.map(h => (
                    <li key={h} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-zinc-50 dark:bg-zinc-900/50 text-center">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">Ready to see it in action?</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6">Start visualizing algorithms in under 30 seconds.</p>
        <Link to="/signup">
          <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Get started free
          </Button>
        </Link>
      </section>
    </div>
  );
}
