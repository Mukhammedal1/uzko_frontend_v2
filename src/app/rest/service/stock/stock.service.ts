import { http } from "@/api/intercept";

export const stockService = {
  list: () => http.get<unknown>("/stocks"),
  create: (name: string) => http.post<unknown>("/stocks", { name }),
  update: (id: number, name: string) =>
    http.patch<unknown>(`/stocks/${id}`, { name }),
  remove: (id: number) => http.delete<unknown>(`/stocks/${id}`),
};
