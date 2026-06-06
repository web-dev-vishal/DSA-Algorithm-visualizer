/**
 * App.tsx — DSA Algorithm Analyzer & Visualizer
 *
 * Fully typed with:
 *  - Typed interfaces for all props
 *  - Explicit generics on useState / useRef
 *  - Typed event handlers (React.MouseEvent, React.ChangeEvent)
 *  - useReducer with discriminated-union Action type for the playback state
 *  - No implicit any
 *
 * Styles: Tailwind CSS utility classes (inline styles removed except where
 * dynamic CSS custom properties are required for per-cell colors).
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useReducer,
} from "react";
import type React from "react";
import { clsx } from "clsx";
import type { AlgorithmAnalysis, VisualizationStep, CodeLine } from "./lib/api";
import "./App.css";

/* ─── Groq config ─────────────────────────────────────────────────── */
const GROQ_API_KEY: string = import.meta.env.VITE_groqApi as string ?? "";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

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
const DEFAULT_MODEL = GROQ_MODELS[0].id;

/* ─── System prompt ───────────────────────────────────────────────── */
const SYSTEM_PROMPT = `You are an expert DSA (Data Structures & Algorithms) tutor and step-by-step visualizer.
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

/* ─── Demo algorithms ─────────────────────────────────────────────── */
interface DemoEntry {
  label: string;
  lang: string;
  code: string;
}

type DemoKey = "bubble" | "binary" | "selection" | "insertion" | "two_ptr" | "remove_dup" | "linear" | "fib_dp";

const DEMOS: Record<DemoKey, DemoEntry> = {
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

/* ─── Cell color map ──────────────────────────────────────────────── */
type CellStateKey = "active" | "secondary" | "done" | "eliminated" | "swap" | "idle";

interface CellStyle {
  bg: string;
  border: string;
  text: string;
}

const COLORS: Record<CellStateKey, CellStyle> = {
  active:     { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  secondary:  { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
  done:       { bg: "#dcfce7", border: "#22c55e", text: "#166534" },
  eliminated: { bg: "#f1f5f9", border: "#cbd5e1", text: "#94a3b8" },
  swap:       { bg: "#ede9fe", border: "#8b5cf6", text: "#4c1d95" },
  idle:       { bg: "#ffffff", border: "#e2e8f0", text: "#334155" },
};

function cellState(idx: number, step: VisualizationStep | null): CellStateKey {
  if (!step) return "idle";
  if (step.swap?.includes(idx))       return "swap";
  if (step.highlight?.includes(idx))  return "active";
  if (step.secondary?.includes(idx))  return "secondary";
  if (step.eliminated?.includes(idx)) return "eliminated";
  if (step.done?.includes(idx))       return "done";
  return "idle";
}

/* ─── ArrayViz ────────────────────────────────────────────────────── */
interface ArrayVizProps {
  step: VisualizationStep | null;
}

function ArrayViz({ step }: ArrayVizProps): React.ReactElement | null {
  if (!step?.arr?.length) return null;
  return (
    <div className="array-viz">
      {step.arr.map((val, idx) => {
        const s   = COLORS[cellState(idx, step)];
        const ptr = step.pointers?.[String(idx)] ?? step.pointers?.[idx];
        return (
          <div key={idx} className="array-cell-wrapper">
            <span
              className="array-cell__ptr"
              style={{ color: ptr ? "#3b82f6" : "transparent" }}
              aria-label={ptr ? `pointer ${ptr} at index ${idx}` : undefined}
            >
              {ptr ?? "·"}
            </span>
            <div
              className="array-cell"
              style={{ background: s.bg, border: `2px solid ${s.border}`, color: s.text }}
              title={`[${idx}] = ${val}`}
            >
              {val}
            </div>
            <span className="array-cell__idx">[{idx}]</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── CodePanel ───────────────────────────────────────────────────── */
interface CodePanelProps {
  lines: CodeLine[];
  activeLine: number;
}

function CodePanel({ lines, activeLine }: CodePanelProps): React.ReactElement {
  const activeRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeLine]);

  return (
    <div className="code-panel">
      <div className="code-panel__titlebar">
        {(["#ff5f57", "#febc2e", "#28c840"] as const).map(c => (
          <span key={c} className="code-panel__dot" style={{ background: c }} />
        ))}
        <span className="code-panel__filename">algorithm</span>
      </div>
      <div className="code-panel__lines">
        {(lines ?? []).map((item, i) => {
          const active = i === activeLine;
          return (
            <div
              key={i}
              ref={active ? activeRef : null}
              className={clsx("code-line", active && "code-line--active")}
            >
              <span className="code-line__num">{i + 1}</span>
              <span className="code-line__code">{item.line}</span>
              {active && item.explain && (
                <span className="code-line__explain" title={item.explain}>
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
    const t = setInterval(() => setD(p => (p.length >= 3 ? "." : p + ".")), 420);
    return () => clearInterval(t);
  }, []);
  return <span>Analyzing{d}</span>;
}

/* ─── Speed / label maps ──────────────────────────────────────────── */
const SPEEDS: readonly number[]  = [1500, 850, 480, 210, 75] as const;
const SLABELS: readonly string[] = ["Slowest", "Slow", "Normal", "Fast", "Fastest"] as const;

/* ─── Phase type ─────────────────────────────────────────────────── */
type Phase = "idle" | "analyzing" | "done" | "error";

/* ─── Playback reducer ───────────────────────────────────────────── */
interface PlaybackState {
  stepIdx: number;
  playing: boolean;
  speed: number;  // 1–5
}

type PlaybackAction =
  | { type: "PLAY_TOGGLE"; totalSteps: number }
  | { type: "NEXT";  totalSteps: number }   // used by auto-play tick only
  | { type: "STEP_NEXT"; totalSteps: number } // manual forward button
  | { type: "STEP_PREV" }                    // manual back button
  | { type: "PREV" }
  | { type: "RESET" }
  | { type: "SEEK"; idx: number }
  | { type: "SET_SPEED"; speed: number }
  | { type: "STOP" };

function playbackReducer(state: PlaybackState, action: PlaybackAction): PlaybackState {
  switch (action.type) {
    case "PLAY_TOGGLE":
      if (state.stepIdx >= action.totalSteps - 1) {
        return { ...state, stepIdx: 0, playing: true };
      }
      return { ...state, playing: !state.playing };
    case "NEXT": {
      const nextIdx = Math.min(state.stepIdx + 1, action.totalSteps - 1);
      // Stop playing automatically when we reach the last step
      const reachedEnd = nextIdx >= action.totalSteps - 1;
      return {
        ...state,
        stepIdx: nextIdx,
        // Only stop if triggered manually (playing=false) or we hit the end
        playing: state.playing && !reachedEnd,
      };
    }
    case "STEP_NEXT":
      // Manual forward — always stops playback
      return { ...state, playing: false, stepIdx: Math.min(state.stepIdx + 1, action.totalSteps - 1) };
    case "STEP_PREV":
    case "PREV":
      return { ...state, playing: false, stepIdx: Math.max(state.stepIdx - 1, 0) };
    case "RESET":
      return { ...state, playing: false, stepIdx: 0 };
    case "SEEK":
      return { ...state, playing: false, stepIdx: action.idx };
    case "SET_SPEED":
      return { ...state, speed: action.speed };
    case "STOP":
      return { ...state, playing: false };
    default:
      return state;
  }
}

const initialPlayback: PlaybackState = { stepIdx: 0, playing: false, speed: 3 };

/* ═══════════════════════════════════════════════════════════════════ */
export default function App(): React.ReactElement {
  const [code,        setCode]        = useState<string>(DEMOS.bubble.code);
  const [activeDemo,  setActiveDemo]  = useState<DemoKey | "">( "bubble");
  const [model,       setModel]       = useState<string>(DEFAULT_MODEL);
  const [customInput, setCustomInput] = useState<string>("");
  const [phase,       setPhase]       = useState<Phase>("idle");
  const [analysis,    setAnalysis]    = useState<AlgorithmAnalysis | null>(null);
  const [error,       setError]       = useState<string>("");

  const [pb, dispatch] = useReducer(playbackReducer, initialPlayback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── load demo ────────────────────────────────────────────────── */
  function loadDemo(key: DemoKey): void {
    setCode(DEMOS[key].code);
    setActiveDemo(key);
    setAnalysis(null);
    setPhase("idle");
    setError("");
    dispatch({ type: "STOP" });
    setCustomInput("");
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  /* ── analyze ──────────────────────────────────────────────────── */
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
    dispatch({ type: "STOP" });
    if (timerRef.current) clearTimeout(timerRef.current);

    let userMsg = "Analyze this DSA code and return the JSON:\n\n" + code;
    if (customInput.trim()) {
      userMsg += `\n\nPlease use this exact array as defaultInput: [${customInput.trim()}]`;
    }

    try {
      const res = await fetch(GROQ_URL, {
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
        const d = await res.json().catch(() => ({})) as { error?: { message?: string } };
        const msg = d?.error?.message ?? "";
        if (res.status === 401) throw new Error("Invalid API key. Check your .env file.");
        if (res.status === 429) throw new Error("Rate limit hit. Wait a moment and try again.");
        if (res.status === 400 && msg.includes("model")) {
          throw new Error(`Model "${model}" is not available on your Groq plan. Try a different model.`);
        }
        throw new Error(msg || `Groq API error ${res.status}`);
      }

      const data  = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      const raw   = data?.choices?.[0]?.message?.content ?? "";

      const clean = raw
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/,           "")
        .trim();

      let parsed: AlgorithmAnalysis;
      try {
        parsed = JSON.parse(clean) as AlgorithmAnalysis;
      } catch {
        const match = clean.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]) as AlgorithmAnalysis;
        } else {
          throw new Error("AI returned invalid JSON. Try again or switch to a larger model.");
        }
      }

      setAnalysis(parsed);
      dispatch({ type: "SEEK", idx: 0 });
      setPhase("done");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Analysis failed. Try again.";
      setError(msg);
      setPhase("error");
    }
  }

  /* ── playback helpers ─────────────────────────────────────────── */
  const steps = analysis?.steps ?? [];
  const cur   = steps[pb.stepIdx] ?? null;

  const tick = useCallback(() => {
    dispatch({ type: "NEXT", totalSteps: steps.length });
  }, [steps.length]);

  useEffect(() => {
    if (!pb.playing) return;
    timerRef.current = setTimeout(tick, SPEEDS[pb.speed - 1]);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pb.playing, pb.stepIdx, pb.speed, tick]);

  const handlePlay = (): void => dispatch({ type: "PLAY_TOGGLE", totalSteps: steps.length });
  const goBack     = (): void => { if (timerRef.current) clearTimeout(timerRef.current); dispatch({ type: "STEP_PREV" }); };
  const goForward  = (): void => { if (timerRef.current) clearTimeout(timerRef.current); dispatch({ type: "STEP_NEXT", totalSteps: steps.length }); };
  const resetViz   = (): void => { if (timerRef.current) clearTimeout(timerRef.current); dispatch({ type: "RESET" }); };

  function seekTo(e: React.MouseEvent<HTMLDivElement>): void {
    if (!steps.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (timerRef.current) clearTimeout(timerRef.current);
    dispatch({ type: "SEEK", idx: Math.round(pct * (steps.length - 1)) });
  }

  /* ── keyboard shortcuts ───────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (!steps.length) return;
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT") return;
      if (e.code === "Space")          { e.preventDefault(); handlePlay(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); goForward(); }
      else if (e.key === "ArrowLeft")  { e.preventDefault(); goBack(); }
      else if (e.key === "r" || e.key === "R") resetViz();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps.length, pb.stepIdx, pb.playing]);

  /* ── status badge ─────────────────────────────────────────────── */
  const BADGE: Record<Phase, { label: string; cls: string }> = {
    idle:      { label: "Idle",         cls: "badge-idle"      },
    analyzing: { label: "Analyzing…",   cls: "badge-analyzing" },
    done:      { label: "Ready",        cls: "badge-done"      },
    error:     { label: "Error",        cls: "badge-error"     },
  };
  const badge = BADGE[phase];

  /* ── metric tiles data ────────────────────────────────────────── */
  type MetricTuple = [string, string, string];
  const metricTiles: MetricTuple[] = analysis
    ? [
        ["Algorithm",  analysis.algorithmName,   "var(--c-ink)"],
        ["Category",   analysis.category,        "var(--c-blue)"],
        ["Time",       analysis.timeComplexity,  "var(--c-purple)"],
        ["Space",      analysis.spaceComplexity, "var(--c-cyan)"],
      ]
    : [];

  /* ══════════════════════════════════════════════════════════════ */
  return (
    <div className="app">
      <div className="app__inner">

        {/* ── HEADER ──────────────────────────────────────────── */}
        <header className="header">
          <div className="header__left">
            <p className="header__eyebrow">DSA Lab</p>
            <h1 className="header__title">
              Algorithm Analyzer
              <span className="header__title-accent"> &amp; Visualizer</span>
            </h1>
          </div>
          <span className={clsx("badge", badge.cls)}>{badge.label}</span>
        </header>

        {/* ── INPUT CARD ──────────────────────────────────────── */}
        <div className="card">
          <div className="card-head">
            <span className="card-head__label">Your Code</span>
            <span className="card-head__sub">C++ · Python · Java · JavaScript</span>
          </div>

          {/* Demo strip */}
          <div className="demo-strip">
            <span className="demo-strip__label">Demo:</span>
            {(Object.entries(DEMOS) as Array<[DemoKey, DemoEntry]>).map(([key, d]) => (
              <button
                key={key}
                onClick={() => loadDemo(key)}
                className={clsx("demo-chip", activeDemo === key && "demo-chip--on")}
              >
                {d.label}
                <span className="demo-chip__lang">{d.lang}</span>
              </button>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            value={code}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setCode(e.target.value);
              setActiveDemo("");
            }}
            spellCheck={false}
            className="code-textarea"
            placeholder="// Paste any DSA algorithm here…"
            aria-label="DSA code input"
          />

          {/* Action row */}
          <div className="action-row">
            <div className="field">
              <label className="field__label" htmlFor="cust-input">Custom array (optional)</label>
              <input
                id="cust-input"
                type="text"
                value={customInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomInput(e.target.value)}
                placeholder="e.g.  5, 3, 8, 1, 2"
                className="field__input"
              />
              <span className="field__hint">Overrides the AI-chosen test array</span>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="model-sel">Model</label>
              <select
                id="model-sel"
                value={model}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setModel(e.target.value)}
                className="field__select"
              >
                {GROQ_MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
              <span className="field__hint">All models work with any Groq key</span>
            </div>

            <button
              onClick={() => void analyze()}
              disabled={phase === "analyzing" || !code.trim()}
              className="btn btn-primary"
            >
              {phase === "analyzing" ? <Dots /> : "Analyze + Visualize"}
            </button>
          </div>

          {error && (
            <div className="error-bar" role="alert">
              <span className="error-bar__icon">⚠</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* ── RESULTS ─────────────────────────────────────────── */}
        {analysis && (
          <>
            {analysis.isValid === false ? (
              <div className="alert alert-warn">
                <strong>Invalid / non-DSA code</strong>
                <p>{analysis.explanation || "Please paste a valid DSA algorithm."}</p>
              </div>
            ) : (
              <>
                {/* Metrics */}
                <div className="metrics">
                  {metricTiles.map(([lbl, val, clr]) => (
                    <div key={lbl} className="metric-tile">
                      <span className="metric-tile__label">{lbl}</span>
                      <span className="metric-tile__value" style={{ color: clr }}>{val}</span>
                    </div>
                  ))}
                </div>

                {/* Correctness */}
                <div className={clsx("alert", analysis.isCorrect ? "alert-ok" : "alert-warn")}>
                  <strong>{analysis.isCorrect ? "✓ Code looks correct" : "⚠ Issues found"}</strong>
                  <p>
                    {analysis.isCorrect
                      ? analysis.explanation
                      : (analysis.bugs ?? []).join(" • ")}
                  </p>
                </div>

                {/* Corrected code */}
                {!analysis.isCorrect && analysis.correctedCode && (
                  <div className="card">
                    <div className="card-head"><span className="card-head__label">Corrected Code</span></div>
                    <pre className="code-block">{analysis.correctedCode}</pre>
                  </div>
                )}

                {/* How it works */}
                {analysis.howItWorks?.length > 0 && (
                  <div className="card">
                    <div className="card-head"><span className="card-head__label">How it works</span></div>
                    <ol className="steps-list">
                      {analysis.howItWorks.map((s, i) => (
                        <li key={i} className="steps-list__item">
                          <span className="steps-list__num">{i + 1}</span>
                          <span className="steps-list__text">{s}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* ── VISUALIZATION ───────────────────────────── */}
                {steps.length > 0 && (
                  <div className="card viz-card">
                    <div className="viz-topbar">
                      <span className="viz-topbar__title">Live Visualization</span>
                      <span className="viz-topbar__counter">
                        Step {pb.stepIdx + 1} / {steps.length}
                      </span>
                    </div>

                    <div className="kbd-row">
                      <kbd>Space</kbd> play/pause &nbsp;·&nbsp;
                      <kbd>←</kbd><kbd>→</kbd> step &nbsp;·&nbsp;
                      <kbd>R</kbd> reset
                    </div>

                    <div className="viz-grid">
                      {/* LEFT — array state */}
                      <div className="viz-col viz-col--left">
                        <p className="section-label">Array state</p>
                        <ArrayViz step={cur} />

                        <div className="legend">
                          {(
                            [
                              ["active",    "#dbeafe", "#3b82f6"],
                              ["comparing", "#fef3c7", "#f59e0b"],
                              ["done",      "#dcfce7", "#22c55e"],
                              ["swapping",  "#ede9fe", "#8b5cf6"],
                              ["skipped",   "#f1f5f9", "#cbd5e1"],
                            ] as Array<[string, string, string]>
                          ).map(([l, bg, bd]) => (
                            <div key={l} className="legend__item">
                              <span className="legend__dot" style={{ background: bg, borderColor: bd }} />
                              <span className="legend__label">{l}</span>
                            </div>
                          ))}
                        </div>

                        {cur?.pointers && Object.keys(cur.pointers).length > 0 && (
                          <div className="ptr-grid">
                            {Object.entries(cur.pointers).map(([idx, name]) => (
                              <div key={name} className="ptr-card">
                                <span className="ptr-card__name">{name}</span>
                                <span className="ptr-card__val">idx = {idx}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="step-msg" aria-live="polite">
                          <p className="step-msg__head">What is happening</p>
                          <p className="step-msg__body">{cur?.msg ?? "—"}</p>
                        </div>
                      </div>

                      {/* RIGHT — code panel */}
                      <div className="viz-col viz-col--right">
                        <p className="section-label">Code — active line highlighted</p>
                        <CodePanel
                          lines={analysis.codeLines}
                          activeLine={cur?.activeLine ?? -1}
                        />
                      </div>
                    </div>

                    {/* Playback controls */}
                    <div className="playback">
                      <button
                        onClick={handlePlay}
                        className={clsx("btn", pb.playing ? "btn-pause" : "btn-play")}
                        title={pb.playing ? "Pause (Space)" : "Play (Space)"}
                      >
                        {pb.playing ? "⏸ Pause" : "▶ Play"}
                      </button>

                      <button onClick={goBack}    disabled={pb.stepIdx === 0}                  className="btn btn-ctrl" title="Step back (←)">‹ Back</button>
                      <button onClick={goForward} disabled={pb.stepIdx >= steps.length - 1}    className="btn btn-ctrl" title="Step forward (→)">Next ›</button>
                      <button onClick={resetViz}                                                className="btn btn-ctrl" title="Reset (R)">↺ Reset</button>

                      <div
                        className="progress"
                        role="slider"
                        aria-label="Step progress"
                        aria-valuemin={1}
                        aria-valuemax={steps.length}
                        aria-valuenow={pb.stepIdx + 1}
                        tabIndex={0}
                        onClick={seekTo}
                        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                          if (e.key === "ArrowRight") goForward();
                          if (e.key === "ArrowLeft")  goBack();
                        }}
                        title="Click to seek"
                      >
                        <div
                          className="progress__fill"
                          style={{ width: `${((pb.stepIdx + 1) / steps.length) * 100}%` }}
                        />
                      </div>

                      <div className="speed">
                        <label className="speed__label" htmlFor="speed-range">Speed</label>
                        <input
                          id="speed-range"
                          type="range"
                          min="1" max="5" step="1"
                          value={pb.speed}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            dispatch({ type: "SET_SPEED", speed: Number(e.target.value) })
                          }
                          aria-valuetext={SLABELS[pb.speed - 1]}
                        />
                        <span className="speed__val">{SLABELS[pb.speed - 1]}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── LINE-BY-LINE ─────────────────────────────── */}
                {analysis.codeLines?.length > 0 && (
                  <div className="card">
                    <div className="card-head"><span className="card-head__label">Line-by-line explanation</span></div>
                    {analysis.codeLines.map((item, i) => (
                      <div
                        key={i}
                        className="explain-row"
                        style={{
                          borderBottom:
                            i < analysis.codeLines.length - 1 ? "1px solid #f1f5f9" : "none",
                        }}
                      >
                        <span className="explain-row__num">{i + 1}</span>
                        <code className="explain-row__code">{item.line}</code>
                        <span className="explain-row__text">{item.explain}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── EMPTY STATE ─────────────────────────────────────── */}
        {phase === "idle" && !analysis && (
          <div className="empty">
            <div className="empty__icon">{"</>"}</div>
            <p className="empty__title">Paste any DSA algorithm above</p>
            <p className="empty__body">
              Pick a demo or paste your own code. The AI will detect bugs, explain
              every line, and animate each step so you can follow along at your own pace.
            </p>
          </div>
        )}

        {/* ── FOOTER ──────────────────────────────────────────── */}
        <footer className="footer">
          Powered by{" "}
          <a href="https://groq.com" target="_blank" rel="noopener noreferrer">Groq</a>
          {" "}· Model: <code>{model}</code>
        </footer>

      </div>
    </div>
  );
}
