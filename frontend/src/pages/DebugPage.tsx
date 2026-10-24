import { useState } from "react";
import { Bug, AlertTriangle, FileCode } from "lucide-react";
import { useConversationStore } from "../store/conversationStore";
import { useStream } from "../hooks/useStream";
import { useT } from "../hooks/useT";
import { LanguageSelector } from "../components/ui/LanguageSelector";
import { StreamingResponse } from "../components/chat/StreamingResponse";
import { toast } from "../components/ui/Toast";
import { classifyError } from "../utils/errorClassifier";

const DEBUG_EXAMPLES = [
  {
    label: "KeyError Python",
    language: "python",
    errorMessage: `KeyError: 'user_id'
  File "app.py", line 23, in get_user
    return data['user_id']`,
    code: `def get_user(data):
    return data['user_id']

response = requests.get('/api/users')
user = get_user(response.json())`,
  },
  {
    label: "TypeError JS",
    language: "javascript",
    errorMessage: `TypeError: Cannot read properties of undefined (reading 'map')
    at App (App.jsx:12:18)`,
    code: `function App() {
  const [data, setData] = useState();

  useEffect(() => {
    fetch('/api/items')
      .then(r => r.json())
      .then(setData);
  }, []);

  return <ul>{data.map(item => <li>{item.name}</li>)}</ul>;
}`,
  },
  {
    label: "Input type Python",
    language: "python",
    errorMessage: `TypeError: unsupported operand type(s) for +: 'int' and 'str'
  File "calc.py", line 8, in add_numbers
    result = num1 + num2`,
    code: `def add_numbers(num1, num2):
    result = num1 + num2
    return result

x = input("Enter first number: ")
y = input("Enter second number: ")
print(add_numbers(x, y))`,
  },
];

export function DebugPage() {
  const [errorMessage, setErrorMessage] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("auto");
  const [error, setError] = useState<string | null>(null);

  const { level, appLanguage, isStreaming, reset } = useConversationStore();
  const { startStream } = useStream();
  const t = useT();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!errorMessage.trim() || !code.trim() || isStreaming) return;

    setError(null);
    reset();

    await startStream(
      "/api/debug",
      { error_message: errorMessage, code, language, level, response_language: appLanguage },
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
        {/* Example chips, only shown when both fields are empty */}
        {!errorMessage && !code && !isStreaming && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.08em]">
              {t.examples_try}
            </span>
            {DEBUG_EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => {
                  setErrorMessage(ex.errorMessage);
                  setCode(ex.code);
                  setLanguage(ex.language);
                }}
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

        {/* Split editor panels, side by side on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Panel 1: Error / Stack trace */}
          <div className="editor-panel">
            <div className="editor-panel-header">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs font-medium text-zinc-400">{t.debug_error_label}</span>
              </div>
            </div>
            <textarea
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              placeholder={t.debug_error_placeholder}
              rows={10}
              className="editor-textarea text-red-300/70 min-h-[200px]"
            />
          </div>

          {/* Panel 2: Code */}
          <div className="editor-panel">
            <div className="editor-panel-header">
              <div className="flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-medium text-zinc-400">{t.debug_code_label}</span>
              </div>
              <LanguageSelector value={language} onChange={setLanguage} />
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t.debug_code_placeholder}
              rows={10}
              className="editor-textarea min-h-[200px]"
            />
          </div>
        </div>

        {error && (
          <div className="text-xs text-red-400/80 bg-red-500/[0.07] border border-red-500/15 rounded-lg px-3 py-2.5">
            {error}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={!errorMessage.trim() || !code.trim() || isStreaming}
            className="btn-primary"
          >
            <Bug className="w-3.5 h-3.5" />
            {isStreaming ? t.debug_submitting : t.debug_submit}
          </button>
        </div>
      </form>

      <StreamingResponse />
    </div>
  );
}
