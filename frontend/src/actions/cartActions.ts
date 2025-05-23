// src/actions/cartActions.ts
"use server";

import { cookies } from "next/headers";
import { API_ROOT } from "@/config/api";

export async function addToCartAction(formData: FormData) {
  const productId = Number(formData.get("productId"));
  const quantity = Number(formData.get("quantity"));

  // build a Cookie header from the incoming request’s cookies
  const cookieStore = cookies();
  const cookieHeader = (await cookieStore)
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`${API_ROOT}/carts/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body: JSON.stringify({ productId, quantity }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to add item to cart: ${res.status}`);
  }
  // no need to return anything unless you want to re-render on success
}
