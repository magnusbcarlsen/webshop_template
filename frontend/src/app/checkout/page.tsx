// app/checkout/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import Link from "next/link";

// Make sure this env var is set in .env.local:
//   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_…
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CartItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    slug: string;
    images?: {
      imageUrl: string;
      altText?: string;
      isPrimary: boolean;
    }[];
  };
}

interface CartAPI {
  id: number;
  items: CartItem[];
}

export default function ClientCheckout() {
  const [cart, setCart] = useState<CartAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingSession, setCreatingSession] = useState(false);

  const FALLBACK_SRC = "/NoImageAvailable.png";

  // 1) Load the cart from your existing /api/carts/items
  useEffect(() => {
    async function loadCart() {
      try {
        const res = await fetch("/api/carts/items", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data: CartAPI = await res.json();
        setCart(data);
      } catch (err) {
        console.error(err);
        setError(
          `Failed to load cart: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      } finally {
        setLoading(false);
      }
    }
    loadCart();
  }, []);

  // 2) Compute total client‐side (purely for display)
  const totalAmount = cart
    ? cart.items.reduce(
        (sum, item) => sum + item.quantity * item.product.price,
        0
      )
    : 0;

  // 3) When “Pay Now” is clicked, send only productId & quantity to backend
  async function handleCheckout() {
    if (!cart || cart.items.length === 0) {
      return;
    }
    setCreatingSession(true);

    // Build the array of { productId, quantity }
    const lineItems = cart.items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: lineItems }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Checkout failed: ${txt}`);
      }

      const { sessionId } = await res.json();

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe.js failed to load.");
      }
      // Redirect to Stripe’s hosted checkout
      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      console.error(err);
      setError(
        `Failed to create checkout session: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      setCreatingSession(false);
    }
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto p-4">Loading checkout…</div>;
  }
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      </div>
    );
  }
  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p>
          Your cart is empty.{" "}
          <Link href="/products" className="text-blue-600 hover:underline">
            Continue shopping
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* --- List of Items --- */}
      <div className="space-y-4">
        {cart.items.map((item) => {
          const primaryImage =
            item.product.images?.find((img) => img.isPrimary) ||
            item.product.images?.[0] ||
            null;

          const imageSrc = primaryImage ? primaryImage.imageUrl : FALLBACK_SRC;
          const altText = primaryImage
            ? primaryImage.altText || item.product.name
            : `${item.product.name} (no image)`;

          return (
            <div
              key={item.id}
              className="flex justify-between items-center border-b pb-2"
            >
              {/* Left: thumbnail + name/quantity */}
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
                      console.error("Image failed to load:", imageSrc)
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

              {/* Middle: line total */}
              <div className="text-right">
                <p className="font-semibold">
                  ${(item.quantity * item.product.price).toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- Cart Total --- */}
      <div className="flex justify-end mt-6">
        <p className="text-xl font-bold">Total: ${totalAmount.toFixed(2)}</p>
      </div>

      {/* --- Pay with Stripe Button --- */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleCheckout}
          disabled={creatingSession}
          className={`${
            creatingSession ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          } text-white py-2 px-6 rounded font-medium`}
        >
          {creatingSession ? "Redirecting…" : "Pay Now with Stripe"}
        </button>
      </div>
    </div>
  );
}
