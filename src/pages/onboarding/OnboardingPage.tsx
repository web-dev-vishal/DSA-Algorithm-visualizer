import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, ArrowRight, Check, Rocket } from "lucide-react";
import { Button } from "../../components/ui/Button";

const STEPS = [
  {
    id: "role",
    title: "What describes you best?",
    subtitle: "We'll personalize your experience based on your goals.",
    multi: false,
    options: [
      { value: "student",     icon: "🎓", label: "Student",     desc: "Learning algorithms for classes or interviews" },
      { value: "engineer",    icon: "👨‍💻", label: "Engineer",    desc: "Improving my DSA skills on the job" },
      { value: "educator",    icon: "👩‍🏫", label: "Educator",    desc: "Teaching algorithms to students or teams" },
      { value: "interviewer", icon: "📋", label: "Interviewer",  desc: "Assessing candidates' coding skills" },
    ],
  },
  {
    id: "goal",
    title: "What's your primary goal?",
    subtitle: "Choose one to help us surface the right features first.",
    multi: false,
    options: [
      { value: "interview-prep", icon: "🎯", label: "Interview prep",  desc: "FAANG / top company interviews" },
      { value: "learn",          icon: "📚", label: "Learn DSA",        desc: "Understand algorithms from scratch" },
      { value: "teach",          icon: "🖥️", label: "Teach & explain",  desc: "Show algorithms to others visually" },
      { value: "debug",          icon: "🐛", label: "Debug & review",   desc: "Find bugs in my algorithm code" },
    ],
  },
  {
    id: "algorithms",
    title: "Which topics interest you?",
    subtitle: "Select all that apply — you can change this later.",
    multi: true,
    options: [
      { value: "sorting",   icon: "📊", label: "Sorting",               desc: "Bubble, Merge, Quick Sort..." },
      { value: "searching", icon: "🔍", label: "Searching",             desc: "Binary Search, Linear Search..." },
      { value: "dp",        icon: "🧠", label: "Dynamic Programming",   desc: "Fibonacci, Coin Change..." },
      { value: "trees",     icon: "🌳", label: "Trees & Graphs",        desc: "BFS, DFS, Traversals..." },
      { value: "two-ptr",   icon: "👈👉", label: "Two Pointers",        desc: "Sliding Window, Fast/Slow..." },
      { value: "recursion", icon: "🔄", label: "Recursion",             desc: "Factorial, Tower of Hanoi..." },
    ],
  },
];

export function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string | string[]>>({});
  const navigate = useNavigate();

  const current = STEPS[step];
  const isMulti = current.multi;

  function select(val: string) {
    if (isMulti) {
      const prev = (selections[current.id] as string[]) ?? [];
      const next = prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val];
      setSelections(s => ({ ...s, [current.id]: next }));
    } else {
      setSelections(s => ({ ...s, [current.id]: val }));
    }
  }

  function isSelected(val: string): boolean {
    const sel = selections[current.id];
    if (Array.isArray(sel)) return sel.includes(val);
    return sel === val;
  }

  function canAdvance(): boolean {
    const sel = selections[current.id];
    if (!sel) return false;
    if (Array.isArray(sel)) return sel.length > 0;
    return true;
  }

  function advance() {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Logo & progress */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-zinc-900 dark:text-white">AlgoViz Pro</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= step ? "bg-indigo-500 w-8" : "bg-zinc-200 dark:bg-zinc-800 w-4"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-zinc-400">Step {step + 1} of {STEPS.length}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{current.title}</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">{current.subtitle}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {current.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => select(opt.value)}
                className={`text-left p-4 rounded-xl border-2 transition-all duration-150 ${
                  isSelected(opt.value)
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50"
                    : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl">{opt.icon}</span>
                  {isSelected(opt.value) && (
                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
                <p className="font-semibold text-zinc-900 dark:text-white text-sm mt-2">{opt.label}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep(s => s - 1)}>Back</Button>
            ) : (
              <span />
            )}
            <Button
              variant="primary"
              disabled={!canAdvance()}
              onClick={advance}
              rightIcon={step < STEPS.length - 1 ? <ArrowRight className="w-4 h-4" /> : <Rocket className="w-4 h-4" />}
            >
              {step < STEPS.length - 1 ? "Continue" : "Get started"}
            </Button>
          </div>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="block text-center text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 mt-4 mx-auto transition-colors"
        >
          Skip setup for now
        </button>
      </div>
    </div>
  );
}
