import { useConversationStore } from "../../store/conversationStore";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { useT } from "../../hooks/useT";
import { Copy, Check, Sparkles } from "lucide-react";
import { useState } from "react";

export function StreamingResponse() {
  const { streamingText, isStreaming } = useConversationStore();
  const [copied, setCopied] = useState(false);
  const t = useT();

  if (!streamingText && !isStreaming) return null;

  const handleCopy = async () => {
    const clean = streamingText.replace(/<annotations>[\s\S]*?<\/annotations>/g, "").trim();
    await navigator.clipboard.writeText(clean);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in-up mt-6">
      <div className="card overflow-hidden">
        {/* Panel header */}
        <div className="h-12 bg-zinc-50 border-b border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            {isStreaming ? (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500" />
              </span>
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {isStreaming ? t.response_generating : t.response_label}
            </span>
          </div>

          {!isStreaming && streamingText && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors px-2 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800"
            >
              {copied ? (
                <><Check className="w-3 h-3 text-green-400" /><span className="text-green-400">{t.response_copied}</span></>
              ) : (
                <><Copy className="w-3 h-3" />{t.response_copy}</>
              )}
            </button>
          )}
        </div>

        {/* Loading skeleton */}
        {isStreaming && !streamingText && (
          <div className="p-6 space-y-3 animate-pulse">
            <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full w-2/3" />
            <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full w-full" />
            <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full w-4/5" />
            <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full w-3/4" />
          </div>
        )}

        {/* Response content */}
        {streamingText && (
          <div className="p-6">
            <MarkdownRenderer content={streamingText} isStreaming={isStreaming} />
          </div>
        )}
      </div>
    </div>
  );
}
