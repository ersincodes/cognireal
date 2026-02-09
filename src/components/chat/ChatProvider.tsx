"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type {
  ChatMessage,
  ChatContextValue,
  ChatApiRequest,
  ChatApiResponse,
  WizardState,
  WizardAnswer,
} from "@/types/chat";
import { WIZARD_QUESTIONS } from "@/lib/wizard";

const STORAGE_KEY = "cognireal-chat-data";

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const initialWizardState: WizardState = {
  isComplete: false,
  currentStep: 0,
  answers: [],
};

const ChatContext = createContext<ChatContextValue | null>(null);

export const useChatContext = (): ChatContextValue => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

interface StoredChatData {
  messages: ChatMessage[];
  wizardState: WizardState;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [wizardState, setWizardState] = useState<WizardState>(initialWizardState);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StoredChatData;
        if (parsed.messages && Array.isArray(parsed.messages)) {
          // Filter out incomplete streaming messages and ensure all messages have content
          const validMessages = parsed.messages.filter(
            (msg) => msg && msg.id && msg.role && msg.content && !msg.isStreaming
          );
          setMessages(validMessages);
        }
        if (parsed.wizardState && typeof parsed.wizardState === "object") {
          setWizardState(parsed.wizardState);
        }
      }
    } catch (e) {
      console.warn("Failed to load chat data from localStorage:", e);
    }
    setIsHydrated(true);
  }, []);

  // Save data to localStorage when they change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const dataToStore: StoredChatData = {
        messages,
        wizardState,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (e) {
      console.warn("Failed to save chat data to localStorage:", e);
    }
  }, [messages, wizardState, isHydrated]);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
    setError(null);
  }, []);

  const openChat = useCallback(() => {
    setIsOpen(true);
    setError(null);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setError(null);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setWizardState(initialWizardState);
    setError(null);
  }, []);

  const answerWizardQuestion = useCallback(
    (answerId: string, customValue?: string) => {
      const currentQuestion = WIZARD_QUESTIONS[wizardState.currentStep];
      if (!currentQuestion) return;

      const answer: WizardAnswer = {
        questionId: currentQuestion.id,
        answerId,
        customValue,
      };

      const newAnswers = [...wizardState.answers, answer];
      const nextStep = wizardState.currentStep + 1;
      const isComplete = nextStep >= WIZARD_QUESTIONS.length;

      setWizardState({
        isComplete,
        currentStep: nextStep,
        answers: newAnswers,
      });
    },
    [wizardState.currentStep, wizardState.answers]
  );

  const resetWizard = useCallback(() => {
    setWizardState(initialWizardState);
    setMessages([]);
    setError(null);
  }, []);

  const setFeedback = useCallback(
    (messageId: string, feedback: "up" | "down" | null) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, feedback } : msg
        )
      );
    },
    []
  );

  const sendMessage = useCallback(async (content: string) => {
    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    // Create user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: trimmedContent,
      timestamp: Date.now(),
    };

    // Create placeholder assistant message for streaming
    const assistantMessageId = generateId();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Prepare messages for API (only user and assistant messages with content)
      const apiMessages = [...messages, userMessage]
        .filter((msg) => (msg.role === "user" || msg.role === "assistant") && msg.content)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      const requestBody: ChatApiRequest = {
        messages: apiMessages,
        wizardContext: wizardState.answers,
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Check if it's a streaming response
      const contentType = response.headers.get("content-type");
      
      if (contentType?.includes("text/event-stream")) {
        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let accumulatedContent = "";
        let buffer = "";
        let receivedDone = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          
          // Split by double newline to get complete SSE events
          const events = buffer.split(/\n\n/);
          buffer = events.pop() || ""; // Keep incomplete event in buffer

          for (const event of events) {
            const trimmedEvent = event.trim();
            if (!trimmedEvent) continue;

            // Handle "data: {json}" format
            if (trimmedEvent.startsWith("data:")) {
              const jsonStr = trimmedEvent.slice(5).trim();
              if (!jsonStr) continue;

              try {
                const data = JSON.parse(jsonStr);
                
                if (data.error) {
                  setError(data.error);
                  // Remove the empty assistant message on error
                  setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
                  return;
                }

                if (data.replace) {
                  // Replace entire content (for out-of-scope responses)
                  accumulatedContent = data.chunk;
                } else if (data.chunk) {
                  accumulatedContent += data.chunk;
                }

                if (data.chunk || data.replace) {
                  // Update the assistant message with accumulated content
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    )
                  );
                }

                if (data.done) {
                  receivedDone = true;
                  // Mark streaming as complete
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, isStreaming: false }
                        : msg
                    )
                  );
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }

        // If stream ended without explicit done signal, mark as complete
        if (!receivedDone) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, isStreaming: false }
                : msg
            )
          );
        }

        // If no content was received, show an error
        if (!accumulatedContent) {
          setError("Failed to get a response. Please try again.");
          setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
        }
      } else {
        // Handle non-streaming response (error responses)
        const data: ChatApiResponse = await response.json();

        if (!response.ok || data.error) {
          setError(data.error || "Failed to get a response. Please try again.");
          // Remove the empty assistant message on error
          setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
          return;
        }

        // Update assistant message with full content
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: data.message, isStreaming: false }
              : msg
          )
        );
      }
    } catch (e) {
      console.error("Failed to send message:", e);
      setError("Unable to connect. Please check your connection and try again.");
      // Remove the empty assistant message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
    } finally {
      setIsLoading(false);
    }
  }, [messages, wizardState.answers]);

  const value: ChatContextValue = {
    messages,
    isOpen,
    isLoading,
    error,
    wizardState,
    sendMessage,
    toggleChat,
    openChat,
    closeChat,
    clearChat,
    setFeedback,
    answerWizardQuestion,
    resetWizard,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatProvider;
