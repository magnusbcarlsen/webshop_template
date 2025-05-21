"use server";
import { addItemToCart } from "@/services/cart-api";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Handles adding a product to the cart.
 * Reads productId and quantity from FormData.
 * Calls backend service and revalidates /products.
 */
export async function addToCartAction(formData: FormData) {
  const productId = formData.get("productId");
  const quantityRaw = formData.get("quantity");
  if (typeof productId !== "string") {
    throw new Error("productId must be a string");
  }
  const quantity =
    quantityRaw && typeof quantityRaw === "string"
      ? parseInt(quantityRaw, 10)
      : 1;

  await addItemToCart(Number(productId), quantity);
  // revalidate the product list or cart UI
  revalidatePath("/products");
}
