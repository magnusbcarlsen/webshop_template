"use client";

// src/app/cart/ClientCart.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CartAPI, removeItemFromCart } from "@/services/cart-api";
import { normalizeImageUrl } from "@/utils/NormalizeImageUrl";

export default function ClientCart() {
  const [cart, setCart] = useState<CartAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback under /public folder:
  const FALLBACK_SRC = "/NoImageAvailable.png";

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

  async function handleDeleteitem(id: number) {
    try {
      const updated = await removeItemFromCart(id);
      setCart(updated);
    } catch (err) {
      console.error("Failed to remove item from cart:", err);
      setError(
        `Failed to remove item from cart: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }

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
          {cart.items.map((item) => {
            // 1) Find a “primary” image, or the first one in the array, or null
            const primaryImage =
              item.product.images?.find((img) => img.isPrimary) ||
              item.product.images?.[0] ||
              null;

            // 2) Normalize or fallback
            const imageSrc = primaryImage
              ? normalizeImageUrl(primaryImage.imageUrl)
              : FALLBACK_SRC;

            // 3) Alt text
            const altText = primaryImage
              ? primaryImage.altText || item.product.name
              : `${item.product.name} (no image)`;

            // ─── DEBUGGING: log exactly which URL we're trying to load ───
            console.log("ClientCart: loading thumbnail →", imageSrc);

            return (
              <div
                key={item.id}
                className="flex justify-between items-center border-b pb-2"
              >
                {/* Left side: thumbnail + name/quantity */}
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden">
                    <Image
                      src={imageSrc}
                      alt={altText}
                      width={64}
                      height={64}
                      className="object-cover"
                      unoptimized
                      onError={() =>
                        console.error("Next/Image failed to load:", imageSrc)
                      }
                    />
                  </div>

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
                </div>

                {/* Middle: price */}
                <div className="text-right">
                  <p className="font-semibold">
                    ${(item.quantity * item.product.price).toFixed(2)}
                  </p>
                </div>

                {/* Right: remove button */}
                <button
                  onClick={() => handleDeleteitem(item.id)}
                  className="text-red-600 hover:text-red-800 ml-4"
                >
                  Remove
                </button>
              </div>
            );
          })}

          {/* Cart total */}
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

          {/* Checkout button */}
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
