export type ChatRole = 'user' | 'assistant';

export interface ChatCitation {
  repo: 'frontend' | 'backend';
  filePath: string;
  startLine?: number;
  endLine?: number;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  citations?: ChatCitation[];
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
}
