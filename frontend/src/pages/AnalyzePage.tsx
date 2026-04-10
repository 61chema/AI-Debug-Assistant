import { useState, useRef } from "react";
import { FileText, Upload, X, Send } from "lucide-react";
import { useConversationStore } from "../store/conversationStore";
import { useStream } from "../hooks/useStream";
import { useT } from "../hooks/useT";
import { StreamingResponse } from "../components/chat/StreamingResponse";
import { toast } from "../components/ui/Toast";
import { classifyError } from "../utils/errorClassifier";

export function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { level, appLanguage, isStreaming, reset } = useConversationStore();
  const { startFileStream } = useStream();
  const t = useT();

  function handleFileChange(selected: File | null) {
    setFile(selected);
    setError(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileChange(dropped);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || isStreaming) return;

    setError(null);
    reset();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("level", level);
    formData.append("response_language", appLanguage);

    await startFileStream("/api/analyze", formData, {
      onError: (msg) => {
        const { variant, message } = classifyError(msg);
        toast(message, variant);
        setError(message);
      },
    });
  }

  return (
    <div className="space-y-5 animate-fade-in-up">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border border-dashed rounded-xl p-12 text-center cursor-pointer
            transition-all duration-150 bg-zinc-50 dark:bg-zinc-950
            ${dragging
              ? "border-indigo-500/50 bg-indigo-500/[0.04] shadow-[0_0_20px_rgba(99,102,241,0.1)]"
              : "border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50"
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            accept=".py,.js,.ts,.tsx,.jsx,.html,.css,.json,.yaml,.yml,.md,.txt,.pdf,.go,.rs,.java,.sh,.sql"
          />

          {file ? (
            <div className="flex items-center justify-center gap-3">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{file.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleFileChange(null); }}
                className="ml-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 flex items-center justify-center mx-auto">
                <Upload className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
              </div>
              <div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">{t.analyze_drop}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-1.5">{t.analyze_drop_hint}</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="text-xs text-red-400/80 bg-red-500/[0.07] border border-red-500/15 rounded-lg px-3 py-2.5">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={!file || isStreaming} className="btn-primary">
            <Send className="w-3.5 h-3.5" />
            {isStreaming ? t.analyze_submitting : t.analyze_submit}
          </button>
        </div>
      </form>

      <StreamingResponse />
    </div>
  );
}
