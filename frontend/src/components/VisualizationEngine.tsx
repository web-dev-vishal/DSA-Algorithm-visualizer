import { useReducer, useEffect, useRef } from "react";
import type React from "react";
import { clsx } from "clsx";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

// ── Interfaces ─────────────────────────────────────────────────────

export interface ExecutionStep {
  arrayState: number[];
  leftIdx: number | null;
  rightIdx: number | null;
  activeLine: number;
  description: string;
  status: "active" | "comparing" | "done" | "swapping" | "skipped";
}

export interface VisualizerProps {
  steps: ExecutionStep[];
  code: string;
}

// ── State and Reducer Types ────────────────────────────────────────

interface PlaybackState {
  currentStep: number;
  isPlaying: boolean;
  speed: number;
}

type PlaybackAction =
  | { type: "NEXT_STEP"; maxSteps: number }
  | { type: "PREV_STEP" }
  | { type: "RESET" }
  | { type: "SET_SPEED"; payload: number }
  | { type: "TOGGLE_PLAY"; maxSteps: number };

const initialPlayback: PlaybackState = {
  currentStep: 0,
  isPlaying: false,
  speed: 1, // Speed multiplier from 0.5 to 3
};

function playbackReducer(state: PlaybackState, action: PlaybackAction): PlaybackState {
  switch (action.type) {
    case "NEXT_STEP":
      if (state.currentStep >= action.maxSteps - 1) {
        return { ...state, isPlaying: false };
      }
      return { ...state, currentStep: state.currentStep + 1 };
    case "PREV_STEP":
      return { ...state, currentStep: Math.max(0, state.currentStep - 1) };
    case "RESET":
      return { ...state, currentStep: 0, isPlaying: false };
    case "SET_SPEED":
      return { ...state, speed: action.payload };
    case "TOGGLE_PLAY":
      if (state.currentStep >= action.maxSteps - 1) {
        return { ...state, currentStep: 0, isPlaying: true };
      }
      return { ...state, isPlaying: !state.isPlaying };
    default:
      return state;
  }
}

// ── Box Styles ─────────────────────────────────────────────────────

const BOX_CLASSES: Record<ExecutionStep["status"] | "idle", string> = {
  active:     "bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-950/40 dark:border-blue-500 dark:text-blue-200",
  comparing:  "bg-amber-100 border-amber-500 text-amber-800 dark:bg-amber-950/40 dark:border-amber-500 dark:text-amber-200",
  done:       "bg-green-100 border-green-500 text-green-800 dark:bg-green-950/40 dark:border-green-500 dark:text-green-200",
  swapping:   "bg-violet-100 border-violet-500 text-violet-800 dark:bg-violet-950/40 dark:border-violet-500 dark:text-violet-200",
  skipped:    "bg-slate-100 border-slate-300 text-slate-400 dark:bg-zinc-800/40 dark:border-zinc-700 dark:text-zinc-500",
  idle:       "bg-white border-slate-200 text-slate-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-350",
};

// ── Component ──────────────────────────────────────────────────────

