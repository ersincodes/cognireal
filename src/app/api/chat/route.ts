import { NextRequest, NextResponse } from "next/server";
import type { ChatApiRequest } from "@/types/chat";
import {
  getClientIdentifier,
  checkRateLimit,
  RATE_LIMIT_ERROR,
  convertToGeminiFormat,
  buildGeminiRequestBody,
  getGeminiStreamUrl,
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

    // Call Gemini API with streaming
    const response = await fetch(getGeminiStreamUrl(apiKey), {
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

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let fullMessage = "";
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Gemini SSE format: "data: {json}\r\n\r\n" or "data: {json}\n\n"
            // Split by double newline to get complete SSE events
            const events = buffer.split(/\r?\n\r?\n/);
            buffer = events.pop() || ""; // Keep incomplete event in buffer

            for (const event of events) {
              const trimmedEvent = event.trim();
              if (!trimmedEvent) continue;

              // Extract JSON from "data: {json}" format
              let jsonStr = trimmedEvent;
              if (trimmedEvent.startsWith("data:")) {
                jsonStr = trimmedEvent.slice(5).trim();
              }

              if (!jsonStr) continue;

              try {
                const data = JSON.parse(jsonStr);
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                
                if (text) {
                  fullMessage += text;
                  // Send the chunk to the client
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: text })}\n\n`));
                }

                // Check for safety block
                if (!text && data.candidates?.[0]?.finishReason === "SAFETY") {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: OUT_OF_SCOPE_REFUSAL, replace: true })}\n\n`));
                  fullMessage = OUT_OF_SCOPE_REFUSAL;
                }
              } catch {
                // Skip invalid JSON lines
              }
            }
          }

          // Process any remaining buffer
          if (buffer.trim()) {
            let jsonStr = buffer.trim();
            if (jsonStr.startsWith("data:")) {
              jsonStr = jsonStr.slice(5).trim();
            }
            
            if (jsonStr) {
              try {
                const data = JSON.parse(jsonStr);
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                if (text) {
                  fullMessage += text;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: text })}\n\n`));
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }

          // Check for out-of-scope response and replace if needed
          if (isOutOfScopeResponse(fullMessage) && fullMessage !== OUT_OF_SCOPE_REFUSAL) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: OUT_OF_SCOPE_REFUSAL, replace: true })}\n\n`));
          }

          // Send done signal
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        } catch (error) {
          console.error("Streaming error:", error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { message: "", error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
