import { http } from "@/api/intercept";
import type {
  CreateProductsPayload,
  ProductsQueryParams,
} from "@/types/product.types";

export const productService = {
  list: (params: ProductsQueryParams) =>
    http.get<unknown>("/products", { params }),
  create: (payload: CreateProductsPayload) =>
    http.post<unknown>("/products", payload),
  remove: (id: number) => http.delete<unknown>(`/products/${id}`),
  removeVariant: (id: number) =>
    http.delete<unknown>(`/products/variants/${id}`),
};
