import type { ChatMessage, DocumentAttachment } from "@/types/chat";

export const DEMO_STORAGE_KEY = "cognireal-demo-store";
export const DEMO_SCHEMA_VERSION = 1;

export interface DemoChat {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
  document?: DocumentAttachment;
  suggestions?: string[];
  userInputCount: number;
  bookACallDismissed: boolean;
}

export interface DemoStore {
  chats: DemoChat[];
  activeId: string | null;
  schemaVersion: number;
}

export const createEmptyStore = (): DemoStore => ({
  chats: [],
  activeId: null,
  schemaVersion: DEMO_SCHEMA_VERSION,
});

export const createNewChat = (title = "New chat"): DemoChat => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  title,
  createdAt: Date.now(),
  messages: [],
  userInputCount: 0,
  bookACallDismissed: false,
});

export const parseStoredDemoStore = (raw: string): DemoStore | null => {
  try {
    const parsed = JSON.parse(raw) as DemoStore;
    if (!parsed || !Array.isArray(parsed.chats)) return null;
    return {
      chats: parsed.chats.filter(
        (c) => c && typeof c.id === "string" && typeof c.createdAt === "number"
      ),
      activeId: typeof parsed.activeId === "string" ? parsed.activeId : null,
      schemaVersion: DEMO_SCHEMA_VERSION,
    };
  } catch {
    return null;
  }
};

export const getActiveChat = (store: DemoStore): DemoChat | null =>
  store.chats.find((c) => c.id === store.activeId) ?? null;
