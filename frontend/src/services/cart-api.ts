import { API_ROOT } from "@/config/api";

export async function addItemToCart(
  productId: number,
  quantity: number = 1
): Promise<any> {
  const url = `${API_ROOT}/carts/items`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity }),
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to add item to cart");
  }

  return response.json();
}

export interface CartAPI {
  id: number;
  items: Array<{
    id: number;
    quantity: number;
    product: { id: number; name: string; price: number; slug: string };
    variant?: { id: number; name: string; price: number };
  }>;
}

export async function getCart(): Promise<CartAPI> {
  const url = `${API_ROOT}/carts/items`;

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch cart");
  }
  return response.json();
}
