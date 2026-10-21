import { http } from "@/api/intercept";

export const shelfNumberService = {
  list: () => http.get<unknown>("/shelf-numbers"),
  create: (name: string) => http.post<unknown>("/shelf-numbers", { name }),
  update: (id: number, name: string) =>
    http.patch<unknown>(`/shelf-numbers/${id}`, { name }),
  remove: (id: number) => http.delete<unknown>(`/shelf-numbers/${id}`),
};
