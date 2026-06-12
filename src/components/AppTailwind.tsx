import { useState, useEffect, useRef, useCallback } from "react";
import type React from "react";
import { clsx } from "clsx";

/* ─── Groq config ─────────────────────────────────────────────────── */
const GROQ_API_KEY: string | undefined = import.meta.env.VITE_groqApi as string | undefined;
const GROQ_URL: string = "https://api.groq.com/openai/v1/chat/completions";

interface GroqModel {
  id: string;
  label: string;
}

// All currently available Groq chat-completion models (June 2025).
// Any valid Groq API key works with every model listed here.
const GROQ_MODELS: GroqModel[] = [
  { id: "llama-3.3-70b-versatile",   label: "Llama 3.3 · 70B  (recommended)" },
  { id: "llama3-70b-8192",           label: "Llama 3 · 70B" },
  { id: "llama3-8b-8192",            label: "Llama 3 · 8B  (faster)" },
  { id: "mixtral-8x7b-32768",        label: "Mixtral · 8x7B" },
  { id: "gemma2-9b-it",              label: "Gemma 2 · 9B" },
];
const DEFAULT_MODEL: string = GROQ_MODELS[0]?.id ?? "llama-3.3-70b-versatile";

/* ─── System prompt ───────────────────────────────────────────────── */
const SYSTEM_PROMPT: string = `You are an expert DSA (Data Structures & Algorithms) tutor and step-by-step visualizer.
Your ONLY output must be a single valid JSON object — no markdown fences, no backticks, no commentary, nothing outside the JSON.

Required JSON shape:
{
  "isValid": true,
  "language": "C++",
  "algorithmName": "Bubble Sort",
  "category": "Sorting",
  "isCorrect": true,
  "bugs": [],
  "correctedCode": "",
  "timeComplexity": "O(n²)",
  "spaceComplexity": "O(1)",
  "explanation": "2-3 sentence plain-English description of what the algorithm does.",
  "howItWorks": ["Step 1: ...", "Step 2: ..."],
  "codeLines": [
    { "line": "void bubbleSort(int arr[], int n) {", "explain": "Function taking the array and its size n" }
  ],
  "defaultInput": [5, 3, 8, 1, 2],
  "steps": [
    {
      "arr": [5, 3, 8, 1, 2],
      "highlight": [0, 1],
      "secondary": [],
      "done": [],
      "eliminated": [],
      "swap": [],
      "pointers": { "0": "i", "1": "j" },
      "activeLine": 2,
      "msg": "We start by looking at the first two elements, 5 and 3. We will compare them."
    }
  ]
}

STRICT RULES:
- defaultInput: 5-8 elements that clearly demonstrate the algorithm. Integers only.
- steps: simulate EVERY individual operation (comparison, swap, assignment) on defaultInput from start to finish.
- Each step: arr must reflect the FULL array state at that moment (copy it correctly each time).
- pointers keys MUST be STRING indices: "0", "1", "3" — not numbers.
- activeLine: 0-based index into codeLines. Must match the line executing at that step.
- msg: friendly, concrete — mention actual values. Like explaining to a curious 15-year-old.
- highlight: indices being compared (blue). secondary: reference indices (yellow).
- swap: BOTH indices being swapped (purple). done: finalized positions (green). eliminated: out-of-range (grey).
- DSA categories supported: Sorting (Bubble/Selection/Insertion/Merge/Quick), Searching (Linear/Binary),
  Two Pointers, Sliding Window, Recursion, Stack, Queue, Linked List traversal,
  Tree traversal (BFS/DFS), Dynamic Programming (use arr for dp table), Graph algorithms.
- For DP: arr represents the dp array — show it building up step by step.
- Minimum 3 steps always.
- If code is not valid DSA: isValid=false, steps=[].
- If bugs found: isCorrect=false, bugs=["description..."], correctedCode="...", then simulate the CORRECTED code.`;

interface DemoEntry {
  label: string;
  lang: string;
  code: string;
}

