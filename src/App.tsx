/**
 * App.tsx — AlgoViz Pro
 * Premium redesign: Indigo/Violet design system, dark-mode first,
 * WCAG AA compliant, fully typed, production-ready.
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

interface GroqModel { id: string; label: string }

const GROQ_MODELS: GroqModel[] = [
  { id: "llama-3.3-70b-versatile",  label: "Llama 3.3 · 70B  (recommended)" },
  { id: "llama3-70b-8192",          label: "Llama 3 · 70B" },
  { id: "llama3-8b-8192",           label: "Llama 3 · 8B  (faster)" },
  { id: "mixtral-8x7b-32768",       label: "Mixtral · 8x7B" },
  { id: "gemma2-9b-it",             label: "Gemma 2 · 9B" },
];
const DEFAULT_MODEL = GROQ_MODELS[0].id;

/* ─── API key helpers ─────────────────────────────────────────────── */
const API_KEY_SESSION_KEY = "algviz_groq_key";

function getStoredKey(): string {
  try { return sessionStorage.getItem(API_KEY_SESSION_KEY) ?? (import.meta.env.VITE_groqApi as string | undefined) ?? ""; }
  catch { return (import.meta.env.VITE_groqApi as string | undefined) ?? ""; }
}
function saveKey(key: string): void {
  try {
    if (key) {
      sessionStorage.setItem(API_KEY_SESSION_KEY, key);
    } else {
      sessionStorage.removeItem(API_KEY_SESSION_KEY);
    }
  } catch { /* ignore */ }
}

/* ─── Dark mode helpers ───────────────────────────────────────────── */
function getSystemDark(): boolean {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}
function applyDark(dark: boolean): void {
  document.documentElement.classList.toggle("dark", dark);
}

/* ─── Share link helpers ──────────────────────────────────────────── */
interface ShareParams { code: string; lang?: string; arr?: string }

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
    return { code: decodeURIComponent(atob(c)), lang: p.get("l") ?? undefined, arr: p.get("a") ?? undefined };
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
- DSA categories supported: Sorting, Searching, Two Pointers, Sliding Window, Recursion, Stack, Queue, Linked List, Tree, DP, Graph.
- For DP: arr represents the dp array — show it building up step by step.
- Minimum 3 steps always.
- If code is not valid DSA: isValid=false, steps=[].
- If bugs found: isCorrect=false, bugs=["description..."], correctedCode="...", then simulate the CORRECTED code.`;

/* ─── Demo algorithms ─────────────────────────────────────────────── */
interface DemoEntry { label: string; lang: string; category: string; code: string }

type DemoKey =
  | "bubble" | "selection" | "insertion" | "merge" | "quick"
  | "binary" | "linear"
  | "two_ptr" | "remove_dup"
  | "sliding_max" | "longest_no_repeat"
  | "fib_dp" | "coin_change"
  | "inorder" | "bfs";

const DEMOS: Record<DemoKey, DemoEntry> = {
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
  sliding_max: {
    label: "Max Subarray Sum", lang: "JS", category: "Sliding Window",
    code: `// JavaScript — Max Sum Subarray of size k
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
    label: "Longest Unique", lang: "Python", category: "Sliding Window",
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

/* ─── Category colour map ─────────────────────────────────────────── */
const CATEGORY_COLORS: Record<string, string> = {
  "Sorting":        "#6366f1",
  "Searching":      "#8b5cf6",
  "Two Pointers":   "#06b6d4",
  "Sliding Window": "#f59e0b",
  "DP":             "#10b981",
  "Tree":           "#ec4899",
  "Graph":          "#f97316",
};

/* ─── Cell state logic ────────────────────────────────────────────── */
type CellStateKey = "active" | "secondary" | "done" | "eliminated" | "swap" | "idle";

function cellState(idx: number, step: VisualizationStep | null): CellStateKey {
  if (!step) return "idle";
  if (step.swap?.includes(idx))       return "swap";
  if (step.highlight?.includes(idx))  return "active";
  if (step.secondary?.includes(idx))  return "secondary";
  if (step.eliminated?.includes(idx)) return "eliminated";
  if (step.done?.includes(idx))       return "done";
  return "idle";
}

/* ─── SVG icon components ─────────────────────────────────────────── */
function IconLogo(): React.ReactElement {
  return (
    <svg className="navbar__logo-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12h4l3-9 4 18 3-9h4" />
    </svg>
  );
}

