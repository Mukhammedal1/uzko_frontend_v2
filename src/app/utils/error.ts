import { ApiError } from "@/api/intercept";

const pickMessage = (data: unknown): string | null => {
  if (typeof data === "string") return data.trim() || null;
  if (typeof data !== "object" || data === null) return null;

  const message = (data as Record<string, unknown>).message;
  if (typeof message === "string") return message.trim() || null;
  if (Array.isArray(message)) {
    const joined = message.filter((item) => typeof item === "string").join(", ");
    return joined || null;
  }

  return null;
};

export const getApiErrorMessage = (error: unknown): string | null => {
  if (!(error instanceof ApiError)) return null;
  if (error.status >= 500) return null;
  return pickMessage(error.data);
};

export const isNetworkError = (error: unknown) =>
  error instanceof TypeError && !(error instanceof ApiError);