/* ─── Demo algorithms ─────────────────────────────────────────────── */
const DEMOS: Record<string, DemoEntry> = {
  bubble: {
    label: "Bubble Sort", lang: "C++",
    code: `// C++ — Bubble Sort
void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
  },
  binary: {
    label: "Binary Search", lang: "Python",
    code: `# Python — Binary Search
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
  },
  selection: {
    label: "Selection Sort", lang: "Java",
    code: `// Java — Selection Sort
void selectionSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        int temp = arr[minIdx];
        arr[minIdx] = arr[i];
        arr[i] = temp;
    }
}`,
  },
  insertion: {
    label: "Insertion Sort", lang: "Python",
    code: `# Python — Insertion Sort
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
  },
  two_ptr: {
    label: "Two Pointers", lang: "JS",
    code: `// JavaScript — Two Sum (sorted array)
function twoSum(arr, target) {
    let left = 0, right = arr.length - 1;
    while (left < right) {
        let sum = arr[left] + arr[right];
        if (sum === target) return [left, right];
        else if (sum < target) left++;
        else right--;
    }
    return [-1, -1];
}`,
  },
  remove_dup: {
    label: "Remove Duplicates", lang: "C++",
    code: `// C++ — Remove Duplicates from Sorted Array
int removeDuplicates(vector<int>& nums) {
    int count = 1;
    for (int i = 1; i < nums.size(); i++) {
        if (nums[i] != nums[i - 1]) {
            nums[count] = nums[i];
            count++;
        }
    }
    return count;
}`,
  },
  linear: {
    label: "Linear Search", lang: "C++",
    code: `// C++ — Linear Search
int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`,
  },
  fib_dp: {
    label: "Fibonacci DP", lang: "Python",
    code: `# Python — Fibonacci (Dynamic Programming)
def fibonacci(n):
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]`,
  },
};

/* ─── Cell color classes mapping for Tailwind ─────────────────────── */
const CELL_CLASSES: Record<string, string> = {
  active:     "bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-950/40 dark:border-blue-500 dark:text-blue-200",
  secondary:  "bg-amber-100 border-amber-500 text-amber-800 dark:bg-amber-950/40 dark:border-amber-500 dark:text-amber-200",
  done:       "bg-green-100 border-green-500 text-green-800 dark:bg-green-950/40 dark:border-green-500 dark:text-green-200",
  eliminated: "bg-slate-100 border-slate-300 text-slate-400 dark:bg-zinc-800/40 dark:border-zinc-700 dark:text-zinc-500",
  swap:       "bg-violet-100 border-violet-500 text-violet-800 dark:bg-violet-950/40 dark:border-violet-500 dark:text-violet-200",
  idle:       "bg-white border-slate-200 text-slate-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300",
};

/* ─── Dot colors mapping for Tailwind ─────────────────────────────── */
const DOT_COLORS: Record<string, string> = {
  "#ff5f57": "bg-[#ff5f57]",
  "#febc2e": "bg-[#febc2e]",
  "#28c840": "bg-[#28c840]",
};

/* ─── Metric text colors mapping for Tailwind ─────────────────────── */
const METRIC_TEXT_CLASSES = {
  "var(--c-ink)": "text-slate-900 dark:text-white",
  "var(--c-blue)": "text-blue-600 dark:text-blue-400",
  "var(--c-purple)": "text-violet-600 dark:text-violet-400",
  "var(--c-cyan)": "text-cyan-600 dark:text-cyan-400",
} as const;

/* ─── Legend state classes mapping for Tailwind ───────────────────── */
const LEGEND_CLASSES = {
  active:     { bg: "bg-blue-100 dark:bg-blue-950/40", border: "border-blue-500" },
  comparing:  { bg: "bg-amber-100 dark:bg-amber-950/40", border: "border-amber-500" },
  done:       { bg: "bg-green-100 dark:bg-green-950/40", border: "border-green-500" },
  swapping:   { bg: "bg-violet-100 dark:bg-violet-950/40", border: "border-violet-500" },
  skipped:    { bg: "bg-slate-100 dark:bg-zinc-800/40", border: "border-slate-300 dark:border-zinc-700" },
} as const;

export interface CodeLine {
  line: string;
  explain: string;
}

export interface VisualizationStep {
  arr: number[];
  highlight?: number[];
  secondary?: number[];
  done?: number[];
  eliminated?: number[];
  swap?: number[];
  pointers?: Record<string, string>;
  activeLine: number;
  msg: string;
}

export interface AlgorithmAnalysis {
  isValid: boolean;
  language: string;
  algorithmName: string;
  category: string;
  isCorrect: boolean;
  bugs: string[];
  correctedCode: string;
  timeComplexity: string;
  spaceComplexity: string;
  explanation: string;
  howItWorks: string[];
  codeLines: CodeLine[];
  defaultInput: number[];
  steps: VisualizationStep[];
}

function cellState(idx: number, step: VisualizationStep | null): string {
  if (!step) return "idle";
  if (step.swap?.includes(idx))       return "swap";
  if (step.highlight?.includes(idx))  return "active";
  if (step.secondary?.includes(idx))  return "secondary";
  if (step.eliminated?.includes(idx)) return "eliminated";
  if (step.done?.includes(idx))       return "done";
  return "idle";
}

interface ArrayVizProps {
  step: VisualizationStep | null;
}

/* ─── ArrayViz ────────────────────────────────────────────────────── */
function ArrayViz({ step }: ArrayVizProps): React.ReactElement | null {
  if (!step?.arr?.length) return null;
  return (
    <div className="array-viz flex flex-wrap justify-center items-end gap-3 min-h-[5.5rem] py-2" role="list" aria-label="Array visualization">
      {step.arr.map((val: number, idx: number) => {
        const ptr: string | undefined = step.pointers?.[String(idx)] ?? step.pointers?.[idx];
        return (
          <div key={idx} className="array-cell-wrapper flex flex-col items-center select-none" role="listitem">
            <span
              className={clsx(
                "array-cell__ptr text-xs font-bold h-5 flex items-center justify-center transition-colors duration-200 mb-1",
                ptr ? "text-blue-500" : "text-transparent"
              )}
              aria-label={ptr ? `pointer ${ptr} at index ${idx}` : undefined}
            >
              {ptr || "·"}
            </span>
            <div
              className={clsx(
                "array-cell border-2 rounded-[10px] w-12 h-12 flex items-center justify-center font-extrabold text-sm shadow-sm transition-all duration-200",
                CELL_CLASSES[cellState(idx, step)]
              )}
              title={`[${idx}] = ${val}`}
            >
              {val}
            </div>
            <span className="array-cell__idx text-[10px] text-slate-400 mt-1 font-mono">[{idx}]</span>
          </div>
        );
      })}
    </div>
  );
}

interface CodePanelProps {
  lines: CodeLine[];
  activeLine: number;
}

/* ─── CodePanel ───────────────────────────────────────────────────── */
function CodePanel({ lines, activeLine }: CodePanelProps): React.ReactElement {
  const activeRef: React.MutableRefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeLine]);

  return (
    <div className="code-panel flex flex-col h-[28rem] rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/30 overflow-hidden shadow-inner" role="region" aria-label="Code with active line highlighted">
      <div className="code-panel__titlebar flex items-center gap-1.5 px-4 py-3 bg-slate-100 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-850" aria-hidden="true">
        {["#ff5f57", "#febc2e", "#28c840"].map((c: string) => (
          <span key={c} className={clsx("code-panel__dot w-3 h-3 rounded-full", DOT_COLORS[c])} />
        ))}
        <span className="code-panel__filename text-xs font-mono font-medium text-slate-400 dark:text-zinc-500 ml-2">algorithm</span>
      </div>
      <div className="code-panel__lines flex-1 overflow-y-auto p-4 font-mono text-sm leading-relaxed" role="list">
        {(lines ?? []).map((item: CodeLine, i: number) => {
          const active: boolean = i === activeLine;
          return (
            <div
              key={i}
              ref={active ? activeRef : null}
              className={clsx(
                "code-line flex items-start px-2 py-0.5 rounded transition-colors duration-150 relative group",
                active ? "code-line--active bg-blue-50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-100 font-medium" : "text-slate-600 dark:text-zinc-400"
              )}
              role="listitem"
              aria-current={active ? "true" : undefined}
            >
              <span className="code-line__num w-6 text-right text-xs text-slate-300 dark:text-zinc-650 pr-3 select-none" aria-hidden="true">{i + 1}</span>
              <span className="code-line__code flex-1 whitespace-pre-wrap">{item.line}</span>
              {active && item.explain && (
                <span className="code-line__explain text-xs text-blue-600 dark:text-blue-400 italic pl-4 bg-slate-50 dark:bg-zinc-900 px-2 rounded opacity-90" title={item.explain}>
                  ← {item.explain}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Animated dots ───────────────────────────────────────────────── */
function Dots(): React.ReactElement {
  const [d, setD] = useState<string>(".");
  useEffect(() => {
    const t: ReturnType<typeof setInterval> = setInterval(() => setD((p: string) => (p.length >= 3 ? "." : p + ".")), 420);
    return () => clearInterval(t);
  }, []);
  return <span>Analyzing{d}</span>;
}

/* ─── Speed / label maps ───────────────────────────────────────────── */
const SPEEDS: number[] = [1500, 850, 480, 210, 75];
const SLABELS: string[] = ["Slowest", "Slow", "Normal", "Fast", "Fastest"];

/* ═══════════════════════════════════════════════════════════════════ */
export default function App(): React.ReactElement {
  const [code,        setCode]        = useState<string>(DEMOS.bubble?.code ?? "");
  const [activeDemo,  setActiveDemo]  = useState<string>("bubble");
  const [model,       setModel]       = useState<string>(DEFAULT_MODEL);
  const [customInput, setCustomInput] = useState<string>("");
  const [phase,       setPhase]       = useState<string>("idle");
  const [analysis,    setAnalysis]    = useState<AlgorithmAnalysis | null>(null);
  const [error,       setError]       = useState<string>("");
  const [stepIdx,     setStepIdx]     = useState<number>(0);
  const [playing,     setPlaying]     = useState<boolean>(false);
  const [speed,       setSpeed]       = useState<number>(3);
  const timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null> = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── load demo ─────────────────────────────────────────────────── */
  function loadDemo(key: string): void {
    const demo = DEMOS[key];
    if (demo) {
      setCode(demo.code);
      setActiveDemo(key);
      setAnalysis(null);
      setPhase("idle");
      setError("");
      setPlaying(false);
      setCustomInput("");
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }
  }

  /* ── analyze ───────────────────────────────────────────────────── */
  async function analyze(): Promise<void> {
    if (!code.trim()) return;

    if (!GROQ_API_KEY || GROQ_API_KEY.trim() === "") {
      setError("No API key. Add VITE_groqApi=your_key to the .env file, then restart the dev server.");
      setPhase("error");
      return;
    }

    setPhase("analyzing");
    setAnalysis(null);
    setError("");
    setPlaying(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    let userMsg: string = "Analyze this DSA code and return the JSON:\n\n" + code;
    if (customInput.trim()) {
      userMsg += `\n\nPlease use this exact array as defaultInput: [${customInput.trim()}]`;
    }

    try {
      const res: Response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.1,
          max_tokens:  8000,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user",   content: userMsg },
          ],
        }),
      });

      if (!res.ok) {
        const d: { error?: { message?: string } } = await res.json().catch(() => ({})) as { error?: { message?: string } };
        const msg: string = d?.error?.message ?? "";
        if (res.status === 401) throw new Error("Invalid API key. Check your .env file.");
        if (res.status === 429) throw new Error("Rate limit hit. Wait a moment and try again.");
        if (res.status === 400 && msg.includes("model")) {
          throw new Error(`Model "${model}" is not available on your Groq plan. Try a different model.`);
        }
        throw new Error(msg || `Groq API error ${res.status}`);
      }

      const data: { choices?: Array<{ message?: { content?: string } }> } = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      const raw: string = data?.choices?.[0]?.message?.content ?? "";

      // Strip markdown fences the model may accidentally add
      const clean: string = raw
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/,           "")
        .trim();

      let parsed: AlgorithmAnalysis;
      try {
        parsed = JSON.parse(clean) as AlgorithmAnalysis;
      } catch {
        const match: RegExpMatchArray | null = clean.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]) as AlgorithmAnalysis;
        } else {
          throw new Error("AI returned invalid JSON. Try again or switch to a larger model.");
        }
      }

      setAnalysis(parsed);
      setStepIdx(0);
      setPhase("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed. Try again.");
      setPhase("error");
    }
  }

  /* ── playback helpers ──────────────────────────────────────────── */
  const steps: VisualizationStep[] = analysis?.steps ?? [];
  const cur: VisualizationStep | null = steps[stepIdx] ?? null;

  const tick: () => void = useCallback((): void => {
    setStepIdx((p: number): number => {
      if (p >= steps.length - 1) { setPlaying(false); return p; }
      return p + 1;
    });
  }, [steps.length]);

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setTimeout(tick, SPEEDS[speed - 1]);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [playing, stepIdx, speed, tick]);

  const handlePlay: () => void = (): void => {
    if (stepIdx >= steps.length - 1) { setStepIdx(0); setPlaying(true); return; }
    setPlaying((p: boolean): boolean => !p);
  };
  const goBack: () => void = (): void => {
    setPlaying(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setStepIdx((p: number): number => Math.max(p - 1, 0));
  };
  const goForward: () => void = (): void => {
    setPlaying(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setStepIdx((p: number): number => Math.min(p + 1, steps.length - 1));
  };
  const resetViz: () => void = (): void => {
    setPlaying(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setStepIdx(0);
  };

  function seekTo(e: React.MouseEvent<HTMLDivElement>): void {
    if (!steps.length) return;
    const rect: DOMRect = e.currentTarget.getBoundingClientRect();
    const pct: number = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setPlaying(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setStepIdx(Math.round(pct * (steps.length - 1)));
  }

  /* ── keyboard shortcuts ────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (!steps.length) return;
      const tag: string | undefined = document.activeElement?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT") return;
      if (e.code === "Space")          { e.preventDefault(); handlePlay(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); goForward(); }
      else if (e.key === "ArrowLeft")  { e.preventDefault(); goBack(); }
      else if (e.key === "r" || e.key === "R") resetViz();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps.length, stepIdx, playing]);

  /* ── status badge ──────────────────────────────────────────────── */
  const BADGE: Record<string, { label: string; cls: string }> = {
    idle:      { label: "Idle",         cls: "badge-idle bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700" },
    analyzing: { label: "Analyzing…",   cls: "badge-analyzing bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 animate-pulse" },
    done:      { label: "Ready",        cls: "badge-done bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800" },
    error:     { label: "Error",        cls: "badge-error bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800" },
  };
  const badge: { label: string; cls: string } = BADGE[phase] ?? { label: "Idle", cls: "badge-idle bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700" };

  /* ──────────────────────────────────────────────────────────────── */
  return (
    <div className="app min-h-screen bg-slate-50 text-slate-800 dark:bg-zinc-950 dark:text-zinc-200 font-sans transition-colors duration-200">
      <div className="app__inner max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* ── HEADER ──────────────────────────────────────────────── */}
        <header className="header flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-5">
          <div className="header__left">
            <p className="header__eyebrow text-xs uppercase tracking-widest text-indigo-500 font-bold">DSA Lab</p>
            <h1 className="header__title text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Algorithm Analyzer
              <span className="header__title-accent text-indigo-500 font-bold"> &amp; Visualizer</span>
            </h1>
          </div>
          <span className={clsx("badge border px-3 py-1 rounded-full text-xs font-semibold select-none", badge.cls)}>{badge.label}</span>
        </header>

        {/* ── INPUT CARD ──────────────────────────────────────────── */}
        <div className="card bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 rounded-2xl p-6 shadow-sm flex flex-col gap-5">

          {/* Card title row */}
          <div className="card-head flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/60 pb-3">
            <span className="card-head__label font-bold text-slate-800 dark:text-white text-lg">Your Code</span>
            <span className="card-head__sub text-xs text-slate-400 dark:text-zinc-500 font-mono">C++ · Python · Java · JavaScript</span>
          </div>

          {/* Demo strip */}
          <div className="demo-strip flex items-center flex-wrap gap-2 text-sm">
            <span className="demo-strip__label text-slate-400 dark:text-zinc-500 font-medium mr-1 select-none">Demo:</span>
            {Object.entries(DEMOS).map(([key, d]: [string, DemoEntry]) => (
              <button
                key={key}
                onClick={(): void => loadDemo(key)}
                className={clsx(
                  "demo-chip px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all select-none hover:bg-slate-50 dark:hover:bg-zinc-800",
                  activeDemo === key
                    ? "demo-chip--on bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/30 dark:border-indigo-800 dark:text-indigo-400"
                    : "bg-white border-slate-200 text-slate-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400"
                )}
                type="button"
              >
                {d.label}
                <span className="demo-chip__lang text-[9px] uppercase px-1 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 font-mono">{d.lang}</span>
              </button>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            value={code}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void => { setCode(e.target.value); setActiveDemo(""); }}
            spellCheck={false}
            className="code-textarea w-full h-64 p-4 font-mono text-sm border border-slate-200 dark:border-zinc-850 rounded-xl bg-slate-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-650"
            placeholder="// Paste any DSA algorithm here…"
            aria-label="DSA code input"
          />

          {/* Action row */}
          <div className="action-row flex flex-col md:flex-row items-stretch md:items-end gap-4">
            {/* Custom input */}
            <div className="field flex-1 flex flex-col gap-1.5">
              <label className="field__label text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide" htmlFor="cust-input">Custom array (optional)</label>
              <input
                id="cust-input"
                type="text"
                value={customInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setCustomInput(e.target.value)}
                placeholder="e.g.  5, 3, 8, 1, 2"
                className="field__input rounded-xl border border-slate-200 dark:border-zinc-850 bg-slate-50 dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-650"
              />
              <span className="field__hint text-[10px] text-slate-400 dark:text-zinc-550 leading-tight">Overrides the AI-chosen test array</span>
            </div>

            {/* Model selector */}
            <div className="field flex-1 flex flex-col gap-1.5">
              <label className="field__label text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide" htmlFor="model-sel">Model</label>
              <select
                id="model-sel"
                value={model}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => setModel(e.target.value)}
                className="field__select rounded-xl border border-slate-200 dark:border-zinc-850 bg-slate-50 dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 text-slate-800 dark:text-zinc-100"
              >
                {GROQ_MODELS.map((m: GroqModel) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
              <span className="field__hint text-[10px] text-slate-400 dark:text-zinc-550 leading-tight">All models work with any Groq key</span>
            </div>

            {/* Analyze button */}
            <button
              onClick={(): void => { void analyze(); }}
              disabled={phase === "analyzing" || !code.trim()}
              className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2 px-5 rounded-xl cursor-pointer select-none transition-colors duration-150 flex items-center justify-center min-w-[10rem] shadow-sm hover:shadow active:scale-[0.98]"
              type="button"
            >
              {phase === "analyzing" ? <Dots /> : "Analyze + Visualize"}
            </button>
          </div>

          {/* Error banner */}
          {error && (
            <div className="error-bar flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 text-sm border border-rose-100 dark:border-rose-900/30" role="alert">
              <span className="error-bar__icon text-base font-bold">⚠</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* ── RESULTS ─────────────────────────────────────────────── */}
        {analysis && (
          <div className="flex flex-col gap-6">
            {/* Invalid code */}
            {analysis.isValid === false ? (
              <div className="alert alert-warn flex flex-col gap-2 p-5 bg-amber-50 text-amber-900 dark:bg-amber-950/20 dark:text-amber-300 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                <strong className="text-base font-bold flex items-center gap-2">
                  <span className="text-lg">⚠</span> Invalid / non-DSA code
                </strong>
                <p className="text-sm">{analysis.explanation || "Please paste a valid DSA algorithm."}</p>
              </div>
            ) : (
              <>
                {/* Metrics */}
                <div className="metrics grid grid-cols-2 md:grid-cols-4 gap-4" role="list" aria-label="Algorithm metrics">
                  {([
                    ["Algorithm",  analysis.algorithmName,  "var(--c-ink)"],
                    ["Category",   analysis.category,       "var(--c-blue)"],
                    ["Time",       analysis.timeComplexity, "var(--c-purple)"],
                    ["Space",      analysis.spaceComplexity,"var(--c-cyan)"],
                  ] as const).map(([lbl, val, clr]) => (
                    <div key={lbl} className="metric-tile p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 flex flex-col gap-1 shadow-sm" role="listitem">
                      <span className="metric-tile__label text-xs text-slate-400 dark:text-zinc-550 font-semibold uppercase tracking-wider select-none">{lbl}</span>
                      <span className={clsx("metric-tile__value font-extrabold text-xl", METRIC_TEXT_CLASSES[clr])}>{val}</span>
                    </div>
                  ))}
                </div>

                {/* Correctness */}
                <div className={clsx(
                  "alert p-5 rounded-2xl border flex flex-col gap-2",
                  analysis.isCorrect
                    ? "alert-ok bg-green-50 text-green-900 border-green-100 dark:bg-green-950/20 dark:text-green-300 dark:border-green-900/30"
                    : "alert-warn bg-amber-50 text-amber-900 border-amber-100 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/30"
                )}>
                  <strong className="text-base font-bold flex items-center gap-2">
                    <span className="text-lg">{analysis.isCorrect ? "✓" : "⚠"}</span>
                    {analysis.isCorrect ? "Code looks correct" : "Issues found"}
                  </strong>
                  <p className="text-sm leading-relaxed">
                    {analysis.isCorrect
                      ? analysis.explanation
                      : (analysis.bugs ?? []).join(" • ")}
                  </p>
                </div>

                {/* Corrected code */}
                {!analysis.isCorrect && analysis.correctedCode && (
                  <div className="card bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
                    <div className="card-head border-b border-slate-100 dark:border-zinc-800/60 pb-2"><span className="card-head__label font-bold text-slate-800 dark:text-white text-base">Corrected Code</span></div>
                    <pre className="code-block w-full overflow-x-auto p-4 rounded-xl font-mono text-sm leading-relaxed bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-850 shadow-inner">{analysis.correctedCode}</pre>
                  </div>
                )}

                {/* How it works */}
                {analysis.howItWorks?.length > 0 && (
                  <div className="card bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                    <div className="card-head border-b border-slate-100 dark:border-zinc-800/60 pb-2"><span className="card-head__label font-bold text-slate-800 dark:text-white text-base">How it works</span></div>
                    <ol className="steps-list flex flex-col gap-3">
                      {analysis.howItWorks.map((s: string, i: number) => (
                        <li key={i} className="steps-list__item flex items-start gap-3 text-sm leading-relaxed text-slate-600 dark:text-zinc-300">
                          <span className="steps-list__num font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 rounded-full w-5 h-5 flex items-center justify-center text-[10px] mt-0.5 select-none">{i + 1}</span>
                          <span className="steps-list__text flex-1">{s}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* ── VISUALIZATION ───────────────────────────── */}
                {steps.length > 0 && (
                  <div className="card viz-card bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
                    {/* Viz header bar */}
                    <div className="viz-topbar flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/60 pb-3">
                      <span className="viz-topbar__title font-bold text-slate-800 dark:text-white text-base">Live Visualization</span>
                      <span className="viz-topbar__counter text-xs font-mono font-semibold text-slate-400 dark:text-zinc-550">
                        Step {stepIdx + 1} / {steps.length}
                      </span>
                    </div>

                    {/* Keyboard hint */}
                    <div className="kbd-row flex items-center gap-1 text-[11px] text-slate-400 dark:text-zinc-550 border border-slate-100 dark:border-zinc-800/60 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-950/20 w-fit select-none">
                      <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm font-sans font-semibold">Space</kbd> play/pause &nbsp;·&nbsp;
                      <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm font-sans font-semibold">←</kbd><kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm font-sans font-semibold">→</kbd> step &nbsp;·&nbsp;
                      <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm font-sans font-semibold">R</kbd> reset
                    </div>

                    {/* Two-column body */}
                    <div className="viz-grid grid grid-cols-1 lg:grid-cols-2 gap-6">

                      {/* LEFT — array state */}
                      <div className="viz-col viz-col--left flex flex-col gap-5 border border-slate-100 dark:border-zinc-800/40 p-4 rounded-xl bg-slate-50/50 dark:bg-zinc-950/10">
                        <p className="section-label text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wide select-none">Array state</p>
                        <ArrayViz step={cur} />

                        {/* Legend */}
                        <div className="legend flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-2 border-t border-b border-slate-100 dark:border-zinc-800/60 text-xs text-slate-500 dark:text-zinc-400 select-none">
                          {([
                            ["active",    "#dbeafe", "#3b82f6"],
                            ["comparing", "#fef3c7", "#f59e0b"],
                            ["done",      "#dcfce7", "#22c55e"],
                            ["swapping",  "#ede9fe", "#8b5cf6"],
                            ["skipped",   "#f1f5f9", "#cbd5e1"],
                          ] as const).map(([l]) => (
                            <div key={l} className="legend__item flex items-center gap-1.5">
                              <span className={clsx("legend__dot w-3 h-3 rounded-full border", LEGEND_CLASSES[l].bg, LEGEND_CLASSES[l].border)} />
                              <span className="legend__label capitalize">{l}</span>
                            </div>
                          ))}
                        </div>

                        {/* Pointer cards */}
                        {cur?.pointers && Object.keys(cur.pointers).length > 0 && (
                          <div className="ptr-grid grid grid-cols-2 sm:grid-cols-3 gap-3" role="list" aria-label="Current pointers">
                            {Object.entries(cur.pointers).map(([idx, name]: [string, string]) => (
                              <div key={name} className="ptr-card p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col gap-0.5 items-center select-none" role="listitem">
                                <span className="ptr-card__name text-xs font-bold text-indigo-500">{name}</span>
                                <span className="ptr-card__val text-[11px] font-mono text-slate-400 dark:text-zinc-550">idx = {idx}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Step message */}
                        <div className="step-msg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-4 rounded-xl flex flex-col gap-1.5 shadow-sm" aria-live="polite">
                          <p className="step-msg__head text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wide select-none">What is happening</p>
                          <p className="step-msg__body text-sm text-slate-600 dark:text-zinc-200 leading-relaxed font-medium">{cur?.msg || "—"}</p>
                        </div>
                      </div>

                      {/* RIGHT — code panel */}
                      <div className="viz-col viz-col--right">
                        <p className="section-label text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wide mb-3 select-none">Code — active line highlighted</p>
                        <CodePanel
                          lines={analysis.codeLines}
                          activeLine={cur?.activeLine ?? -1}
                        />
                      </div>
                    </div>

                    {/* Playback controls */}
                    <div className="playback flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-zinc-950/30 p-4 rounded-xl border border-slate-200 dark:border-zinc-850" role="toolbar" aria-label="Playback controls">
                      <button
                        onClick={handlePlay}
                        className={clsx(
                          "btn font-semibold text-xs py-2 px-4 rounded-xl shadow-sm hover:shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all select-none min-w-[6.5rem]",
                          playing
                            ? "btn-pause bg-amber-500 text-white hover:bg-amber-600"
                            : "btn-play bg-indigo-600 text-white hover:bg-indigo-700"
                        )}
                        title={playing ? "Pause (Space)" : "Play (Space)"}
                        type="button"
                      >
                        {playing ? "⏸ Pause" : "▶ Play"}
                      </button>

                      <button onClick={goBack}    disabled={stepIdx === 0}                 className="btn btn-ctrl border border-slate-200 text-slate-600 dark:border-zinc-800 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-850/50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs py-2 px-3.5 rounded-xl cursor-pointer active:scale-95 select-none" title="Step back (←)" type="button">‹ Back</button>
                      <button onClick={goForward} disabled={stepIdx >= steps.length - 1}   className="btn btn-ctrl border border-slate-200 text-slate-600 dark:border-zinc-800 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-850/50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs py-2 px-3.5 rounded-xl cursor-pointer active:scale-95 select-none" title="Step forward (→)" type="button">Next ›</button>
                      <button onClick={resetViz}                                            className="btn btn-ctrl border border-slate-200 text-slate-600 dark:border-zinc-800 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-850/50 font-semibold text-xs py-2 px-3.5 rounded-xl cursor-pointer active:scale-95 select-none" title="Reset (R)" type="button">↺ Reset</button>

                      {/* Seekable progress bar */}
                      <div
                        className="progress flex-1 min-w-[10rem] h-2.5 rounded-full bg-slate-200 dark:bg-zinc-850 overflow-hidden cursor-pointer relative shadow-inner select-none"
                        role="slider"
                        aria-label="Step progress"
                        aria-valuemin={1}
                        aria-valuemax={steps.length}
                        aria-valuenow={stepIdx + 1}
                        tabIndex={0}
                        onClick={seekTo}
                        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>): void => { if (e.key === "ArrowRight") goForward(); if (e.key === "ArrowLeft") goBack(); }}
                        title="Click to seek"
                      >
                        <div
                          className="progress__fill h-full bg-indigo-600 rounded-full transition-all duration-100"
                          style={{ width: `${((stepIdx + 1) / steps.length) * 100}%` }}
                        />
                      </div>

                      {/* Speed slider */}
                      <div className="speed flex items-center gap-2 select-none">
                        <label className="speed__label text-xs font-semibold text-slate-400 dark:text-zinc-550 uppercase tracking-wider" htmlFor="speed-range">Speed</label>
                        <input
                          id="speed-range"
                          type="range"
                          min="1" max="5" step="1"
                          value={speed}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setSpeed(Number(e.target.value))}
                          aria-valuetext={SLABELS[speed - 1]}
                          className="accent-indigo-600 w-24 h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-zinc-850"
                        />
                        <span className="speed__val text-xs font-bold text-slate-600 dark:text-zinc-300 w-12 text-right">{SLABELS[speed - 1]}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── LINE-BY-LINE ─────────────────────────────── */}
                {analysis.codeLines?.length > 0 && (
                  <div className="card bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                    <div className="card-head border-b border-slate-100 dark:border-zinc-800/60 pb-2"><span className="card-head__label font-bold text-slate-800 dark:text-white text-base">Line-by-line explanation</span></div>
                    <div className="flex flex-col">
                      {analysis.codeLines.map((item: CodeLine, i: number) => (
                        <div
                          key={i}
                          className={clsx(
                            "explain-row py-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 font-mono text-sm border-slate-100 dark:border-zinc-850",
                            i < analysis.codeLines.length - 1 ? "border-b" : "border-0"
                          )}
                        >
                          <span className="explain-row__num text-xs text-slate-300 dark:text-zinc-650 w-5 text-right select-none">{i + 1}</span>
                          <code className="explain-row__code font-bold text-slate-800 dark:text-zinc-200 flex-1 whitespace-pre-wrap">{item.line}</code>
                          <span className="explain-row__text text-xs text-slate-500 dark:text-zinc-400 font-sans flex-1 bg-slate-50 dark:bg-zinc-950/30 px-3 py-1 rounded-lg border border-slate-100 dark:border-zinc-850/50">{item.explain}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── EMPTY STATE ─────────────────────────────────────── */}
        {phase === "idle" && !analysis && (
          <div className="empty flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 rounded-2xl shadow-sm gap-4" aria-label="Get started">
            <div className="empty__icon text-4xl text-indigo-500 font-mono select-none">{"</>"}</div>
            <p className="empty__title text-lg font-bold text-slate-800 dark:text-white">Paste any DSA algorithm above</p>
            <p className="empty__body text-sm text-slate-400 dark:text-zinc-400 max-w-md leading-relaxed">
              Pick a demo or paste your own code. The AI will detect bugs, explain
              every line, and animate each step so you can follow along at your own pace.
            </p>
          </div>
        )}

        {/* ── FOOTER ──────────────────────────────────────────── */}
        <footer className="footer flex items-center justify-between border-t border-slate-200 dark:border-zinc-800 pt-5 text-xs text-slate-400 dark:text-zinc-550 select-none">
          <span>Powered by{" "}
            <a href="https://groq.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-colors font-medium">Groq</a>
          </span>
          <span>Model: <code className="font-mono bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 px-1.5 py-0.5 rounded text-[10px]">{model}</code></span>
        </footer>

      </div>
    </div>
  );
}
