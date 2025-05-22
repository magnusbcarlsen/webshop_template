"use client";

// src/app/cart/ClientCart.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getCart, CartAPI } from "@/services/cart-api";

/**
 * Client Component: Displays the current cart contents.
 */
export default function ClientCart() {
  const [cart, setCart] = useState<CartAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCart() {
      try {
        const response = await fetch("/api/carts/items", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setCart(data);
      } catch (err) {
        console.error("Failed to load cart:", err);
        setError(
          `Failed to load your cart: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, []);

  if (loading) {
    return <div className="max-w-4xl mx-auto p-4">Loading your cart...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {cart && cart.items.length === 0 ? (
        <p>
          Your cart is empty.{" "}
          <Link href="/products" className="text-blue-600 hover:underline">
            Continue shopping
          </Link>
          .
        </p>
      ) : cart ? (
        <div className="space-y-4">
          {cart.items.map((item) => (
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
            <p className="text-xl font-bold">
              Total: $
              {cart.items
                .reduce(
                  (sum, item) => sum + item.quantity * item.product.price,
                  0
                )
                .toFixed(2)}
            </p>
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
      ) : null}
    </div>
  );
}
