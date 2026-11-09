import { http } from "@/api/intercept";
import type {
  AssignVariantsPayload,
  BulkDeletePayload,
  BulkUpdateProductsPayload,
  CreateProductsPayload,
  ProductsQueryParams,
} from "@/types/product.types";

export const productService = {
  list: (params: ProductsQueryParams) =>
    http.get<unknown>("/products", { params }),
  detail: (id: number) => http.get<unknown>(`/products/${id}`),
  create: (payload: CreateProductsPayload) =>
    http.post<unknown>("/products", payload),
  update: (payload: BulkUpdateProductsPayload) =>
    http.patch<unknown>("/products", payload),
  assign: (payload: AssignVariantsPayload) =>
    http.patch<unknown>("/products/variants/assign", payload),
  remove: (payload: BulkDeletePayload) =>
    http.delete<unknown>("/products", { body: payload }),
};
