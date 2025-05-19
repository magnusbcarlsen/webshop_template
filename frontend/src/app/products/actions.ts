"use server";

export async function getProducts() {
  try {
    // Add the /api prefix to match the NestJS global prefix
    const response = await fetch("http://backend:3001/api/products", {
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
