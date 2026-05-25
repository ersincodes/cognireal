/**
 * Chat debug logging. Enable with CHAT_DEBUG=true (server) or NEXT_PUBLIC_CHAT_DEBUG=true (client).
 */

const isServer = typeof window === "undefined";

const isEnabled = (): boolean => {
  if (isServer) {
    return (
      process.env.CHAT_DEBUG === "true" ||
      process.env.NODE_ENV === "development"
    );
  }
  return (
    process.env.NEXT_PUBLIC_CHAT_DEBUG === "true" ||
    process.env.NODE_ENV === "development"
  );
};

const formatData = (data: unknown): string => {
  if (data === undefined) return "";
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
};

export const chatDebug = (
  scope: string,
  message: string,
  data?: unknown
): void => {
  if (!isEnabled()) return;
  const prefix = `[chat:${scope}]`;
  if (data !== undefined) {
    console.log(prefix, message, formatData(data));
  } else {
    console.log(prefix, message);
  }
};

export const chatError = (
  scope: string,
  message: string,
  error?: unknown
): void => {
  const prefix = `[chat:${scope}]`;
  if (error !== undefined) {
    console.error(prefix, message, error);
  } else {
    console.error(prefix, message);
  }
};

export type StreamDelta = {
  content?: string | null;
  reasoning_content?: string | null;
  role?: string;
};

/** Extract user-visible text and reasoning tokens from NVIDIA stream deltas. */
export const extractStreamDelta = (
  delta: StreamDelta | undefined
): { content?: string; reasoning?: string } => {
  if (!delta) return {};
  return {
    content: delta.content ?? undefined,
    reasoning: delta.reasoning_content ?? undefined,
  };
};
