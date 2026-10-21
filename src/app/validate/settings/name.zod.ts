import { z } from "zod";

export const settingsNameSchema = z.object({
  name: z.string().trim().min(1, "validation.required"),
});
