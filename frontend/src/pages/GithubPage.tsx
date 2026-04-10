import { useState } from "react";
import { Github, Send, CheckCircle, AlertCircle } from "lucide-react";
import { useConversationStore } from "../store/conversationStore";
import { useStream } from "../hooks/useStream";
import { useT } from "../hooks/useT";
import { StreamingResponse } from "../components/chat/StreamingResponse";
import { toast } from "../components/ui/Toast";
import { classifyError } from "../utils/errorClassifier";

function isValidGithubUrl(url: string): boolean {
  return /^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\/.+/.test(url);
}

export function GithubPage() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { level, appLanguage, isStreaming, reset } = useConversationStore();
  const { startStream } = useStream();
  const t = useT();

  const urlValid = url.length > 0 && isValidGithubUrl(url);
  const urlInvalid = url.length > 10 && !isValidGithubUrl(url);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!urlValid || isStreaming) return;

    setError(null);
    reset();

    await startStream(
      "/api/github",
      { url, analysis_type: "file", level, response_language: appLanguage },
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
        {/* URL input */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-[0.1em]">
            {t.github_url_label}
          </p>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Github className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t.github_url_placeholder}
              className="input pl-9 pr-10 font-mono text-[13px]"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {urlValid   && <CheckCircle className="w-3.5 h-3.5 text-green-400" />}
              {urlInvalid && <AlertCircle className="w-3.5 h-3.5 text-red-400/60" />}
            </div>
          </div>
          {urlInvalid && (
            <p className="text-xs text-zinc-500 mt-1.5">{t.github_url_error}</p>
          )}
        </div>

        {error && (
          <div className="text-xs text-red-400/80 bg-red-500/[0.07] border border-red-500/15 rounded-lg px-3 py-2.5">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={!urlValid || isStreaming} className="btn-primary">
            <Send className="w-3.5 h-3.5" />
            {isStreaming ? t.github_submitting : t.github_submit}
          </button>
        </div>
      </form>

      <StreamingResponse />
    </div>
  );
}
