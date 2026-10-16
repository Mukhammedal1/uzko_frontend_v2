import { http } from "@/api/intercept";

export const currencyService = {
  list: () => http.get<unknown>("/currency"),
  business: () => http.get<unknown>("/business-currency"),
};
