import { http } from "@/api/intercept";
import type {
  LoginPayload,
  LoginResponse,
  MeResponse,
} from "@/types/auth.types";

export const authService = {
  login: (payload: LoginPayload) =>
    http.post<LoginResponse>("/auth/signin", payload, { auth: false }),
  me: () => http.get<MeResponse>("/auth/me"),
};
