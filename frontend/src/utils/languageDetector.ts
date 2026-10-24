/**
 * languageDetector, detects the programming language of a code snippet
 * using simple heuristics (pattern matching).
 *
 * Not 100% accurate, but good enough to catch obvious mismatches
 * like submitting React/JSX when "Python" is selected.
 */

interface DetectionResult {
  language: string;
  confidence: "high" | "medium" | "low";
}

const SIGNATURES: Array<{ language: string; patterns: RegExp[]; weight: number }> = [
  {
    language: "typescript",
    patterns: [
      /:\s*(string|number|boolean|void|any|never|unknown)\b/,
      /interface\s+\w+\s*\{/,
      /type\s+\w+\s*=/,
      /<[A-Z]\w*>/,         // generics like Array<string>
      /React\.FC|React\.ReactNode/,
    ],
    weight: 3,
  },
  {
    language: "javascript",
    patterns: [
      /import\s+.*\s+from\s+['"]/,
      /export\s+(default|const|function|class)/,
      /const\s+\w+\s*=\s*\(/,   // arrow functions
      /=>/,
      /useState|useEffect|useRef/,
      /jsx|tsx|\.jsx/,
      /className=/,             // JSX attribute
    ],
    weight: 2,
  },
  {
    language: "python",
    patterns: [
      /def\s+\w+\s*\(/,
      /import\s+\w+(\s+as\s+\w+)?$/m,
      /from\s+\w+\s+import/,
      /:\s*$(?!.*{)/m,         // line ending with : (not JS object)
      /print\s*\(/,
      /elif\s+/,
      /lambda\s+\w+:/,
      /f['"]\{/,               // f-strings
      /\bself\b/,
    ],
    weight: 2,
  },
  {
    language: "go",
    patterns: [
      /^package\s+\w+/m,
      /^import\s+\(/m,
      /func\s+\w+\s*\(/,
      /:=\s*/,
      /fmt\.\w+/,
    ],
    weight: 3,
  },
  {
    language: "rust",
    patterns: [
      /fn\s+\w+\s*\(/,
      /let\s+(mut\s+)?\w+/,
      /println!/,
      /\bimpl\b/,
      /->\s*\w+\s*\{/,
      /\buse\s+std::/,
    ],
    weight: 3,
  },
  {
    language: "java",
    patterns: [
      /public\s+(class|static|void|interface)/,
      /System\.out\.print/,
      /new\s+\w+\s*\(/,
      /@Override/,
      /\bvoid\b.*\{/,
    ],
    weight: 2,
  },
  {
    language: "sql",
    patterns: [
      /\bSELECT\b.*\bFROM\b/i,
      /\bINSERT\s+INTO\b/i,
      /\bCREATE\s+TABLE\b/i,
      /\bWHERE\b.*=/i,
    ],
    weight: 3,
  },
  {
    language: "bash",
    patterns: [
      /^#!/,
      /\$\{?\w+\}?/,
      /\becho\b/,
      /\bfi\b/,
      /\|\s*grep\b/,
    ],
    weight: 2,
  },
];

export function detectLanguage(code: string): DetectionResult {
  if (!code.trim()) return { language: "unknown", confidence: "low" };

  const scores: Record<string, number> = {};

  for (const { language, patterns, weight } of SIGNATURES) {
    let matches = 0;
    for (const pattern of patterns) {
      if (pattern.test(code)) matches++;
    }
    if (matches > 0) {
      scores[language] = (matches / patterns.length) * weight;
    }
  }

  if (Object.keys(scores).length === 0) {
    return { language: "other", confidence: "low" };
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  const confidence = best[1] > 1.5 ? "high" : best[1] > 0.8 ? "medium" : "low";

  return { language: best[0], confidence };
}

/**
 * Returns true if the detected language clearly doesn't match the selected one.
 * We're lenient: javascript/typescript are treated as compatible,
 * and "other" never triggers a mismatch.
 */
export function isMismatch(selected: string, detected: string): boolean {
  if (detected === "unknown" || detected === "other") return false;
  if (selected === "other") return false;

  // Treat js/ts as the same family
  const jsFamily = new Set(["javascript", "typescript"]);
  if (jsFamily.has(selected) && jsFamily.has(detected)) return false;

  return selected !== detected;
}
