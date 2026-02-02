export interface OpenClawSession {
  sessionKey: string;
  channel?: string;
  lastActivity?: string;
  messageCount?: number;
}

export interface OpenClawMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface OpenClawHealthResponse {
  status: 'ok' | 'error';
  version?: string;
  uptime?: number;
}

export interface OpenClawChatResponse {
  response: string;
  sessionKey?: string;
}

export interface OpenClawSessionsResponse {
  sessions: OpenClawSession[];
}

export interface OpenClawHistoryResponse {
  messages: OpenClawMessage[];
  sessionKey: string;
}

export interface OpenClawMemoryResponse {
  value?: string;
  found?: boolean;
  results?: Array<{ key: string; value: string; score?: number }>;
}
