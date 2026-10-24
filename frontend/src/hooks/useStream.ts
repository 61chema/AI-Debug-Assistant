/**
 * useStream hook, handles SSE (Server-Sent Events) streaming from the backend.
 *
 * SSE is like a one-way radio: the server keeps broadcasting text
 * and the browser listens. We use it to get Claude's response token by token.
 *
 * The hook reads the stream, fires callbacks for each event type,
 * and manages the loading/error state.
 */
import { useCallback } from "react";
import { useConversationStore } from "../store/conversationStore";
import type { Annotation } from "../types/api.types";

interface StreamCallbacks {
  onText?: (text: string) => void;
  onAnnotations?: (annotations: Annotation[]) => void;
  onDone?: () => void;
  onError?: (error: string) => void;
  onStreamError?: (error: string) => void; // error sent inside the SSE stream by the backend
}

export function useStream() {
  const { setIsStreaming, appendStreamingText, setAnnotations } =
    useConversationStore();

  const startStream = useCallback(
    async (url: string, body: object, callbacks: StreamCallbacks = {}) => {
      setIsStreaming(true);

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.detail || `HTTP error ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response body received.");
        }

        // ReadableStream: reads the SSE response byte by byte
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Decode the raw bytes into a string and add to our buffer
          buffer += decoder.decode(value, { stream: true });

          // SSE messages are separated by double newlines (\n\n)
          // We split by \n\n to get individual events
          const parts = buffer.split("\n\n");

          // The last part might be incomplete, so keep it in the buffer
          buffer = parts.pop() || "";

          for (const part of parts) {
            if (!part.trim()) continue;

            // Parse the SSE event
            const lines = part.split("\n");
            let eventType = "text";
            let data = "";

            for (const line of lines) {
              if (line.startsWith("event: ")) {
                eventType = line.slice(7).trim();
              } else if (line.startsWith("data: ")) {
                // Unescape \n that the backend escaped to preserve SSE framing
                data = line.slice(6).replace(/\\n/g, "\n");
              }
            }

            // Handle each event type
            if (eventType === "text" && data) {
              appendStreamingText(data);
              callbacks.onText?.(data);
            } else if (eventType === "annotations" && data) {
              try {
                const annotations: Annotation[] = JSON.parse(data);
                setAnnotations(annotations);
                callbacks.onAnnotations?.(annotations);
              } catch {
                // Ignore malformed annotation JSON
              }
            } else if (eventType === "error" && data) {
              callbacks.onStreamError?.(data);
              callbacks.onError?.(data);
            } else if (eventType === "done") {
              callbacks.onDone?.();
            }
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        callbacks.onError?.(message);
      } finally {
        setIsStreaming(false);
      }
    },
    [setIsStreaming, appendStreamingText, setAnnotations]
  );

  /**
   * For file uploads we need multipart/form-data, not JSON.
   * This variant accepts a FormData object instead of a plain object.
   */
  const startFileStream = useCallback(
    async (url: string, formData: FormData, callbacks: StreamCallbacks = {}) => {
      setIsStreaming(true);

      try {
        const response = await fetch(url, {
          method: "POST",
          body: formData,
          // Note: DO NOT set Content-Type header for FormData!
          // The browser sets it automatically with the correct boundary.
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.detail || `HTTP error ${response.status}`);
        }

        if (!response.body) throw new Error("No response body.");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            if (!part.trim()) continue;
            const lines = part.split("\n");
            let eventType = "text";
            let data = "";

            for (const line of lines) {
              if (line.startsWith("event: ")) eventType = line.slice(7).trim();
              else if (line.startsWith("data: ")) data = line.slice(6).replace(/\\n/g, "\n");
            }

            if (eventType === "text" && data) {
              appendStreamingText(data);
              callbacks.onText?.(data);
            } else if (eventType === "error" && data) {
              callbacks.onError?.(data);
            } else if (eventType === "done") {
              callbacks.onDone?.();
            }
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        callbacks.onError?.(message);
      } finally {
        setIsStreaming(false);
      }
    },
    [setIsStreaming, appendStreamingText]
  );

  return { startStream, startFileStream };
}
