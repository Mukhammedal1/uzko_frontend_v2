import type { AuthTokens } from "@/types/auth.types";

const ACCESS_KEYS = ["accessToken", "access_token", "access", "token", "jwt"];
const REFRESH_KEYS = ["refreshToken", "refresh_token", "refresh"];
const USER_ID_KEYS = ["user_id", "userId"];
const NESTED_KEYS = ["data", "tokens", "result"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const pickNumber = (source: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return undefined;
};

const pickString = (source: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return undefined;
};

export const extractTokens = (payload: unknown): AuthTokens | null => {
  const queue: unknown[] = [payload];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!isRecord(current)) continue;

    const accessToken = pickString(current, ACCESS_KEYS);
    if (accessToken) {
      return {
        accessToken,
        refreshToken: pickString(current, REFRESH_KEYS),
        userId: pickNumber(current, USER_ID_KEYS),
      };
    }

    NESTED_KEYS.forEach((key) => queue.push(current[key]));
  }

  return null;
};
