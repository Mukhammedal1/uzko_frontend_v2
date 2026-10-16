import { http } from "@/api/intercept";
import type { UploadedFile } from "@/types/product.types";

export const fileService = {
  upload: (file: File) => {
    const body = new FormData();
    body.append("file", file);
    return http.post<UploadedFile>("/files/upload", body);
  },
};
