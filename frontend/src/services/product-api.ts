// frontend/src/services/product-api.ts

import { API_ROOT } from "@/config/api";
import router from "next/router";

export type CategoryAPI = {
  id: number;
  parentCategoryId: number | null;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
};

export type CreateCategoryPayload = {
  parentCategoryId?: number | null;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
};

/**
 * Product shape from backend
 */
export type ProductAPI = {
  id: number;
  // STRIPE
  stripeProductId: string;
  stripePriceId: string;
  // category: { id: number; name: string } | null;
  categories: { id: number; name: string }[];
  name: string;
  slug: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  stockQuantity: number;
  sku: string | null;
  weight: number | null;
  dimensions: string | null;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  images: {
    id: number;
    imageUrl: string;
    altText: string | null;
    isPrimary: boolean;
  }[];
  variants: {
    id: number;
    sku: string;
    price: number;
    salePrice: number | null;
    stockQuantity: number;
    isActive: boolean;
  }[];
};

export type AdminProductPayload = Omit<
  ProductAPI,
  "id" | "createdAt" | "updatedAt" | "images" | "variants" | "categories"
> & {
  categoryIds: number[];
  unitAmount: number; // in smallest currency unit, e.g. øre
  currency: string; // e.g. "DKK"
};

// frontend/src/services/product-api.ts

// ─── UTILITIES ─────────────────────────────────────────────────────
async function handleResponse<T = unknown>(res: Response): Promise<T> {
  if (res.status === 401 || res.status === 403) {
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const errPayload = await res.json().catch(() => null);
    const msg = errPayload?.message || `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return res.json();
}

// ─── CATEGORIES ────────────────────────────────────────────────────
export async function fetchCategories(): Promise<CategoryAPI[]> {
  const res = await fetch(`${API_ROOT}/categories`, {
    cache: "no-store",
  });
  return handleResponse(res);
}

export async function createCategory(
  payload: CreateCategoryPayload
): Promise<CategoryAPI> {
  const res = await fetch(`${API_ROOT}/categories`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

// ─── PRODUCTS (PUBLIC) ─────────────────────────────────────────────
export async function fetchProducts(): Promise<ProductAPI[]> {
  const res = await fetch(`${API_ROOT}/products`, { cache: "no-store" });
  return handleResponse(res);
}

export async function fetchProductById(
  id: number | string
): Promise<ProductAPI> {
  const res = await fetch(`${API_ROOT}/products/${id}`, {
    cache: "no-store",
  });
  return handleResponse(res);
}

export async function fetchProductBySlug(slug: string): Promise<ProductAPI> {
  const res = await fetch(`${API_ROOT}/products/slug/${slug}`, {
    cache: "no-store",
  });
  return handleResponse(res);
}

// ─── PRODUCTS (ADMIN) ──────────────────────────────────────────────
export async function createProduct(
  payload: FormData | AdminProductPayload
): Promise<ProductAPI> {
  const isForm = payload instanceof FormData;
  const res = await fetch(`${API_ROOT}/products`, {
    method: "POST",
    credentials: "include",
    headers: isForm ? undefined : { "Content-Type": "application/json" },
    body: isForm ? payload : JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateProduct(
  id: number,
  payload: FormData | AdminProductPayload
): Promise<ProductAPI> {
  const isForm = payload instanceof FormData;
  const res = await fetch(`${API_ROOT}/products/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: isForm ? undefined : { "Content-Type": "application/json" },
    body: isForm ? payload : JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`${API_ROOT}/products/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  await handleResponse(res);
}
