// Chat message types for the AI chatbot

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  feedback?: "up" | "down" | null;
  isStreaming?: boolean;
  streamPhase?: "reasoning" | "streaming";
}

export interface ChatApiRequest {
  messages: Pick<ChatMessage, "role" | "content">[];
  documentContext?: string;
}

export interface ChatApiResponse {
  message: string;
  error?: string;
}

export interface DocumentAttachment {
  filename: string;
  mimeType: string;
  extractedText: string;
  charCount: number;
  pageCount?: number;
  sheetNames?: string[];
}

export interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  documentAttachment: DocumentAttachment | null;
  isParsingDocument: boolean;
}

export interface ChatContextValue extends ChatState {
  sendMessage: (content: string) => Promise<void>;
  openDemoChat: () => void;
  closeChat: () => void;
  clearChat: () => void;
  attachDocument: (file: File) => Promise<void>;
  clearDocument: () => void;
  setFeedback: (messageId: string, feedback: "up" | "down" | null) => void;
}

// Rate limiting types
export interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export interface RateLimitStore {
  [key: string]: RateLimitEntry;
}
