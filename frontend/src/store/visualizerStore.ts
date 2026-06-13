import { create } from "zustand";
import type { ExecutionStep, AnalysisResult } from "../lib/api";

export interface VisualizerState {
  steps: ExecutionStep[];
  currentStep: number;
  isPlaying: boolean;
  speed: number;
  code: string;
  language: "js" | "python" | "cpp" | "java";
  analysisResult: AnalysisResult | null;
  loading: boolean;
  error: string | null;

  setSteps: (steps: ExecutionStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  togglePlay: () => void;
  setSpeed: (speed: number) => void;
  setCode: (code: string) => void;
  setLanguage: (language: "js" | "python" | "cpp" | "java") => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useVisualizerStore = create<VisualizerState>((set) => ({
  steps: [],
  currentStep: 0,
  isPlaying: false,
  speed: 1,
  code: "",
  language: "cpp",
  analysisResult: null,
  loading: false,
  error: null,

  setSteps: (steps: ExecutionStep[]): void => set({ steps, currentStep: 0 }),
  nextStep: (): void =>
    set((state: VisualizerState) => {
      if (state.currentStep >= state.steps.length - 1) {
        return { isPlaying: false };
      }
      return { currentStep: state.currentStep + 1 };
    }),
  prevStep: (): void =>
    set((state: VisualizerState) => ({
      currentStep: Math.max(0, state.currentStep - 1),
    })),
  reset: (): void => set({ currentStep: 0, isPlaying: false }),
  togglePlay: (): void =>
    set((state: VisualizerState) => {
      if (state.currentStep >= state.steps.length - 1) {
        return { currentStep: 0, isPlaying: true };
      }
      return { isPlaying: !state.isPlaying };
    }),
  setSpeed: (speed: number): void => set({ speed }),
  setCode: (code: string): void => set({ code }),
  setLanguage: (language: "js" | "python" | "cpp" | "java"): void => set({ language }),
  setAnalysisResult: (analysisResult: AnalysisResult | null): void => set({ analysisResult }),
  setLoading: (loading: boolean): void => set({ loading }),
  setError: (error: string | null): void => set({ error }),
}));

// (4) Selector hook for memoized slice selection
export function useVisualizerSelector<T>(selector: (state: VisualizerState) => T): T {
  return useVisualizerStore(selector);
}

// (5) Individual action hooks
export function useSetSteps(): (steps: ExecutionStep[]) => void {
  return useVisualizerStore((state: VisualizerState) => state.setSteps);
}

export function useNextStep(): () => void {
  return useVisualizerStore((state: VisualizerState) => state.nextStep);
}

export function usePrevStep(): () => void {
  return useVisualizerStore((state: VisualizerState) => state.prevStep);
}

export function useReset(): () => void {
  return useVisualizerStore((state: VisualizerState) => state.reset);
}

export function useTogglePlay(): () => void {
  return useVisualizerStore((state: VisualizerState) => state.togglePlay);
}

export function useSetSpeed(): (speed: number) => void {
  return useVisualizerStore((state: VisualizerState) => state.setSpeed);
}

export function useSetCode(): (code: string) => void {
  return useVisualizerStore((state: VisualizerState) => state.setCode);
}

export function useSetLanguage(): (language: "js" | "python" | "cpp" | "java") => void {
  return useVisualizerStore((state: VisualizerState) => state.setLanguage);
}

export function useSetAnalysisResult(): (result: AnalysisResult | null) => void {
  return useVisualizerStore((state: VisualizerState) => state.setAnalysisResult);
}

export function useSetLoading(): (loading: boolean) => void {
  return useVisualizerStore((state: VisualizerState) => state.setLoading);
}

export function useSetError(): (error: string | null) => void {
  return useVisualizerStore((state: VisualizerState) => state.setError);
}
