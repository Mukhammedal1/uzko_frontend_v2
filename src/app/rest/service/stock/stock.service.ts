import { http } from "@/api/intercept";

export const stockService = {
  list: () => http.get<unknown>("/stocks"),
};
