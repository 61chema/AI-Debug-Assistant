import { useNavigate } from "react-router-dom";
import { Code2, Bug, FileText, Github, ArrowRight } from "lucide-react";
import { useT } from "../hooks/useT";

export function HomePage() {
  const navigate = useNavigate();
  const t = useT();

  const FEATURES = [
    {
      to: "/explain", icon: Code2,    title: t.home_explain_title, description: t.home_explain_desc,
      iconColor: "text-violet-400", accent: "group-hover:border-violet-500/30 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.05)]",
    },
    {
      to: "/debug",   icon: Bug,      title: t.home_debug_title,   description: t.home_debug_desc,
      iconColor: "text-red-400",    accent: "group-hover:border-red-500/30 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.05)]",
    },
    {
      to: "/analyze", icon: FileText, title: t.home_analyze_title, description: t.home_analyze_desc,
      iconColor: "text-blue-400",   accent: "group-hover:border-blue-500/30 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.05)]",
    },
    {
      to: "/github",  icon: Github,   title: t.home_github_title,  description: t.home_github_desc,
      iconColor: "text-green-400",  accent: "group-hover:border-green-500/30 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.05)]",
    },
  ];

  return (
    <div className="space-y-10 py-2 animate-fade-in-up">
      {/* Hero */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 text-[10px] font-medium text-zinc-500 uppercase tracking-[0.1em]">
          {t.home_badge}
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight leading-[1.2]">
            {t.home_title_1}{" "}
            <span className="text-indigo-500 dark:text-indigo-400">{t.home_title_2}</span>
          </h1>
          <p className="text-zinc-500 leading-relaxed max-w-md text-sm">
            {t.home_subtitle}
          </p>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FEATURES.map(({ to, icon: Icon, title, description, iconColor, accent }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className={`group text-left p-5 rounded-xl border border-zinc-200 bg-white
                        dark:border-zinc-800 dark:bg-zinc-900
                        transition-all duration-200 ${accent} hover:bg-zinc-50 dark:hover:bg-zinc-900/80`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
                <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-700 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all duration-150 mt-1" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors duration-150">
              {title}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-600 leading-relaxed group-hover:text-zinc-600 dark:group-hover:text-zinc-500 transition-colors duration-150">
              {description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
