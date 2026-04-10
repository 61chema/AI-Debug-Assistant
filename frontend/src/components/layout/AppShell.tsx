import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { ToastContainer } from "../ui/Toast";
import { LevelSelector } from "../ui/LevelSelector";
import { Menu, Code2, Bug, FileText, Github, Clock, Home, Sun, Moon } from "lucide-react";
import { useConversationStore } from "../../store/conversationStore";
import { useT } from "../../hooks/useT";
import { clsx } from "clsx";
import type { AppLanguage } from "../../utils/translations";
import type { Level } from "../../types/api.types";

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { level, setLevel, appLanguage, setAppLanguage, theme, setTheme } = useConversationStore();
  const location = useLocation();
  const t = useT();

  // Page metadata for the top header — mapped by route
  const PAGE_INFO = {
    "/":        { icon: Home,     color: "text-zinc-400",   title: t.nav_home,    subtitle: t.home_badge },
    "/explain": { icon: Code2,    color: "text-violet-400", title: t.nav_explain, subtitle: t.explain_subtitle },
    "/debug":   { icon: Bug,      color: "text-red-400",    title: t.nav_debug,   subtitle: t.debug_subtitle },
    "/analyze": { icon: FileText, color: "text-blue-400",   title: t.nav_analyze, subtitle: t.analyze_subtitle },
    "/github":  { icon: Github,   color: "text-green-400",  title: t.nav_github,  subtitle: t.github_subtitle },
    "/history": { icon: Clock,    color: "text-zinc-400",   title: t.nav_history, subtitle: t.history_subtitle },
  } as const;

  const path = location.pathname as keyof typeof PAGE_INFO;
  const page = PAGE_INFO[path] ?? PAGE_INFO["/"];
  const PageIcon = page.icon;

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar dock — 68px fixed width */}
      <aside
        className={clsx(
          "fixed lg:relative inset-y-0 left-0 z-30 w-[68px] flex-shrink-0",
          "transform transition-transform duration-200 ease-out lg:transform-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main workspace */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top header bar */}
        <header className="h-[60px] border-b border-zinc-200 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/90 backdrop-blur-md flex items-center justify-between px-5 flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mr-1"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Page icon */}
            <div className="p-1.5 bg-zinc-100 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-md">
              <PageIcon className={clsx("w-4 h-4", page.color)} />
            </div>

            {/* Page title + subtitle */}
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-none">{page.title}</h1>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5 leading-none line-clamp-1 max-w-[320px]">
                {page.subtitle}
              </p>
            </div>
          </div>

          {/* Right controls: level selector + language toggle + theme toggle */}
          <div className="flex items-center gap-2.5">
            <LevelSelector value={level} onChange={(l: Level) => setLevel(l)} />

            <div className="flex gap-0.5 p-0.5 bg-zinc-100 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-lg">
              {(["es", "en"] as AppLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setAppLanguage(lang)}
                  className={clsx(
                    "px-2.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-widest transition-all duration-150",
                    appLanguage === lang
                      ? "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800
                         text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100
                         hover:bg-zinc-100 dark:hover:bg-zinc-800
                         transition-colors duration-150"
            >
              {theme === "dark"
                ? <Sun className="w-3.5 h-3.5" />
                : <Moon className="w-3.5 h-3.5" />
              }
            </button>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
