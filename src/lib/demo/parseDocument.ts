import { readXlsx } from "hucre/xlsx";
import { extractText, getDocumentProxy } from "unpdf";
import {
  ALLOWED_EXTENSIONS,
  MAX_FILE_BYTES,
  MAX_FILE_SIZE_LABEL,
  getExtension,
} from "@/lib/demo/uploadLimits";

const MAX_EXTRACTED_CHARS = 30_000;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "application/csv",
]);

export interface ParsedDocument {
  filename: string;
  mimeType: string;
  extractedText: string;
  charCount: number;
  pageCount?: number;
  sheetNames?: string[];
}

export class DocumentParseError extends Error {
  constructor(
    message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = "DocumentParseError";
  }
}

const truncateText = (text: string): string => {
  const trimmed = text.trim();
  if (trimmed.length <= MAX_EXTRACTED_CHARS) return trimmed;

  const half = Math.floor(MAX_EXTRACTED_CHARS / 2);
  return `${trimmed.slice(0, half)}\n\n[... content truncated ...]\n\n${trimmed.slice(-half)}`;
};

const parsePdf = async (buffer: Buffer): Promise<{ text: string; pageCount: number }> => {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text, totalPages } = await extractText(pdf, { mergePages: true });

  return {
    text: text || "",
    pageCount: totalPages,
  };
};

const cellToString = (value: unknown): string => {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value);
};

const rowsToCsv = (rows: unknown[][]): string =>
  rows.map((row) => row.map(cellToString).join(",")).join("\n");

const parseSpreadsheet = async (
  buffer: Buffer,
  extension: string
): Promise<{ text: string; sheetNames: string[] }> => {
  if (extension === "csv") {
    const csvText = buffer.toString("utf-8").trim();
    if (!csvText) {
      return { text: "", sheetNames: [] };
    }

    return {
      text: `## Sheet: Sheet1\n${csvText}`,
      sheetNames: ["Sheet1"],
    };
  }

  const workbook = await readXlsx(new Uint8Array(buffer));
  const parts: string[] = [];
  const sheetNames: string[] = [];

  for (const sheet of workbook.sheets) {
    sheetNames.push(sheet.name);
    parts.push(`## Sheet: ${sheet.name}\n${rowsToCsv(sheet.rows)}`);
  }

  return {
    text: parts.join("\n\n"),
    sheetNames,
  };
};

export const parseDocumentBuffer = async (
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<ParsedDocument> => {
  if (buffer.byteLength > MAX_FILE_BYTES) {
    throw new DocumentParseError(`File is too large. Maximum size is ${MAX_FILE_SIZE_LABEL}.`);
  }

  const extension = getExtension(filename);
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new DocumentParseError("Unsupported file type. Upload a PDF or spreadsheet.");
  }

  if (mimeType && !ALLOWED_MIME_TYPES.has(mimeType) && mimeType !== "application/octet-stream") {
    throw new DocumentParseError("Unsupported file type. Upload a PDF or spreadsheet.");
  }

  let extractedText = "";
  let pageCount: number | undefined;
  let sheetNames: string[] | undefined;

  if (extension === "pdf") {
    const parsed = await parsePdf(buffer);
    extractedText = parsed.text;
    pageCount = parsed.pageCount;
  } else {
    const parsed = await parseSpreadsheet(buffer, extension);
    extractedText = parsed.text;
    sheetNames = parsed.sheetNames;
  }

  if (!extractedText.trim()) {
    throw new DocumentParseError(
      "No readable text found. Try a text-based PDF or a spreadsheet with data."
    );
  }

  const truncated = truncateText(extractedText);

  return {
    filename,
    mimeType: mimeType || "application/octet-stream",
    extractedText: truncated,
    charCount: truncated.length,
    pageCount,
    sheetNames,
  };
};
