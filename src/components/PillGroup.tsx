"use client";

import { cn } from "@/lib/utils";

export interface PillOption<T extends string> {
  value: T;
  label: string;
}

export default function PillGroup<T extends string>({
  value,
  onChange,
  options,
  size = "md",
  allowDeselect = false,
}: {
  value: T;
  onChange: (v: T) => void;
  options: PillOption<T>[];
  size?: "sm" | "md";
  allowDeselect?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(allowDeselect && value === opt.value ? ("" as T) : opt.value)}
          className={cn(
            "rounded-full font-medium transition-colors",
            size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm",
            value === opt.value
              ? "bg-secondary text-secondary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
