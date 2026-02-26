"use server";

import { getBaseUrl } from "@/config/api";

export async function getProducts() {
  try {
    const response = await fetch(`${getBaseUrl()}/products`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return { error: `API error: ${response.status}`, data: null };
    }

    const data = await response.json();
    return { error: null, data };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { error: String(error), data: null };
  }
}
