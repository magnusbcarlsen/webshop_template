// frontend/src/services/product-api.ts

import { API_ROOT } from "@/config/api";
import { api } from "./csrf.service";
import { fetchWithCSRFFormData } from "./csrf-formdata.helper"; // ADD THIS IMPORT
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
  // GET requests don't need CSRF, but using for consistency (no /api prefix)
  const res = await api.get("/categories");
  return handleResponse(res);
}

export async function createCategory(
  payload: CreateCategoryPayload
): Promise<CategoryAPI> {
  // UPDATED: Use CSRF-protected API call (no /api prefix)
  const res = await api.post("/categories", payload);
  return handleResponse(res);
}

// ─── PRODUCTS (PUBLIC) ─────────────────────────────────────────────
export async function fetchProducts(): Promise<ProductAPI[]> {
  // GET requests don't need CSRF, but using for consistency (no /api prefix)
  const res = await api.get("/products");
  return handleResponse(res);
}

export async function fetchProductById(
  id: number | string
): Promise<ProductAPI> {
  // GET requests don't need CSRF, but using for consistency (no /api prefix)
  const res = await api.get(`/products/${id}`);
  return handleResponse(res);
}

export async function fetchProductBySlug(slug: string): Promise<ProductAPI> {
  // GET requests don't need CSRF, but using for consistency (no /api prefix)
  const res = await api.get(`/products/slug/${slug}`);
  return handleResponse(res);
}

// ─── PRODUCTS (ADMIN) ──────────────────────────────────────────────
export async function createProduct(
  payload: FormData | AdminProductPayload
): Promise<ProductAPI> {
  const isForm = payload instanceof FormData;

  if (isForm) {
    // UPDATED: Use CSRF FormData helper (API_ROOT already included)
    const res = await fetchWithCSRFFormData(`${API_ROOT}/products`, payload, {
      method: "POST",
    });
    return handleResponse(res);
  } else {
    // UPDATED: Use CSRF-protected API call for JSON (no /api prefix)
    const res = await api.post("/products", payload);
    return handleResponse(res);
  }
}

export async function updateProduct(
  id: number,
  payload: FormData | AdminProductPayload
): Promise<ProductAPI> {
  const isForm = payload instanceof FormData;

  if (isForm) {
    // UPDATED: Use CSRF FormData helper (API_ROOT already included)
    const res = await fetchWithCSRFFormData(
      `${API_ROOT}/products/${id}`,
      payload,
      {
        method: "PATCH",
      }
    );
    return handleResponse(res);
  } else {
    // UPDATED: Use CSRF-protected API call for JSON (no /api prefix)
    const res = await api.put(`/products/${id}`, payload);
    return handleResponse(res);
  }
}

export async function deleteProduct(id: number): Promise<void> {
  // UPDATED: Use CSRF-protected API call (no /api prefix)
  const res = await api.delete(`/products/${id}`);
  await handleResponse(res);
}
