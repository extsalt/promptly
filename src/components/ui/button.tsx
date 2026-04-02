import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
}

const buttonVariants = {
  primary:
    "bg-primary text-[var(--background)] hover:bg-primary-hover shadow-sm",
  secondary:
    "bg-zinc-800 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white",
  ghost: "bg-transparent text-[var(--foreground)] hover:bg-foreground/10",
  glass:
    "bg-white/10 backdrop-blur-xl border border-white/10 hover:bg-white/20 text-[var(--foreground)]",
} as const;

const buttonSizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2 text-sm",
  lg: "px-8 py-2.5 text-base",
} as const;

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  );
}
