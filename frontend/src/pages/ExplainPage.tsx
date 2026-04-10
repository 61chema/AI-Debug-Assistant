import { useState } from "react";
import { Code2, Send } from "lucide-react";
import { useConversationStore } from "../store/conversationStore";
import { useStream } from "../hooks/useStream";
import { useT } from "../hooks/useT";
import { LanguageSelector } from "../components/ui/LanguageSelector";
import { StreamingResponse } from "../components/chat/StreamingResponse";
import { toast } from "../components/ui/Toast";
import { classifyError } from "../utils/errorClassifier";

const EXPLAIN_EXAMPLES = [
  {
    label: "Python decorator",
    language: "python",
    code: `def retry(max_attempts=3):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    print(f"Attempt {attempt + 1} failed: {e}")
        return wrapper
    return decorator`,
  },
  {
    label: "React hook",
    language: "javascript",
    code: `function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    setStoredValue(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue];
}`,
  },
  {
    label: "Async/await JS",
    language: "javascript",
    code: `async function fetchUserData(userId) {
  try {
    const [user, posts] = await Promise.all([
      fetch(\`/api/users/\${userId}\`).then(r => r.json()),
      fetch(\`/api/posts?author=\${userId}\`).then(r => r.json()),
    ]);
    return { ...user, posts };
  } catch (error) {
    console.error("Failed to fetch:", error);
    throw error;
  }
}`,
  },
];

export function ExplainPage() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("auto");
  const [error, setError] = useState<string | null>(null);

  const { level, appLanguage, isStreaming, reset } = useConversationStore();
  const { startStream } = useStream();
  const t = useT();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || isStreaming) return;

    setError(null);
    reset();

    await startStream(
      "/api/explain",
      { code, language, level, response_language: appLanguage },
      {
        onError: (msg) => {
          const { variant, message } = classifyError(msg);
          toast(message, variant);
          setError(message);
        },
      }
    );
  }

  return (
    <div className="space-y-5 animate-fade-in-up">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Example chips */}
        {!code && !isStreaming && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.08em]">
              {t.examples_try}
            </span>
            {EXPLAIN_EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => { setCode(ex.code); setLanguage(ex.language); }}
                className="text-xs px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800
                           text-zinc-600 dark:text-zinc-500
                           hover:text-zinc-900 dark:hover:text-zinc-200
                           hover:border-zinc-400 dark:hover:border-zinc-600
                           bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-150"
              >
                {ex.label}
              </button>
            ))}
          </div>
        )}

        {/* Code editor panel */}
        <div className="editor-panel">
          {/* Panel header */}
          <div className="editor-panel-header">
            <div className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-medium text-zinc-400">{t.explain_title}</span>
            </div>
            <LanguageSelector value={language} onChange={setLanguage} />
          </div>
          {/* Textarea */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t.explain_placeholder}
            rows={16}
            className="editor-textarea min-h-[280px]"
          />
        </div>

        {error && (
          <div className="text-xs text-red-400/80 bg-red-500/[0.07] border border-red-500/15 rounded-lg px-3 py-2.5">
            {error}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            {t.explain_level_hint}{" "}
            <span className="text-indigo-500 dark:text-indigo-400 font-medium capitalize">{level}</span>
          </span>
          <button type="submit" disabled={!code.trim() || isStreaming} className="btn-primary">
            <Send className="w-3.5 h-3.5" />
            {isStreaming ? t.explain_submitting : t.explain_submit}
          </button>
        </div>
      </form>

      <StreamingResponse />
    </div>
  );
}
