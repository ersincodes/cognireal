export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_FILE_SIZE_LABEL = "10 MB";

export const ALLOWED_EXTENSIONS = new Set(["pdf", "xlsx", "csv"]);
export const ACCEPTED_FILE_TYPES = ".pdf,.xlsx,.csv";

export type UploadValidationError = "fileTooLarge" | "unsupportedType";

export const getExtension = (filename: string): string => {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
};

export const validateUploadFile = (file: File): UploadValidationError | null => {
  if (file.size > MAX_FILE_BYTES) {
    return "fileTooLarge";
  }

  const extension = getExtension(file.name);
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return "unsupportedType";
  }

  return null;
};
