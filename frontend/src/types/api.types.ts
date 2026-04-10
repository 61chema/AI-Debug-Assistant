// Types that mirror the backend Pydantic schemas

export type Level = "junior" | "mid" | "senior";
export type Feature = "explain" | "debug" | "analyze" | "github";

export interface ExplainRequest {
  code: string;
  language: string;
  level: Level;
  conversation_id?: string;
}

export interface DebugRequest {
  error_message: string;
  code: string;
  language: string;
  level: Level;
  conversation_id?: string;
}

export interface GithubRequest {
  url: string;
  analysis_type: "file" | "repo_overview";
  level: Level;
  conversation_id?: string;
}

export interface FollowUpRequest {
  conversation_id: string;
  message: string;
  level: Level;
}

// Line annotation returned by Claude for the explain feature
export interface Annotation {
  line: number;
  note: string;
}

export interface ConversationSummary {
  id: string;
  feature: Feature;
  title: string;
  level: Level;
  created_at: string;
  updated_at: string;
}

export interface MessageOut {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ConversationDetail extends ConversationSummary {
  messages: MessageOut[];
}

export interface HistoryResponse {
  items: ConversationSummary[];
  total: number;
  page: number;
  limit: number;
}
