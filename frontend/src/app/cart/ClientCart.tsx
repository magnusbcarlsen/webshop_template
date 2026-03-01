"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, Checkbox } from "@heroui/react";
import { CartAPI, removeItemFromCart } from "@/services/cart-api";
import { useProductImage } from "@/hooks/useProductImage";
import { useRouter } from "next/navigation";
import { CheckoutButton } from "@/components/CheckoutButton";

function CartItemImage({
  slug,
  images,
  size = "md",
}: {
  slug: string;
  images?: { imageUrl: string; altText: string | null; isPrimary: boolean }[];
  size?: "sm" | "md";
}) {
  const { src, altText, onError } = useProductImage(slug, images);

  const sizeClass = size === "sm" ? "w-12 h-12 lg:w-16 lg:h-16" : "w-32 h-32 lg:w-40 lg:h-40";

  return (
    <div className={`relative ${sizeClass} bg-gray-100 rounded overflow-hidden flex-shrink-0`}>
      <Image
        src={src}
        alt={altText}
        fill
        className="object-cover"
        unoptimized
        onError={onError}
      />
    </div>
  );
}

export default function ClientCart() {
  const router = useRouter();
  const [cart, setCart] = useState<CartAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);

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

  // Calculate totals
  const subtotal = cart
    ? cart.items.reduce(
        (sum, item) => sum + item.quantity * item.product.price,
        0
      )
    : 0;

  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

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
          <div
            className="mb-6 mt-6 text-left border-b-2 border-current border-b-[var(--foreground)]
                w-full sm:max-w-lg md:max-w-md lg:max-w-sm"
          >
            <h1 className="font-bold pb-6">Din kurv</h1>
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
                href="/"
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
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8 border-b border-gray-200 pb-8"
                    >
                      {/* Product Image */}
                      <CartItemImage
                        slug={item.product.slug}
                        images={item.product.images}
                        size="md"
                      />

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
                        <div className="flex items-center space-x-6">
                          <div className="text-xl font-bold">
                            DKK{" "}
                            {(item.quantity * item.product.price).toFixed(2)}
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

      {/* Right Column: Order Summary - From Checkout Page */}
      <div className="w-full lg:w-[30vw] lg:h-screen bg-gray-100 flex flex-col justify-center p-6 sm:p-8 lg:p-12 relative">
        <div className="w-full max-w-md mx-auto space-y-6 lg:space-y-8">
          <div className="text-center border-b-2 border-current border-solid border-b-gray-700 w-[80%] mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold pb-3 lg:pb-4">
              ORDER SUMMARY
            </h2>
          </div>

          {/* Cart Items */}
          <div className="space-y-3 lg:space-y-4 max-h-48 lg:max-h-60 overflow-y-auto">
            {cart &&
              cart.items.map((item) => {
                return (
                  <div
                    key={item.id}
                    className="flex items-center space-x-3 lg:space-x-4 bg-white/60 p-2 lg:p-3 rounded-lg"
                  >
                    <CartItemImage
                      slug={item.product.slug}
                      images={item.product.images}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate text-xs lg:text-sm">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-xs lg:text-sm font-semibold">
                      DKK {(item.quantity * item.product.price).toFixed(2)}
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="border-b border-gray-300"></div>

          {/* Order Totals */}
          <div className="space-y-2 lg:space-y-3">
            <div className="flex justify-between text-base lg:text-lg">
              <span>Subtotal</span>
              <span>DKK {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base lg:text-lg">
              <span>Shipping</span>
              <span>
                {shipping === 0 ? "Free" : `DKK ${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="border-b border-gray-300"></div>
            <div className="flex justify-between text-lg lg:text-xl font-bold">
              <span>Total</span>
              <span>DKK {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start space-x-2">
            <Checkbox
              isSelected={agreeTerms}
              onValueChange={setAgreeTerms}
              size="sm"
            />
            <span className="text-sm text-gray-700">
              I agree to the{" "}
              <Link href="/terms" className="underline hover:text-black">
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-black">
                Privacy Policy
              </Link>
            </span>
          </div>

          {/* Checkout Button */}
          {cart && cart.items.length > 0 && (
            <CheckoutButton
              items={cart.items.map((item) => ({
                priceId: item.product.stripePriceId,
                quantity: item.quantity,
              }))}
              isDisabled={!agreeTerms}
              isLoading={false}
              className="bg-black text-white hover:bg-gray-800 py-3 lg:py-4 text-base lg:text-lg font-semibold"
            />
          )}

          {!agreeTerms && cart && cart.items.length > 0 && (
            <p className="text-xs lg:text-sm text-red-600 text-center">
              Please agree to terms and conditions
            </p>
          )}
        </div>

        {/* Background Icon */}
        <div className="absolute bottom-4 right-4 lg:bottom-8 lg:right-8 opacity-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 lg:h-24 lg:w-24 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
