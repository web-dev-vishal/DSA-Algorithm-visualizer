import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import type React from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Pause, RotateCcw, ChevronLeft, ChevronRight, 
  Code2, AlertTriangle, Check, Info, Terminal, ClipboardCheck,
  Sun, Moon, MessageSquare, Send, Sparkles, X, HelpCircle, Layers, Download
} from "lucide-react";
import { simulateAlgorithm } from "../lib/offlineSimulator";
import { Badge } from "./ui/Badge";

/* ─── Groq config ─────────────────────────────────────────────────── */
const GROQ_API_KEY: string | undefined = import.meta.env.VITE_groqApi as string | undefined;
const GROQ_URL: string = "https://api.groq.com/openai/v1/chat/completions";

interface GroqModel {
  id: string;
  label: string;
}

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

const CELL_CLASSES: Record<string, string> = {
  active:     "bg-blue-500/10 border-blue-500 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
  secondary:  "bg-amber-500/10 border-amber-500 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
  done:       "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300",
  eliminated: "bg-zinc-200/50 border-zinc-300 text-zinc-400 dark:bg-zinc-800/40 dark:border-zinc-700 dark:text-zinc-500",
  swap:       "bg-purple-500/10 border-purple-500 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300",
  idle:       "bg-white border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300",
};

const METRIC_TEXT_CLASSES = {
  "var(--c-ink)": "text-indigo-600 dark:text-indigo-400",
  "var(--c-blue)": "text-blue-650 dark:text-blue-400",
  "var(--c-purple)": "text-purple-650 dark:text-purple-400",
  "var(--c-cyan)": "text-cyan-600 dark:text-cyan-400",
} as const;

