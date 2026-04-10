import { clsx } from "clsx";

const LANGUAGES = [
  { value: "auto",       label: "Auto-detect" },
  { value: "python",     label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "go",         label: "Go" },
  { value: "rust",       label: "Rust" },
  { value: "java",       label: "Java" },
  { value: "cpp",        label: "C++" },
  { value: "c",          label: "C" },
  { value: "ruby",       label: "Ruby" },
  { value: "php",        label: "PHP" },
  { value: "sql",        label: "SQL" },
  { value: "bash",       label: "Bash" },
  { value: "other",      label: "Other" },
];

interface Props {
  value: string;
  onChange: (lang: string) => void;
  className?: string;
}

export function LanguageSelector({ value, onChange, className }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={clsx(
        "bg-white border border-zinc-300 text-zinc-700 text-xs rounded-md px-2 py-1",
        "dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-300",
        "focus:outline-none focus:border-indigo-500/50 cursor-pointer transition-colors",
        "hover:border-zinc-400 dark:hover:border-zinc-600",
        className
      )}
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.value} value={lang.value}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}
