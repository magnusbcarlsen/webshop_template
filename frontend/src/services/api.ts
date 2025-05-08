// frontend/src/services/api.ts

// Root for API calls: either explicit NEXT_PUBLIC_API_URL or proxy via /api
const API_ROOT = process.env.NEXT_PUBLIC_API_URL ?? "/api";

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

/**
 * Product shape from backend
 */
export type ProductAPI = {
  id: number;
  category: { id: number; name: string } | null;
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
 * Fetch all categories
 */
export async function fetchCategories(): Promise<CategoryAPI[]> {
  const res = await fetch(`${API_ROOT}/categories`);
  if (!res.ok) throw new Error(`Fetch categories failed: ${res.status}`);
  return res.json();
}

/**
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
  payload: Omit<
    ProductAPI,
    "id" | "createdAt" | "updatedAt" | "images" | "variants" | "category"
  > & { categoryId: number | null }
): Promise<ProductAPI> {
  const res = await fetch(`${API_ROOT}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Create product failed: ${res.status}`);
  return res.json();
}

/**
 * Update an existing product
 */
export async function updateProduct(
  id: number,
  payload: Partial<
    Omit<
      ProductAPI,
      "id" | "createdAt" | "updatedAt" | "images" | "variants" | "category"
    >
  > & { categoryId: number | null }
): Promise<ProductAPI> {
  const res = await fetch(`${API_ROOT}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Update product failed: ${res.status}`);
  return res.json();
}

/**
 * Delete a product by ID
 */
export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`${API_ROOT}/products/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Delete product failed: ${res.status}`);
}
