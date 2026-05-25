import { NextRequest, NextResponse } from "next/server";
import type { ChatApiRequest } from "@/types/chat";
import {
  getClientIdentifier,
  checkRateLimit,
  RATE_LIMIT_ERROR,
  isOutOfScopeResponse,
  generateSystemPrompt,
  OUT_OF_SCOPE_REFUSAL,
} from "@/lib/chat";
import {
  createNvidiaClient,
  buildNvidiaMessages,
  getNvidiaModel,
  NVIDIA_GENERATION_CONFIG,
} from "@/lib/chat/nvidia";
import { chatDebug, chatError, extractStreamDelta } from "@/lib/chat/debug";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const startedAt = Date.now();

  try {
    chatDebug("api", `request ${requestId} started`);

    const clientId = getClientIdentifier(request);
    if (!checkRateLimit(clientId)) {
      chatDebug("api", `request ${requestId} rate limited`, { clientId });
      return NextResponse.json(
        { message: "", error: RATE_LIMIT_ERROR },
        { status: 429 }
      );
    }

    const body: ChatApiRequest = await request.json();

    if (!body.messages || !Array.isArray(body.messages)) {
      chatDebug("api", `request ${requestId} invalid body`);
      return NextResponse.json(
        { message: "", error: "Invalid request format" },
        { status: 400 }
      );
    }

    const validMessages = body.messages.filter(
      (msg) =>
        msg.role &&
        msg.content &&
        typeof msg.content === "string" &&
        msg.content.trim().length > 0
    );

    if (validMessages.length === 0) {
      chatDebug("api", `request ${requestId} no valid messages`);
      return NextResponse.json(
        { message: "", error: "No valid messages provided" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      chatError("api", `request ${requestId} missing NVIDIA_API_KEY`);
      return NextResponse.json(
        {
          message: "",
          error: "Chat service is temporarily unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    const model = getNvidiaModel();
    const hasDocument = Boolean(body.documentContext?.trim());
    const systemPrompt = generateSystemPrompt(body.documentContext);

    chatDebug("api", `request ${requestId} calling NVIDIA`, {
      model,
      messageCount: validMessages.length,
      hasDocument,
      systemPromptChars: systemPrompt.length,
      lastUserMessage: validMessages[validMessages.length - 1]?.content?.slice(0, 120),
    });

    const conversationMessages = validMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const client = createNvidiaClient(apiKey);
    const nvidiaStartedAt = Date.now();

    let stream;

    try {
      stream = await client.chat.completions.create({
        model,
        messages: buildNvidiaMessages(systemPrompt, conversationMessages),
        stream: true,
        temperature: NVIDIA_GENERATION_CONFIG.temperature,
        top_p: NVIDIA_GENERATION_CONFIG.top_p,
        max_tokens: NVIDIA_GENERATION_CONFIG.max_tokens,
      });
    } catch (error) {
      chatError("api", `request ${requestId} NVIDIA create() failed`, error);
      throw error;
    }

    chatDebug("api", `request ${requestId} stream opened`, {
      msToOpen: Date.now() - nvidiaStartedAt,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        let fullMessage = "";
        let chunkIndex = 0;
        let reasoningChunks = 0;
        let contentChunks = 0;
        let reasoningChars = 0;
        let sentReasoningMeta = false;
        let firstChunkAt: number | null = null;
        let firstContentAt: number | null = null;

        const enqueue = (payload: Record<string, unknown>) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
          );
        };

        try {
          for await (const chunk of stream) {
            chunkIndex++;
            const choice = chunk.choices[0];
            const delta = choice?.delta as Record<string, unknown> | null | undefined;
            const { content, reasoning } = extractStreamDelta(
              delta as Parameters<typeof extractStreamDelta>[0]
            );

            if (chunkIndex === 1) {
              firstChunkAt = Date.now();
              chatDebug("api", `request ${requestId} first chunk`, {
                msFromStart: firstChunkAt - nvidiaStartedAt,
                deltaKeys: delta ? Object.keys(delta) : [],
                finishReason: choice?.finish_reason,
              });
            }

            if (reasoning) {
              reasoningChunks++;
              reasoningChars += reasoning.length;

              if (!sentReasoningMeta) {
                sentReasoningMeta = true;
                chatDebug("api", `request ${requestId} reasoning phase started`);
                enqueue({ meta: { phase: "reasoning" } });
              }

              if (reasoningChunks <= 3 || reasoningChunks % 25 === 0) {
                chatDebug("api", `request ${requestId} reasoning chunk`, {
                  index: reasoningChunks,
                  chars: reasoning.length,
                  totalReasoningChars: reasoningChars,
                });
              }
            }

            if (content) {
              contentChunks++;
              if (!firstContentAt) {
                firstContentAt = Date.now();
                chatDebug("api", `request ${requestId} first content chunk`, {
                  msFromStart: firstContentAt - nvidiaStartedAt,
                  msAfterFirstChunk: firstChunkAt
                    ? firstContentAt - firstChunkAt
                    : null,
                  preview: content.slice(0, 80),
                });
                enqueue({ meta: { phase: "streaming" } });
              }

              fullMessage += content;
              enqueue({ chunk: content });
            }

            if (chunkIndex <= 3 || chunkIndex % 50 === 0) {
              chatDebug("api", `request ${requestId} chunk summary`, {
                chunkIndex,
                contentChunks,
                reasoningChunks,
                finishReason: choice?.finish_reason,
              });
            }
          }

          chatDebug("api", `request ${requestId} stream complete`, {
            totalMs: Date.now() - nvidiaStartedAt,
            chunkIndex,
            contentChunks,
            reasoningChunks,
            reasoningChars,
            responseChars: fullMessage.length,
            responsePreview: fullMessage.slice(0, 160),
          });

          if (!fullMessage && reasoningChars > 0) {
            chatError(
              "api",
              `request ${requestId} ended with reasoning only — no user-visible content`,
              { reasoningChars, reasoningChunks }
            );
            enqueue({
              error:
                "The model finished reasoning but returned no answer. Try a shorter question or check CHAT_DEBUG logs.",
            });
            return;
          }

          if (!fullMessage) {
            chatError("api", `request ${requestId} empty response`, {
              chunkIndex,
              contentChunks,
              reasoningChunks,
            });
            enqueue({ error: "The model returned an empty response." });
            return;
          }

          if (
            isOutOfScopeResponse(fullMessage) &&
            fullMessage !== OUT_OF_SCOPE_REFUSAL
          ) {
            enqueue({ chunk: OUT_OF_SCOPE_REFUSAL, replace: true });
          }

          enqueue({ done: true });
        } catch (error) {
          chatError("api", `request ${requestId} streaming error`, error);
          enqueue({ error: "Stream interrupted" });
        } finally {
          chatDebug("api", `request ${requestId} finished`, {
            totalRequestMs: Date.now() - startedAt,
          });
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Chat-Request-Id": requestId,
      },
    });
  } catch (error) {
    chatError("api", `request ${requestId} failed`, error);
    return NextResponse.json(
      { message: "", error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
