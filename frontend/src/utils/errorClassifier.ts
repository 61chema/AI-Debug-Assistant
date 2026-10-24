/**
 * errorClassifier, decides how to present an error to the user.
 *
 * Not all errors are equal:
 * - "Overloaded" → it's Anthropic's fault, warn the user, suggest retrying
 * - "Rate limit"  → external limit, suggest waiting
 * - "Invalid API key" → config issue, guide towards the fix
 * - Everything else → generic app error
 *
 * Returns a variant (controls the toast color) and a user-friendly message.
 */

import type { ToastVariant } from "../components/ui/Toast";

interface ClassifiedError {
  variant: ToastVariant;
  message: string;
}

export function classifyError(raw: string): ClassifiedError {
  const msg = raw.toLowerCase();

  if (msg.includes("overloaded")) {
    return {
      variant: "warning",
      message: "Claude's servers are temporarily overloaded, this is not an app error. Please try again in a few seconds.",
    };
  }

  if (msg.includes("rate limit") || msg.includes("429")) {
    return {
      variant: "warning",
      message: "Rate limit reached. You've sent too many requests too quickly. Wait a moment and try again.",
    };
  }

  if (msg.includes("api key") || msg.includes("401") || msg.includes("unauthorized")) {
    return {
      variant: "error",
      message: "Invalid API key. Check your ANTHROPIC_API_KEY in the .env file and restart the backend.",
    };
  }

  if (msg.includes("file not found") || msg.includes("404")) {
    return {
      variant: "error",
      message: "File not found on GitHub. Make sure the URL is correct and the repository is public.",
    };
  }

  if (msg.includes("too large") || msg.includes("413")) {
    return {
      variant: "error",
      message: "File is too large. Maximum allowed size is 10 MB.",
    };
  }

  if (msg.includes("network") || msg.includes("econnrefused") || msg.includes("failed to fetch")) {
    return {
      variant: "error",
      message: "Cannot connect to the backend. Make sure the server is running on port 8000.",
    };
  }

  // Generic fallback
  return {
    variant: "error",
    message: raw || "Something went wrong. Please try again.",
  };
}
