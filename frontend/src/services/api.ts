// frontend/src/services/api.ts
 // use the NEXT_PUBLIC_ var if set (e.g. in dev), otherwise fall back to the proxy path
 const API_ROOT = process.env.NEXT_PUBLIC_API_URL ?? '/api';


 export async function fetchProducts() {
   const res = await fetch(`${API_ROOT}/products`);
   if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
   return res.json() as Promise<ProductAPI[]>;
 }

/**
 * Fetch a single product by its numeric ID
 */
export async function fetchProductById(id: number | string) {
  const res = await fetch(`${API_ROOT}/products/${id}`);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json() as Promise<ProductAPI>;
}

export async function fetchProductBySlug(slug: string) {
  const res = await fetch(`${API_ROOT}/products/slug/${slug}`);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json() as Promise<ProductAPI>;
}

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
   images: { id: number; imageUrl: string; altText: string | null; isPrimary: boolean }[];
   variants: { id: number; sku: string; price: number; salePrice: number | null; stockQuantity: number; isActive: boolean }[];
 };
