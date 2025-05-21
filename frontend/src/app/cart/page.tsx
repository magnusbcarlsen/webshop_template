import React from "react";
import Link from "next/link";
import { getCart, CartAPI } from "@/services/cart-api";

/**
 * Server Component: Displays the current cart contents.
 */
export default async function CartPage() {
  const cart: CartAPI = await getCart();
  const items = cart.items;
  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {items.length === 0 ? (
        <p>
          Your cart is empty.{" "}
          <Link href="/products" className="text-blue-600 hover:underline">
            Continue shopping
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <Link
                  href={`/products/${item.product.slug}`}
                  className="text-lg font-medium hover:underline"
                >
                  {item.product.name}
                </Link>
                <p className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  ${(item.quantity * item.product.price).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
          <div className="flex justify-end mt-4">
            <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
          </div>
          <div className="flex justify-end mt-2">
            <Link
              href="/checkout"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
