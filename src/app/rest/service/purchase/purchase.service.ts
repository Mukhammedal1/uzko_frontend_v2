import { http } from "@/api/intercept";
import type {
  PurchaseCreatePayload,
  PurchasesQueryParams,
  PurchaseUpdatePayload,
} from "@/types/purchase.types";

export const purchaseService = {
  list: (params: PurchasesQueryParams) =>
    http.get<unknown>("/purchases", { params }),
  get: (id: number) => http.get<unknown>(`/purchases/${id}`),
  history: (id: number) =>
    http.get<unknown>(`/purchases/${id}/balance-history`),
  create: (payload: PurchaseCreatePayload) =>
    http.post<unknown>("/purchases", payload),
  update: (id: number, payload: PurchaseUpdatePayload) =>
    http.patch<unknown>(`/purchases/${id}`, payload),
  remove: (id: number) => http.delete<unknown>(`/purchases/${id}`),
};
