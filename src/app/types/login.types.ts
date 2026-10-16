import type { z } from "zod";

import type { loginSchema } from "@/validate/login/login.zod";

export type LoginFormValues = z.infer<typeof loginSchema>;
