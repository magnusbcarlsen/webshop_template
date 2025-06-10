import { API_ROOT } from "@/config/api";
import { ProductAPI } from "./product-api";

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
    // Optional: redirect or trigger login modal
    if (typeof window !== "undefined") {
      window.location.href = "/login"; // or toast message
    }
    throw new Error("Unauthorized access to cart.");
  }

  if (!res.ok) {
    throw new Error(`Cart request failed: ${res.status}`);
  }

  return res.json();
}

export async function getCart(): Promise<CartAPI> {
  const res = await fetch(`${API_ROOT}/carts/items`, {
    method: "GET",
    credentials: "include", // 🔐 sends sessionId cookie
    cache: "no-store",
  });

  return handleCartResponse(res);
}

export async function addItemToCart(
  productId: number,
  quantity = 1,
  variantId?: number
): Promise<CartAPI> {
  const res = await fetch(`${API_ROOT}/carts/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // 🔐 ensures cookie is included
    cache: "no-store",
    body: JSON.stringify({ productId, quantity, variantId }),
  });

  return handleCartResponse(res);
}

export async function removeItemFromCart(itemId: number): Promise<CartAPI> {
  const res = await fetch(`${API_ROOT}/carts/items/${itemId}`, {
    method: "DELETE",
    credentials: "include", // 🔐 ensures session security
    cache: "no-store",
  });

  return handleCartResponse(res);
}
