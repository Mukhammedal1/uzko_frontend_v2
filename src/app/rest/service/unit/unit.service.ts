import { http } from "@/api/intercept";

export const unitService = {
  list: () => http.get<unknown>("/units"),
};
