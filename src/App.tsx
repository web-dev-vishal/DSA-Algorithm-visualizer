/**
 * App.tsx — AlgoViz Pro
 *
 * Features:
 *  - AlgoViz Pro branding & navigation
 *  - Dark mode (system-preference-aware + manual toggle)
 *  - BYOK: in-app Groq API key management (sessionStorage)
 *  - Shareable links (URL encodes code + array + language)
 *  - 15+ demo algorithms across 7 categories
 *  - Step-by-step visualizer with playback controls
 *  - Big-O analysis, line-by-line explanations, bug detection
 *  - Fully typed with strict TypeScript; no implicit any
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

/* ─── API key helpers (sessionStorage) ───────────────────────────── */
const API_KEY_SESSION_KEY = "algviz_groq_key";

function getStoredKey(): string {
  try { return sessionStorage.getItem(API_KEY_SESSION_KEY) ?? import.meta.env.VITE_groqApi ?? ""; }
  catch { return import.meta.env.VITE_groqApi ?? ""; }
}

function saveKey(key: string): void {
  try { key ? sessionStorage.setItem(API_KEY_SESSION_KEY, key) : sessionStorage.removeItem(API_KEY_SESSION_KEY); }
  catch { /* ignore */ }
}

/* ─── Dark mode helpers ───────────────────────────────────────────── */
function getSystemDark(): boolean {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function applyDark(dark: boolean): void {
  document.documentElement.classList.toggle("dark", dark);
}

/* ─── Share link helpers ──────────────────────────────────────────── */
interface ShareParams {
  code: string;
  lang?: string;
  arr?: string;
}

function encodeShare({ code, lang, arr }: ShareParams): string {
  const params = new URLSearchParams();
  params.set("c", btoa(encodeURIComponent(code)));
  if (lang) params.set("l", lang);
  if (arr)  params.set("a", arr);
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

function decodeShare(): ShareParams | null {
  const p = new URLSearchParams(window.location.search);
  const c = p.get("c");
  if (!c) return null;
  try {
    return {
      code: decodeURIComponent(atob(c)),
      lang: p.get("l") ?? undefined,
      arr:  p.get("a") ?? undefined,
    };
  } catch { return null; }
}

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

/* ─── Demo algorithms (15+) ───────────────────────────────────────── */
interface DemoEntry {
  label: string;
  lang: string;
  category: string;
  code: string;
}

type DemoKey =
  | "bubble" | "selection" | "insertion" | "merge" | "quick"
  | "binary" | "linear"
  | "two_ptr" | "remove_dup"
  | "sliding_max" | "longest_no_repeat"
  | "fib_dp" | "coin_change"
  | "inorder" | "bfs";

const DEMOS: Record<DemoKey, DemoEntry> = {
  /* ── Sorting ── */
  bubble: {
    label: "Bubble Sort", lang: "C++", category: "Sorting",
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
  selection: {
    label: "Selection Sort", lang: "Java", category: "Sorting",
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
    label: "Insertion Sort", lang: "Python", category: "Sorting",
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
  merge: {
    label: "Merge Sort", lang: "Python", category: "Sorting",
    code: `# Python — Merge Sort
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:]); result.extend(right[j:])
    return result`,
  },
  quick: {
    label: "Quick Sort", lang: "C++", category: "Sorting",
    code: `// C++ — Quick Sort
int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return i + 1;
}
void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`,
  },
  /* ── Searching ── */
  binary: {
    label: "Binary Search", lang: "Python", category: "Searching",
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
  linear: {
    label: "Linear Search", lang: "C++", category: "Searching",
    code: `// C++ — Linear Search
int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`,
  },
  /* ── Two Pointers ── */
  two_ptr: {
    label: "Two Sum", lang: "JS", category: "Two Pointers",
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
    label: "Remove Duplicates", lang: "C++", category: "Two Pointers",
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
  /* ── Sliding Window ── */
  sliding_max: {
    label: "Max Subarray Sum", lang: "JS", category: "Sliding Window",
    code: `// JavaScript — Max Sum Subarray of size k (Sliding Window)
function maxSumSubarray(arr, k) {
    let windowSum = 0;
    for (let i = 0; i < k; i++) windowSum += arr[i];
    let maxSum = windowSum;
    for (let i = k; i < arr.length; i++) {
        windowSum += arr[i] - arr[i - k];
        maxSum = Math.max(maxSum, windowSum);
    }
    return maxSum;
}`,
  },
  longest_no_repeat: {
    label: "Longest Unique Substr", lang: "Python", category: "Sliding Window",
    code: `# Python — Longest Substring Without Repeating Characters
def length_of_longest_substring(s):
    char_set = set()
    left = 0
    max_len = 0
    for right in range(len(s)):
        while s[right] in char_set:
            char_set.remove(s[left])
            left += 1
        char_set.add(s[right])
        max_len = max(max_len, right - left + 1)
    return max_len`,
  },
  /* ── Dynamic Programming ── */
  fib_dp: {
    label: "Fibonacci DP", lang: "Python", category: "DP",
    code: `# Python — Fibonacci (Dynamic Programming)
def fibonacci(n):
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]`,
  },
  coin_change: {
    label: "Coin Change", lang: "Python", category: "DP",
    code: `# Python — Coin Change (minimum coins)
def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i], dp[i - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1`,
  },
  /* ── Tree ── */
  inorder: {
    label: "Inorder Traversal", lang: "Java", category: "Tree",
    code: `// Java — Binary Tree Inorder Traversal
void inorder(TreeNode root, List<Integer> result) {
    if (root == null) return;
    inorder(root.left, result);
    result.add(root.val);
    inorder(root.right, result);
}`,
  },
  /* ── Graph / BFS ── */
  bfs: {
    label: "BFS", lang: "Python", category: "Graph",
    code: `# Python — Breadth-First Search (BFS)
from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order`,
  },
};

/* ─── Category colors ─────────────────────────────────────────────── */
const CATEGORY_COLORS: Record<string, string> = {
  "Sorting":       "#3b82f6",
  "Searching":     "#8b5cf6",
  "Two Pointers":  "#06b6d4",
  "Sliding Window":"#f59e0b",
  "DP":            "#10b981",
  "Tree":          "#ec4899",
  "Graph":         "#f97316",
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

const DARK_COLORS: Record<CellStateKey, CellStyle> = {
  active:     { bg: "#1e3a5f", border: "#3b82f6", text: "#93c5fd" },
  secondary:  { bg: "#3d2f0a", border: "#f59e0b", text: "#fcd34d" },
  done:       { bg: "#0a2e1a", border: "#22c55e", text: "#4ade80" },
  eliminated: { bg: "#1e293b", border: "#475569", text: "#475569" },
  swap:       { bg: "#2d1f52", border: "#8b5cf6", text: "#c4b5fd" },
  idle:       { bg: "#1e293b", border: "#334155", text: "#94a3b8" },
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
  dark: boolean;
}

function ArrayViz({ step, dark }: ArrayVizProps): React.ReactElement | null {
  if (!step?.arr?.length) return null;
  const palette = dark ? DARK_COLORS : COLORS;
  return (
    <div className="array-viz">
      {step.arr.map((val, idx) => {
        const s   = palette[cellState(idx, step)];
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

/* ─── API Key Modal ───────────────────────────────────────────────── */
interface ApiKeyModalProps {
  current: string;
  onSave: (key: string) => void;
  onClose: () => void;
}

function ApiKeyModal({ current, onSave, onClose }: ApiKeyModalProps): React.ReactElement {
  const [val, setVal] = useState<string>(current);
  const [show, setShow] = useState<boolean>(false);

  function handleSave(): void {
    onSave(val.trim());
    onClose();
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="API Key Settings">
      <div className="modal">
        <div className="modal__header">
          <span className="modal__title">🔑 Groq API Key</span>
          <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal__body">
          <p className="modal__desc">
            Your key is stored only in <code>sessionStorage</code> and cleared when you close the tab.
            It's never sent to any server other than Groq.
          </p>
          <p className="modal__desc">
            Get a free key at{" "}
            <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer">
              console.groq.com
            </a>
          </p>
          <div className="modal__field">
            <label className="field__label" htmlFor="api-key-input">API Key</label>
            <div className="modal__input-row">
              <input
                id="api-key-input"
                type={show ? "text" : "password"}
                value={val}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVal(e.target.value)}
                placeholder="gsk_..."
                className="field__input modal__key-input"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                className="btn btn-ghost modal__eye"
                onClick={() => setShow(s => !s)}
                aria-label={show ? "Hide key" : "Show key"}
              >
                {show ? "🙈" : "👁"}
              </button>
            </div>
          </div>
        </div>
        <div className="modal__footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Key</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Share Toast ─────────────────────────────────────────────────── */
interface ShareToastProps {
  visible: boolean;
}
function ShareToast({ visible }: ShareToastProps): React.ReactElement {
  return (
    <div className={clsx("share-toast", visible && "share-toast--visible")} role="status" aria-live="polite">
      ✓ Link copied to clipboard
    </div>
  );
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
  speed: number;
}

type PlaybackAction =
  | { type: "PLAY_TOGGLE"; totalSteps: number }
  | { type: "NEXT";  totalSteps: number }
  | { type: "STEP_NEXT"; totalSteps: number }
  | { type: "STEP_PREV" }
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
      const reachedEnd = nextIdx >= action.totalSteps - 1;
      return { ...state, stepIdx: nextIdx, playing: state.playing && !reachedEnd };
    }
    case "STEP_NEXT":
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

/* ─── Category filter tabs ────────────────────────────────────────── */
const ALL_CATEGORIES = ["All", "Sorting", "Searching", "Two Pointers", "Sliding Window", "DP", "Tree", "Graph"] as const;
type CategoryFilter = typeof ALL_CATEGORIES[number];

/* ═══════════════════════════════════════════════════════════════════ */
export default function App(): React.ReactElement {
  /* ── Dark mode ────────────────────────────────────────────────── */
  const [dark, setDark] = useState<boolean>(() => {
    const stored = localStorage.getItem("algviz_dark");
    return stored !== null ? stored === "1" : getSystemDark();
  });

  useEffect(() => {
    applyDark(dark);
    localStorage.setItem("algviz_dark", dark ? "1" : "0");
  }, [dark]);

  // Also respond to system preference changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent): void => {
      if (localStorage.getItem("algviz_dark") === null) {
        setDark(e.matches);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* ── API key state ────────────────────────────────────────────── */
  const [apiKey,       setApiKey]       = useState<string>(getStoredKey);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);

  function handleSaveKey(key: string): void {
    setApiKey(key);
    saveKey(key);
  }

  /* ── Share state ──────────────────────────────────────────────── */
  const [shareToast, setShareToast] = useState<boolean>(false);

  function copyShareLink(): void {
    const url = encodeShare({ code, arr: customInput || undefined });
    navigator.clipboard.writeText(url).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }).catch(() => {
      // Fallback: select a temp input
      const el = document.createElement("input");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    });
  }

  /* ── Category filter ──────────────────────────────────────────── */
  const [catFilter, setCatFilter] = useState<CategoryFilter>("All");

  /* ── Core state ───────────────────────────────────────────────── */
  const [code,        setCode]        = useState<string>(() => {
    const shared = decodeShare();
    return shared?.code ?? DEMOS.bubble.code;
  });
  const [activeDemo,  setActiveDemo]  = useState<DemoKey | "">(() => {
    return decodeShare() ? "" : "bubble";
  });
  const [model,       setModel]       = useState<string>(DEFAULT_MODEL);
  const [customInput, setCustomInput] = useState<string>(() => {
    return decodeShare()?.arr ?? "";
  });
  const [phase,       setPhase]       = useState<Phase>("idle");
  const [analysis,    setAnalysis]    = useState<AlgorithmAnalysis | null>(null);
  const [error,       setError]       = useState<string>("");

  const [pb, dispatch] = useReducer(playbackReducer, initialPlayback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Load demo ────────────────────────────────────────────────── */
  function loadDemo(key: DemoKey): void {
    setCode(DEMOS[key].code);
    setActiveDemo(key);
    setAnalysis(null);
    setPhase("idle");
    setError("");
    dispatch({ type: "STOP" });
    setCustomInput("");
    if (timerRef.current) clearTimeout(timerRef.current);
    // Clear share params from URL
    if (window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

  /* ── Analyze ──────────────────────────────────────────────────── */
  async function analyze(): Promise<void> {
    if (!code.trim()) return;

    const key = apiKey.trim();
    if (!key) {
      setError("No API key. Click the key icon in the header to add your Groq API key.");
      setPhase("error");
      setShowKeyModal(true);
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
          "Authorization": `Bearer ${key}`,
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
        if (res.status === 401) throw new Error("Invalid API key — check it in the key settings (🔑 in header).");
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

  /* ── Playback helpers ─────────────────────────────────────────── */
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

  /* ── Keyboard shortcuts ───────────────────────────────────────── */
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

  /* ── Status badge ─────────────────────────────────────────────── */
  const BADGE: Record<Phase, { label: string; cls: string }> = {
    idle:      { label: "Idle",         cls: "badge-idle"      },
    analyzing: { label: "Analyzing…",   cls: "badge-analyzing" },
    done:      { label: "Ready",        cls: "badge-done"      },
    error:     { label: "Error",        cls: "badge-error"     },
  };
  const badge = BADGE[phase];

  /* ── Metric tiles ─────────────────────────────────────────────── */
  type MetricTuple = [string, string, string];
  const metricTiles: MetricTuple[] = analysis
    ? [
        ["Algorithm",  analysis.algorithmName,   "var(--c-ink)"],
        ["Category",   analysis.category,        "var(--c-blue)"],
        ["Time",       analysis.timeComplexity,  "var(--c-purple)"],
        ["Space",      analysis.spaceComplexity, "var(--c-cyan)"],
      ]
    : [];

  /* ── Filtered demos ───────────────────────────────────────────── */
  const filteredDemos = (Object.entries(DEMOS) as Array<[DemoKey, DemoEntry]>).filter(
    ([, d]) => catFilter === "All" || d.category === catFilter
  );

  /* ══════════════════════════════════════════════════════════════ */
  return (
    <div className={clsx("app", dark && "app--dark")}>
      {/* ── NAVBAR ────────────────────────────────────────────── */}
      <nav className="navbar">
        <div className="navbar__brand">
          <span className="navbar__logo" aria-hidden="true">⬡</span>
          <span className="navbar__name">AlgoViz <span className="navbar__pro">Pro</span></span>
        </div>
        <div className="navbar__actions">
          {/* Key status indicator */}
          <button
            className={clsx("btn btn-nav", apiKey ? "btn-nav--keyed" : "btn-nav--nokey")}
            onClick={() => setShowKeyModal(true)}
            title={apiKey ? "API key configured — click to change" : "No API key — click to add"}
            aria-label="Manage API key"
          >
            🔑 {apiKey ? "Key set" : "Add key"}
          </button>

          {/* Share button — only visible when there's code */}
          {code.trim() && (
            <button
              className="btn btn-nav"
              onClick={copyShareLink}
              title="Copy shareable link"
              aria-label="Copy shareable link"
            >
              🔗 Share
            </button>
          )}

          {/* Dark mode toggle */}
          <button
            className="btn btn-nav btn-nav--icon"
            onClick={() => setDark(d => !d)}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? "☀" : "🌙"}
          </button>
        </div>
      </nav>

      <div className="app__inner">
        {/* ── HERO HEADER ───────────────────────────────────────── */}
        <header className="header">
          <div className="header__left">
            <p className="header__eyebrow">Algorithm Visualizer</p>
            <h1 className="header__title">
              Write, analyze &amp; debug
              <span className="header__title-accent"> algorithms</span>
            </h1>
            <p className="header__sub">
              AI-powered Big-O analysis · Step-by-step execution · Line-by-line explanations
            </p>
          </div>
          <span className={clsx("badge", badge.cls)} aria-live="polite">{badge.label}</span>
        </header>

        {/* ── SHARED CODE BANNER ────────────────────────────────── */}
        {decodeShare() && (
          <div className="alert alert-share">
            <strong>🔗 Shared snippet loaded</strong>
            <p>Someone shared this algorithm with you. Click "Analyze + Visualize" to run it.</p>
          </div>
        )}

        {/* ── INPUT CARD ────────────────────────────────────────── */}
        <div className="card">
          <div className="card-head">
            <span className="card-head__label">Your Code</span>
            <span className="card-head__sub">C++ · Python · Java · JavaScript</span>
          </div>

          {/* Category filter tabs */}
          <div className="cat-tabs">
            {ALL_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className={clsx("cat-tab", catFilter === cat && "cat-tab--on")}
                style={catFilter === cat && cat !== "All" ? { borderColor: CATEGORY_COLORS[cat], color: CATEGORY_COLORS[cat] } : {}}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Demo strip */}
          <div className="demo-strip">
            <span className="demo-strip__label">Demo:</span>
            {filteredDemos.map(([key, d]) => (
              <button
                key={key}
                onClick={() => loadDemo(key)}
                className={clsx("demo-chip", activeDemo === key && "demo-chip--on")}
                style={activeDemo === key ? { borderColor: CATEGORY_COLORS[d.category] ?? "#3b82f6" } : {}}
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

                {/* ── VISUALIZATION ─────────────────────────── */}
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
                        <ArrayViz step={cur} dark={dark} />

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

                      <button onClick={goBack}    disabled={pb.stepIdx === 0}                   className="btn btn-ctrl" title="Step back (←)">‹ Back</button>
                      <button onClick={goForward} disabled={pb.stepIdx >= steps.length - 1}     className="btn btn-ctrl" title="Step forward (→)">Next ›</button>
                      <button onClick={resetViz}                                                 className="btn btn-ctrl" title="Reset (R)">↺ Reset</button>

                      {/* Seekable progress bar */}
                      <div
                        className="progress"
                        role="slider"
                        aria-label="Step progress"
                        aria-valuemin={1}
                        aria-valuemax={steps.length}
                        aria-valuenow={pb.stepIdx + 1}
                        tabIndex={0}
                        onClick={seekTo}
                        onKeyDown={(e) => { if (e.key === "ArrowRight") goForward(); if (e.key === "ArrowLeft") goBack(); }}
                        title="Click to seek"
                      >
                        <div
                          className="progress__fill"
                          style={{ width: `${((pb.stepIdx + 1) / steps.length) * 100}%` }}
                        />
                      </div>

                      {/* Speed slider */}
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

                {/* ── LINE-BY-LINE ──────────────────────────── */}
                {analysis.codeLines?.length > 0 && (
                  <div className="card">
                    <div className="card-head"><span className="card-head__label">Line-by-line explanation</span></div>
                    {analysis.codeLines.map((item, i) => (
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
            <div className="empty__icon" aria-hidden="true">{"</>"}</div>
            <p className="empty__title">Paste any DSA algorithm above</p>
            <p className="empty__body">
              Choose from 15+ demos across 7 categories or paste your own code.
              The AI detects bugs, explains every line, and animates each step so you can follow at your own pace.
            </p>
            <div className="empty__chips">
              {(["bubble", "binary", "two_ptr", "fib_dp", "bfs"] as DemoKey[]).map(k => (
                <button key={k} className="demo-chip" onClick={() => loadDemo(k)}>
                  {DEMOS[k].label}
                  <span className="demo-chip__lang">{DEMOS[k].lang}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── FOOTER ────────────────────────────────────────── */}
        <footer className="footer">
          <span>AlgoViz Pro</span>
          <span className="footer__sep">·</span>
          Powered by{" "}
          <a href="https://groq.com" target="_blank" rel="noopener noreferrer">Groq</a>
          <span className="footer__sep">·</span>
          Model: <code>{model}</code>
        </footer>
      </div>

      {/* ── MODALS / TOASTS ───────────────────────────────────── */}
      {showKeyModal && (
        <ApiKeyModal
          current={apiKey}
          onSave={handleSaveKey}
          onClose={() => setShowKeyModal(false)}
        />
      )}
      <ShareToast visible={shareToast} />
    </div>
  );
}
