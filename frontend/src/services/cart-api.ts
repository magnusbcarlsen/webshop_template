// src/services/cart-api.ts
import { API_ROOT } from "@/config/api";

export interface ProductAPI {
  id: number;
  name: string;
  slug: string;
  price: number;
}

export interface CartItemAPI {
  id: number;
  quantity: number;
  product: ProductAPI;
}

export interface CartAPI {
  id: number;
  items: CartItemAPI[];
}

export async function getCart(): Promise<CartAPI> {
  const res = await fetch(`${API_ROOT}/carts/items`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch cart: ${res.status}`);
  }
  return res.json();
}

export async function addItemToCart(
  productId: number,
  quantity = 1
): Promise<CartAPI> {
  const res = await fetch(`${API_ROOT}/carts/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({ productId, quantity }),
  });
  if (!res.ok) {
    throw new Error(`Failed to add item to cart: ${res.status}`);
  }
  return res.json();
}

export async function removeItemFromCart(itemId: number): Promise<CartAPI> {
  const res = await fetch(`${API_ROOT}/carts/items/${itemId}`, {
    method: "DELETE",
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to remove product from cart: ${res.status}`);
  }
  return res.json(); // updated cart so your UI can re-render
}
