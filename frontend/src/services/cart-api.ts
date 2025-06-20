import { API_ROOT } from "@/config/api";
import { ProductAPI } from "./product-api";
import router from "next/router";
import { api } from "./csrf.service"; // UPDATED: Use CSRF service

export interface CartItemAPI {
  id: number;
  quantity: number;
  product: ProductAPI;
  variant?: { id: number }; // optional if variants are used
}

export interface CartAPI {
  id: number;
  items: CartItemAPI[];
}

async function handleCartResponse(res: Response): Promise<CartAPI> {
  if (res.status === 401 || res.status === 403) {
    if (typeof window !== "undefined") {
      throw new Error("Unauthorized access to cart.");
    }
  }

  if (!res.ok) {
    throw new Error(`Cart request failed: ${res.status}`);
  }

  return res.json();
}

// UPDATED: Use CSRF-protected API calls (no /api prefix)
export async function getCart(): Promise<CartAPI> {
  const res = await api.get("/carts/items");
  return handleCartResponse(res);
}

export async function addItemToCart(
  productId: number,
  quantity = 1,
  variantId?: number
): Promise<CartAPI> {
  const res = await api.post("/carts/items", {
    productId,
    quantity,
    variantId,
  });
  return handleCartResponse(res);
}

export async function removeItemFromCart(itemId: number): Promise<CartAPI> {
  const res = await api.delete(`/carts/items/${itemId}`);
  return handleCartResponse(res);
}

// ADDED: Additional cart functions that might be needed
export async function updateCartItem(
  itemId: number,
  quantity: number
): Promise<CartAPI> {
  const res = await api.put(`/carts/items/${itemId}`, {
    quantity,
  });
  return handleCartResponse(res);
}

export async function clearCart(): Promise<void> {
  const res = await api.delete("/carts");
  if (!res.ok) {
    throw new Error(`Failed to clear cart: ${res.status}`);
  }
}
