/**
 * src/lib/api.ts
 * ──────────────────────────────────────────────────────────────────
 * Type-safe API layer for the Groq chat-completions endpoint.
 * No `any` — every shape is explicitly typed.
 */

import { useState, useCallback, useEffect } from "react";

// ── Environment ────────────────────────────────────────────────────
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// ── Request shapes ─────────────────────────────────────────────────

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqRequestBody {
  model: string;
  temperature?: number;
  max_tokens?: number;
  messages: ChatMessage[];
}

export interface FetchApiOptions extends Omit<RequestInit, "body"> {
  body?: GroqRequestBody;
  apiKey: string;
}

// ── Response shapes ────────────────────────────────────────────────

export interface GroqChoice {
  index: number;
  message: ChatMessage;
  finish_reason: string;
}

export interface GroqUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface GroqResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: GroqChoice[];
  usage: GroqUsage;
}

/** Shape of a Groq API error body */
export interface GroqErrorBody {
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
}

// ── Typed visualization output (from the AI JSON) ──────────────────

export interface CodeLine {
  line: string;
  explain: string;
}

export interface VisualizationStep {
  /** Full array state at this moment */
  arr: number[];
  /** Indices being compared (blue) */
  highlight: number[];
  /** Reference indices (yellow) */
  secondary: number[];
  /** Finalized / sorted positions (green) */
  done: number[];
  /** Out-of-range / eliminated indices (grey) */
  eliminated: number[];
  /** Indices being swapped (purple) */
  swap: number[];
  /** Map of string-index → pointer label, e.g. { "0": "i", "3": "j" } */
  pointers: Record<string, string>;
  /** 0-based index into codeLines for the currently executing line */
  activeLine: number;
  /** Human-readable description of what is happening in this step */
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

// ── New structures requested in Prompt 3 ───────────────────────────

export type AlgorithmCategory = "sorting" | "searching" | "graph" | "tree" | "dp" | "twoPointers" | "slidingWindow";

export type Language = "cpp" | "java" | "python" | "javascript" | "typescript" | "go";

export interface ExecutionStep {
  arrayState: number[];
  leftIdx: number | null;
  rightIdx: number | null;
  activeLine: number;
  description: string;
  status: "active" | "comparing" | "done" | "swapping" | "skipped";
}

export interface LineExplanation {
  line: number;
  code: string;
  explanation: string;
}

export interface AnalysisResult {
  algorithm: string;
  category: AlgorithmCategory;
  timeComplexity: string;
  spaceComplexity: string;
  isCorrect: boolean;
  summary: string;
  steps: ExecutionStep[];
  lineExplanations: LineExplanation[];
}

/** Typed custom API Error class */
export class ApiError extends Error {
  status: number;
  info?: unknown;
  constructor(message: string, status: number, info?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.info = info;
  }
}

// ── Generic fetch helper ───────────────────────────────────────────

/**
 * A generic fetch wrapper that returns `Promise<T>`.
 * Throws a typed ApiError on non-2xx responses.
 * Backwards compatible with legacy options.
 */
export async function fetchApi<T>(
  url: string,
  options?: Omit<RequestInit, "body"> & { apiKey?: string; body?: unknown }
): Promise<T> {
  const standardOptions: RequestInit = {};

  if (options) {
    const { apiKey, body, ...rest } = options;
    standardOptions.method = rest.method ?? (body ? "POST" : "GET");
    const headers = new Headers(rest.headers);
    if (apiKey) {
      headers.set("Authorization", `Bearer ${apiKey}`);
    }
    if (body) {
      if (typeof body === "string") {
        standardOptions.body = body;
      } else {
        headers.set("Content-Type", "application/json");
        standardOptions.body = JSON.stringify(body);
      }
    }
    standardOptions.headers = headers;
    Object.assign(standardOptions, rest);
  }

  try {
    const response = await fetch(url, standardOptions);
    if (!response.ok) {
      let info: unknown;
      try {
        info = await response.json();
      } catch {
        info = null;
      }
      const errBody = info as GroqErrorBody | undefined;
      const msg = errBody?.error?.message ?? "";

      if (response.status === 401) throw new ApiError("Invalid API key. Check your .env file.", 401, info);
      if (response.status === 429) throw new ApiError("Rate limit hit. Wait a moment and try again.", 429, info);
      if (response.status === 400 && msg.includes("model")) {
        throw new ApiError("Model is not available on your Groq plan. Try a different model.", 400, info);
      }
      throw new ApiError(msg || `API error ${response.status}`, response.status, info);
    }
    return (await response.json()) as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err instanceof Error ? err.message : "Network error", 500);
  }
}

// ── Convenience: call Groq and parse algorithm JSON ───────────────

export async function analyzeAlgorithm(
  code: string,
  model: string,
  apiKey: string,
  systemPrompt: string,
  customInput?: string,
): Promise<AlgorithmAnalysis> {
  let userMsg = "Analyze this DSA code and return the JSON:\n\n" + code;
  if (customInput?.trim()) {
    userMsg += `\n\nPlease use this exact array as defaultInput: [${customInput.trim()}]`;
  }

  const data = await fetchApi<GroqResponse>(GROQ_URL, {
    apiKey,
    body: {
      model,
      temperature: 0.1,
      max_tokens: 8000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMsg },
      ],
    },
  });

  const raw = data.choices[0]?.message.content ?? "";
  const clean = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
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

  return parsed;
}

// ── analyzeCode function ───────────────────────────────────────────

export async function analyzeCode(
  code: string,
  language: Language,
  array?: number[]
): Promise<AnalysisResult> {
  return fetchApi<AnalysisResult>("/api/analyze", {
    method: "POST",
    body: {
      code,
      language,
      array,
    },
  });
}

// ── useApi hook (legacy) ───────────────────────────────────────────

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string;
}

export function useApi<T, A extends unknown[]>(
  fn: (...args: A) => Promise<T>,
): { data: T | null; loading: boolean; error: string; execute: (...args: A) => Promise<void>; reset: () => void } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: "",
  });

  const execute = useCallback(
    async (...args: A) => {
      setState({ data: null, loading: true, error: "" });
      try {
        const result = await fn(...args);
        setState({ data: result, loading: false, error: "" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setState({ data: null, loading: false, error: msg });
      }
    },
    [fn],
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: "" });
  }, []);

  return { ...state, execute, reset };
}

// ── useFetch custom hook ───────────────────────────────────────────

export function useFetch<T>(
  url: string,
  options?: RequestInit
): { data: T | null; loading: boolean; error: string | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        setLoading(true);
        setError(null);
      }
    }).catch(() => {});

    fetchApi<T>(url, options)
      .then((res: T) => {
        if (active) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          setError(msg);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [url, options]);

  return { data, loading, error };
}
