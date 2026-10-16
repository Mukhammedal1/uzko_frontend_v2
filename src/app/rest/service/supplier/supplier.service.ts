import { http } from "@/api/intercept";

export const supplierService = {
  list: () => http.get<unknown>("/suppliers"),
};
