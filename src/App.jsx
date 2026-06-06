import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

// ─── Groq config ──────────────────────────────────────────────────────────────
const GROQ_API_KEY = import.meta.env.VITE_groqApi;
const GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions";
// Use a real, currently available Groq model
const GROQ_MODEL   = "llama-3.3-70b-versatile";

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert DSA (Data Structures & Algorithms) tutor and visualizer.
Your ONLY output must be a single valid JSON object — no markdown, no backticks, no commentary, nothing else outside the JSON.

Required JSON structure:
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
  "explanation": "2-3 sentence plain-English explanation of what this algorithm does.",
  "howItWorks": [
    "Step 1: ...",
    "Step 2: ..."
  ],
  "codeLines": [
    { "line": "void bubbleSort(int arr[], int n) {", "explain": "Function definition — takes array and size n" }
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

Rules:
- defaultInput: choose a small array (5-8 elements) that clearly demonstrates the algorithm.
- steps: simulate EVERY individual step on defaultInput from start to finish. Each step = one meaningful operation (comparison, swap, assignment, etc.).
- Each step must include the FULL current state of arr (copy it, do not mutate across steps incorrectly).
- pointers keys are STRING indices (e.g. "0", "1", "3").
- activeLine is 0-based index into codeLines array.
- msg: explain like teaching a curious 15-year-old. Be concrete — mention actual values from arr.
- highlight: indices being actively examined/compared (blue).
- secondary: indices used as reference but not primary focus (yellow).
- swap: indices being swapped (purple). Include BOTH indices.
- done: indices whose final sorted position is confirmed (green).
- eliminated: indices outside current search range (grey).
- If code is not DSA or not valid code: isValid=false, steps=[].
- If bugs found: isCorrect=false, fill bugs array with descriptions, fill correctedCode with fixed version, simulate correctedCode on defaultInput.
- Support all major DSA categories: Sorting (Bubble, Selection, Insertion, Merge, Quick), Searching (Linear, Binary), Two Pointers, Sliding Window, Recursion, Stack, Queue, Linked List traversal, Tree traversal (BFS/DFS), Dynamic Programming (show dp array), Graph algorithms.
- For DP algorithms: use arr to represent the dp table/array at each step.
- For tree/graph: represent visited/current nodes as indices if possible, or set arr to a serialized version.
- Always produce at least 3 steps even for trivial code.`;

// ─── Demo algorithms ──────────────────────────────────────────────────────────
const DEMOS = {
  bubble: {
    label: "Bubble Sort",
    lang: "C++",
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
}`
  },
  binary: {
    label: "Binary Search",
    lang: "Python",
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
    return -1`
  },
  selection: {
    label: "Selection Sort",
    lang: "Java",
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
}`
  },
  two_ptr: {
    label: "Two Pointers",
    lang: "JS",
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
}`
  },
  remove_dup: {
    label: "Remove Duplicates",
    lang: "C++",
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
}`
  },
  insertion: {
    label: "Insertion Sort",
    lang: "Python",
    code: `# Python — Insertion Sort
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`
  },
  linear_search: {
    label: "Linear Search",
    lang: "C++",
    code: `// C++ — Linear Search
int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`
  },
  fibonacci_dp: {
    label: "Fibonacci DP",
    lang: "Python",
    code: `# Python — Fibonacci with Dynamic Programming
def fibonacci(n):
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]`
  }
};

