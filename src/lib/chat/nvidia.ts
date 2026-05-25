/**
 * NVIDIA NIM / integrate API utilities (OpenAI-compatible).
 */

import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

export const getNvidiaModel = (): string =>
  process.env.NVIDIA_MODEL ||
  "mistralai/mistral-large-3-675b-instruct-2512";

export const createNvidiaClient = (apiKey: string): OpenAI =>
  new OpenAI({
    baseURL: NVIDIA_BASE_URL,
    apiKey,
  });

export const buildNvidiaMessages = (
  systemPrompt: string,
  messages: { role: string; content: string }[]
): ChatCompletionMessageParam[] => [
  { role: "system", content: systemPrompt },
  ...messages.map((msg) => ({
    role: (msg.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
    content: msg.content,
  })),
];

export const NVIDIA_GENERATION_CONFIG = {
  temperature: 0.15,
  top_p: 1.0,
  max_tokens: 8192,
} as const;
