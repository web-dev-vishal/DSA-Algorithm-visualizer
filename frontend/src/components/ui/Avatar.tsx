import { useState, useEffect } from "react";
import { clsx } from "clsx";

interface AvatarProps {
  src?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map(n => n[0])
    .join("")
    .toUpperCase();
}

function stringToColor(str: string): string {
  const colors = [
    "bg-indigo-500", "bg-violet-500", "bg-cyan-500", "bg-emerald-500",
    "bg-amber-500", "bg-rose-500", "bg-pink-500", "bg-sky-500",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length] ?? "bg-indigo-500";
}

export function Avatar({ src, name = "", size = "md", className }: AvatarProps) {
  const sizes = { xs: "w-5 h-5 text-[9px]", sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-11 h-11 text-base", xl: "w-14 h-14 text-lg" };
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  if (src && !error) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setError(true)}
        className={clsx("rounded-full object-cover flex-shrink-0", sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={clsx(
        "rounded-full flex items-center justify-center text-white font-bold flex-shrink-0",
        sizes[size],
        stringToColor(name),
        className
      )}
      aria-label={name}
    >
      {getInitials(name) || "?"}
    </div>
  );
}
