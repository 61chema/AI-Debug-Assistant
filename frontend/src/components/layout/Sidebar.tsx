import { useNavigate, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { Code2, Bug, FileText, Github, Clock, Home, Terminal } from "lucide-react";
import { useConversationStore } from "../../store/conversationStore";

interface Props {
  onClose: () => void;
}

const NAV_ITEMS = [
  { to: "/",        icon: Home,     label: "Home" },
  { to: "/explain", icon: Code2,    label: "Explain Code" },
  { to: "/debug",   icon: Bug,      label: "Debug Errors" },
  { to: "/analyze", icon: FileText, label: "Analyze File" },
  { to: "/github",  icon: Github,   label: "GitHub URL" },
  { to: "/history", icon: Clock,    label: "History" },
];

export function Sidebar({ onClose }: Props) {
  const { reset } = useConversationStore();
  const navigate = useNavigate();
  const location = useLocation();

  function isActive(to: string) {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  }

  function handleNavClick(to: string) {
    reset();
    navigate(to);
    onClose();
  }

  return (
    <div className="h-full flex flex-col items-center py-4 bg-white border-r border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
      {/* Logo mark */}
      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-8 flex-shrink-0">
        <Terminal className="w-5 h-5 text-white" />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5 w-full px-2 flex-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const active = isActive(to);
          return (
            <div key={to} className="relative group">
              {/* Active indicator bar */}
              {active && (
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.7)]" />
              )}

              <button
                onClick={() => handleNavClick(to)}
                className={clsx(
                  "w-full aspect-square rounded-lg flex items-center justify-center transition-all duration-150 outline-none",
                  active
                    ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] border border-transparent"
                )}
                title={label}
              >
                <Icon className="w-[18px] h-[18px]" />
              </button>

              {/* Tooltip */}
              <div className="
                absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2
                bg-white border border-zinc-200 text-zinc-800
                dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100
                px-2.5 py-1 rounded-md text-xs font-medium
                opacity-0 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100
                transition-all duration-150 pointer-events-none shadow-xl z-50 whitespace-nowrap
              ">
                {label}
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