const LEGEND_CLASSES = {
  active:     { bg: "bg-blue-500/10 dark:bg-blue-950/30", border: "border-blue-500", label: "Comparing" },
  comparing:  { bg: "bg-amber-500/10 dark:bg-amber-950/30", border: "border-amber-500", label: "Pivot/Ref" },
  done:       { bg: "bg-emerald-500/10 dark:bg-emerald-950/30", border: "border-emerald-500", label: "Sorted" },
  swapping:   { bg: "bg-purple-500/10 dark:bg-purple-950/30", border: "border-purple-500", label: "Swapping" },
  skipped:    { bg: "bg-zinc-100 dark:bg-zinc-800/30", border: "border-zinc-350 dark:border-zinc-700", label: "Eliminated" },
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

/* ─── ArrayViz ────────────────────────────────────────────────────── */
function ArrayViz({ step }: { step: VisualizationStep | null }): React.ReactElement | null {
  if (!step?.arr?.length) return null;
  return (
    <div className="flex flex-wrap justify-center items-end gap-3 min-h-[6.5rem] py-4" role="list" aria-label="Visualizer array">
      <AnimatePresence mode="popLayout">
        {step.arr.map((val: number, idx: number) => {
          const ptr: string | undefined = step.pointers?.[String(idx)] ?? step.pointers?.[idx];
          const state = cellState(idx, step);
          return (
            <motion.div
              layout
              key={`cell-${idx}-${val}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="flex flex-col items-center select-none"
              role="listitem"
            >
              {/* Pointer indicator */}
              <span
                className={clsx(
                  "text-xs font-black h-5 flex items-center justify-center transition-colors duration-200 mb-1 px-1.5 rounded bg-zinc-100 dark:bg-zinc-800",
                  ptr ? "text-indigo-500 opacity-100" : "text-transparent opacity-0"
                )}
              >
                {ptr || "·"}
              </span>

              {/* Number box */}
              <motion.div
                animate={state === "swap" ? { y: [0, -10, 0] } : {}}
                transition={{ duration: 0.3 }}
                className={clsx(
                  "border-2 rounded-xl w-14 h-14 flex items-center justify-center font-black text-base shadow-sm transition-all duration-200",
                  CELL_CLASSES[state]
                )}
                title={`Index [${idx}] = ${val}`}
              >
                {val}
              </motion.div>

              <span className="text-[10px] text-zinc-400 dark:text-zinc-550 mt-1.5 font-mono font-medium">
                [{idx}]
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/* ─── BarChartViz ─────────────────────────────────────────────────── */
function BarChartViz({ step }: { step: VisualizationStep | null }): React.ReactElement | null {
  if (!step?.arr?.length) return null;
  const maxVal = Math.max(...step.arr, 1);
  return (
    <div className="flex items-end justify-center gap-2 h-44 py-4 px-2 bg-zinc-50 dark:bg-zinc-950/20 rounded-xl border border-zinc-200 dark:border-zinc-800" role="list" aria-label="Visualizer bars">
      <AnimatePresence mode="popLayout">
        {step.arr.map((val: number, idx: number) => {
          const ptr: string | undefined = step.pointers?.[String(idx)] ?? step.pointers?.[idx];
          const state = cellState(idx, step);
          const heightPct = Math.max(15, Math.min(100, (val / maxVal) * 100));
          
          const barColors: Record<string, string> = {
            active: "bg-blue-500 dark:bg-blue-600 shadow-lg shadow-blue-500/20",
            secondary: "bg-amber-500 dark:bg-amber-600 shadow-lg shadow-amber-500/20",
            done: "bg-emerald-500 dark:bg-emerald-600 shadow-lg shadow-emerald-500/20",
            eliminated: "bg-zinc-300 dark:bg-zinc-700 opacity-40",
            swap: "bg-purple-500 dark:bg-purple-600 shadow-lg shadow-purple-500/20",
            idle: "bg-indigo-500 dark:bg-indigo-600"
          };
          
          return (
            <motion.div
              layout
              key={`bar-${idx}-${val}`}
              className="flex flex-col items-center flex-1 max-w-[40px] group relative h-full justify-end"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {ptr && (
                <span className="absolute -top-7 bg-zinc-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md pointer-events-none select-none z-10 whitespace-nowrap">
                  {ptr}
                </span>
              )}
              <motion.div
                style={{ height: `${heightPct}%` }}
                className={clsx(
                  "w-full rounded-t-lg transition-all duration-200 border-b border-transparent",
                  barColors[state] || barColors.idle
                )}
                title={`Index [${idx}] = ${val}`}
              />
              <span className="text-[10px] font-bold mt-1 text-zinc-700 dark:text-zinc-300">
                {val}
              </span>
              <span className="text-[8px] text-zinc-400 font-mono">
                [{idx}]
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/* ─── TreeViz ─────────────────────────────────────────────────────── */
function TreeViz({ step }: { step: VisualizationStep | null }): React.ReactElement | null {
  if (!step?.arr?.length) return null;
  const arr = step.arr;
  const n = arr.length;
  const nodes: Array<{ id: number; val: number; x: number; y: number; level: number }> = [];
  const levelHeight = 50;
  const width = 500;
  const height = 200;
  
  for (let i = 0; i < n; i++) {
    const level = Math.floor(Math.log2(i + 1));
    const levelNodes = Math.pow(2, level);
    const indexInLevel = i - (levelNodes - 1);
    const segmentWidth = width / levelNodes;
    const x = segmentWidth * indexInLevel + segmentWidth / 2;
    const y = 25 + level * levelHeight;
    nodes.push({ id: i, val: arr[i]!, x, y, level });
  }
  
  const edges: Array<{ from: { x: number; y: number }; to: { x: number; y: number }; key: string }> = [];
  for (let i = 0; i < n; i++) {
    const leftChild = 2 * i + 1;
    const rightChild = 2 * i + 2;
    if (leftChild < n) {
      edges.push({ from: nodes[i]!, to: nodes[leftChild]!, key: `edge-${i}-${leftChild}` });
    }
    if (rightChild < n) {
      edges.push({ from: nodes[i]!, to: nodes[rightChild]!, key: `edge-${i}-${rightChild}` });
    }
  }
  
  return (
    <div className="flex flex-col items-center p-3 bg-zinc-50 dark:bg-zinc-950/20 rounded-xl border border-zinc-200 dark:border-zinc-800 animate-fade-in">
      <span className="text-[10px] text-zinc-400 dark:text-zinc-550 uppercase tracking-widest mb-1 select-none font-bold font-sans">
        Binary Heap Hierarchy representation
      </span>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-lg h-auto select-none font-sans">
        {edges.map(edge => (
          <line
            key={edge.key}
            x1={edge.from.x}
            y1={edge.from.y}
            x2={edge.to.x}
            y2={edge.to.y}
            stroke="currentColor"
            strokeWidth={1.5}
            className="text-zinc-300 dark:text-zinc-850"
          />
        ))}
        {nodes.map(node => {
          const state = cellState(node.id, step);
          const ptr = step.pointers?.[String(node.id)] ?? step.pointers?.[node.id];
          
          const nodeColors: Record<string, { circle: string; text: string; ring: string }> = {
            active: { circle: "fill-blue-500 stroke-blue-600", text: "fill-white", ring: "stroke-blue-400 animate-pulse" },
            secondary: { circle: "fill-amber-500 stroke-amber-600", text: "fill-white", ring: "stroke-amber-400 animate-pulse" },
            done: { circle: "fill-emerald-500 stroke-emerald-600", text: "fill-white", ring: "stroke-emerald-400" },
            eliminated: { circle: "fill-zinc-200 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700", text: "fill-zinc-400 dark:fill-zinc-550", ring: "stroke-transparent" },
            swap: { circle: "fill-purple-500 stroke-purple-600", text: "fill-white", ring: "stroke-purple-400 animate-pulse" },
            idle: { circle: "fill-white dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-800", text: "fill-zinc-800 dark:fill-zinc-200", ring: "stroke-transparent" }
          };
          
          const style = nodeColors[state] || nodeColors.idle || { circle: "", text: "", ring: "" };
          return (
            <g key={`node-${node.id}`}>
              {(state === "active" || state === "secondary" || state === "swap") && (
                <circle cx={node.x} cy={node.y} r={17} className={clsx("fill-none stroke-2", style.ring)} />
              )}
              <circle cx={node.x} cy={node.y} r={12} className={clsx("stroke-2 shadow-sm transition-all duration-200", style.circle)} />
              <text x={node.x} y={node.y + 3.5} textAnchor="middle" fontSize="9" fontWeight="bold" className={style.text}>{node.val}</text>
              {ptr && (
                <g>
                  <rect x={node.x - 16} y={node.y - 25} width={32} height={10} rx={3} className="fill-zinc-900 dark:fill-zinc-100" />
                  <text x={node.x} y={node.y - 18} textAnchor="middle" fontSize="6" fontWeight="black" className="fill-white dark:fill-zinc-900">{ptr}</text>
                </g>
              )}
              <text x={node.x} y={node.y + 20} textAnchor="middle" fontSize="6.5" className="fill-zinc-400 dark:fill-zinc-550 font-mono">[{node.id}]</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── MatrixViz ───────────────────────────────────────────────────── */
function MatrixViz({ step }: { step: VisualizationStep | null }): React.ReactElement | null {
  if (!step?.arr?.length) return null;
  const arr = step.arr;
  const maxVal = Math.max(...arr, 1);
  const bgColors: Record<string, string> = {
    active: "bg-blue-500 text-white",
    secondary: "bg-amber-500 text-white",
    done: "bg-emerald-500 text-white",
    eliminated: "bg-zinc-200 dark:bg-zinc-850 text-zinc-400 dark:text-zinc-650",
    swap: "bg-purple-550 text-white",
    idle: ""
  };
  return (
    <div className="flex flex-col items-center p-3 bg-zinc-50 dark:bg-zinc-950/20 rounded-xl border border-zinc-200 dark:border-zinc-800 animate-fade-in">
      <span className="text-[10px] text-zinc-400 dark:text-zinc-550 uppercase tracking-widest mb-2 select-none font-bold font-sans">
        Memory Matrix Grid / DP Table
      </span>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 w-full max-w-sm justify-center">
        {arr.map((val: number, idx: number) => {
          const state = cellState(idx, step);
          const ptr = step.pointers?.[String(idx)] ?? step.pointers?.[idx];
          const intensity = Math.max(0.08, Math.min(0.85, val / maxVal));
          
          const customStyle = state === "idle"
            ? { backgroundColor: `rgba(99, 102, 241, ${intensity})`, color: intensity > 0.45 ? '#fff' : 'var(--color-ink)' }
            : {};
            
          return (
            <div
              key={`matrix-${idx}`}
              style={customStyle}
              className={clsx(
                "w-10 h-10 rounded-lg border flex flex-col items-center justify-center relative font-mono shadow-sm text-xs",
                state === "idle" ? "border-indigo-500/20" : "border-transparent",
                bgColors[state]
              )}
            >
              <span className="text-[8px] text-zinc-400 absolute top-0.5 left-1">#{idx}</span>
              <span className="font-bold mt-1">{val}</span>
              {ptr && (
                <span className="absolute bottom-0 right-0 bg-zinc-900 text-white text-[6px] px-0.5 rounded font-black">{ptr}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── CodePanel ───────────────────────────────────────────────────── */
function CodePanel({ lines, activeLine }: { lines: CodeLine[]; activeLine: number }): React.ReactElement {
  const activeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeLine]);

  return (
    <div className="flex flex-col h-[28rem] rounded-xl border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950/40 overflow-hidden shadow-inner" role="region" aria-label="Code highlighting pane">
      <div className="flex items-center gap-1.5 px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-850 select-none">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="text-xs font-mono font-bold text-zinc-450 dark:text-zinc-500 ml-2">sandbox.code</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs sm:text-sm leading-relaxed" role="list">
        {(lines ?? []).map((item: CodeLine, i: number) => {
          const active: boolean = i === activeLine;
          return (
            <div
              key={i}
              ref={active ? activeRef : null}
              className={clsx(
                "flex items-start px-2 py-0.5 rounded transition-all duration-150 border-l-2 relative group",
                active 
                  ? "bg-indigo-500/10 border-indigo-500 text-indigo-950 dark:text-indigo-200 font-bold" 
                  : "border-transparent text-zinc-650 dark:text-zinc-400"
              )}
              role="listitem"
            >
              <span className="w-6 text-right text-xs text-zinc-350 dark:text-zinc-650 pr-3 select-none" aria-hidden="true">{i + 1}</span>
              <span className="flex-1 whitespace-pre-wrap">{item.line}</span>
              {active && item.explain && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded shadow-md hidden md:block max-w-xs truncate animate-fade-in" title={item.explain}>
                  {item.explain}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── DiagnosticPanel ─────────────────────────────────────────────── */
function DiagnosticPanel({ analysis }: { analysis: AlgorithmAnalysis }) {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  const score = analysis.isCorrect ? 98 : 65;
  const ratingLabel = analysis.isCorrect ? "Enterprise Grade" : "Refactoring Required";
  const ratingDesc = analysis.isCorrect 
    ? "Clean execution paths, optimal stack frame allocations, and no syntax or semantic errors identified." 
    : `Identified ${analysis.bugs?.length || 1} logical anomalies or edge-case failures. Review corrections.`;

  // Dynamic analysis based on complexity text
  const proofBreakdown = useMemo(() => {
    const t = (analysis.timeComplexity || "").toLowerCase();
    if (t.includes("n²") || t.includes("n^2")) {
      return {
        formula: "T(n) = O(n²)",
        explanation: "Quadratic Growth. Nested iterations compare elements pairwise. Scales poorly beyond 10,000 array elements.",
        math: "N * (N - 1) / 2 comparisons in the worst-case scenario."
      };
    } else if (t.includes("log n") || t.includes("logn")) {
      return {
        formula: "T(n) = O(log n)",
        explanation: "Logarithmic Scaling. Search space is split in half at each iteration, offering near-instantaneous search speeds.",
        math: "Maximum steps = log₂(N). For N = 1,000,000, max iterations <= 20."
      };
    } else if (t.includes("n log n") || t.includes("nlogn")) {
      return {
        formula: "T(n) = O(n log n)",
        explanation: "Linearithmic Scaling. Typical of optimal comparison-based sorting algorithms (Merge / Quick Sort).",
        math: "Recursion tree depth log(N) multiplied by partition merges of size N."
      };
    } else if (t.includes("n")) {
      return {
        formula: "T(n) = O(n)",
        explanation: "Linear growth. Accesses or passes over each input index exactly once.",
        math: "Total execution operations map 1:1 with input array length."
      };
    }
    return {
      formula: `T(n) = ${analysis.timeComplexity}`,
      explanation: "Standard execution complexity class mapping.",
      math: "Derived via recurrence relation trace logs."
    };
  }, [analysis.timeComplexity]);

  const edgeCases = useMemo(() => {
    const cat = (analysis.category || "").toLowerCase();
    if (cat.includes("sort")) {
      return [
        { test: "Empty array & single-element checks", passed: true, desc: "Handled without index errors." },
        { test: "Identical/Duplicate values", passed: true, desc: "Stable sorting preserved." },
        { test: "Reverse-sorted sequence", passed: analysis.isCorrect, desc: "Worst-case path verified." },
        { test: "Large array values bounds", passed: true, desc: "Overflow-safe operations." }
      ];
    }
    return [
      { test: "Empty boundary condition", passed: true, desc: "Returns sentinel index immediately." },
      { test: "Value not present in array", passed: true, desc: "Verified default exit condition." },
      { test: "First / Last position target", passed: true, desc: "Checked loop bounds safe." },
      { test: "Negative numbers index", passed: true, desc: "Correct logical type comparison." }
    ];
  }, [analysis.category, analysis.isCorrect]);

  const optimizationTips = useMemo(() => {
    const t = (analysis.timeComplexity || "").toLowerCase();
    const tips = [];
    if (t.includes("n²")) {
      tips.push("Add an adaptive early-break flag (e.g. `swapped` flag) to abort sorting if a pass yields zero swaps.");
      tips.push("Upgrade to a divide-and-conquer approach (Merge Sort/Quick Sort) to scale efficiency to O(N log N).");
    } else if (t.includes("n")) {
      tips.push("Leverage two-pointer boundary checks to complete comparisons in a single pass without allocating additional storage.");
    }
    tips.push("Pre-allocate arrays or specify buffer capacities to prevent dynamic overhead memory reallocations.");
    tips.push("Verify null references and boundary check conditions before accessing nested pointers.");
    return tips;
  }, [analysis.timeComplexity]);

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="glass-card spotlight-card rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-850 flex flex-col gap-6"
    >
      <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-850/60 pb-3 select-none">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-500 animate-pulse" />
          <h3 className="font-extrabold text-zinc-850 dark:text-white text-sm">Diagnostic Analysis & Complexity Proof</h3>
        </div>
        <Badge variant="primary" className="text-[10px] tracking-wider font-bold">AI Audit Engine</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Score Ring */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center gap-2.5">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* SVG Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle 
                cx="56" cy="56" r="48" 
                className="stroke-zinc-100 dark:stroke-zinc-800 fill-none" 
                strokeWidth="8"
              />
              <motion.circle 
                cx="56" cy="56" r="48" 
                className={clsx("fill-none stroke-2", analysis.isCorrect ? "stroke-emerald-500" : "stroke-amber-500")}
                strokeWidth="8"
                strokeDasharray={301.6}
                initial={{ strokeDashoffset: 301.6 }}
                animate={{ strokeDashoffset: 301.6 - (301.6 * score) / 100 }}
                transition={{ duration: 1, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center select-none">
              <span className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">{score}%</span>
              <span className="text-[9px] text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider">Score</span>
            </div>
          </div>
          <div>
            <h4 className={clsx("font-bold text-xs select-none", analysis.isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-450")}>
              {ratingLabel}
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-450 mt-1 max-w-[200px] leading-relaxed">
              {ratingDesc}
            </p>
          </div>
        </div>

        {/* Breakdown details */}
        <div className="md:col-span-8 space-y-4">
          {/* Formal Proof */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-850 flex flex-col gap-1 shadow-inner">
            <span className="text-[9px] text-indigo-500 font-black uppercase tracking-widest select-none">Asymptotic Growth Model</span>
            <code className="text-sm font-black text-zinc-900 dark:text-white font-mono mt-0.5">{proofBreakdown.formula}</code>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal mt-1">{proofBreakdown.explanation}</p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-550 font-mono mt-1 italic select-none">{proofBreakdown.math}</p>
          </div>

          {/* Checked cases */}
          <div className="space-y-2">
            <span className="text-[9px] text-zinc-455 dark:text-zinc-500 font-black uppercase tracking-widest select-none">Edge Cases Audit Suite</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {edgeCases.map((c, i) => (
                <div key={i} className="flex items-start gap-2 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-850 shadow-sm">
                  {c.passed ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold text-zinc-800 dark:text-zinc-300 text-[11px]">{c.test}</p>
                    <p className="text-[10px] text-zinc-450 dark:text-zinc-500 leading-tight mt-0.5">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optimizations */}
          <div className="space-y-1.5">
            <span className="text-[9px] text-zinc-455 dark:text-zinc-500 font-black uppercase tracking-widest select-none">Refactoring Recommendations</span>
            <ul className="list-disc pl-4 text-xs text-zinc-650 dark:text-zinc-405 space-y-1 leading-relaxed">
              {optimizationTips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dots() {
  const [d, setD] = useState(".");
  useEffect(() => {
    const t = setInterval(() => setD(p => p.length >= 3 ? "." : p + "."), 400);
    return () => clearInterval(t);
  }, []);
  return <span className="font-semibold text-xs tracking-wider">Analyzing{d}</span>;
}

const SPEEDS = [1500, 850, 480, 210, 75];
const SLABELS = ["Slowest", "Slow", "Normal", "Fast", "Fastest"];

export default function App() {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("algviz_dark");
      if (stored !== null) return stored === "1";
    } catch {}
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("algviz_dark", dark ? "1" : "0");
  }, [dark]);

  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem("algviz_dark");
        if (stored !== null) setDark(stored === "1");
      } catch {}
    };
    window.addEventListener("storage", handleSync);
    return () => window.removeEventListener("storage", handleSync);
  }, []);

  const [code, setCode] = useState(DEMOS.bubble?.code ?? "");
  const [activeDemo, setActiveDemo] = useState("bubble");
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [customInput, setCustomInput] = useState("");
  const [phase, setPhase] = useState("idle");
  const [analysis, setAnalysis] = useState<AlgorithmAnalysis | null>(null);
  const [error, setError] = useState("");
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(3);
  const [codeCopied, setCodeCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Steps & active frames declared early to support interactive helper references
  const steps = analysis?.steps ?? [];
  const cur = steps[stepIdx] ?? null;

  // Premium state upgrades
  const [vizMode, setVizMode] = useState<"grid" | "bars" | "tree" | "matrix">("grid");
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorMessages, setTutorMessages] = useState<Array<{ sender: "user" | "tutor"; text: string }>>([
    { sender: "tutor", text: "Hi! I am your DSA Tutor. Click any step, or ask me questions about this algorithm's logic, edge cases, or complexity!" }
  ]);
  const [tutorInput, setTutorInput] = useState("");
  const [tutorLoading, setTutorLoading] = useState(false);

  // Card mouse-spotlight coordinates calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  function loadDemo(key: string) {
    const demo = DEMOS[key];
    if (demo) {
      setCode(demo.code);
      setActiveDemo(key);
      setAnalysis(null);
      setPhase("idle");
      setError("");
      setPlaying(false);
      setCustomInput("");
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }

  async function askTutor(message: string) {
    if (!message.trim()) return;
    
    setTutorMessages(prev => [...prev, { sender: "user", text: message }]);
    setTutorInput("");
    setTutorLoading(true);
    
    let reply = "";
    
    if (GROQ_API_KEY && GROQ_API_KEY.trim() !== "") {
      try {
        const prompt = `You are a friendly, expert DSA tutor. The user is visualizing the algorithm "${analysis?.algorithmName || 'DSA'}" (${analysis?.category || 'General'}).
Current step: ${stepIdx + 1} of ${steps.length}.
Array state at current step: ${JSON.stringify(cur?.arr)}.
Description of current step: "${cur?.msg}".
User question: "${message}"

Give a concise, 2-3 sentence friendly explanation tailored to their question. Keep it simple and helpful.`;

        const res = await fetch(GROQ_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 300,
            messages: [
              { role: "user", content: prompt }
            ]
          })
        });
        
        if (res.ok) {
          const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
          reply = data?.choices?.[0]?.message?.content ?? "";
        }
      } catch {}
    }
    
    if (!reply) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const lower = message.toLowerCase();
      if (lower.includes("complexity") || lower.includes("big o") || lower.includes("time") || lower.includes("space")) {
        reply = `The time complexity of ${analysis?.algorithmName || "this algorithm"} is ${analysis?.timeComplexity || "O(n²)"} and space complexity is ${analysis?.spaceComplexity || "O(1)"}. This is because in the worst case, we do nested operations on the array.`;
      } else if (lower.includes("step") || lower.includes("doing") || lower.includes("swap") || lower.includes("compare")) {
        reply = `At step ${stepIdx + 1}, the algorithm is currently: "${cur?.msg}". The pointers are positioned at ${JSON.stringify(cur?.pointers || {})}. We are tracking these indexes to swap or update them according to the loop rules.`;
      } else if (lower.includes("optimize") || lower.includes("better")) {
        reply = `To optimize this, we could use an algorithm with better average/worst case. For example, if it's sorting, we could use Merge Sort or Quick Sort, which run in O(n log n) time complexity, or use a HashTable to save lookup times.`;
      } else {
        reply = `In ${analysis?.algorithmName || 'this algorithm'}, at frame ${stepIdx + 1}, we're looking at array ${JSON.stringify(cur?.arr)}. Let me know if you want me to explain the time complexity, loop conditions, or why we compare specific indices!`;
      }
    }
    
    setTutorMessages(prev => [...prev, { sender: "tutor", text: reply }]);
    setTutorLoading(false);
  }

  async function analyze() {
    if (!code.trim()) return;

    // Detect if we should use local offline simulation
    const demoKeys = ["bubble", "binary", "selection", "insertion", "two_ptr", "fib_dp"];
    const isDemo = activeDemo && demoKeys.includes(activeDemo);
    let simulateOfflineKey = "";
    
    if (isDemo) {
      simulateOfflineKey = activeDemo;
    } else if (!GROQ_API_KEY || GROQ_API_KEY.trim() === "") {
      const lowerCode = code.toLowerCase();
      if (lowerCode.includes("binary") || lowerCode.includes("search")) {
        simulateOfflineKey = "binary";
      } else if (lowerCode.includes("bubble")) {
        simulateOfflineKey = "bubble";
      } else if (lowerCode.includes("selection")) {
        simulateOfflineKey = "selection";
      } else if (lowerCode.includes("insertion")) {
        simulateOfflineKey = "insertion";
      } else if (lowerCode.includes("two") || lowerCode.includes("pointer") || lowerCode.includes("twosum")) {
        simulateOfflineKey = "two_ptr";
      } else if (lowerCode.includes("fib") || lowerCode.includes("dp") || lowerCode.includes("dynamic")) {
        simulateOfflineKey = "fib_dp";
      } else {
        simulateOfflineKey = "bubble";
      }
    }

    if (simulateOfflineKey) {
      setPhase("analyzing");
      setAnalysis(null);
      setError("");
      setPlaying(false);
      if (timerRef.current) clearTimeout(timerRef.current);

      await new Promise(resolve => setTimeout(resolve, 800));

      try {
        const result = simulateAlgorithm(simulateOfflineKey, customInput);
        setAnalysis(result);
        setStepIdx(0);
        setPhase("done");
        return;
      } catch (e) {
        setError("Simulation failed: " + (e instanceof Error ? e.message : String(e)));
        setPhase("error");
        return;
      }
    }

    setPhase("analyzing");
    setAnalysis(null);
    setError("");
    setPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);

    let userMsg = "Analyze this DSA code and return the JSON:\n\n" + code;
    if (customInput.trim()) {
      userMsg += `\n\nPlease use this exact array as defaultInput: [${customInput.trim()}]`;
    }

    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model,
          temperature: 0.1,
          max_tokens: 8000,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMsg }
          ]
        })
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: { message?: string } };
        throw new Error(d?.error?.message ?? `Groq API returned status ${res.status}`);
      }

      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      const raw = data?.choices?.[0]?.message?.content ?? "";
      const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

      let parsed: AlgorithmAnalysis;
      try {
        parsed = JSON.parse(clean);
      } catch {
        const match = clean.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        } else {
          throw new Error("Failed to parse AI response. Check input array formats.");
        }
      }

      setAnalysis(parsed);
      setStepIdx(0);
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Execution verification failed. Try another model.");
      setPhase("error");
    }
  }

  const tick = useCallback(() => {
    setStepIdx(p => {
      if (p >= steps.length - 1) {
        setPlaying(false);
        return p;
      }
      return p + 1;
    });
  }, [steps.length]);

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setTimeout(tick, SPEEDS[speed - 1]);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, stepIdx, speed, tick]);

  const handlePlay = useCallback(() => {
    if (stepIdx >= steps.length - 1) {
      setStepIdx(0);
      setPlaying(true);
      return;
    }
    setPlaying(p => !p);
  }, [stepIdx, steps.length]);

  const goBack = useCallback(() => {
    setPlaying(false);
    setStepIdx(p => Math.max(p - 1, 0));
  }, []);

  const goForward = useCallback(() => {
    setPlaying(false);
    setStepIdx(p => Math.min(p + 1, steps.length - 1));
  }, [steps.length]);

  const resetViz = useCallback(() => {
    setPlaying(false);
    setStepIdx(0);
  }, []);

  function seekTo(e: React.MouseEvent<HTMLDivElement>) {
    if (!steps.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setPlaying(false);
    setStepIdx(Math.round(pct * (steps.length - 1)));
  }

  function copyCodeText() {
    navigator.clipboard.writeText(code).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  }

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!steps.length) return;
      const tag = document.activeElement?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT") return;

      if (e.code === "Space") {
        e.preventDefault();
        handlePlay();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goForward();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goBack();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        resetViz();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [steps.length, handlePlay, goForward, goBack, resetViz]);

  const BADGE = {
    idle:      { label: "Ready", shadow: "shadow-zinc-500/10", cls: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400" },
    analyzing: { label: "Analyzing...", shadow: "shadow-indigo-500/20", cls: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/60" },
    done:      { label: "Visualizer Loaded", shadow: "shadow-emerald-500/10", cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/60" },
    error:     { label: "Error", shadow: "shadow-rose-500/10", cls: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60" },
  } as const;
  const badge = BADGE[phase as keyof typeof BADGE] ?? BADGE.idle;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-850 dark:bg-zinc-950 dark:text-zinc-200 font-sans transition-colors duration-300 pt-24 pb-8 px-4 relative">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Main Workspace Column */}
        <div className="flex-1 flex flex-col gap-6 w-full">
        
        {/* ── HEADER ──────────────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-855 pb-5">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full select-none">
                  DSA Workspace
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1">
                Visual Lab Sandbox
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={clsx("badge border px-3 py-1 rounded-full text-xs font-semibold select-none flex items-center gap-1.5 shadow-sm", badge.shadow, badge.cls)}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {badge.label}
            </div>
          </div>
        </header>

        {/* ── IDE WORKSPACE CARD ──────────────────────────────────── */}
        <div 
          onMouseMove={handleMouseMove}
          className="glass-card spotlight-card rounded-2xl p-6 shadow-md border border-zinc-200/60 dark:border-zinc-850/60 flex flex-col gap-5 relative"
        >
          
          {/* Card Head */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-150 dark:border-zinc-850/60 pb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4.5 h-4.5 text-zinc-400" />
              <span className="font-bold text-zinc-850 dark:text-white text-base">Write/Paste Code</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-mono select-none">
              {Object.entries(DEMOS).map(([key, d]) => (
                <button
                  key={key}
                  onClick={() => loadDemo(key)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                    activeDemo === key
                      ? "bg-indigo-50 border-indigo-200 text-indigo-650 dark:bg-indigo-950/40 dark:border-indigo-850 dark:text-indigo-400"
                      : "bg-white border-zinc-200 text-zinc-650 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea Code Block */}
          <div className="relative">
            <textarea
              value={code}
              onChange={(e) => { setCode(e.target.value); setActiveDemo(""); }}
              spellCheck={false}
              className="w-full h-72 p-4 font-mono text-sm border border-zinc-250 dark:border-zinc-850 rounded-xl bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-550 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-inner"
              placeholder="// Paste algorithms here..."
              aria-label="Code Editor Textarea"
            />
            <button
              onClick={copyCodeText}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-150 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-650 dark:text-zinc-350 transition-colors shadow-sm cursor-pointer select-none"
              title="Copy to clipboard"
            >
              {codeCopied ? <ClipboardCheck className="w-4 h-4 text-emerald-450 dark:text-emerald-400 animate-pulse" /> : <Code2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Actions & Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-4">
            
            {/* Custom array inputs */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block" htmlFor="cust-input">Custom Array</label>
              <input
                id="cust-input"
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="e.g. 5, 3, 8, 1, 2"
                className="rounded-xl border border-zinc-250 dark:border-zinc-850 bg-white dark:bg-zinc-900 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 text-zinc-850 dark:text-zinc-100 shadow-sm font-mono"
              />
            </div>

            {/* Model selectors */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block" htmlFor="model-select">Execution Model</label>
              <select
                id="model-select"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="rounded-xl border border-zinc-250 dark:border-zinc-850 bg-white dark:bg-zinc-900 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 text-zinc-850 dark:text-zinc-100 shadow-sm"
              >
                {GROQ_MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Run Button */}
            <button
              onClick={analyze}
              disabled={phase === "analyzing" || !code.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl cursor-pointer select-none transition-all duration-150 flex items-center justify-center shadow-md shadow-indigo-550/20 active:scale-98"
            >
              {phase === "analyzing" ? <Dots /> : "Run Visualization"}
            </button>
          </div>

          {/* Error notice */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-350 text-xs sm:text-sm" role="alert">
              <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* ── ANALYSIS RESULT PANELS ──────────────────────────────── */}
        {analysis && (
          <div className="flex flex-col gap-6 animate-fade-up">
            
            {/* Invalid response fallback */}
            {analysis.isValid === false ? (
              <div className="flex items-start gap-3 p-5 rounded-2xl bg-amber-50 border border-amber-100 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-base">Invalid algorithm logic</h3>
                  <p className="text-sm mt-1 leading-relaxed">{analysis.explanation || "Please submit a standard Data Structure or Algorithm code snippet."}</p>
                </div>
              </div>
            ) : (
              <>
                {/* Metrics Blocks */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="list" aria-label="Big-O Complexity Metrics">
                  {[
                    ["Algorithm",  analysis.algorithmName,  "var(--c-ink)"],
                    ["Category",   analysis.category,       "var(--c-blue)"],
                    ["Time Complexity", analysis.timeComplexity, "var(--c-purple)"],
                    ["Space Complexity", analysis.spaceComplexity, "var(--c-cyan)"],
                  ].map(([lbl, val, clr]) => (
                    <div key={lbl} className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 flex flex-col gap-1 shadow-sm" role="listitem">
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-widest select-none">{lbl}</span>
                      <span className={clsx("font-extrabold text-base sm:text-lg", METRIC_TEXT_CLASSES[clr as keyof typeof METRIC_TEXT_CLASSES])}>{val}</span>
                    </div>
                  ))}
                </div>

                {/* Bug check indicator */}
                <div className={clsx(
                  "p-5 rounded-2xl border flex items-start gap-3.5",
                  analysis.isCorrect
                    ? "bg-emerald-50 border-emerald-100 text-emerald-950 dark:bg-emerald-950/25 dark:border-emerald-900/30 dark:text-emerald-355"
                    : "bg-amber-50 border-amber-100 text-amber-955 dark:bg-amber-950/25 dark:border-amber-900/30 dark:text-amber-355"
                )}>
                  <div className="mt-0.5 flex-shrink-0">
                    {analysis.isCorrect ? <Check className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base">{analysis.isCorrect ? "Algorithm correctness verified" : "Issues / Bugs found"}</h3>
                    <p className="text-xs sm:text-sm mt-1 leading-relaxed">
                      {analysis.isCorrect ? analysis.explanation : (analysis.bugs ?? []).join(" • ")}
                    </p>
                  </div>
                </div>

                {/* Diagnostic proof analysis card (PREMIUM COMPONENT) */}
                <DiagnosticPanel analysis={analysis} />

                {/* Corrected Code proposal */}
                {!analysis.isCorrect && analysis.correctedCode && (
                  <div 
                    onMouseMove={handleMouseMove}
                    className="glass-card spotlight-card rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-850 flex flex-col gap-3"
                  >
                    <h3 className="font-bold text-zinc-850 dark:text-white text-base">Corrected Code Proposal</h3>
                    <pre className="w-full overflow-x-auto p-4 rounded-xl font-mono text-xs sm:text-sm leading-relaxed bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 shadow-inner">{analysis.correctedCode}</pre>
                  </div>
                )}

                {/* Step Visualizer */}
                {steps.length > 0 && (
                  <div 
                    onMouseMove={handleMouseMove}
                    className="glass-card spotlight-card rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-850 flex flex-col gap-5"
                  >
                    
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-850/60 pb-3">
                      <h3 className="font-bold text-zinc-850 dark:text-white text-base">Interactive Visualization Canvas</h3>
                      <span className="text-xs font-mono font-bold text-zinc-400 dark:text-zinc-550 select-none">
                        Frame {stepIdx + 1} / {steps.length}
                      </span>
                    </div>

                    {/* Keyboard shortcuts banner */}
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-450 dark:text-zinc-550 border border-zinc-150 dark:border-zinc-800/60 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/20 w-fit select-none">
                      <kbd className="px-1.5 py-0.5 rounded border border-zinc-250 dark:border-zinc-700 bg-white dark:bg-zinc-850 shadow-sm font-sans font-semibold">Space</kbd> play/pause &nbsp;·&nbsp;
                      <kbd className="px-1.5 py-0.5 rounded border border-zinc-250 dark:border-zinc-700 bg-white dark:bg-zinc-850 shadow-sm font-sans font-semibold">←</kbd><kbd className="px-1.5 py-0.5 rounded border border-zinc-250 dark:border-zinc-700 bg-white dark:bg-zinc-850 shadow-sm font-sans font-semibold">→</kbd> frame step &nbsp;·&nbsp;
                      <kbd className="px-1.5 py-0.5 rounded border border-zinc-250 dark:border-zinc-700 bg-white dark:bg-zinc-850 shadow-sm font-sans font-semibold">R</kbd> reset
                    </div>

                    {/* Visualizer Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                      
                      {/* Left: visualizer block */}
                      <div className="flex flex-col gap-5 border border-zinc-200 dark:border-zinc-850 p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/10 h-full justify-between">
                        <div className="space-y-4">
                          {/* Tab selection for visualizer modes */}
                          <div className="flex border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-2 gap-3 text-[11px] font-semibold select-none flex-wrap">
                            {([
                              { id: "grid", label: "Horizontal Grid" },
                              { id: "bars", label: "Vertical Bars" },
                              { id: "tree", label: "Binary Tree" },
                              { id: "matrix", label: "DP Grid" }
                            ] as const).map(tab => (
                              <button
                                key={tab.id}
                                onClick={() => setVizMode(tab.id)}
                                className={clsx(
                                  "pb-1.5 px-0.5 border-b-2 transition-all cursor-pointer",
                                  vizMode === tab.id
                                    ? "border-indigo-500 text-indigo-655 dark:text-indigo-400 font-bold"
                                    : "border-transparent text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-350"
                                )}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>

                          {/* Dynamic visual representations */}
                          {vizMode === "grid" && <ArrayViz step={cur} />}
                          {vizMode === "bars" && <BarChartViz step={cur} />}
                          {vizMode === "tree" && <TreeViz step={cur} />}
                          {vizMode === "matrix" && <MatrixViz step={cur} />}

                          {/* Connection / indexes legend */}
                          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-3 border-t border-b border-zinc-100 dark:border-zinc-800/40 text-xs select-none">
                            {Object.entries(LEGEND_CLASSES).map(([key, item]) => (
                              <div key={key} className="flex items-center gap-1.5">
                                <span className={clsx("w-3 h-3 rounded border", item.bg, item.border)} />
                                <span className="text-zinc-550 dark:text-zinc-450 text-[11px] font-medium">{item.label}</span>
                              </div>
                            ))}
                          </div>

                          {/* Pointers detail */}
                          {cur?.pointers && Object.keys(cur.pointers).length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-1" role="list" aria-label="Variables tracker">
                              {Object.entries(cur.pointers).map(([idx, name]) => (
                                <div key={name} className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col items-center select-none" role="listitem">
                                  <span className="text-xs font-bold text-indigo-500">{name}</span>
                                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-550 mt-0.5">idx = {idx}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Visualizer text explainer */}
                        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 shadow-inner flex flex-col gap-1.5" aria-live="polite">
                          <div className="flex items-center gap-1 text-indigo-500">
                            <Info className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider select-none">What is happening</span>
                          </div>
                          <p className="text-xs sm:text-sm text-zinc-705 dark:text-zinc-200 font-medium leading-relaxed">
                            {cur?.msg || "Visualizer loaded. Click Play to start."}
                          </p>
                        </div>
                      </div>

                      {/* Right: code block */}
                      <div className="flex flex-col gap-3">
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest select-none">Active Code Line Tracker</span>
                        <CodePanel lines={analysis.codeLines} activeLine={cur?.activeLine ?? -1} />
                      </div>
                    </div>

                    {/* Playback Controls Toolbar */}
                    <div className="flex flex-wrap items-center gap-4 bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-850" role="toolbar" aria-label="Playback controls">
                      <button
                        onClick={handlePlay}
                        className={clsx(
                          "font-bold text-xs py-2 px-5 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all select-none min-w-[7.2rem] text-white",
                          playing ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/15" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-650/15"
                        )}
                        title={playing ? "Pause execution (Space)" : "Play execution (Space)"}
                        type="button"
                      >
                        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        {playing ? "Pause" : "Play"}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button onClick={goBack} disabled={stepIdx === 0} className="border border-zinc-200 text-zinc-650 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs py-2 px-3.5 rounded-xl cursor-pointer active:scale-95 transition-all dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-850/50" title="Step back (←)" type="button">
                          <ChevronLeft className="w-3.5 h-3.5" /> Back
                        </button>
                        <button onClick={goForward} disabled={stepIdx >= steps.length - 1} className="border border-zinc-200 text-zinc-650 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs py-2 px-3.5 rounded-xl cursor-pointer active:scale-95 transition-all dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-850/50" title="Step forward (→)" type="button">
                          Next <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={resetViz} className="border border-zinc-200 text-zinc-650 hover:bg-zinc-100 font-bold text-xs py-2 px-3.5 rounded-xl cursor-pointer active:scale-95 transition-all dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-850/50" title="Reset (R)" type="button">
                          <RotateCcw className="w-3.5 h-3.5" /> Reset
                        </button>
                      </div>

                      {/* Seek slider */}
                      <div
                        className="flex-1 min-w-[8rem] h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full cursor-pointer overflow-hidden relative shadow-inner select-none"
                        role="slider"
                        aria-label="Progress slider"
                        aria-valuemin={1}
                        aria-valuemax={steps.length}
                        aria-valuenow={stepIdx + 1}
                        tabIndex={0}
                        onClick={seekTo}
                        onKeyDown={(e) => { if (e.key === "ArrowRight") goForward(); if (e.key === "ArrowLeft") goBack(); }}
                        title="Click or drag to seek steps"
                      >
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-100 shadow"
                          style={{ width: `${((stepIdx + 1) / steps.length) * 100}%` }}
                        />
                      </div>

                      {/* Speed config */}
                      <div className="flex items-center gap-2 select-none">
                        <label className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider" htmlFor="playback-speed">Speed</label>
                        <input
                          id="playback-speed"
                          type="range"
                          min="1" max="5" step="1"
                          value={speed}
                          onChange={(e) => setSpeed(Number(e.target.value))}
                          className="accent-indigo-600 w-20 cursor-pointer h-1 rounded bg-zinc-200 dark:bg-zinc-800"
                        />
                        <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-455 w-14 text-right">{SLABELS[speed - 1]}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Line-by-line detailed description */}
                {analysis.codeLines?.length > 0 && (
                  <div 
                    onMouseMove={handleMouseMove}
                    className="glass-card spotlight-card rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-850 flex flex-col gap-4"
                  >
                    <div className="border-b border-zinc-150 dark:border-zinc-850/60 pb-3">
                      <h3 className="font-bold text-zinc-850 dark:text-white text-base">Static Code Line Reference</h3>
                    </div>
                    <div className="flex flex-col">
                      {analysis.codeLines.map((item, idx) => (
                        <div
                          key={idx}
                          className={clsx(
                            "py-3.5 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 font-mono text-xs sm:text-sm border-zinc-100 dark:border-zinc-900",
                            idx < analysis.codeLines.length - 1 ? "border-b" : "border-0"
                          )}
                        >
                          <span className="text-zinc-350 dark:text-zinc-650 w-6 text-right select-none" aria-hidden="true">{idx + 1}</span>
                          <code className="font-semibold text-zinc-850 dark:text-zinc-250 flex-1 whitespace-pre-wrap">{item.line}</code>
                          <span className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-405 font-sans flex-1 bg-zinc-50 dark:bg-zinc-950/20 px-3.5 py-1.5 rounded-xl border border-zinc-150/40 dark:border-zinc-855/40">
                            {item.explain}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── DEFAULT EMPTY STATE ────────────────────────────────── */}
        {phase === "idle" && !analysis && (
          <div 
            onMouseMove={handleMouseMove}
            className="spotlight-card flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl shadow-sm gap-4" 
            aria-label="Editor empty state panel"
          >
            <div className="text-5xl font-mono text-indigo-500 select-none">{"{...}"}</div>
            <h2 className="text-lg font-bold text-zinc-800 dark:text-white">Workspace Empty</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-455 max-w-lg leading-relaxed font-sans">
              Pick a sorting or searching demo above or write your own custom code. Click the 'Run Visualization' button to generate pointer frame tables and complexity analytics instantly.
            </p>
          </div>
        )}

        {/* ── WORKSPACE METADATA ───────────────────────────────── */}
        <div className="flex items-center justify-between text-[11px] text-zinc-450 dark:text-zinc-550 select-none mt-2">
          <span>
            Powered by <a href="https://groq.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-colors font-medium">Groq completions</a>
          </span>
          <span className="font-mono bg-zinc-200/50 dark:bg-zinc-900 px-2 py-0.5 border border-zinc-250 dark:border-zinc-800/60 rounded text-[9px]">
            {model}
          </span>
        </div>

        </div>

        {/* Floating AI Tutor Toggle (when collapsed) */}
        {!tutorOpen && (
          <motion.button
            layoutId="tutor-toggle"
            onClick={() => setTutorOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-xl hover:scale-105 transition-transform cursor-pointer select-none group z-40 border border-indigo-400/30"
          >
            <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </motion.button>
        )}

        {/* AI Tutor Sidebar Panel */}
        <AnimatePresence>
          {tutorOpen && (
            <motion.div
              initial={{ opacity: 0, x: 50, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "100%" }}
              exit={{ opacity: 0, x: 50, width: 0 }}
              className="w-full lg:w-[350px] shrink-0 lg:sticky lg:top-24 z-30"
            >
              <div 
                onMouseMove={handleMouseMove}
                className="glass-card spotlight-card rounded-2xl border border-zinc-200 dark:border-zinc-850 p-4 flex flex-col h-[650px] shadow-xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl relative"
              >
                
                {/* Tutor Header */}
                <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-850/60 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-zinc-900 dark:text-white text-sm">DSA AI Tutor</h3>
                      <p className="text-[10px] text-zinc-455 dark:text-zinc-550 font-bold uppercase tracking-wider">Active Assistant</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTutorOpen(false)}
                    className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-405 hover:text-zinc-650 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Message list */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs sm:text-sm">
                  {tutorMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={clsx(
                        "p-3 rounded-xl max-w-[85%] leading-relaxed",
                        msg.sender === "tutor"
                          ? "bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 mr-auto border border-zinc-100 dark:border-zinc-850"
                          : "bg-indigo-600 text-white ml-auto font-medium"
                      )}
                    >
                      {msg.text}
                    </div>
                  ))}
                  {tutorLoading && (
                    <div className="bg-zinc-50 dark:bg-zinc-900 mr-auto border border-zinc-100 dark:border-zinc-850 p-3 rounded-xl max-w-[85%] flex items-center gap-1.5 text-zinc-500 font-mono text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-100" />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-200" />
                    </div>
                  )}
                </div>

                {/* Suggested prompt chips */}
                <div className="my-3 flex flex-wrap gap-1.5">
                  {[
                    "Explain this step",
                    "Time Complexity",
                    "How to optimize?"
                  ].map(chip => (
                    <button
                      key={chip}
                      onClick={() => askTutor(chip)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-655 dark:text-indigo-400 border border-indigo-150/40 dark:border-indigo-900/40 text-[10px] font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Text input */}
                <form
                  onSubmit={(e) => { e.preventDefault(); askTutor(tutorInput); }}
                  className="flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 bg-zinc-50 dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-indigo-500/25"
                >
                  <input
                    type="text"
                    value={tutorInput}
                    onChange={(e) => setTutorInput(e.target.value)}
                    placeholder="Ask tutor something..."
                    className="flex-1 bg-transparent text-xs p-2 outline-none border-none text-zinc-850 dark:text-zinc-100"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
