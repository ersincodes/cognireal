"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  ChatMessage,
  ChatApiRequest,
  DocumentAttachment,
} from "@/types/chat";
import { chatDebug, chatError } from "@/lib/chat/debug";
import {
  MAX_FILE_SIZE_LABEL,
  validateUploadFile,
  type UploadValidationError,
} from "@/lib/demo/uploadLimits";
import {
  DEMO_STORAGE_KEY,
  createEmptyStore,
  createNewChat,
  parseStoredDemoStore,
  getActiveChat,
  type DemoStore,
  type DemoChat,
} from "@/lib/demo/store";
import { useLanguage } from "@/i18n/LanguageContext";

const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

type DemoAction =
  | { type: "HYDRATE"; payload: DemoStore }
  | { type: "SET_ACTIVE"; id: string }
  | { type: "CREATE_CHAT"; chat: DemoChat }
  | { type: "DELETE_CHAT"; id: string }
  | { type: "RENAME_CHAT"; id: string; title: string }
  | { type: "UPDATE_CHAT"; id: string; patch: Partial<DemoChat> }
  | { type: "SET_MODAL"; open: boolean };

const demoReducer = (state: DemoStore, action: DemoAction): DemoStore => {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;
    case "SET_ACTIVE":
      return { ...state, activeId: action.id };
    case "CREATE_CHAT":
      return {
        ...state,
        chats: [action.chat, ...state.chats],
        activeId: action.chat.id,
      };
    case "DELETE_CHAT": {
      const chats = state.chats.filter((c) => c.id !== action.id);
      const activeId =
        state.activeId === action.id
          ? chats[0]?.id ?? null
          : state.activeId;
      return { ...state, chats, activeId };
    }
    case "RENAME_CHAT":
      return {
        ...state,
        chats: state.chats.map((c) =>
          c.id === action.id ? { ...c, title: action.title } : c
        ),
      };
    case "UPDATE_CHAT":
      return {
        ...state,
        chats: state.chats.map((c) =>
          c.id === action.id ? { ...c, ...action.patch } : c
        ),
      };
    case "SET_MODAL":
      return state;
    default:
      return state;
  }
};

export interface DemoContextValue {
  store: DemoStore;
  activeChat: DemoChat | null;
  isHydrated: boolean;
  isLoading: boolean;
  isParsingDocument: boolean;
  isLoadingSuggestions: boolean;
  error: string | null;
  isModalOpen: boolean;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  createChat: () => void;
  selectChat: (id: string) => void;
  deleteChat: (id: string) => void;
  renameChat: (id: string, title: string) => void;
  attachDocument: (file: File) => Promise<void>;
  clearDocument: () => void;
  sendMessage: (content: string) => Promise<void>;
  dismissBookACall: () => void;
  closeModal: () => void;
  setFeedback: (messageId: string, feedback: "up" | "down" | null) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export const useDemoContext = (): DemoContextValue => {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error("useDemoContext must be used within DemoProvider");
  }
  return ctx;
};

interface DemoProviderProps {
  children: ReactNode;
}

