import { useEffect, useState } from "react";
import { Clock, Code2, Bug, FileText, Github, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useT } from "../hooks/useT";
import type { ConversationDetail, ConversationSummary, Feature } from "../types/api.types";
import { MarkdownRenderer } from "../components/chat/MarkdownRenderer";

const FEATURE_ICONS: Record<Feature, React.ElementType> = {
  explain: Code2,
  debug:   Bug,
  analyze: FileText,
  github:  Github,
};

const FEATURE_COLORS: Record<Feature, string> = {
  explain: "text-violet-400",
  debug:   "text-red-400",
  analyze: "text-blue-400",
  github:  "text-green-400",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function HistoryPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useT();

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      setConversations(data.items || []);
    } finally {
      setLoading(false);
    }
  }

  async function toggleExpand(id: string) {
    if (expanded === id) {
      setExpanded(null);
      setDetail(null);
      return;
    }
    setExpanded(id);
    const res = await fetch(`/api/history/${id}`);
    const data = await res.json();
    setDetail(data);
  }

  async function deleteConversation(id: string) {
    await fetch(`/api/history/${id}`, { method: "DELETE" });
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (expanded === id) {
      setExpanded(null);
      setDetail(null);
    }
  }

  return (
    <div className="space-y-5 animate-fade-in-up">
      {loading && (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-xl" />
          ))}
        </div>
      )}

      {!loading && conversations.length === 0 && (
        <div className="text-center py-20">
          <div className="w-12 h-12 rounded-xl bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-5 h-5 text-zinc-400 dark:text-zinc-600" />
          </div>
          <p className="text-sm text-zinc-500">{t.history_empty}</p>
        </div>
      )}

      <div className="space-y-2">
        {conversations.map((conv) => {
          const Icon = FEATURE_ICONS[conv.feature] || Code2;
          const colorClass = FEATURE_COLORS[conv.feature] || FEATURE_COLORS.explain;
          const isOpen = expanded === conv.id;

          return (
            <div key={conv.id} className="card overflow-hidden">
              {/* Summary row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${colorClass}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 truncate">{conv.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 font-mono">{formatDate(conv.created_at)}</p>
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className="text-[10px] text-zinc-500 capitalize font-medium px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-600">
                    {conv.level}
                  </span>
                  <button
                    onClick={() => toggleExpand(conv.id)}
                    className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    {isOpen
                      ? <ChevronUp className="w-3.5 h-3.5" />
                      : <ChevronDown className="w-3.5 h-3.5" />
                    }
                  </button>
                  <button
                    onClick={() => deleteConversation(conv.id)}
                    className="text-zinc-500 hover:text-red-500/70 dark:hover:text-red-400/70 transition-colors p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {isOpen && detail && detail.id === conv.id && (
                <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-5 space-y-5 animate-fade-in">
                  {detail.messages.map((msg) => (
                    <div key={msg.id}>
                      <p className={`text-[10px] font-semibold uppercase tracking-[0.1em] mb-2 ${
                        msg.role === "user" ? "text-zinc-500" : "text-indigo-500/60"
                      }`}>
                        {msg.role === "user" ? "You" : "Assistant"}
                      </p>
                      {msg.role === "assistant" ? (
                        <MarkdownRenderer content={msg.content} />
                      ) : (
                        <pre className="text-xs text-zinc-600 dark:text-zinc-500 font-mono whitespace-pre-wrap break-words
                                        bg-zinc-50 dark:bg-zinc-950 rounded-lg p-3 border border-zinc-200 dark:border-zinc-800">
                          {msg.content}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
