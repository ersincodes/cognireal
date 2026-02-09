import { NextRequest, NextResponse } from "next/server";
import type { ChatApiRequest } from "@/types/chat";
import {
  getClientIdentifier,
  checkRateLimit,
  RATE_LIMIT_ERROR,
  convertToGeminiFormat,
  buildGeminiRequestBody,
  getGeminiApiUrl,
  extractGeminiResponse,
  isOutOfScopeResponse,
} from "@/lib/chat";
import {
  generateSystemPrompt,
  OUT_OF_SCOPE_REFUSAL,
} from "@/lib/wizard";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientId = getClientIdentifier(request);
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { message: "", error: RATE_LIMIT_ERROR },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body: ChatApiRequest = await request.json();

    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { message: "", error: "Invalid request format" },
        { status: 400 }
      );
    }

    // Filter valid messages
    const validMessages = body.messages.filter(
      (msg) =>
        msg.role &&
        msg.content &&
        typeof msg.content === "string" &&
        msg.content.trim().length > 0
    );

    if (validMessages.length === 0) {
      return NextResponse.json(
        { message: "", error: "No valid messages provided" },
        { status: 400 }
      );
    }

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not configured");
      return NextResponse.json(
        {
          message: "",
          error: "Chat service is temporarily unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    // Generate dynamic system prompt based on wizard context
    const systemPrompt = generateSystemPrompt(body.wizardContext);

    // Prepare messages for Gemini API
    const conversationMessages = validMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
    const geminiContents = convertToGeminiFormat(conversationMessages);

    // Build request body
    const requestBody = buildGeminiRequestBody(systemPrompt, geminiContents);

    // Call Gemini API
    const response = await fetch(getGeminiApiUrl(apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API error:", response.status, errorData);

      if (response.status === 429) {
        return NextResponse.json(
          { message: "", error: "Service is busy. Please try again in a moment." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { message: "", error: "Failed to get a response. Please try again." },
        { status: 500 }
      );
    }

    const data = await response.json();
    const { message: assistantMessage, blockedBySafety } = extractGeminiResponse(data);

    // Handle safety-blocked responses
    if (blockedBySafety) {
      return NextResponse.json({ message: OUT_OF_SCOPE_REFUSAL });
    }

    // Server-side validation: enforce exact refusal message for out-of-scope responses
    if (isOutOfScopeResponse(assistantMessage) && assistantMessage !== OUT_OF_SCOPE_REFUSAL) {
      return NextResponse.json({ message: OUT_OF_SCOPE_REFUSAL });
    }

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { message: "", error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
