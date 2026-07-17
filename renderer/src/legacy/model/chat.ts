export type ChatRole = 'user' | 'assistant';

export interface ChatCitation {
  repo: 'frontend' | 'backend';
  filePath: string;
  startLine?: number;
  endLine?: number;
}

export interface ChatCreateSessionPayload {
  sessionName?: string;
  requestName?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | string;
  url?: string;
  serverUrl?: string;
  mode?: 'concurrency' | 'rate' | string;
  concurrencyNumber?: number;
  totalRequests?: number;
  testDuration?: number;
  requestsPerSecond?: number;
}

export interface ChatAction {
  type: 'create_session' | string;
  payload: ChatCreateSessionPayload;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  citations?: ChatCitation[];
  actions?: ChatAction[];
  createdAt: number;
}

export interface ChatHistoryItem {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  question: string;
  history: ChatHistoryItem[];
}

export interface ChatResponse {
  answer: string;
  citations?: ChatCitation[];
  actions?: ChatAction[];
}
