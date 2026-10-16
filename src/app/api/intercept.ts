import { LAYOUT_LOGIN_PATH } from "@/constants/layout/layout.constants";
import { extractTokens } from "@/utils/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_ID_KEY = "user_id";
const REFRESH_PATH = "/auth/refresh";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown, message?: string) {
    super(message ?? `Request failed with status ${status}`);
    this.status = status;
    this.data = data;
  }
}

const decodeUserId = (token: string | null): number | null => {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const json = window.atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const value = (JSON.parse(json) as Record<string, unknown>).user_id;

    return typeof value === "number" ? value : null;
  } catch {
    return null;
  }
};

export const tokenStorage = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  set(token: string) {
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  getRefresh(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefresh(token: string) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  getUserId(): number | null {
    if (typeof window === "undefined") return null;

    const stored = Number(window.localStorage.getItem(USER_ID_KEY));
    if (Number.isFinite(stored) && stored > 0) return stored;

    return decodeUserId(this.getRefresh()) ?? decodeUserId(this.get());
  },
  setUserId(userId: number) {
    window.localStorage.setItem(USER_ID_KEY, String(userId));
  },
  clear() {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(USER_ID_KEY);
  },
};

export type RequestOptions = Omit<RequestInit, "body"> & {
  auth?: boolean;
  params?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
};

const buildUrl = (path: string, params?: RequestOptions["params"]) => {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  if (!params) return url;

  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) search.append(key, String(value));
  });

  const query = search.toString();
  if (!query) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${query}`;
};

const parseBody = async (response: Response) => {
  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json")
    ? await response.json()
    : await response.text();
};

let refreshing: Promise<boolean> | null = null;

const performRefresh = async (): Promise<boolean> => {
  const refreshToken = tokenStorage.getRefresh();
  const userId = tokenStorage.getUserId();
  if (!refreshToken || userId === null) return false;

  try {
    const response = await fetch(buildUrl(REFRESH_PATH), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, refresh_token: refreshToken }),
    });
    if (!response.ok) return false;

    const tokens = extractTokens(await parseBody(response));
    if (!tokens) return false;

    tokenStorage.set(tokens.accessToken);
    if (tokens.refreshToken) tokenStorage.setRefresh(tokens.refreshToken);
    tokenStorage.setUserId(tokens.userId ?? userId);
    return true;
  } catch {
    return false;
  }
};

const refreshSession = () => {
  if (!refreshing) {
    refreshing = performRefresh().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
};

const redirectToLogin = () => {
  if (typeof window === "undefined") return;
  if (window.location.pathname === LAYOUT_LOGIN_PATH) return;
  window.location.replace(LAYOUT_LOGIN_PATH);
};

async function send<T>(
  path: string,
  options: RequestOptions,
  retried: boolean,
): Promise<T> {
  const { auth = true, params, body, headers, ...init } = options;
  const finalHeaders = new Headers(headers);

  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = tokenStorage.get();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path, params), {
    ...init,
    headers: finalHeaders,
    body:
      body === undefined || body instanceof FormData
        ? (body as FormData | undefined)
        : JSON.stringify(body),
  });

  const data = await parseBody(response);

  if (!response.ok) {
    if (response.status === 401 && auth) {
      if (!retried && (await refreshSession())) {
        return send<T>(path, options, true);
      }

      tokenStorage.clear();
      redirectToLogin();
    }
    throw new ApiError(response.status, data);
  }

  return data as T;
}

export function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  return send<T>(path, options, false);
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
