import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({ children, className, hover, padding = "md" }: CardProps) {
  const paddings = { none: "", sm: "p-4", md: "p-5", lg: "p-6" };
  return (
    <div
      className={clsx(
        "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl",
        "shadow-sm",
        hover && "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer",
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 rounded-t-2xl", className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("p-5", className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 rounded-b-2xl", className)}>
      {children}
    </div>
  );
}
