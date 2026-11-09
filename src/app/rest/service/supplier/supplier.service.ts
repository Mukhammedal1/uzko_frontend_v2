import { http } from "@/api/intercept";
import type {
  SupplierCreatePayload,
  SuppliersQueryParams,
  SupplierUpdatePayload,
} from "@/types/supplier.types";

export const supplierService = {
  list: () => http.get<unknown>("/suppliers"),
  page: (params: SuppliersQueryParams) =>
    http.get<unknown>("/suppliers", { params }),
  get: (id: number) => http.get<unknown>(`/suppliers/${id}`),
  create: (payload: SupplierCreatePayload) =>
    http.post<unknown>("/suppliers", payload),
  update: (id: number, payload: SupplierUpdatePayload) =>
    http.patch<unknown>(`/suppliers/${id}`, payload),
  remove: (id: number) => http.delete<unknown>(`/suppliers/${id}`),
};