export function VisualizationEngine({ steps, code }: VisualizerProps): React.ReactElement {
  const [state, dispatch] = useReducer(playbackReducer, initialPlayback);
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  const totalSteps = steps.length;
  const currentStepData: ExecutionStep | undefined = steps[state.currentStep];
  
  // Auto-play side effect
  useEffect(() => {
    if (!state.isPlaying || totalSteps === 0) return;

    const tick = (): void => {
      dispatch({ type: "NEXT_STEP", maxSteps: totalSteps });
    };

    const intervalId = setInterval(tick, Math.round(1000 / state.speed));
    return () => clearInterval(intervalId);
  }, [state.isPlaying, state.speed, totalSteps]);

  // Smooth scroll to active line
  useEffect(() => {
    activeLineRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [currentStepData?.activeLine]);

  if (totalSteps === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl select-none text-center">
        <p className="text-slate-500 dark:text-zinc-400 text-sm">No visualization steps generated. Paste code above and analyze first.</p>
      </div>
    );
  }

  const codeLines = code.split("\n");
  const activeLine = currentStepData?.activeLine ?? -1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-6 rounded-2xl shadow-sm">
      
      {/* LEFT COLUMN: Array visualization & description */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* Array state boxes */}
        <div className="flex flex-col gap-3 p-5 rounded-xl border border-slate-100 dark:border-zinc-800/60 bg-slate-50/50 dark:bg-zinc-950/10">
          <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wide select-none">Array State</span>
          
          <div className="flex flex-wrap justify-center items-end gap-3 min-h-[6rem] py-2" role="list" aria-label="Visualizer boxes">
            {currentStepData?.arrayState.map((val, idx) => {
              const left = idx === currentStepData.leftIdx;
              const right = idx === currentStepData.rightIdx;
              let status: ExecutionStep["status"] | "idle" = "idle";
              
              if (left || right) {
                status = currentStepData.status;
              } else if (state.currentStep === totalSteps - 1) {
                status = "done";
              }

              return (
                <div key={idx} className="flex flex-col items-center select-none" role="listitem">
                  <span className="text-[10px] font-mono text-indigo-500 h-4 flex items-center justify-center font-bold">
                    {left && "L"}
                    {right && "R"}
                  </span>
                  
                  <div className={clsx(
                    "border-2 rounded-[10px] w-12 h-12 flex items-center justify-center font-extrabold text-sm shadow-sm transition-all duration-200",
                    BOX_CLASSES[status]
                  )}>
                    {val}
                  </div>
                  
                  <span className="text-[9px] text-slate-400 mt-1 font-mono">[{idx}]</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* What is happening description panel */}
        <div className="bg-slate-50 dark:bg-zinc-950/30 border border-slate-200 dark:border-zinc-850 p-4 rounded-xl flex flex-col gap-2" role="region" aria-label="Step description">
          <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wide select-none">What is happening</span>
          <p className="text-sm text-slate-700 dark:text-zinc-200 font-medium leading-relaxed">
            {currentStepData?.description ?? "Ready to visualize..."}
          </p>
        </div>

        {/* Playback control toolbar */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-50 dark:bg-zinc-950/30 p-4 rounded-xl border border-slate-200 dark:border-zinc-850" role="toolbar" aria-label="Playback controls">
          
          {/* Play/Pause Button */}
          <button
            onClick={() => dispatch({ type: "TOGGLE_PLAY", maxSteps: totalSteps })}
            className={clsx(
              "flex items-center justify-center gap-1.5 font-bold text-xs px-4 py-2 rounded-xl text-white cursor-pointer active:scale-95 shadow-sm hover:shadow transition-all w-24",
              state.isPlaying ? "bg-amber-500 hover:bg-amber-600" : "bg-indigo-600 hover:bg-indigo-700"
            )}
            type="button"
          >
            {state.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {state.isPlaying ? "Pause" : "Play"}
          </button>

          {/* Back Button */}
          <button
            onClick={() => dispatch({ type: "PREV_STEP" })}
            disabled={state.currentStep === 0}
            className="flex items-center justify-center gap-1 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs py-2 px-3.5 rounded-xl cursor-pointer active:scale-95 transition-all select-none"
            type="button"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back
          </button>

          {/* Next Button */}
          <button
            onClick={() => dispatch({ type: "NEXT_STEP", maxSteps: totalSteps })}
            disabled={state.currentStep >= totalSteps - 1}
            className="flex items-center justify-center gap-1 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs py-2 px-3.5 rounded-xl cursor-pointer active:scale-95 transition-all select-none"
            type="button"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Reset Button */}
          <button
            onClick={() => dispatch({ type: "RESET" })}
            className="flex items-center justify-center gap-1 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 font-semibold text-xs py-2 px-3.5 rounded-xl cursor-pointer active:scale-95 transition-all select-none"
            type="button"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>

          {/* Step Counter */}
          <span className="text-xs font-mono font-bold text-slate-400 dark:text-zinc-500 ml-auto mr-4">
            Step {state.currentStep + 1} / {totalSteps}
          </span>

          {/* Speed Slider */}
          <div className="flex items-center gap-2 select-none border-l border-slate-200 dark:border-zinc-800 pl-4">
            <label className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider" htmlFor="speed-slider">Speed</label>
            <input
              id="speed-slider"
              type="range"
              min="0.5"
              max="3"
              step="0.5"
              value={state.speed}
              onChange={(e) => dispatch({ type: "SET_SPEED", payload: parseFloat(e.target.value) })}
              className="accent-indigo-600 w-24 h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-zinc-800"
            />
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-300 w-8 text-right">
              {state.speed.toFixed(1)}x
            </span>
          </div>

        </div>

      </div>

      {/* RIGHT COLUMN: Code panel */}
      <div className="lg:col-span-5 flex flex-col gap-3">
        <span className="text-xs font-semibold text-slate-400 dark:text-zinc-550 uppercase tracking-wide select-none">Code Execution</span>
        
        <div className="flex flex-col h-[26rem] rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/20 overflow-hidden shadow-inner">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-850">
            <span className="text-xs font-mono font-medium text-slate-400 dark:text-zinc-500">source.code</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed">
            {codeLines.map((line, idx) => {
              const active = idx === activeLine;
              return (
                <div
                  key={idx}
                  ref={active ? activeLineRef : null}
                  className={clsx(
                    "flex items-start px-2 py-0.5 rounded transition-all duration-150 border-l-2",
                    active
                      ? "bg-indigo-50/70 border-indigo-500 text-indigo-950 dark:bg-indigo-950/30 dark:text-indigo-200 font-bold"
                      : "border-transparent text-slate-650 dark:text-zinc-400"
                  )}
                >
                  <span className="w-6 text-right text-[10px] text-slate-300 dark:text-zinc-650 pr-3 select-none">{idx + 1}</span>
                  <span className="flex-1 whitespace-pre">{line}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