export const DemoProvider = ({ children }: DemoProviderProps) => {
  const { t } = useLanguage();
  const [store, dispatch] = useReducer(demoReducer, createEmptyStore());
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isParsingDocument, setIsParsingDocument] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeChat = getActiveChat(store);

  const persistStore = useCallback((next: DemoStore) => {
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn("Failed to persist demo store:", e);
      }
    }, 250);
  }, []);

  const updateChat = useCallback(
    (id: string, patch: Partial<DemoChat>) => {
      dispatch({ type: "UPDATE_CHAT", id, patch });
    },
    []
  );

  useEffect(() => {
    const stored = localStorage.getItem(DEMO_STORAGE_KEY);
    const parsed = stored ? parseStoredDemoStore(stored) : null;

    if (parsed && parsed.chats.length > 0) {
      const activeExists = parsed.activeId
        ? parsed.chats.some((c) => c.id === parsed.activeId)
        : false;
      dispatch({
        type: "HYDRATE",
        payload: {
          ...parsed,
          activeId: activeExists ? parsed.activeId : parsed.chats[0].id,
        },
      });
    } else {
      const chat = createNewChat();
      dispatch({ type: "CREATE_CHAT", chat });
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    persistStore(store);
  }, [store, isHydrated, persistStore]);

  const createChat = useCallback(() => {
    const chat = createNewChat();
    dispatch({ type: "CREATE_CHAT", chat });
    setError(null);
    setIsModalOpen(false);
    setSidebarOpen(false);
  }, []);

  const selectChat = useCallback((id: string) => {
    dispatch({ type: "SET_ACTIVE", id });
    setError(null);
    setIsModalOpen(false);
    setSidebarOpen(false);
  }, []);

  const deleteChat = useCallback(
    (id: string) => {
      dispatch({ type: "DELETE_CHAT", id });
      if (store.chats.length <= 1) {
        const chat = createNewChat();
        dispatch({ type: "CREATE_CHAT", chat });
      }
    },
    [store.chats.length]
  );

  const renameChat = useCallback((id: string, title: string) => {
    dispatch({ type: "RENAME_CHAT", id, title });
  }, []);

  const getUploadValidationMessage = useCallback(
    (err: UploadValidationError): string => {
      if (err === "fileTooLarge") {
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

  const fetchSuggestions = useCallback(
    async (doc: DocumentAttachment) => {
      setIsLoadingSuggestions(true);
      try {
        const response = await fetch("/api/demo/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentContext: doc.extractedText,
            filename: doc.filename,
            sheetNames: doc.sheetNames,
            pageCount: doc.pageCount,
          }),
        });
        const data = (await response.json()) as { questions?: string[] };
        return data.questions?.slice(0, 4) ?? [];
      } catch {
        return [
          t("demo.samplePrompts.summarize"),
          t("demo.samplePrompts.keyNumbers"),
          t("demo.samplePrompts.actionItems"),
          t("demoPage.suggestions.fallback"),
        ];
      } finally {
        setIsLoadingSuggestions(false);
      }
    },
    [t]
  );

  const attachDocument = useCallback(
    async (file: File) => {
      if (!activeChat) return;

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

        const data = (await response.json()) as DocumentAttachment & {
          error?: string;
        };

        if (!response.ok || data.error) {
          setError(
            data.error
              ? mapServerUploadError(data.error)
              : t("demo.errors.uploadFailed")
          );
          return;
        }

        const document: DocumentAttachment = {
          filename: data.filename,
          mimeType: data.mimeType,
          extractedText: data.extractedText,
          charCount: data.charCount,
          pageCount: data.pageCount,
          sheetNames: data.sheetNames,
        };

        const suggestions = await fetchSuggestions(document);

        updateChat(activeChat.id, {
          document,
          suggestions,
          title: file.name,
        });
      } catch (e) {
        console.error("Failed to attach document:", e);
        setError(t("demo.errors.uploadFailed"));
      } finally {
        setIsParsingDocument(false);
      }
    },
    [
      activeChat,
      fetchSuggestions,
      getUploadValidationMessage,
      mapServerUploadError,
      t,
      updateChat,
    ]
  );

  const clearDocument = useCallback(() => {
    if (!activeChat) return;
    updateChat(activeChat.id, {
      document: undefined,
      suggestions: undefined,
    });
  }, [activeChat, updateChat]);

  const dismissBookACall = useCallback(() => {
    if (!activeChat) return;
    updateChat(activeChat.id, { bookACallDismissed: true });
    setIsModalOpen(false);
  }, [activeChat, updateChat]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const setFeedback = useCallback(
    (messageId: string, feedback: "up" | "down" | null) => {
      if (!activeChat) return;
      updateChat(activeChat.id, {
        messages: activeChat.messages.map((msg) =>
          msg.id === messageId ? { ...msg, feedback } : msg
        ),
      });
    },
    [activeChat, updateChat]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeChat) return;

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

      const priorMessages = activeChat.messages;
      const newUserInputCount = activeChat.userInputCount + 1;

      let title = activeChat.title;
      if (priorMessages.length === 0 && title === "New chat") {
        title = trimmedContent.slice(0, 48) + (trimmedContent.length > 48 ? "…" : "");
      }

      updateChat(activeChat.id, {
        title,
        messages: [...priorMessages, userMessage, assistantMessage],
        userInputCount: newUserInputCount,
      });

      if (
        newUserInputCount > 0 &&
        newUserInputCount % 5 === 0 &&
        !activeChat.bookACallDismissed
      ) {
        setIsModalOpen(true);
      }

      setIsLoading(true);
      setError(null);

      try {
        const apiMessages = [...priorMessages, userMessage]
          .filter(
            (msg) =>
              (msg.role === "user" || msg.role === "assistant") && msg.content
          )
          .map((msg) => ({ role: msg.role, content: msg.content }));

        const requestBody: ChatApiRequest = {
          messages: apiMessages,
          documentContext: activeChat.document?.extractedText,
          mode: "demo",
        };

        chatDebug("demo", "sending message", {
          content: trimmedContent,
          hasDocument: Boolean(activeChat.document?.extractedText),
        });

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        const contentType = response.headers.get("content-type");
        const requestId = response.headers.get("x-chat-request-id");

        if (!contentType?.includes("text/event-stream")) {
          const data = await response.json();
          if (!response.ok || data.error) {
            setError(data.error || "Failed to get a response.");
            updateChat(activeChat.id, {
              messages: [...priorMessages, userMessage],
            });
            return;
          }
          updateChat(activeChat.id, {
            messages: [
              ...priorMessages,
              userMessage,
              { ...assistantMessage, content: data.message, isStreaming: false },
            ],
          });
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let accumulatedContent = "";
        let buffer = "";
        let receivedDone = false;

        const applyMessages = (msgs: ChatMessage[]) => {
          updateChat(activeChat.id, { messages: msgs });
        };

        let currentMessages = [
          ...priorMessages,
          userMessage,
          assistantMessage,
        ];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split(/\n\n/);
          buffer = events.pop() || "";

          for (const event of events) {
            const trimmedEvent = event.trim();
            if (!trimmedEvent.startsWith("data:")) continue;

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

              if (data.error) {
                setError(data.error);
                applyMessages([...priorMessages, userMessage]);
                return;
              }

              if (data.meta?.phase === "reasoning") {
                currentMessages = currentMessages.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, streamPhase: "reasoning" as const }
                    : msg
                );
                applyMessages(currentMessages);
              }

              if (data.meta?.phase === "streaming") {
                currentMessages = currentMessages.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, streamPhase: "streaming" as const }
                    : msg
                );
                applyMessages(currentMessages);
              }

              if (data.replace) {
                accumulatedContent = data.chunk || "";
              } else if (data.chunk) {
                accumulatedContent += data.chunk;
              }

              if (data.chunk || data.replace) {
                currentMessages = currentMessages.map((msg) =>
                  msg.id === assistantMessageId
                    ? {
                        ...msg,
                        content: accumulatedContent,
                        streamPhase: "streaming" as const,
                      }
                    : msg
                );
                applyMessages(currentMessages);
              }

              if (data.done) {
                receivedDone = true;
                currentMessages = currentMessages.map((msg) =>
                  msg.id === assistantMessageId
                    ? {
                        ...msg,
                        isStreaming: false,
                        streamPhase: undefined,
                      }
                    : msg
                );
                applyMessages(currentMessages);
              }
            } catch (parseError) {
              chatError("demo", "SSE parse error", { requestId, parseError });
            }
          }
        }

        if (!receivedDone && accumulatedContent) {
          currentMessages = currentMessages.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, isStreaming: false }
              : msg
          );
          applyMessages(currentMessages);
        }

        if (!accumulatedContent) {
          setError("Failed to get a response. Please try again.");
          applyMessages([...priorMessages, userMessage]);
        }
      } catch (e) {
        chatError("demo", "sendMessage failed", e);
        setError("Unable to connect. Please check your connection and try again.");
        updateChat(activeChat.id, {
          messages: [...priorMessages, userMessage],
        });
      } finally {
        setIsLoading(false);
      }
    },
    [activeChat, updateChat]
  );

  const value: DemoContextValue = {
    store,
    activeChat,
    isHydrated,
    isLoading,
    isParsingDocument,
    isLoadingSuggestions,
    error,
    isModalOpen,
    isSidebarOpen,
    setSidebarOpen,
    createChat,
    selectChat,
    deleteChat,
    renameChat,
    attachDocument,
    clearDocument,
    sendMessage,
    dismissBookACall,
    closeModal,
    setFeedback,
  };

  return (
    <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
  );
};

export default DemoProvider;
