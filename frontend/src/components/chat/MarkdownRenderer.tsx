import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";
import { useConversationStore } from "../../store/conversationStore";

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-zinc-500 hover:text-zinc-200 transition-colors p-0.5 rounded"
      title="Copy code"
    >
      {copied
        ? <Check className="w-3 h-3 text-green-400" />
        : <Copy className="w-3 h-3" />
      }
    </button>
  );
}

interface Props {
  content: string;
  isStreaming?: boolean;
}

export function MarkdownRenderer({ content, isStreaming = false }: Props) {
  const { theme } = useConversationStore();
  const isDark = theme === "dark";

  const clean = content
    .replace(/<annotations>[\s\S]*?<\/annotations>/g, "")
    .trim();

  return (
    <div
      className="
        prose prose-sm max-w-none
        dark:prose-invert

        prose-h1:text-sm prose-h1:font-semibold
        prose-h1:text-zinc-900 dark:prose-h1:text-zinc-100
        prose-h1:mt-5 prose-h1:mb-2 prose-h1:tracking-tight

        prose-h2:text-[10px] prose-h2:font-semibold
        prose-h2:text-zinc-500 dark:prose-h2:text-zinc-500
        prose-h2:mt-6 prose-h2:mb-2.5 prose-h2:uppercase prose-h2:tracking-[0.1em]
        prose-h2:not-italic prose-h2:border-0 prose-h2:bg-transparent
        prose-h2:px-0 prose-h2:py-0 prose-h2:rounded-none

        prose-h3:text-sm prose-h3:font-medium
        prose-h3:text-zinc-700 dark:prose-h3:text-zinc-300
        prose-h3:mt-4 prose-h3:mb-1.5

        prose-p:text-zinc-600 dark:prose-p:text-zinc-400
        prose-p:text-sm prose-p:leading-7 prose-p:my-2

        prose-ul:my-2 prose-ul:space-y-1
        prose-ol:my-2 prose-ol:space-y-1
        prose-li:text-zinc-600 dark:prose-li:text-zinc-400
        prose-li:text-sm prose-li:leading-6 prose-li:my-0

        prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100
        prose-strong:font-semibold
        prose-em:text-zinc-500

        prose-code:text-indigo-600 dark:prose-code:text-indigo-300
        prose-code:bg-indigo-50 dark:prose-code:bg-indigo-950/40
        prose-code:border prose-code:border-indigo-200 dark:prose-code:border-indigo-500/20
        prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
        prose-code:text-xs prose-code:font-mono
        prose-code:before:content-none prose-code:after:content-none

        prose-pre:bg-transparent prose-pre:p-0 prose-pre:my-3

        prose-blockquote:border-zinc-300 dark:prose-blockquote:border-zinc-700
        prose-blockquote:text-zinc-500 prose-blockquote:not-italic
        prose-hr:border-zinc-200 dark:prose-hr:border-zinc-800
      "
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const isBlock = !("data-inline" in props) && Boolean(match);

            if (isBlock && match) {
              return (
                <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 my-3">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-100 border-b border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                      {match[1]}
                    </span>
                    <CopyCodeButton code={String(children).replace(/\n$/, "")} />
                  </div>
                  <SyntaxHighlighter
                    style={isDark ? vscDarkPlus : vs}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      borderRadius: 0,
                      fontSize: "12px",
                      background: isDark ? "#0a0a0d" : "#f8f8f8",
                    }}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              );
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {clean}
      </ReactMarkdown>

      {isStreaming && (
        <span className="inline-block w-1 h-3.5 bg-indigo-400 ml-0.5 animate-blink align-middle rounded-sm" />
      )}
    </div>
  );
}
