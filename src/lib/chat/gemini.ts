/**
 * Gemini API integration utilities.
 */

// Types for Gemini API
export interface GeminiContent {
  role: "user" | "model";
  parts: { text: string }[];
}

export interface GeminiSafetySettings {
  category: string;
  threshold: string;
}

export interface GeminiGenerationConfig {
  maxOutputTokens: number;
  temperature: number;
}

export interface GeminiRequestBody {
  systemInstruction: {
    parts: { text: string }[];
  };
  contents: GeminiContent[];
  generationConfig: GeminiGenerationConfig;
  safetySettings: GeminiSafetySettings[];
}

// Default safety settings
const DEFAULT_SAFETY_SETTINGS: GeminiSafetySettings[] = [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
];

// Default generation config
const DEFAULT_GENERATION_CONFIG: GeminiGenerationConfig = {
  maxOutputTokens: 1024,
  temperature: 0.7,
};

/**
 * Convert chat messages to Gemini format.
 * Maps 'assistant' role to 'model' as required by Gemini API.
 */
export const convertToGeminiFormat = (
  messages: { role: string; content: string }[]
): GeminiContent[] => {
  return messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));
};

/**
 * Build the Gemini API request body.
 */
export const buildGeminiRequestBody = (
  systemPrompt: string,
  contents: GeminiContent[],
  config?: Partial<GeminiGenerationConfig>
): GeminiRequestBody => {
  return {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents,
    generationConfig: {
      ...DEFAULT_GENERATION_CONFIG,
      ...config,
    },
    safetySettings: DEFAULT_SAFETY_SETTINGS,
  };
};

/**
 * Get the Gemini API URL for the configured model.
 */
export const getGeminiApiUrl = (apiKey: string): string => {
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
};

/**
 * Extract the assistant message from Gemini response.
 */
export const extractGeminiResponse = (data: {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
}): { message: string; blockedBySafety: boolean } => {
  const message = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const blockedBySafety =
    !message && data.candidates?.[0]?.finishReason === "SAFETY";

  return { message, blockedBySafety };
};

/**
 * Indicators that suggest the model is refusing an out-of-scope request.
 * Used as a safety net when the model doesn't use the exact refusal phrase.
 */
export const OUT_OF_SCOPE_INDICATORS = [
  "i cannot help with",
  "i'm not able to assist with",
  "outside my scope",
  "not within my expertise",
  "i can't provide information about",
  "not related to",
  "outside the scope",
  "beyond my area",
  "not something i can assist",
];

/**
 * Check if a response indicates an out-of-scope refusal.
 */
export const isOutOfScopeResponse = (message: string): boolean => {
  const lowerContent = message.toLowerCase();
  return OUT_OF_SCOPE_INDICATORS.some((indicator) =>
    lowerContent.includes(indicator)
  );
};
