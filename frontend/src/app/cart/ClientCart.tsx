"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, Checkbox } from "@heroui/react";
import { CartAPI, removeItemFromCart } from "@/services/cart-api";
import { normalizeImageUrl } from "@/utils/NormalizeImageUrl";

export default function ClientCart() {
  const [cart, setCart] = useState<CartAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

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

  const handleImageError = (itemId: number, imageSrc: string) => {
    console.error("Next/Image failed to load:", imageSrc);
    setImageErrors((prev) => ({
      ...prev,
      [itemId]: true,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading your cart...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Left Column: Cart Items */}
      <div className="w-full lg:w-[70vw] h-auto lg:h-screen overflow-y-scroll scrollbar-none bg-[var(--background)] text-[var(--foreground)]">
        <div className="p-8 lg:p-12">
          {/* Page Title */}
          <div className="mb-12 mt-6 text-left border-b-2 border-current border-solid border-b-[var(--foreground)] w-[60%] mx-auto">
            <h1 className="text-6xl lg:text-8xl font-bold pb-6">YOUR CART</h1>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg">
              <p>Error: {error}</p>
            </div>
          )}

          {/* Empty Cart */}
          {cart && cart.items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl mb-6">Your cart is empty.</p>
              <Link
                href="/products"
                className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            cart && (
              <div className="space-y-8">
                {/* Cart Items */}
                {cart.items.map((item) => {
                  const primaryImage =
                    item.product.images?.find((img) => img.isPrimary) ||
                    item.product.images?.[0] ||
                    null;

                  const imageSrc = primaryImage
                    ? normalizeImageUrl(primaryImage.imageUrl)
                    : FALLBACK_SRC;

                  const altText = primaryImage
                    ? primaryImage.altText || item.product.name
                    : `${item.product.name} (no image)`;

                  const displayImageSrc = imageErrors[item.id]
                    ? FALLBACK_SRC
                    : imageSrc;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8 border-b border-gray-200 pb-8"
                    >
                      {/* Product Image */}
                      <div className="relative w-32 h-32 lg:w-40 lg:h-40 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={displayImageSrc}
                          alt={altText}
                          fill
                          className="object-cover"
                          unoptimized
                          onError={() => handleImageError(item.id, imageSrc)}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 space-y-4">
                        <div>
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="text-2xl font-medium hover:underline block"
                          >
                            {item.product.name}
                          </Link>

                          {item.product.dimensions && (
                            <p className="text-sm">
                              Dimensions: {item.product.dimensions}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Price and Quantity Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-8">
                          <div className="text-lg font-semibold">
                            ${item.product.price}
                          </div>
                          <div className="text-lg">Qty: {item.quantity}</div>
                        </div>

                        <div className="flex items-center space-x-6">
                          <div className="text-xl font-bold">
                            ${(item.quantity * item.product.price).toFixed(2)}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            color="danger"
                            onPress={() => handleDeleteitem(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>

      {/* Right Column: Checkout Section */}
      <div className="mb-4 mt-4 w-full lg:w-[30vw] h-auto lg:h-screen bg-gray-100 flex flex-col justify-center items-center relative">
        <div className="w-[80%] max-w-md space-y-8">
          {/* Cart Summary – always shown */}
          {cart && (
            <>
              <div className="text-left space-y-4">
                <h2 className="text-2xl font-bold">Order Summary</h2>
                <div className="border-b border-gray-300 pb-4">
                  <div className="flex justify-between items-center text-lg">
                    <span>Subtotal</span>
                    <span className="font-bold">
                      $
                      {cart.items.length > 0
                        ? cart.items
                            .reduce(
                              (sum, item) =>
                                sum + item.quantity * item.product.price,
                              0
                            )
                            .toFixed(2)
                        : "0.00"}
                    </span>
                  </div>
                  <p className="text-left text-sm text-gray-600 mt-2">
                    Shipping & taxes calculated at checkout
                  </p>
                </div>
              </div>

              {/* Show only when cart has items */}
              {cart.items.length > 0 && (
                <>
                  <div className="space-y-4">
                    <Checkbox size="sm" className="text-sm">
                      <span className="text-sm text-gray-700">
                        I agree to{" "}
                        <Link
                          href="/terms"
                          className="underline hover:text-black"
                        >
                          Terms & Conditions
                        </Link>
                      </span>
                    </Checkbox>
                  </div>

                  <Button
                    variant="solid"
                    color="primary"
                    size="lg"
                    fullWidth
                    className="bg-black text-white hover:bg-gray-800 py-4 text-lg font-semibold"
                    onPress={() => {
                      window.location.href = "/checkout";
                    }}
                  >
                    PROCEED TO CHECKOUT
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
