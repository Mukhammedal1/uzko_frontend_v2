import { z } from "zod";

import { LOGIN_PASSWORD_MIN_LENGTH } from "@/constants/login/login.constants";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "validation.required")
    .email("validation.emailInvalid"),
  password: z
    .string()
    .min(1, "validation.required")
    .min(LOGIN_PASSWORD_MIN_LENGTH, "validation.passwordMin"),
});
