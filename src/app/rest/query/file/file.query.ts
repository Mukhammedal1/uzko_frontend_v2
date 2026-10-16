"use client";

import { useMutation } from "@tanstack/react-query";

import { fileService } from "@/rest/service/file/file.service";

export function useUploadFileMutation() {
  return useMutation({
    mutationFn: (file: File) => fileService.upload(file),
  });
}
