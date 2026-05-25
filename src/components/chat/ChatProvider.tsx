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
  DocumentAttachment,
} from "@/types/chat";
import { chatDebug, chatError } from "@/lib/chat/debug";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  MAX_FILE_SIZE_LABEL,
  validateUploadFile,
  type UploadValidationError,
} from "@/lib/demo/uploadLimits";

const STORAGE_KEY = "cognireal-chat-data";

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentAttachment, setDocumentAttachment] =
    useState<DocumentAttachment | null>(null);
  const [isParsingDocument, setIsParsingDocument] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StoredChatData;
        if (parsed.messages && Array.isArray(parsed.messages)) {
          const validMessages = parsed.messages.filter(
            (msg) => msg && msg.id && msg.role && msg.content && !msg.isStreaming
          );
          setMessages(validMessages);
        }
      }
    } catch (e) {
      console.warn("Failed to load chat data from localStorage:", e);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      const dataToStore: StoredChatData = { messages };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (e) {
      console.warn("Failed to save chat data to localStorage:", e);
    }
  }, [messages, isHydrated]);

  const openDemoChat = useCallback(() => {
    setIsOpen(true);
    setError(null);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setError(null);
  }, []);

  const clearDocument = useCallback(() => {
    setDocumentAttachment(null);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setDocumentAttachment(null);
    setError(null);
  }, []);

  const getUploadValidationMessage = useCallback(
    (error: UploadValidationError): string => {
      if (error === "fileTooLarge") {
        return t("demo.errors.fileTooLarge", { maxSize: MAX_FILE_SIZE_LABEL });
      }
      return t("demo.errors.unsupportedType");
    },
    [t]
  );

  const mapServerUploadError = useCallback(
    (message: string): string => {
      if (message.toLowerCase().includes("too large")) {
        return t("demo.errors.fileTooLarge", { maxSize: MAX_FILE_SIZE_LABEL });
      }
      if (message.toLowerCase().includes("unsupported file type")) {
        return t("demo.errors.unsupportedType");
      }
      return message;
    },
    [t]
  );

  const attachDocument = useCallback(async (file: File) => {
    const validationError = validateUploadFile(file);
    if (validationError) {
      setError(getUploadValidationMessage(validationError));
      return;
    }

    setIsParsingDocument(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/demo/parse", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as DocumentAttachment & { error?: string };

      if (!response.ok || data.error) {
        setError(
          data.error
            ? mapServerUploadError(data.error)
            : t("demo.errors.uploadFailed")
        );
        return;
      }

      setDocumentAttachment({
        filename: data.filename,
        mimeType: data.mimeType,
        extractedText: data.extractedText,
        charCount: data.charCount,
        pageCount: data.pageCount,
        sheetNames: data.sheetNames,
      });
    } catch (e) {
      console.error("Failed to attach document:", e);
      setError(t("demo.errors.uploadFailed"));
    } finally {
      setIsParsingDocument(false);
    }
  }, [getUploadValidationMessage, mapServerUploadError, t]);

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

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: trimmedContent,
      timestamp: Date.now(),
    };

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
      const apiMessages = [...messages, userMessage]
        .filter((msg) => (msg.role === "user" || msg.role === "assistant") && msg.content)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      const requestBody: ChatApiRequest = {
        messages: apiMessages,
        documentContext: documentAttachment?.extractedText,
      };

      chatDebug("client", "sending message", {
        content: trimmedContent,
        historyCount: apiMessages.length,
        hasDocument: Boolean(documentAttachment?.extractedText),
      });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const contentType = response.headers.get("content-type");
      const requestId = response.headers.get("x-chat-request-id");

      chatDebug("client", "response received", {
        requestId,
        status: response.status,
        contentType,
        ok: response.ok,
      });

      if (contentType?.includes("text/event-stream")) {
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let accumulatedContent = "";
        let buffer = "";
        let receivedDone = false;

        let eventCount = 0;
        const streamStartedAt = Date.now();

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            chatDebug("client", "stream reader done", {
              requestId,
              eventCount,
              accumulatedChars: accumulatedContent.length,
              receivedDone,
              ms: Date.now() - streamStartedAt,
            });
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split(/\n\n/);
          buffer = events.pop() || "";

          for (const event of events) {
            const trimmedEvent = event.trim();
            if (!trimmedEvent) continue;

            if (trimmedEvent.startsWith("data:")) {
              const jsonStr = trimmedEvent.slice(5).trim();
              if (!jsonStr) continue;

              try {
                const data = JSON.parse(jsonStr) as {
                  chunk?: string;
                  replace?: boolean;
                  done?: boolean;
                  error?: string;
                  meta?: { phase?: "reasoning" | "streaming" };
                };
                eventCount++;

                if (eventCount <= 5 || eventCount % 25 === 0) {
                  chatDebug("client", "sse event", {
                    requestId,
                    eventCount,
                    keys: Object.keys(data),
                    chunkPreview: data.chunk?.slice(0, 60),
                    meta: data.meta,
                    done: data.done,
                    error: data.error,
                  });
                }

                if (data.error) {
                  chatError("client", "stream error event", {
                    requestId,
                    error: data.error,
                  });
                  setError(data.error);
                  setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
                  return;
                }

                if (data.meta?.phase === "reasoning") {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, streamPhase: "reasoning" }
                        : msg
                    )
                  );
                }

                if (data.meta?.phase === "streaming") {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, streamPhase: "streaming" }
                        : msg
                    )
                  );
                }

                if (data.replace) {
                  accumulatedContent = data.chunk || "";
                } else if (data.chunk) {
                  accumulatedContent += data.chunk;
                }

                if (data.chunk || data.replace) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? {
                            ...msg,
                            content: accumulatedContent,
                            streamPhase: "streaming",
                          }
                        : msg
                    )
                  );
                }

                if (data.done) {
                  receivedDone = true;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, isStreaming: false, streamPhase: undefined }
                        : msg
                    )
                  );
                }
              } catch (parseError) {
                chatError("client", "failed to parse SSE JSON", {
                  requestId,
                  jsonStr: jsonStr.slice(0, 200),
                  parseError,
                });
              }
            }
          }
        }

        if (!receivedDone) {
          chatDebug("client", "stream ended without done flag", {
            requestId,
            accumulatedChars: accumulatedContent.length,
          });
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, isStreaming: false }
                : msg
            )
          );
        }

        if (!accumulatedContent) {
          chatError("client", "no content accumulated", { requestId });
          setError("Failed to get a response. Please try again.");
          setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
        }
      } else {
        const data: ChatApiResponse = await response.json();

        if (!response.ok || data.error) {
          chatError("client", "non-stream error response", {
            status: response.status,
            error: data.error,
          });
          setError(data.error || "Failed to get a response. Please try again.");
          setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
          return;
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: data.message, isStreaming: false }
              : msg
          )
        );
      }
    } catch (e) {
      chatError("client", "sendMessage failed", e);
      setError("Unable to connect. Please check your connection and try again.");
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
    } finally {
      setIsLoading(false);
    }
  }, [messages, documentAttachment?.extractedText]);

  const value: ChatContextValue = {
    messages,
    isOpen,
    isLoading,
    error,
    documentAttachment,
    isParsingDocument,
    sendMessage,
    openDemoChat,
    closeChat,
    clearChat,
    attachDocument,
    clearDocument,
    setFeedback,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatProvider;
