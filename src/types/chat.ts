// Chat message types for the AI chatbot

import type { WizardAnswer, WizardState } from "./wizard";

// Re-export wizard types for convenience
export type { WizardOption, WizardQuestion, WizardAnswer, WizardState } from "./wizard";

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  feedback?: "up" | "down" | null;
  isStreaming?: boolean;
}

export interface ChatApiRequest {
  messages: Pick<ChatMessage, "role" | "content">[];
  wizardContext?: WizardAnswer[];
}

export interface ChatApiResponse {
  message: string;
  error?: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  wizardState: WizardState;
}

export interface ChatContextValue extends ChatState {
  sendMessage: (content: string) => Promise<void>;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  clearChat: () => void;
  setFeedback: (messageId: string, feedback: "up" | "down" | null) => void;
  answerWizardQuestion: (answerId: string, customValue?: string) => void;
  resetWizard: () => void;
}

// Rate limiting types
export interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export interface RateLimitStore {
  [key: string]: RateLimitEntry;
}
