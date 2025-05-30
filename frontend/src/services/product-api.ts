// frontend/src/services/product-api.ts

import { API_ROOT } from "@/config/api";

// // Root for API calls: handle server vs client environment correctly
// function getBaseUrl() {
//   if (typeof window === "undefined") {
//     // Server-side: use absolute URL with /api prefix to match NestJS global prefix
//     return process.env.BACKEND_URL
//       ? `${process.env.BACKEND_URL}/api`
//       : "http://backend:3001/api";
//   }
//   // Client-side: use relative path for API proxy (already handled by nginx)
//   return "/api";
// }

// const API_ROOT = getBaseUrl();

/**
 * Category shape from backend
 */
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

/**
 * CATEGORIES
 */
export async function fetchCategories(): Promise<CategoryAPI[]> {
  const res = await fetch(`${API_ROOT}/categories`);
  if (!res.ok) throw new Error(`Fetch categories failed: ${res.status}`);
  return res.json();
}

export async function createCategory(
  payload: CreateCategoryPayload
): Promise<CategoryAPI> {
  const res = await fetch(`${API_ROOT}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Create category failed: ${res.status}`);
  return res.json();
}

/**
 * PRODUCTS
 * Fetch all products
 */
export async function fetchProducts(): Promise<ProductAPI[]> {
  const res = await fetch(`${API_ROOT}/products`);
  if (!res.ok) throw new Error(`Fetch products failed: ${res.status}`);
  return res.json();
}

/**
 * Fetch a single product by numeric ID
 */
export async function fetchProductById(
  id: number | string
): Promise<ProductAPI> {
  const res = await fetch(`${API_ROOT}/products/${id}`);
  if (!res.ok) throw new Error(`Fetch product by ID failed: ${res.status}`);
  return res.json();
}

/**
 * Fetch a single product by slug
 */
export async function fetchProductBySlug(slug: string): Promise<ProductAPI> {
  const res = await fetch(`${API_ROOT}/products/slug/${slug}`);
  if (!res.ok) throw new Error(`Fetch product by slug failed: ${res.status}`);
  return res.json();
}

/**
 * Create a new product
 */
export async function createProduct(
  payload:
    | FormData
    | (Omit<
        ProductAPI,
        "id" | "createdAt" | "updatedAt" | "images" | "variants" | "categories"
      > & { categoryIds: number[] })
): Promise<ProductAPI> {
  const isForm = payload instanceof FormData;

  const res = await fetch(`${API_ROOT}/products`, {
    method: "POST",
    headers: isForm ? undefined : { "Content-Type": "application/json" },
    body: isForm ? payload : JSON.stringify(payload),
  });

  const body = await res.json();
  if (!res.ok) {
    if (res.status === 409 || body.message?.toLowerCase().includes("unique")) {
      throw new Error(body.message || "Name already exists");
    }
    throw new Error(`Create product failed: ${res.status}`);
  }

  return body;
}

/**
 * Update an existing product
 */

export async function updateProduct(
  id: number,
  // Allow either FormData (for file uploads) or a POJO with categoryIds:number[]
  payload:
    | FormData
    | (Partial<
        Omit<
          ProductAPI,
          | "id"
          | "createdAt"
          | "updatedAt"
          | "images"
          | "variants"
          | "categories"
        >
      > & { categoryIds: number[] })
): Promise<ProductAPI> {
  // Detect whether we're sending FormData or JSON
  const isForm = payload instanceof FormData;

  const res = await fetch(`${API_ROOT}/products/${id}`, {
    method: "PATCH",
    headers: isForm ? undefined : { "Content-Type": "application/json" },
    body: isForm ? payload : JSON.stringify(payload),
  });

  const body = await res.json();
  if (!res.ok) {
    if (res.status === 409 || body.message?.toLowerCase().includes("unique")) {
      throw new Error(body.message || "Name already exists");
    }
    throw new Error(`Edit product failed: ${res.status}`);
  }

  return body;
}

/**
 * Delete a product by ID
 */

export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`${API_ROOT}/products/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Delete product failed: ${res.status}`);
}