// ─── Colors for each cell state ───────────────────────────────────────────────
const COLORS = {
  active:     { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" }, // blue
  secondary:  { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" }, // yellow
  done:       { bg: "#dcfce7", border: "#22c55e", text: "#166534" }, // green  ✔ fixed
  eliminated: { bg: "#f1f5f9", border: "#cbd5e1", text: "#94a3b8" }, // grey
  swap:       { bg: "#ede9fe", border: "#8b5cf6", text: "#4c1d95" }, // purple
  idle:       { bg: "#ffffff", border: "#e2e8f0", text: "#334155" }, // white
};

// Cell state priority: swap > highlight > secondary > eliminated > done > idle
function cellState(idx, step) {
  if (!step) return "idle";
  if (step.swap?.includes(idx))       return "swap";
  if (step.highlight?.includes(idx))  return "active";
  if (step.secondary?.includes(idx))  return "secondary";
  if (step.eliminated?.includes(idx)) return "eliminated";
  if (step.done?.includes(idx))       return "done";
  return "idle";
}

// ─── ArrayViz component ───────────────────────────────────────────────────────
function ArrayViz({ step }) {
  if (!step?.arr || step.arr.length === 0) return null;
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
              aria-hidden={!ptr}
            >
              {ptr || "."}
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

// ─── CodePanel component ──────────────────────────────────────────────────────
function CodePanel({ lines, activeLine }) {
  const activeRef = useRef(null);
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeLine]);

  return (
    <div className="code-panel" role="region" aria-label="Algorithm code with active line highlight">
      <div className="code-panel__titlebar">
        {["#ff5f57", "#febc2e", "#28c840"].map(c => (
          <div key={c} className="code-panel__dot" style={{ background: c }} aria-hidden="true" />
        ))}
        <span className="code-panel__filename">algorithm.code</span>
      </div>
      <div className="code-panel__lines">
        {(lines || []).map((item, i) => {
          const isActive = i === activeLine;
          return (
            <div
              key={i}
              ref={isActive ? activeRef : null}
              className={`code-line${isActive ? " code-line--active" : ""}`}
              aria-current={isActive ? "true" : undefined}
            >
              <span className="code-line__num">{i + 1}</span>
              <span className="code-line__code">{item.line}</span>
              {isActive && item.explain && (
                <span className="code-line__explain" title={item.explain}>
                  {"← "}{item.explain}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Animated loading dots ────────────────────────────────────────────────────
function Dots({ label }) {
  const [d, setD] = useState(".");
  useEffect(() => {
    const t = setInterval(() => setD(p => (p.length >= 3 ? "." : p + ".")), 400);
    return () => clearInterval(t);
  }, []);
  return <span className="analyzing-dots">{label}{d}</span>;
}

// ─── Speed constants ──────────────────────────────────────────────────────────
const SPEEDS  = [1600, 900, 500, 220, 80];
const SLABELS = ["Slowest", "Slow", "Normal", "Fast", "Fastest"];

// ─── Main app ─────────────────────────────────────────────────────────────────
export default function DSAAnalyzer() {
  const [code,       setCode]       = useState(DEMOS.bubble.code);
  const [activeDemo, setActiveDemo] = useState("bubble");
  const [customInput, setCustomInput] = useState("");
  const [phase,      setPhase]      = useState("idle"); // idle | analyzing | done | error
  const [analysis,   setAnalysis]   = useState(null);
  const [error,      setError]      = useState("");
  const [stepIdx,    setStepIdx]    = useState(0);
  const [playing,    setPlaying]    = useState(false);
  const [speed,      setSpeed]      = useState(3);
  const timerRef = useRef(null);

  // ── load demo ──────────────────────────────────────────────────────────────
  function loadDemo(key) {
    setCode(DEMOS[key].code);
    setActiveDemo(key);
    setAnalysis(null);
    setPhase("idle");
    setError("");
    setPlaying(false);
    setCustomInput("");
    clearTimeout(timerRef.current);
  }

  // ── analyze ────────────────────────────────────────────────────────────────
  async function analyze() {
    if (!code.trim()) return;
    if (!GROQ_API_KEY || GROQ_API_KEY === "your_groq_api_key_here") {
      setError("No API key found. Add your Groq API key to the .env file as VITE_groqApi=your_key");
      setPhase("error");
      return;
    }

    setPhase("analyzing");
    setAnalysis(null);
    setError("");
    setPlaying(false);
    clearTimeout(timerRef.current);

    // Build user message — append custom input hint if provided
    let userMsg = "Analyze this DSA code and return the JSON:\n\n" + code;
    if (customInput.trim()) {
      userMsg += `\n\nUse this as defaultInput: ${customInput.trim()}`;
    }

    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": "Bearer " + GROQ_API_KEY,
        },
        body: JSON.stringify({
          model:       GROQ_MODEL,
          temperature: 0.1,
          max_tokens:  8000,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user",   content: userMsg },
          ],
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error?.message || `Groq API error ${res.status}`);
      }

      const data = await res.json();
      const raw  = data?.choices?.[0]?.message?.content ?? "";

      // Strip any accidental markdown fences or leading/trailing whitespace
      const clean = raw
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/```\s*$/, "")
        .trim();

      let parsed;
      try {
        parsed = JSON.parse(clean);
      } catch {
        // Try to extract the first {...} block if the model added surrounding text
        const match = clean.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        } else {
          throw new Error("Could not parse the AI response as JSON. Try again.");
        }
      }

      setAnalysis(parsed);
      setStepIdx(0);
      setPhase("done");
    } catch (e) {
      setError(e.message || "Analysis failed. Check your code and try again.");
      setPhase("error");
    }
  }

  // ── playback ───────────────────────────────────────────────────────────────
  const steps = analysis?.steps ?? [];
  const cur   = steps[stepIdx] ?? null;

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
    return () => clearTimeout(timerRef.current);
  }, [playing, stepIdx, speed, tick]);

  function handlePlay() {
    if (stepIdx >= steps.length - 1) {
      setStepIdx(0);
      setPlaying(true);
      return;
    }
    setPlaying(p => !p);
  }

  function stepForward() {
    setPlaying(false);
    clearTimeout(timerRef.current);
    setStepIdx(p => Math.min(p + 1, steps.length - 1));
  }

  function stepBack() {
    setPlaying(false);
    clearTimeout(timerRef.current);
    setStepIdx(p => Math.max(p - 1, 0));
  }

  function reset() {
    setPlaying(false);
    clearTimeout(timerRef.current);
    setStepIdx(0);
  }

  // Clickable progress bar — jump to step
  function handleProgressClick(e) {
    if (!steps.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    const idx  = Math.round(pct * (steps.length - 1));
    setPlaying(false);
    clearTimeout(timerRef.current);
    setStepIdx(Math.max(0, Math.min(idx, steps.length - 1)));
  }

  // ── keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e) {
      // Only when visualization is shown and not focused in textarea/input
      if (!steps.length) return;
      const tag = document.activeElement?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        handlePlay();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        stepForward();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        stepBack();
      } else if (e.key === "r" || e.key === "R") {
        reset();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps.length, stepIdx, playing]);

  // ── status badge props ─────────────────────────────────────────────────────
  const STATUS = {
    idle:      { label: "Idle",         cls: "status-badge--idle"      },
    analyzing: { label: "Analyzing...", cls: "status-badge--analyzing" },
    done:      { label: "Ready",        cls: "status-badge--done"      },
    error:     { label: "Error",        cls: "status-badge--error"     },
  };
  const sb = STATUS[phase] ?? STATUS.idle;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="app-wrapper">
      <div className="app-inner">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="app-header">
          <div>
            <div className="app-header__eyebrow">DSA Lab</div>
            <h1 className="app-header__title">
              Algorithm Analyzer<br />
              <span className="app-header__title--accent">&amp; Visualizer</span>
            </h1>
          </div>
          <span className={`status-badge ${sb.cls}`} role="status" aria-live="polite">
            {sb.label}
          </span>
        </header>

        {/* ── Code input card ─────────────────────────────────────────────── */}
        <div className="card">
          <div className="card__header">
            <span className="card__label">Paste your code</span>
            <span className="card__subtitle">C++, Python, Java, JavaScript supported</span>
          </div>

          {/* Demo buttons */}
          <div className="demo-bar">
            <span className="demo-bar__label">Try a demo:</span>
            {Object.entries(DEMOS).map(([key, d]) => (
              <button
                key={key}
                onClick={() => loadDemo(key)}
                className={`demo-btn${activeDemo === key ? " demo-btn--active" : ""}`}
                aria-pressed={activeDemo === key}
              >
                {d.label}
                <span className="demo-btn__lang">{d.lang}</span>
              </button>
            ))}
          </div>

          {/* Code textarea */}
          <textarea
            value={code}
            onChange={e => { setCode(e.target.value); setActiveDemo(""); }}
            spellCheck={false}
            className="code-input"
            placeholder="// Paste any DSA algorithm here..."
            aria-label="DSA code input"
          />

          {/* Custom input + analyze */}
          <div className="code-actions">
            <div className="custom-input-wrapper">
              <label className="custom-input__label" htmlFor="custom-input">
                Custom input array
              </label>
              <input
                id="custom-input"
                type="text"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                placeholder="e.g. 5,3,8,1,2  (optional)"
                className="custom-input__field"
                aria-describedby="custom-input-hint"
              />
              <span id="custom-input-hint" className="custom-input__hint">
                Override the AI-chosen test array
              </span>
            </div>

            <button
              onClick={analyze}
              disabled={phase === "analyzing" || !code.trim()}
              className="btn btn--primary"
              aria-busy={phase === "analyzing"}
            >
              {phase === "analyzing"
                ? <Dots label="Analyzing" />
                : "Analyze + Visualize"}
            </button>

            {error && (
              <p className="error-text" role="alert">
                ⚠ {error}
              </p>
            )}
          </div>
        </div>

        {/* ── Results ─────────────────────────────────────────────────────── */}
        {analysis && (
          <>
            {analysis.isValid === false ? (
              <div className="alert alert--warning" role="alert">
                <div className="alert__title">Invalid or non-DSA code</div>
                <div className="alert__body">
                  {analysis.explanation || "Please paste a valid DSA algorithm (sorting, searching, DP, etc.)."}
                </div>
              </div>
            ) : (
              <>
                {/* Metric cards */}
                <div className="metrics-grid">
                  {[
                    ["Algorithm",  analysis.algorithmName, "#0f172a"],
                    ["Category",   analysis.category,      "#3b82f6"],
                    ["Time",       analysis.timeComplexity,"#8b5cf6"],
                    ["Space",      analysis.spaceComplexity,"#06b6d4"],
                  ].map(([label, value, color]) => (
                    <div key={label} className="metric-card">
                      <div className="metric-card__label">{label}</div>
                      <div className="metric-card__value" style={{ color }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Correctness banner */}
                <div className={`alert ${analysis.isCorrect ? "alert--success" : "alert--warning"}`} role="alert">
                  <div className="alert__title">
                    {analysis.isCorrect ? "✓ Code is correct!" : "⚠ Issues found in your code"}
                  </div>
                  <div className="alert__body">
                    {analysis.isCorrect
                      ? analysis.explanation
                      : (analysis.bugs ?? []).join(" • ")}
                  </div>
                </div>

                {/* Corrected code */}
                {!analysis.isCorrect && analysis.correctedCode && (
                  <div className="card">
                    <div className="card__header">
                      <span className="card__label">Corrected Code</span>
                    </div>
                    <pre className="corrected-code">{analysis.correctedCode}</pre>
                  </div>
                )}

                {/* How it works */}
                {analysis.howItWorks?.length > 0 && (
                  <div className="card">
                    <div className="card__header">
                      <span className="card__label">How it works</span>
                    </div>
                    <ol className="how-it-works" aria-label="Algorithm steps">
                      {analysis.howItWorks.map((s, i) => (
                        <li key={i} className="how-step">
                          <div className="how-step__num" aria-hidden="true">{i + 1}</div>
                          <span className="how-step__text">{s}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* ── Live Visualization ─────────────────────────────────── */}
                {steps.length > 0 && (
                  <div className="card viz-card">
                    {/* Viz header */}
                    <div className="viz-header">
                      <span className="viz-header__title">Live Visualization</span>
                      <span className="viz-header__count">
                        Step {stepIdx + 1} / {steps.length}
                      </span>
                    </div>

                    {/* Keyboard hint */}
                    <div className="kbd-hint" aria-live="polite">
                      <kbd>Space</kbd> play/pause &nbsp;·&nbsp;
                      <kbd>←</kbd><kbd>→</kbd> step &nbsp;·&nbsp;
                      <kbd>R</kbd> reset
                    </div>

                    <div className="viz-body">
                      {/* Left: array + pointers + message */}
                      <div className="viz-left">
                        <div className="viz-section-label">Array state</div>
                        <ArrayViz step={cur} />

                        {/* Legend */}
                        <div className="legend" aria-label="Color legend">
                          {[
                            ["active",    "#dbeafe", "#3b82f6"],
                            ["comparing", "#fef3c7", "#f59e0b"],
                            ["done",      "#dcfce7", "#22c55e"],
                            ["swapping",  "#ede9fe", "#8b5cf6"],
                            ["skipped",   "#f1f5f9", "#cbd5e1"],
                          ].map(([l, bg, bd]) => (
                            <div key={l} className="legend-item">
                              <div
                                className="legend-dot"
                                style={{ background: bg, borderColor: bd }}
                                aria-hidden="true"
                              />
                              <span className="legend-label">{l}</span>
                            </div>
                          ))}
                        </div>

                        {/* Pointer cards */}
                        {cur?.pointers && Object.keys(cur.pointers).length > 0 && (
                          <div className="pointers-grid" aria-label="Variable pointers">
                            {Object.entries(cur.pointers).map(([idx, name]) => (
                              <div key={name} className="pointer-card">
                                <div className="pointer-card__name">{name}</div>
                                <div className="pointer-card__value">idx = {idx}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Step message */}
                        <div className="step-msg" aria-live="polite">
                          <div className="step-msg__title">What is happening</div>
                          <p className="step-msg__text">{cur?.msg || "—"}</p>
                        </div>
                      </div>

                      {/* Right: code panel */}
                      <div className="viz-right">
                        <div className="viz-section-label">Code (active line highlighted)</div>
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
                        className={`btn ${playing ? "btn--pause" : "btn--play"}`}
                        aria-label={playing ? "Pause visualization" : "Play visualization"}
                      >
                        {playing ? "⏸ Pause" : "▶ Play"}
                      </button>

                      <button
                        onClick={stepBack}
                        disabled={stepIdx === 0}
                        className="btn"
                        aria-label="Previous step"
                        title="Step back (←)"
                      >
                        ‹ Back
                      </button>

                      <button
                        onClick={stepForward}
                        disabled={stepIdx >= steps.length - 1}
                        className="btn"
                        aria-label="Next step"
                        title="Step forward (→)"
                      >
                        Next ›
                      </button>

                      <button
                        onClick={reset}
                        className="btn"
                        aria-label="Reset to first step"
                        title="Reset (R)"
                      >
                        ↺ Reset
                      </button>

                      {/* Clickable progress bar */}
                      <div
                        className="progress-bar"
                        role="slider"
                        aria-valuemin={1}
                        aria-valuemax={steps.length}
                        aria-valuenow={stepIdx + 1}
                        aria-label="Step progress"
                        tabIndex={0}
                        onClick={handleProgressClick}
                        onKeyDown={e => {
                          if (e.key === "ArrowRight") stepForward();
                          if (e.key === "ArrowLeft")  stepBack();
                        }}
                        style={{ cursor: "pointer" }}
                        title="Click to jump to a step"
                      >
                        <div
                          className="progress-bar__fill"
                          style={{ width: `${steps.length ? ((stepIdx + 1) / steps.length) * 100 : 0}%` }}
                        />
                      </div>

                      {/* Speed control */}
                      <div className="speed-control">
                        <label className="speed-control__label" htmlFor="speed-range">
                          Speed
                        </label>
                        <input
                          id="speed-range"
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={speed}
                          onChange={e => setSpeed(Number(e.target.value))}
                          aria-valuetext={SLABELS[speed - 1]}
                        />
                        <span className="speed-control__value">{SLABELS[speed - 1]}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Line-by-line explanation ───────────────────────────── */}
                {analysis.codeLines?.length > 0 && (
                  <div className="card">
                    <div className="card__header">
                      <span className="card__label">Line-by-line explanation</span>
                    </div>
                    <div role="list" aria-label="Code line explanations">
                      {analysis.codeLines.map((item, i) => (
                        <div
                          key={i}
                          role="listitem"
                          className="explain-row"
                          style={{
                            borderBottom:
                              i < analysis.codeLines.length - 1
                                ? "1px solid #f8fafc"
                                : "none",
                          }}
                        >
                          <span className="explain-row__num" aria-hidden="true">
                            {i + 1}
                          </span>
                          <code className="explain-row__code">{item.line}</code>
                          <span className="explain-row__text">{item.explain}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── Empty state ─────────────────────────────────────────────────── */}
        {phase === "idle" && !analysis && (
          <div className="empty-state" aria-label="Get started">
            <div className="empty-state__icon" aria-hidden="true">{"</>"}</div>
            <div className="empty-state__title">Paste any DSA algorithm above</div>
            <div className="empty-state__body">
              Choose a demo or paste your own code. The AI will detect bugs, explain every line,
              and animate each step so you can follow along at your own pace.
            </div>
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer className="app-footer">
          Powered by{" "}
          <a
            href="https://groq.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Groq
          </a>{" "}
          · Model: {GROQ_MODEL}
        </footer>

      </div>
    </div>
  );
}
