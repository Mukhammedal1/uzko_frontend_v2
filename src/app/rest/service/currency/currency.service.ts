import { http } from "@/api/intercept";

export const currencyService = {
  list: () => http.get<unknown>("/currency"),
  business: () => http.get<unknown>("/business-currency"),
  saveRate: (currencyId: number, rate: number) =>
    http.post<unknown>("/business-currency", {
      currency_id: currencyId,
      rate,
    }),
  setMain: (currencyId: number) =>
    http.patch<unknown>(`/business-currency/${currencyId}/main`),
};
