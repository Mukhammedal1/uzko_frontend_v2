import { http } from "@/api/intercept";

export const expenseTypeService = {
  list: () => http.get<unknown>("/expense-types"),
  create: (name: string) => http.post<unknown>("/expense-types", { name }),
  update: (id: number, name: string) =>
    http.patch<unknown>(`/expense-types/${id}`, { name }),
  remove: (id: number) => http.delete<unknown>(`/expense-types/${id}`),
};
