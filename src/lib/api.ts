/**
 * src/lib/api.ts
 * ──────────────────────────────────────────────────────────────────
 * Type-safe API layer for the Groq chat-completions endpoint.
 * No `any` — every shape is explicitly typed.
 */

import { useState, useCallback } from "react";

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

// ── Generic fetch helper ───────────────────────────────────────────

/**
 * A generic fetch wrapper that returns `Promise<T>`.
 * Throws a typed Error on non-2xx responses so callers can catch
 * specific messages without touching `any`.
 */
export async function fetchApi<T>(
  url: string,
  { apiKey, body, ...rest }: FetchApiOptions,
): Promise<T> {
  const response = await fetch(url, {
    ...rest,
    method: rest.method ?? (body ? "POST" : "GET"),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...rest.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errBody = (await response.json().catch(() => ({}))) as GroqErrorBody;
    const msg = errBody.error?.message ?? "";

    if (response.status === 401) throw new Error("Invalid API key. Check your .env file.");
    if (response.status === 429) throw new Error("Rate limit hit. Wait a moment and try again.");
    if (response.status === 400 && msg.includes("model")) {
      throw new Error(`Model is not available on your Groq plan. Try a different model.`);
    }
    throw new Error(msg || `Groq API error ${response.status}`);
  }

  return response.json() as Promise<T>;
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

// ── useApi hook ───────────────────────────────────────────────────

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string;
}

/**
 * Generic hook that wraps an async function with loading / error / data state.
 * `T` is the resolved value type; `A` is the tuple of argument types for `fn`.
 */
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
