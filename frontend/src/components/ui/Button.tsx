import { forwardRef } from "react";
import type React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold rounded-[10px] border transition-all duration-150 select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-indigo-600 text-white border-transparent shadow-[0_2px_8px_rgba(99,102,241,0.35)] hover:bg-indigo-700 hover:-translate-y-0.5",
        ghost: "bg-transparent border-transparent text-zinc-650 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
        danger: "bg-rose-500 text-white border-transparent shadow-sm hover:bg-rose-600",
        // preserved for compatibility
        secondary: "bg-white border-zinc-200 text-zinc-700 shadow-sm hover:bg-zinc-50 hover:border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-700",
        destructive: "bg-rose-500 text-white border-transparent shadow-sm hover:bg-rose-600",
        outline: "bg-transparent border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950",
      },
      size: {
        sm: "text-xs px-3 py-1.5 h-7",
        md: "text-sm px-4 py-2 h-9",
        lg: "text-sm px-6 py-2.5 h-11",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant, size, loading, leftIcon, rightIcon, children, className, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