function IconKey(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="8" cy="15" r="4" /><path d="M11.5 11.5L20 3m0 0l1 1-1 1m0-2l-3 3" />
    </svg>
  );
}

function IconShare(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" />
      <path d="M8 12h8M8 10.5l8-4M8 13.5l8 4" />
    </svg>
  );
}

function IconMoon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
    </svg>
  );
}

function IconSun(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function IconWarn(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconCheck(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconCode(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconEye({ show }: { show: boolean }): React.ReactElement {
  return show ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconPlay(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="13" height="13">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function IconPause(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="13" height="13">
      <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function IconStepBack(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" width="13" height="13">
      <polygon points="19,20 9,12 19,4" /><line x1="5" y1="19" x2="5" y2="5" />
    </svg>
  );
}

function IconStepForward(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" width="13" height="13">
      <polygon points="5,4 15,12 5,20" /><line x1="19" y1="5" x2="19" y2="19" />
    </svg>
  );
}

function IconReset(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" width="13" height="13">
      <polyline points="1,4 1,10 7,10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
    </svg>
  );
}

function IconCopy(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" width="14" height="14">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  );
}

/* ─── ArrayViz ────────────────────────────────────────────────────── */
interface ArrayVizProps {
  step: VisualizationStep | null;
}

function ArrayViz({ step }: ArrayVizProps): React.ReactElement | null {
  if (!step?.arr?.length) return null;
  return (
    <div className="array-viz" role="list" aria-label="Array visualization">
      {step.arr.map((val, idx) => {
        const state = cellState(idx, step);
        const ptr   = step.pointers?.[String(idx)] ?? step.pointers?.[idx];
        return (
          <div key={idx} className="array-cell-wrapper" role="listitem">
            <span
              className="array-cell__ptr"
              style={{ color: ptr ? "var(--c-brand)" : "transparent" }}
              aria-label={ptr ? `pointer ${ptr} at index ${idx}` : undefined}
            >
              {ptr ?? "·"}
            </span>
            <div
              className={`array-cell cell--${state}`}
              title={`[${idx}] = ${val}`}
              aria-label={`index ${idx}, value ${val}`}
            >
              {val}
            </div>
            <span className="array-cell__idx" aria-hidden="true">[{idx}]</span>
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
    <div className="code-panel" role="region" aria-label="Code with active line highlighted">
      <div className="code-panel__titlebar" aria-hidden="true">
        {(["#ff5f57", "#febc2e", "#28c840"] as const).map(c => (
          <span key={c} className="code-panel__dot" style={{ background: c }} />
        ))}
        <span className="code-panel__filename">algorithm</span>
      </div>
      <div className="code-panel__lines" role="list">
        {(lines ?? []).map((item, i) => {
          const active = i === activeLine;
          return (
            <div
              key={i}
              ref={active ? activeRef : null}
              className={clsx("code-line", active && "code-line--active")}
              role="listitem"
              aria-current={active ? "true" : undefined}
            >
              <span className="code-line__num" aria-hidden="true">{i + 1}</span>
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

/* ─── Animated loading dots ───────────────────────────────────────── */
function Dots(): React.ReactElement {
  const [d, setD] = useState<string>(".");
  useEffect(() => {
    const t = setInterval(() => setD(p => (p.length >= 3 ? "." : p + ".")), 420);
    return () => clearInterval(t);
  }, []);
  return <span aria-label="Analyzing">Analyzing{d}</span>;
}

/* ─── API Key Modal ───────────────────────────────────────────────── */
interface ApiKeyModalProps {
  current: string;
  onSave: (key: string) => void;
  onClose: () => void;
}

function ApiKeyModal({ current, onSave, onClose }: ApiKeyModalProps): React.ReactElement {
  const [val,  setVal]  = useState<string>(current);
  const [show, setShow] = useState<boolean>(false);

  function handleSave(): void { onSave(val.trim()); onClose(); }

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="API Key Settings"
    >
      {/* Backdrop dismiss — proper button so it's keyboard accessible */}
      <button
        className="modal-backdrop__dismiss"
        onClick={onClose}
        aria-label="Close dialog"
        tabIndex={-1}
        type="button"
      />
      <div className="modal">
        <div className="modal__header">
          <span className="modal__title">
            <IconKey /> Groq API Key
          </span>
          <button className="modal__close" onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </div>
        <div className="modal__body">
          <p className="modal__desc">
            Your key is stored only in <code>sessionStorage</code> and cleared when you close the tab.
            It is never sent to any server other than Groq.
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
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") handleSave(); }}
                placeholder="gsk_..."
                className="field__input modal__key-input"
                autoComplete="off"
                spellCheck={false}
                aria-label="Groq API key input"
              />
              <button
                className="btn btn-ghost modal__eye"
                onClick={() => setShow(s => !s)}
                aria-label={show ? "Hide key" : "Show key"}
                type="button"
              >
                <IconEye show={show} />
              </button>
            </div>
          </div>
        </div>
        <div className="modal__footer">
          <button className="btn btn-ghost" onClick={onClose} type="button">Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} type="button">Save Key</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Share Toast ─────────────────────────────────────────────────── */
function ShareToast({ visible }: { visible: boolean }): React.ReactElement {
  return (
    <div
      className={clsx("share-toast", visible && "share-toast--visible")}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <IconCopy />
      Link copied to clipboard
    </div>
  );
}

/* ─── Speed/label maps ────────────────────────────────────────────── */
const SPEEDS:  readonly number[] = [1500, 850, 480, 210, 75] as const;
const SLABELS: readonly string[] = ["0.5×", "0.75×", "1×", "1.5×", "2×"] as const;

/* ─── Phase type ─────────────────────────────────────────────────── */
type Phase = "idle" | "analyzing" | "done" | "error";

/* ─── Playback reducer ───────────────────────────────────────────── */
interface PlaybackState { stepIdx: number; playing: boolean; speed: number }

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
      if (state.stepIdx >= action.totalSteps - 1)
        return { ...state, stepIdx: 0, playing: true };
      return { ...state, playing: !state.playing };
    case "NEXT": {
      const next = Math.min(state.stepIdx + 1, action.totalSteps - 1);
      return { ...state, stepIdx: next, playing: state.playing && next < action.totalSteps - 1 };
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

/* ─── Category tabs ───────────────────────────────────────────────── */
const ALL_CATEGORIES = ["All", "Sorting", "Searching", "Two Pointers", "Sliding Window", "DP", "Tree", "Graph"] as const;
type CategoryFilter = typeof ALL_CATEGORIES[number];

/* ─── Metric config ───────────────────────────────────────────────── */
const METRIC_COLORS: Record<string, string> = {
  Algorithm:  "var(--c-ink)",
  Category:   "#6366f1",
  Time:       "#8b5cf6",
  Space:      "#06b6d4",
};

/* ─── Status badge config (module-level — no reason to rebuild each render) */
const BADGE_CONFIG: Record<Phase, { label: string; cls: string }> = {
  idle:      { label: "Ready",      cls: "badge-idle"      },
  analyzing: { label: "Analyzing",  cls: "badge-analyzing" },
  done:      { label: "Complete",   cls: "badge-done"      },
  error:     { label: "Error",      cls: "badge-error"     },
};

/* ═══════════════════════════════════════════════════════════════════
   ROOT COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

// Parse the share URL once at startup — stable for the lifetime of the page.
const INITIAL_SHARE = decodeShare();

export default function App(): React.ReactElement {

  /* ── Dark mode ─────────────────────────────────────────────────── */
  const [dark, setDark] = useState<boolean>(() => {
    const stored = localStorage.getItem("algviz_dark");
    return stored !== null ? stored === "1" : getSystemDark();
  });

  useEffect(() => {
    applyDark(dark);
    localStorage.setItem("algviz_dark", dark ? "1" : "0");
  }, [dark]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent): void => {
      if (localStorage.getItem("algviz_dark") === null) setDark(e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* ── API key ────────────────────────────────────────────────────── */
  const [apiKey, setApiKey]             = useState<string>(getStoredKey);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);

  function handleSaveKey(key: string): void { setApiKey(key); saveKey(key); }

  /* ── Share state ────────────────────────────────────────────────── */
  const [shareToast, setShareToast] = useState<boolean>(false);

  function copyShareLink(): void {
    const url = encodeShare({ code, arr: customInput || undefined });
    navigator.clipboard.writeText(url).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2800);
    }).catch(() => {
      // Fallback for browsers/contexts where clipboard API is unavailable
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.body.removeChild(ta);
      } catch {
        // nothing we can do
      }
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2800);
    });
  }

  /* ── Category filter ────────────────────────────────────────────── */
  const [catFilter, setCatFilter] = useState<CategoryFilter>("All");

  /* ── Core state ─────────────────────────────────────────────────── */
  const [code, setCode] = useState<string>(() => INITIAL_SHARE?.code ?? DEMOS.bubble.code);
  const [activeDemo, setActiveDemo] = useState<DemoKey | "">(() => INITIAL_SHARE ? "" : "bubble");
  const [model, setModel]           = useState<string>(DEFAULT_MODEL);
  const [customInput, setCustomInput] = useState<string>(() => INITIAL_SHARE?.arr ?? "");
  const [phase, setPhase]           = useState<Phase>("idle");
  const [analysis, setAnalysis]     = useState<AlgorithmAnalysis | null>(null);
  const [error, setError]           = useState<string>("");

  const [pb, dispatch] = useReducer(playbackReducer, initialPlayback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending timer on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  /* ── Load demo ──────────────────────────────────────────────────── */
  function loadDemo(key: DemoKey): void {
    setCode(DEMOS[key].code);
    setActiveDemo(key);
    setAnalysis(null);
    setPhase("idle");
    setError("");
    dispatch({ type: "STOP" });
    setCustomInput("");
    if (timerRef.current) clearTimeout(timerRef.current);
    if (window.location.search)
      window.history.replaceState(null, "", window.location.pathname);
  }

  /* ── Analyze ────────────────────────────────────────────────────── */
  async function analyze(): Promise<void> {
    if (!code.trim()) return;

    const key = apiKey.trim();
    if (!key) {
      setError("No API key. Click the key button in the header to add your Groq API key.");
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
    if (customInput.trim()) userMsg += `\n\nPlease use this exact array as defaultInput: [${customInput.trim()}]`;

    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model, temperature: 0.1, max_tokens: 8000,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user",   content: userMsg },
          ],
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: { message?: string } };
        const msg = d?.error?.message ?? "";
        if (res.status === 401) throw new Error("Invalid API key — check it in the key settings.");
        if (res.status === 429) throw new Error("Rate limit hit. Wait a moment and try again.");
        if (res.status === 400 && msg.includes("model"))
          throw new Error(`Model "${model}" is not available on your plan. Try a different model.`);
        throw new Error(msg || `Groq API error ${res.status}`);
      }

      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      const raw  = data?.choices?.[0]?.message?.content ?? "";
      const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

      let parsed: AlgorithmAnalysis;
      try {
        parsed = JSON.parse(clean) as AlgorithmAnalysis;
      } catch {
        const match = clean.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]) as AlgorithmAnalysis;
        else throw new Error("AI returned invalid JSON. Try again or switch to a larger model.");
      }

      setAnalysis(parsed);
      dispatch({ type: "SEEK", idx: 0 });
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed. Try again.");
      setPhase("error");
    }
  }

  /* ── Playback ───────────────────────────────────────────────────── */
  const steps = analysis?.steps ?? [];
  const cur   = steps[pb.stepIdx] ?? null;

  const tick = useCallback(() => {
    dispatch({ type: "NEXT", totalSteps: steps.length });
  }, [steps.length]);

  useEffect(() => {
    if (!pb.playing) return;
    timerRef.current = setTimeout(tick, SPEEDS[pb.speed - 1]);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [pb.playing, pb.stepIdx, pb.speed, tick]);

  const handlePlay = useCallback((): void => dispatch({ type: "PLAY_TOGGLE", totalSteps: steps.length }), [steps.length]);
  const goBack     = useCallback((): void => { if (timerRef.current) clearTimeout(timerRef.current); dispatch({ type: "STEP_PREV" }); }, []);
  const goForward  = useCallback((): void => { if (timerRef.current) clearTimeout(timerRef.current); dispatch({ type: "STEP_NEXT", totalSteps: steps.length }); }, [steps.length]);
  const resetViz   = useCallback((): void => { if (timerRef.current) clearTimeout(timerRef.current); dispatch({ type: "RESET" }); }, []);

  function seekTo(e: React.MouseEvent<HTMLDivElement>): void {
    if (!steps.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (timerRef.current) clearTimeout(timerRef.current);
    dispatch({ type: "SEEK", idx: Math.round(pct * (steps.length - 1)) });
  }

  /* ── Keyboard shortcuts ─────────────────────────────────────────── */
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
  }, [steps.length, handlePlay, goForward, goBack, resetViz]);

  /* ── Status badge ───────────────────────────────────────────────── */
  const badge = BADGE_CONFIG[phase];

  /* ── Filtered demos ─────────────────────────────────────────────── */
  const filteredDemos = (Object.entries(DEMOS) as Array<[DemoKey, DemoEntry]>).filter(
    ([, d]) => catFilter === "All" || d.category === catFilter,
  );

  /* ── Metric tiles data ──────────────────────────────────────────── */
  type MetricTuple = [string, string, string];
  const metricTiles: MetricTuple[] = analysis
    ? [
        ["Algorithm",  analysis.algorithmName,   METRIC_COLORS.Algorithm],
        ["Category",   analysis.category,        METRIC_COLORS.Category],
        ["Time",       analysis.timeComplexity,  METRIC_COLORS.Time],
        ["Space",      analysis.spaceComplexity, METRIC_COLORS.Space],
      ]
    : [];

  /* ═══════════════════════════════════════════════════════════════ */
  return (
    <div className={clsx("app", dark && "dark")}>

      {/* ═══ NAVBAR ════════════════════════════════════════════════ */}
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <a className="navbar__brand" href="/" aria-label="AlgoViz Pro home">
          <div className="navbar__logo-wrap" aria-hidden="true">
            <IconLogo />
          </div>
          <span className="navbar__name">
            AlgoViz <span className="navbar__name-accent">Pro</span>
          </span>
        </a>

        <div className="navbar__actions">
          {/* API Key indicator */}
          <button
            className={clsx("btn btn-nav", apiKey ? "btn-nav--keyed" : "btn-nav--nokey")}
            onClick={() => setShowKeyModal(true)}
            aria-label={apiKey ? "API key configured — click to change" : "No API key — click to add"}
            title={apiKey ? "API key configured" : "Add Groq API key"}
            type="button"
          >
            <IconKey />
            <span>{apiKey ? "Key set" : "Add key"}</span>
          </button>

          {/* Share button */}
          {code.trim() && (
            <button
              className="btn btn-nav"
              onClick={copyShareLink}
              aria-label="Copy shareable link"
              title="Copy shareable link"
              type="button"
            >
              <IconShare />
              <span>Share</span>
            </button>
          )}

          {/* Dark mode toggle */}
          <button
            className="btn btn-nav btn-nav--icon"
            onClick={() => setDark(d => !d)}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            title={dark ? "Light mode" : "Dark mode"}
            type="button"
          >
            {dark ? <IconSun /> : <IconMoon />}
          </button>
        </div>
      </nav>

      <div className="app__inner">

        {/* ═══ HERO HEADER ════════════════════════════════════════ */}
        <header className="header">
          <div className="header__left">
            <p className="header__eyebrow" aria-label="Section: Algorithm Visualizer">
              <span className="header__eyebrow-dot" aria-hidden="true" />
              Algorithm Visualizer
            </p>
            <h1 className="header__title">
              Write, analyze &amp; debug
              <span className="header__title-accent"> algorithms</span>
            </h1>
            <p className="header__sub">
              AI-powered Big-O analysis · Step-by-step execution · Line-by-line explanations
            </p>
          </div>
          <span
            className={clsx("badge", badge.cls)}
            aria-live="polite"
            aria-atomic="true"
          >
            {badge.label}
          </span>
        </header>

        {/* ═══ SHARED CODE BANNER ══════════════════════════════════ */}
        {INITIAL_SHARE && (
          <div className="alert alert-share" role="status">
            <strong>
              <IconShare />
              Shared snippet loaded
            </strong>
            <p>Someone shared this algorithm with you. Hit "Analyze + Visualize" to run it.</p>
          </div>
        )}

        {/* ═══ INPUT CARD ══════════════════════════════════════════ */}
        <section className="card" aria-label="Code input">
          <div className="card-head">
            <span className="card-head__label">Your Code</span>
            <span className="card-head__sub">C++ · Python · Java · JavaScript</span>
          </div>

          {/* Category filter tabs */}
          <div className="cat-tabs" role="tablist" aria-label="Algorithm categories">
            {ALL_CATEGORIES.map(cat => (
              <button
                key={cat}
                role="tab"
                aria-selected={catFilter === cat}
                onClick={() => setCatFilter(cat)}
                className={clsx("cat-tab", catFilter === cat && "cat-tab--on")}
                style={
                  catFilter === cat && cat !== "All"
                    ? { borderColor: CATEGORY_COLORS[cat], color: CATEGORY_COLORS[cat], background: `${CATEGORY_COLORS[cat]}14` }
                    : {}
                }
                type="button"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Demo strip */}
          <div className="demo-strip" aria-label="Demo algorithms">
            <span className="demo-strip__label" aria-hidden="true">Demos:</span>
            {filteredDemos.map(([key, d]) => (
              <button
                key={key}
                onClick={() => loadDemo(key)}
                className={clsx("demo-chip", activeDemo === key && "demo-chip--on")}
                style={activeDemo === key ? { borderColor: CATEGORY_COLORS[d.category] ?? "#6366f1" } : {}}
                aria-pressed={activeDemo === key}
                type="button"
              >
                {d.label}
                <span className="demo-chip__lang" aria-label={`language: ${d.lang}`}>{d.lang}</span>
              </button>
            ))}
          </div>

          {/* Code textarea */}
          <textarea
            value={code}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setCode(e.target.value);
              setActiveDemo("");
            }}
            spellCheck={false}
            className="code-textarea"
            placeholder="// Paste any DSA algorithm here…"
            aria-label="DSA code input — paste your algorithm here"
          />

          {/* Action row */}
          <div className="action-row">
            {/* Custom input array */}
            <div className="field">
              <label className="field__label" htmlFor="cust-input">Custom array</label>
              <input
                id="cust-input"
                type="text"
                value={customInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomInput(e.target.value)}
                placeholder="e.g. 5, 3, 8, 1, 2"
                className="field__input"
                aria-describedby="cust-input-hint"
              />
              <span id="cust-input-hint" className="field__hint">Optional — overrides the AI-chosen array</span>
            </div>

            {/* Model selector */}
            <div className="field">
              <label className="field__label" htmlFor="model-sel">Model</label>
              <select
                id="model-sel"
                value={model}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setModel(e.target.value)}
                className="field__select"
                aria-describedby="model-hint"
              >
                {GROQ_MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
              <span id="model-hint" className="field__hint">All models work with any Groq key</span>
            </div>

            {/* Analyze CTA */}
            <button
              onClick={() => void analyze()}
              disabled={phase === "analyzing" || !code.trim()}
              className="btn btn-primary"
              type="button"
              aria-busy={phase === "analyzing"}
            >
              {phase === "analyzing" ? <Dots /> : "Analyze + Visualize"}
            </button>
          </div>

          {/* Error bar */}
          {error && (
            <div className="error-bar" role="alert" aria-live="assertive">
              <IconWarn />
              <span>{error}</span>
            </div>
          )}
        </section>

        {/* ═══ RESULTS ═════════════════════════════════════════════ */}
        {analysis && (
          <div className="anim-fade-up">
            {analysis.isValid === false ? (
              <div className="alert alert-warn" role="alert">
                <strong>
                  <IconWarn />
                  Invalid / non-DSA code
                </strong>
                <p>{analysis.explanation || "Please paste a valid DSA algorithm."}</p>
              </div>
            ) : (
              <>
                {/* ── Metric tiles ──────────────────────────────── */}
                <div className="metrics" role="list" aria-label="Algorithm metrics">
                  {metricTiles.map(([lbl, val, clr]) => (
                    <div key={lbl} className="metric-tile" role="listitem">
                      <span className="metric-tile__label">{lbl}</span>
                      <span className="metric-tile__value" style={{ color: clr }}>{val}</span>
                    </div>
                  ))}
                </div>

                {/* ── Correctness alert ─────────────────────────── */}
                <div
                  className={clsx("alert", analysis.isCorrect ? "alert-ok" : "alert-warn")}
                  role={analysis.isCorrect ? "status" : "alert"}
                >
                  <strong>
                    {analysis.isCorrect ? <IconCheck /> : <IconWarn />}
                    {analysis.isCorrect ? "Code looks correct" : "Issues found"}
                  </strong>
                  <p>
                    {analysis.isCorrect
                      ? analysis.explanation
                      : (analysis.bugs ?? []).join(" · ")}
                  </p>
                </div>

                {/* ── Corrected code ────────────────────────────── */}
                {!analysis.isCorrect && analysis.correctedCode && (
                  <section className="card" aria-label="Corrected code">
                    <div className="card-head">
                      <span className="card-head__label">Corrected Code</span>
                    </div>
                    <pre className="code-block">{analysis.correctedCode}</pre>
                  </section>
                )}

                {/* ── How it works ──────────────────────────────── */}
                {analysis.howItWorks?.length > 0 && (
                  <section className="card" aria-label="How the algorithm works">
                    <div className="card-head">
                      <span className="card-head__label">How it works</span>
                    </div>
                    <ol className="steps-list">
                      {analysis.howItWorks.map((s, i) => (
                        <li key={i} className="steps-list__item">
                          <span className="steps-list__num" aria-hidden="true">{i + 1}</span>
                          <span className="steps-list__text">{s}</span>
                        </li>
                      ))}
                    </ol>
                  </section>
                )}

                {/* ═══ VISUALIZATION CARD ═══════════════════════ */}
                {steps.length > 0 && (
                  <section className="card viz-card" aria-label="Algorithm visualization">
                    {/* Topbar */}
                    <div className="viz-topbar">
                      <span className="viz-topbar__title" aria-hidden="true">Live Visualization</span>
                      <span
                        className="viz-topbar__counter"
                        aria-label={`Step ${pb.stepIdx + 1} of ${steps.length}`}
                      >
                        {pb.stepIdx + 1} / {steps.length}
                      </span>
                    </div>

                    {/* Keyboard hint */}
                    <div className="kbd-row" aria-label="Keyboard shortcuts">
                      <kbd>Space</kbd> play/pause &nbsp;·&nbsp;
                      <kbd>←</kbd> <kbd>→</kbd> step &nbsp;·&nbsp;
                      <kbd>R</kbd> reset
                    </div>

                    {/* Two-column layout */}
                    <div className="viz-grid">
                      {/* LEFT — array state */}
                      <div className="viz-col viz-col--left">
                        <p className="section-label" id="array-label">Array state</p>
                        <ArrayViz step={cur} />

                        {/* Legend */}
                        <div className="legend" role="list" aria-label="Cell state legend">
                          {(
                            [
                              ["Active",     "rgba(99,102,241,0.1)",  "#6366f1"],
                              ["Comparing",  "rgba(245,158,11,0.1)", "#f59e0b"],
                              ["Done",       "rgba(16,185,129,0.1)",  "#10b981"],
                              ["Swapping",   "rgba(139,92,246,0.12)", "#8b5cf6"],
                              ["Skipped",    "rgba(113,113,122,0.1)", "#52525b"],
                            ] as Array<[string, string, string]>
                          ).map(([l, bg, bd]) => (
                            <div key={l} className="legend__item" role="listitem">
                              <span className="legend__dot" style={{ background: bg, borderColor: bd }} aria-hidden="true" />
                              <span className="legend__label">{l}</span>
                            </div>
                          ))}
                        </div>

                        {/* Pointer cards */}
                        {cur?.pointers && Object.keys(cur.pointers).length > 0 && (
                          <div className="ptr-grid" role="list" aria-label="Current pointers">
                            {Object.entries(cur.pointers).map(([idx, name]) => (
                              <div key={name} className="ptr-card" role="listitem">
                                <span className="ptr-card__name">{name}</span>
                                <span className="ptr-card__val">idx = {idx}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Step message */}
                        <div className="step-msg" aria-live="polite" aria-atomic="true">
                          <p className="step-msg__head">What is happening</p>
                          <p className="step-msg__body">{cur?.msg ?? "—"}</p>
                        </div>
                      </div>

                      {/* RIGHT — code panel */}
                      <div className="viz-col viz-col--right">
                        <p className="section-label">Code · active line highlighted</p>
                        <CodePanel
                          lines={analysis.codeLines}
                          activeLine={cur?.activeLine ?? -1}
                        />
                      </div>
                    </div>

                    {/* Playback controls */}
                    <div className="playback" role="toolbar" aria-label="Playback controls">
                      <button
                        onClick={handlePlay}
                        className={clsx("btn", pb.playing ? "btn-pause" : "btn-play")}
                        title={pb.playing ? "Pause (Space)" : "Play (Space)"}
                        aria-label={pb.playing ? "Pause playback" : "Start playback"}
                        type="button"
                      >
                        {pb.playing ? <IconPause /> : <IconPlay />}
                        {pb.playing ? "Pause" : "Play"}
                      </button>

                      <button
                        onClick={goBack}
                        disabled={pb.stepIdx === 0}
                        className="btn btn-ctrl"
                        title="Step back (←)"
                        aria-label="Step backward"
                        type="button"
                      >
                        <IconStepBack /> Back
                      </button>

                      <button
                        onClick={goForward}
                        disabled={pb.stepIdx >= steps.length - 1}
                        className="btn btn-ctrl"
                        title="Step forward (→)"
                        aria-label="Step forward"
                        type="button"
                      >
                        Next <IconStepForward />
                      </button>

                      <button
                        onClick={resetViz}
                        className="btn btn-ctrl"
                        title="Reset (R)"
                        aria-label="Reset to first step"
                        type="button"
                      >
                        <IconReset /> Reset
                      </button>

                      {/* Seekable progress bar — native range for full a11y */}
                      <div className="progress" aria-hidden="true" onClick={seekTo} title="Click to seek">
                        <div
                          className="progress__fill"
                          style={{ width: `${((pb.stepIdx + 1) / steps.length) * 100}%` }}
                        />
                      </div>
                      <input
                        type="range"
                        className="progress-seek-input sr-only"
                        min={0}
                        max={steps.length - 1}
                        value={pb.stepIdx}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          if (timerRef.current) clearTimeout(timerRef.current);
                          dispatch({ type: "SEEK", idx: Number(e.target.value) });
                        }}
                        aria-label="Seek through steps"
                        aria-valuetext={`Step ${pb.stepIdx + 1} of ${steps.length}`}
                      />

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
                          aria-label="Playback speed"
                          aria-valuetext={SLABELS[pb.speed - 1]}
                        />
                        <span className="speed__val" aria-hidden="true">{SLABELS[pb.speed - 1]}</span>
                      </div>
                    </div>
                  </section>
                )}

                {/* ─── LINE-BY-LINE EXPLANATION ─────────────────── */}
                {analysis.codeLines?.length > 0 && (
                  <section className="card" aria-label="Line-by-line code explanation">
                    <div className="card-head">
                      <span className="card-head__label">Line-by-line explanation</span>
                    </div>
                    {analysis.codeLines.map((item, i) => (
                      <div
                        key={i}
                        className="explain-row"
                        style={{
                          borderBottom:
                            i < analysis.codeLines.length - 1
                              ? "1px solid var(--c-border)"
                              : "none",
                        }}
                      >
                        <span className="explain-row__num" aria-hidden="true">{i + 1}</span>
                        <code className="explain-row__code">{item.line}</code>
                        <span className="explain-row__text">{item.explain}</span>
                      </div>
                    ))}
                  </section>
                )}
              </>
            )}
          </div>
        )}

        {/* ═══ EMPTY STATE ═══════════════════════════════════════ */}
        {phase === "idle" && !analysis && (
          <div className="empty" aria-label="Get started">
            <div className="empty__icon-wrap" aria-hidden="true">
              <IconCode />
            </div>
            <p className="empty__title">Paste any DSA algorithm above</p>
            <p className="empty__body">
              Choose from {Object.keys(DEMOS).length}+ demos across 7 categories, or paste your own code.
              The AI detects bugs, explains every line, and animates each step so you can follow at your own pace.
            </p>
            <div className="empty__chips" aria-label="Quick-start demos">
              {(["bubble", "binary", "two_ptr", "fib_dp", "bfs"] as DemoKey[]).map(k => (
                <button
                  key={k}
                  className="demo-chip"
                  onClick={() => loadDemo(k)}
                  type="button"
                  aria-label={`Load ${DEMOS[k].label} demo`}
                >
                  {DEMOS[k].label}
                  <span className="demo-chip__lang" aria-hidden="true">{DEMOS[k].lang}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ FOOTER ════════════════════════════════════════════ */}
        <footer className="footer" role="contentinfo">
          <span>AlgoViz Pro</span>
          <span className="footer__sep" aria-hidden="true">·</span>
          <span>Powered by{" "}
            <a href="https://groq.com" target="_blank" rel="noopener noreferrer" aria-label="Groq AI (opens in new tab)">
              Groq
            </a>
          </span>
          <span className="footer__sep" aria-hidden="true">·</span>
          <span aria-label={`Current model: ${model}`}>
            Model: <code>{model}</code>
          </span>
        </footer>

      </div>

      {/* ═══ MODALS & TOASTS ════════════════════════════════════ */}
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
