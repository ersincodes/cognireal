import { NextRequest, NextResponse } from "next/server";
import {
  getClientIdentifier,
  checkRateLimit,
  RATE_LIMIT_ERROR,
  createNvidiaClient,
  buildNvidiaMessages,
  getNvidiaModel,
} from "@/lib/chat";

export const runtime = "nodejs";

const FALLBACK_QUESTIONS = [
  "Summarize this document",
  "What are the key numbers?",
  "List the main action items",
  "What trends stand out in the data?",
];

const SUGGEST_SYSTEM_PROMPT = `You generate suggested questions for a document Q&A demo.
Given document metadata and a text excerpt, output exactly 4 short, specific questions a user could ask about THIS document.
Rules:
- Each question must be 12 words or fewer
- Questions must be answerable from the document
- No numbering, no bullet characters
- Output strict JSON only: {"questions":["...","...","...","..."]}`;

interface SuggestRequestBody {
  documentContext: string;
  filename?: string;
  sheetNames?: string[];
  pageCount?: number;
}

const parseQuestions = (raw: string): string[] | null => {
  try {
    const parsed = JSON.parse(raw) as { questions?: unknown };
    if (!Array.isArray(parsed.questions)) return null;

    const questions = parsed.questions
      .filter((q): q is string => typeof q === "string" && q.trim().length > 0)
      .map((q) => q.trim().slice(0, 120))
      .slice(0, 4);

    return questions.length >= 3 ? questions : null;
  } catch {
    return null;
  }
};

export async function POST(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
    if (!checkRateLimit(clientId)) {
      return NextResponse.json({ error: RATE_LIMIT_ERROR }, { status: 429 });
    }

    const body = (await request.json()) as SuggestRequestBody;

    if (!body.documentContext?.trim()) {
      return NextResponse.json(
        { error: "Document context is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { questions: FALLBACK_QUESTIONS, fallback: true },
        { status: 200 }
      );
    }

    const excerpt = body.documentContext.trim().slice(0, 8000);
    const metaParts: string[] = [];
    if (body.filename) metaParts.push(`Filename: ${body.filename}`);
    if (body.pageCount) metaParts.push(`Pages: ${body.pageCount}`);
    if (body.sheetNames?.length) {
      metaParts.push(`Sheets: ${body.sheetNames.join(", ")}`);
    }

    const userContent = `${metaParts.join("\n")}\n\nDocument excerpt:\n${excerpt}`;

    const client = createNvidiaClient(apiKey);
    const model = getNvidiaModel();

    const completion = await client.chat.completions.create({
      model,
      messages: buildNvidiaMessages(SUGGEST_SYSTEM_PROMPT, [
        { role: "user", content: userContent },
      ]),
      temperature: 0.3,
      max_tokens: 512,
      response_format: { type: "json_object" },
    });

    const rawContent = completion.choices[0]?.message?.content ?? "";
    const questions = parseQuestions(rawContent);

    return NextResponse.json({
      questions: questions ?? FALLBACK_QUESTIONS,
      fallback: !questions,
    });
  } catch (error) {
    console.error("Suggest questions error:", error);
    return NextResponse.json({
      questions: FALLBACK_QUESTIONS,
      fallback: true,
    });
  }
}
