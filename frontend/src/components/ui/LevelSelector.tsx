import { clsx } from "clsx";
import type { Level } from "../../types/api.types";

interface Props {
  value: Level;
  onChange: (level: Level) => void;
}

const LEVELS: { value: Level; label: string; tooltip: string }[] = [
  { value: "junior", label: "Junior", tooltip: "Plain English & analogies" },
  { value: "mid",    label: "Mid",    tooltip: "Technical concepts & best practices" },
  { value: "senior", label: "Senior", tooltip: "Architecture & tradeoffs" },
];

export function LevelSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-0.5 p-0.5 bg-zinc-100 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-lg">
      {LEVELS.map((level) => (
        <button
          key={level.value}
          title={level.tooltip}
          onClick={() => onChange(level.value)}
          className={clsx(
            "px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150",
            value === level.value
              ? "bg-indigo-600 text-white shadow-[0_0_8px_rgba(99,102,241,0.3)]"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          )}
        >
          {level.label}
        </button>
      ))}
    </div>
  );
}
