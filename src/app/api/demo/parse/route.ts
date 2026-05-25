import { NextRequest, NextResponse } from "next/server";
import {
  getClientIdentifier,
  checkUploadRateLimit,
  UPLOAD_RATE_LIMIT_ERROR,
} from "@/lib/chat";
import {
  parseDocumentBuffer,
  DocumentParseError,
} from "@/lib/demo/parseDocument";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
    if (!checkUploadRateLimit(clientId)) {
      return NextResponse.json(
        { error: UPLOAD_RATE_LIMIT_ERROR },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseDocumentBuffer(
      buffer,
      file.name,
      file.type || "application/octet-stream"
    );

    return NextResponse.json(parsed);
  } catch (error) {
    if (error instanceof DocumentParseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Document parse error:", error);
    return NextResponse.json(
      { error: "Failed to parse document. Please try again." },
      { status: 500 }
    );
  }
}
