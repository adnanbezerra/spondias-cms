"use client";

export type AdminCategory = {
  id: string;
  name: string;
  isActive: boolean;
};

export type AdminSection = {
  id: string;
  name: string;
  isActive: boolean;
  order: number;
  isBanner: boolean;
  bannerImg: string | null;
};

export type AdminProduct = {
  id: string;
  name: string;
  price: number;
  stock: number;
  discountPercentage: number;
  image: string | null;
  isActive: boolean;
};

type UploadImageResponse = {
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
};

export const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const headers = new Headers(init?.headers);
  if (!(init?.body instanceof FormData) && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  const payload = (await response.json()) as T | { message?: string };
  if (!response.ok) {
    throw new Error((payload as { message?: string }).message ?? "Falha na requisição.");
  }

  return payload as T;
};

export const uploadImage = async (file: File): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/admin/uploads/image", {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json()) as
    | UploadImageResponse
    | { message?: string };

  if (!response.ok) {
    const errorPayload = payload as { message?: string };
    throw new Error(errorPayload.message ?? "Falha no upload da imagem.");
  }

  return payload as UploadImageResponse;
};
