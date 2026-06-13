import { useState, useEffect, useRef, useCallback } from "react";
import type React from "react";
import "./App.css";

/* ─── Groq config ─────────────────────────────────────────────────── */
// Groq credentials are now managed securely by the backend.

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

interface ColorState {
  bg: string;
  border: string;
  text: string;
}

/* ─── Cell color map ──────────────────────────────────────────────── */
const COLORS: Record<string, ColorState> = {
  active:     { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  secondary:  { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
  done:       { bg: "#dcfce7", border: "#22c55e", text: "#166534" },
  eliminated: { bg: "#f1f5f9", border: "#cbd5e1", text: "#94a3b8" },
  swap:       { bg: "#ede9fe", border: "#8b5cf6", text: "#4c1d95" },
  idle:       { bg: "#ffffff", border: "#e2e8f0", text: "#334155" },
};

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
    <div className="array-viz">
      {step.arr.map((val: number, idx: number) => {
        const s: ColorState = COLORS[cellState(idx, step)] ?? { bg: "#ffffff", border: "#e2e8f0", text: "#334155" };
        const ptr: string | undefined = step.pointers?.[String(idx)] ?? step.pointers?.[idx];
        return (
          <div key={idx} className="array-cell-wrapper">
            <span
              className="array-cell__ptr"
              style={{ color: ptr ? "#3b82f6" : "transparent" }}
              aria-label={ptr ? `pointer ${ptr} at index ${idx}` : undefined}
            >
              {ptr || "·"}
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
    <div className="code-panel">
      <div className="code-panel__titlebar">
        {["#ff5f57", "#febc2e", "#28c840"].map((c: string) => (
          <span key={c} className="code-panel__dot" style={{ background: c }} />
        ))}
        <span className="code-panel__filename">algorithm</span>
      </div>
      <div className="code-panel__lines">
        {(lines ?? []).map((item: CodeLine, i: number) => {
          const active: boolean = i === activeLine;
          return (
            <div
              key={i}
              ref={active ? activeRef : null}
              className={`code-line${active ? " code-line--active" : ""}`}
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

    setPhase("analyzing");
    setAnalysis(null);
    setError("");
    setPlaying(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    try {
      const res: Response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language: DEMOS[activeDemo]?.lang || "JavaScript",
          array: customInput.trim() ? customInput.split(",").map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n)) : undefined
        }),
      });

      if (!res.ok) {
        const d: { message?: string } = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(d?.message || `API returned status ${res.status}`);
      }

      const responseData = await res.json() as { success: boolean; data: AlgorithmAnalysis; message?: string };
      if (!responseData.success) {
        throw new Error(responseData.message || "Analysis failed");
      }

      setAnalysis(responseData.data);
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
    idle:      { label: "Idle",         cls: "badge-idle"      },
    analyzing: { label: "Analyzing…",   cls: "badge-analyzing" },
    done:      { label: "Ready",        cls: "badge-done"      },
    error:     { label: "Error",        cls: "badge-error"     },
  };
  const badge: { label: string; cls: string } = BADGE[phase] ?? { label: "Idle", cls: "badge-idle" };

  /* ──────────────────────────────────────────────────────────────── */
  return (
    <div className="app">
      <div className="app__inner">

        {/* ── HEADER ──────────────────────────────────────────────── */}
        <header className="header">
          <div className="header__left">
            <p className="header__eyebrow">DSA Lab</p>
            <h1 className="header__title">
              Algorithm Analyzer
              <span className="header__title-accent"> &amp; Visualizer</span>
            </h1>
          </div>
          <span className={`badge ${badge.cls}`}>{badge.label}</span>
        </header>

        {/* ── INPUT CARD ──────────────────────────────────────────── */}
        <div className="card">

          {/* Card title row */}
          <div className="card-head">
            <span className="card-head__label">Your Code</span>
            <span className="card-head__sub">C++ · Python · Java · JavaScript</span>
          </div>

          {/* Demo strip */}
          <div className="demo-strip">
            <span className="demo-strip__label">Demo:</span>
            {Object.entries(DEMOS).map(([key, d]: [string, DemoEntry]) => (
              <button
                key={key}
                onClick={(): void => loadDemo(key)}
                className={`demo-chip${activeDemo === key ? " demo-chip--on" : ""}`}
                type="button"
              >
                {d.label}
                <span className="demo-chip__lang">{d.lang}</span>
              </button>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            value={code}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void => { setCode(e.target.value); setActiveDemo(""); }}
            spellCheck={false}
            className="code-textarea"
            placeholder="// Paste any DSA algorithm here…"
            aria-label="DSA code input"
          />

          {/* Action row */}
          <div className="action-row">
            {/* Custom input */}
            <div className="field">
              <label className="field__label" htmlFor="cust-input">Custom array (optional)</label>
              <input
                id="cust-input"
                type="text"
                value={customInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setCustomInput(e.target.value)}
                placeholder="e.g.  5, 3, 8, 1, 2"
                className="field__input"
              />
              <span className="field__hint">Overrides the AI-chosen test array</span>
            </div>

            {/* Model selector */}
            <div className="field">
              <label className="field__label" htmlFor="model-sel">Model</label>
              <select
                id="model-sel"
                value={model}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => setModel(e.target.value)}
                className="field__select"
              >
                {GROQ_MODELS.map((m: GroqModel) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
              <span className="field__hint">All models work with any Groq key</span>
            </div>

            {/* Analyze button */}
            <button
              onClick={(): void => { void analyze(); }}
              disabled={phase === "analyzing" || !code.trim()}
              className="btn btn-primary"
              type="button"
            >
              {phase === "analyzing" ? <Dots /> : "Analyze + Visualize"}
            </button>
          </div>

          {/* Error banner */}
          {error && (
            <div className="error-bar" role="alert">
              <span className="error-bar__icon">⚠</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* ── RESULTS ─────────────────────────────────────────────── */}
        {analysis && (
          <>
            {/* Invalid code */}
            {analysis.isValid === false ? (
              <div className="alert alert-warn">
                <strong>Invalid / non-DSA code</strong>
                <p>{analysis.explanation || "Please paste a valid DSA algorithm."}</p>
              </div>
            ) : (
              <>
                {/* Metrics */}
                <div className="metrics">
                  {[
                    ["Algorithm",  analysis.algorithmName,  "var(--c-ink)"],
                    ["Category",   analysis.category,       "var(--c-blue)"],
                    ["Time",       analysis.timeComplexity, "var(--c-purple)"],
                    ["Space",      analysis.spaceComplexity,"var(--c-cyan)"],
                  ].map(([lbl, val, clr]: string[]) => (
                    <div key={lbl} className="metric-tile">
                      <span className="metric-tile__label">{lbl}</span>
                      <span className="metric-tile__value" style={{ color: clr }}>{val}</span>
                    </div>
                  ))}
                </div>

                {/* Correctness */}
                <div className={`alert ${analysis.isCorrect ? "alert-ok" : "alert-warn"}`}>
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
                      {analysis.howItWorks.map((s: string, i: number) => (
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
                    {/* Viz header bar */}
                    <div className="viz-topbar">
                      <span className="viz-topbar__title">Live Visualization</span>
                      <span className="viz-topbar__counter">
                        Step {stepIdx + 1} / {steps.length}
                      </span>
                    </div>

                    {/* Keyboard hint */}
                    <div className="kbd-row">
                      <kbd>Space</kbd> play/pause &nbsp;·&nbsp;
                      <kbd>←</kbd><kbd>→</kbd> step &nbsp;·&nbsp;
                      <kbd>R</kbd> reset
                    </div>

                    {/* Two-column body */}
                    <div className="viz-grid">

                      {/* LEFT — array state */}
                      <div className="viz-col viz-col--left">
                        <p className="section-label">Array state</p>
                        <ArrayViz step={cur} />

                        {/* Legend */}
                        <div className="legend">
                          {[
                            ["active",    "#dbeafe", "#3b82f6"],
                            ["comparing", "#fef3c7", "#f59e0b"],
                            ["done",      "#dcfce7", "#22c55e"],
                            ["swapping",  "#ede9fe", "#8b5cf6"],
                            ["skipped",   "#f1f5f9", "#cbd5e1"],
                          ].map(([l, bg, bd]: string[]) => (
                            <div key={l} className="legend__item">
                              <span className="legend__dot" style={{ background: bg, borderColor: bd }} />
                              <span className="legend__label">{l}</span>
                            </div>
                          ))}
                        </div>

                        {/* Pointer cards */}
                        {cur?.pointers && Object.keys(cur.pointers).length > 0 && (
                          <div className="ptr-grid">
                            {Object.entries(cur.pointers).map(([idx, name]: [string, string]) => (
                              <div key={name} className="ptr-card">
                                <span className="ptr-card__name">{name}</span>
                                <span className="ptr-card__val">idx = {idx}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Step message */}
                        <div className="step-msg" aria-live="polite">
                          <p className="step-msg__head">What is happening</p>
                          <p className="step-msg__body">{cur?.msg || "—"}</p>
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
                        className={`btn ${playing ? "btn-pause" : "btn-play"}`}
                        title={playing ? "Pause (Space)" : "Play (Space)"}
                        type="button"
                      >
                        {playing ? "⏸ Pause" : "▶ Play"}
                      </button>

                      <button onClick={goBack}    disabled={stepIdx === 0}                 className="btn btn-ctrl" title="Step back (←)" type="button">‹ Back</button>
                      <button onClick={goForward} disabled={stepIdx >= steps.length - 1}   className="btn btn-ctrl" title="Step forward (→)" type="button">Next ›</button>
                      <button onClick={resetViz}                                            className="btn btn-ctrl" title="Reset (R)" type="button">↺ Reset</button>

                      {/* Seekable progress bar */}
                      <div
                        className="progress"
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
                          className="progress__fill"
                          style={{ width: `${((stepIdx + 1) / steps.length) * 100}%` }}
                        />
                      </div>

                      {/* Speed slider */}
                      <div className="speed">
                        <label className="speed__label" htmlFor="speed-range">Speed</label>
                        <input
                          id="speed-range"
                          type="range"
                          min="1" max="5" step="1"
                          value={speed}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setSpeed(Number(e.target.value))}
                          aria-valuetext={SLABELS[speed - 1]}
                        />
                        <span className="speed__val">{SLABELS[speed - 1]}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── LINE-BY-LINE ─────────────────────────────── */}
                {analysis.codeLines?.length > 0 && (
                  <div className="card">
                    <div className="card-head"><span className="card-head__label">Line-by-line explanation</span></div>
                    {analysis.codeLines.map((item: CodeLine, i: number) => (
                      <div
                        key={i}
                        className="explain-row"
                        style={{ borderBottom: i < analysis.codeLines.length - 1 ? "1px solid #f1f5f9" : "none" }}
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
