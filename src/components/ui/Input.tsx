import { forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-4 h-4">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              "w-full rounded-[10px] border bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100",
              "px-3 py-2 text-sm font-mono transition-all duration-150",
              "placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
              "focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400",
              error
                ? "border-rose-400 focus:ring-rose-500/20"
                : "border-zinc-200 dark:border-zinc-700",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-4 h-4">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-rose-500">{error}</p>}
        {hint && !error && <p className="text-xs text-zinc-400 dark:text-zinc-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
