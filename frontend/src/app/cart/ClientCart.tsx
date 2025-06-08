"use client";

// src/app/cart/ClientCart.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardBody, Button, Input, Checkbox } from "@heroui/react";
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
      {/* ─────────────────────────────────────────────
               Page Title
      ───────────────────────────────────────────── */}
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      {/* ─────────────────────────────────────────────
               Error Message (if any)
      ───────────────────────────────────────────── */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          <p>Error: {error}</p>
        </div>
      )}

      {/* ─────────────────────────────────────────────
               Empty Cart Link
      ───────────────────────────────────────────── */}
      {cart && cart.items.length === 0 ? (
        <p>
          Your cart is empty.{" "}
          <Link href="/products" className="text-blue-600 hover:underline">
            Continue shopping
          </Link>
          .
        </p>
      ) : (
        cart && (
          <div className="flex flex-col md:flex-row md:space-x-8">
            {/* ─────────────────────────────────────────────
                   Left Column: Item List + “Add a note”
            ───────────────────────────────────────────── */}
            <div className="flex-1 space-y-6">
              {/* ─── Table Headers (Desktop Only) ─── */}
              <div className="hidden md:flex justify-between border-b pb-2">
                <div className="w-2/5">
                  <p className="text-sm font-semibold text-gray-600">PRODUCT</p>
                </div>
                <div className="w-1/5 text-center">
                  <p className="text-sm font-semibold text-gray-600">PRICE</p>
                </div>
                <div className="w-1/5 text-center">
                  <p className="text-sm font-semibold text-gray-600">QTY</p>
                </div>
                <div className="w-1/5 text-right">
                  <p className="text-sm font-semibold text-gray-600">TOTAL</p>
                </div>
              </div>

              {/* ─── Cart Items ─── */}
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

                // DEBUG: see exactly which URL we're loading
                console.log("ClientCart: loading thumbnail →", imageSrc);

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-4"
                  >
                    {/* ── Product Column: Thumbnail + Details ── */}
                    <div className="flex items-center space-x-4 w-full sm:w-2/5 mb-3 sm:mb-0">
                      <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden">
                        <Image
                          src={imageSrc}
                          alt={altText}
                          width={64}
                          height={64}
                          className="object-cover"
                          unoptimized
                          onError={() =>
                            console.error(
                              "Next/Image failed to load:",
                              imageSrc
                            )
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
                        {/* SKU, size, color (if available) */}
                        {item.product.sku && (
                          <p className="text-xs text-gray-500">
                            #{item.product.sku}
                          </p>
                        )}
                        {item.product.dimensions && (
                          <p className="text-xs text-gray-500">
                            Size: {item.product.dimensions}
                          </p>
                        )}
                        {/* {item.product.color && (
                          <p className="text-xs text-gray-500">
                            Color: {item.product.color}
                          </p>
                        )} */}
                      </div>
                    </div>

                    {/* ── Pricing & Quantity Details ── */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center w-full sm:w-3/5">
                      {/* Price */}
                      <div className="w-1/2 sm:w-1/5 text-left sm:text-center mb-2 sm:mb-0">
                        <p className="text-sm font-semibold">
                          ${item.product.price}
                        </p>
                      </div>

                      {/* Quantity (without buttons) */}
                      <div className="w-1/2 sm:w-1/5 text-left sm:text-center mb-2 sm:mb-0">
                        <p className="text-sm">Qty: {item.quantity}</p>
                      </div>

                      {/* Total */}
                      <div className="w-1/2 sm:w-1/5 text-left sm:text-right mb-2 sm:mb-0">
                        <p className="text-sm font-semibold">
                          ${item.quantity * item.product.price}
                        </p>
                      </div>

                      {/* Remove “X” Button */}
                      <div className="w-1/2 sm:w-auto text-left sm:text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          color="danger"
                          onPress={() => handleDeleteitem(item.id)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* ─────────────────────────────────────────────
                       “Add a note” Input
              ───────────────────────────────────────────── */}
              <div className="pt-4">
                <p className="text-sm text-gray-600 mb-1">Add a note</p>
                <Input
                  placeholder="Some words to In House team"
                  size="md"
                  className="max-w-md"
                />
              </div>
            </div>

            {/* ─────────────────────────────────────────────
                   Right Column: Summary & Checkout Card
            ───────────────────────────────────────────── */}
            <Card
              className="
                w-full
                h-auto
                mb-6
                bg-pink-50
                relative

                md:w-[35vw]
                md:h-screen
                md:mb-0
                md:sticky
                md:top-0
              "
            >
              <CardBody className="space-y-4 p-6">
                {/* ── Cart Total ── */}
                <div>
                  <div className="flex justify-between items-baseline">
                    <p className="text-gray-500">Cart Total</p>
                    <p className="text-lg font-bold">
                      $
                      {cart.items.reduce(
                        (sum, item) => sum + item.quantity * item.product.price,
                        0
                      )}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Shipping & taxes calculated at checkout
                  </p>
                </div>

                <hr />

                {/* ── Terms & Conditions Checkbox ── */}
                <div>
                  <Checkbox size="sm">
                    <span className="text-xs text-gray-700">
                      I agree to{" "}
                      <Link href="/terms" className="underline">
                        Terms &amp; Conditions
                      </Link>
                    </span>
                  </Checkbox>
                </div>

                {/* ── Checkout Button ── */}
                <Button
                  variant="solid"
                  size="md"
                  fullWidth
                  className="bg-black text-white"
                  onPress={() => {
                    window.location.href = "/checkout";
                  }}
                >
                  CHECKOUT
                </Button>

                {/* ── PayPal Button (commented out—you can re-enable if needed) ── */}
                {/*
                <Button
                  variant="light"
                  size="md"
                  fullWidth
                  className="border border-gray-300"
                  onPress={() => {
                    console.log("PayPal checkout");
                  }}
                >
                  <img src="/paypal-logo.png" alt="PayPal" className="h-5" />
                </Button>
                */}

                {/* ── Faded Shopping‐Bag Icon (background) ── */}
                <div className="absolute bottom-4 right-4 opacity-10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-20 w-20 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M5 6h14l-1.5 14h-11L5 6z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 10V6a3 3 0 016 0v4"
                    />
                  </svg>
                </div>
              </CardBody>
            </Card>
          </div>
        )
      )}
    </div>
  );
}

// "use client";

// // src/app/cart/ClientCart.tsx
// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { CartAPI, removeItemFromCart } from "@/services/cart-api";
// import { normalizeImageUrl } from "@/utils/NormalizeImageUrl";

// export default function ClientCart() {
//   const [cart, setCart] = useState<CartAPI | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Fallback under /public folder:
//   const FALLBACK_SRC = "/NoImageAvailable.png";

//   useEffect(() => {
//     async function loadCart() {
//       try {
//         const response = await fetch("/api/carts/items", {
//           credentials: "include",
//           cache: "no-store",
//         });
//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const data = await response.json();
//         setCart(data);
//       } catch (err) {
//         console.error("Failed to load cart:", err);
//         setError(
//           `Failed to load your cart: ${
//             err instanceof Error ? err.message : String(err)
//           }`
//         );
//       } finally {
//         setLoading(false);
//       }
//     }
//     loadCart();
//   }, []);

//   async function handleDeleteitem(id: number) {
//     try {
//       const updated = await removeItemFromCart(id);
//       setCart(updated);
//     } catch (err) {
//       console.error("Failed to remove item from cart:", err);
//       setError(
//         `Failed to remove item from cart: ${
//           err instanceof Error ? err.message : String(err)
//         }`
//       );
//     }
//   }

//   if (loading) {
//     return <div className="max-w-4xl mx-auto p-4">Loading your cart...</div>;
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

//       {error && (
//         <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
//           Error: {error}
//         </div>
//       )}

//       {cart && cart.items.length === 0 ? (
//         <p>
//           Your cart is empty.{" "}
//           <Link href="/products" className="text-blue-600 hover:underline">
//             Continue shopping
//           </Link>
//           .
//         </p>
//       ) : cart ? (
//         <div className="space-y-4">
//           {cart.items.map((item) => {
//             // 1) Find a “primary” image, or the first one in the array, or null
//             const primaryImage =
//               item.product.images?.find((img) => img.isPrimary) ||
//               item.product.images?.[0] ||
//               null;

//             // 2) Normalize or fallback
//             const imageSrc = primaryImage
//               ? normalizeImageUrl(primaryImage.imageUrl)
//               : FALLBACK_SRC;

//             // 3) Alt text
//             const altText = primaryImage
//               ? primaryImage.altText || item.product.name
//               : `${item.product.name} (no image)`;

//             // ─── DEBUGGING: log exactly which URL we're trying to load ───
//             console.log("ClientCart: loading thumbnail →", imageSrc);

//             return (
//               <div
//                 key={item.id}
//                 className="flex justify-between items-center border-b pb-2"
//               >
//                 {/* Left side: thumbnail + name/quantity */}
//                 <div className="flex items-center space-x-4">
//                   <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden">
//                     <Image
//                       src={imageSrc}
//                       alt={altText}
//                       width={64}
//                       height={64}
//                       className="object-cover"
//                       unoptimized
//                       onError={() =>
//                         console.error("Next/Image failed to load:", imageSrc)
//                       }
//                     />
//                   </div>

//                   <div>
//                     <Link
//                       href={`/products/${item.product.slug}`}
//                       className="text-lg font-medium hover:underline"
//                     >
//                       {item.product.name}
//                     </Link>
//                     <p className="text-sm text-gray-500">
//                       Quantity: {item.quantity}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Middle: price */}
//                 <div className="text-right">
//                   <p className="font-semibold">
//                     ${(item.quantity * item.product.price).toFixed(2)}
//                   </p>
//                 </div>

//                 {/* Right: remove button */}
//                 <button
//                   onClick={() => handleDeleteitem(item.id)}
//                   className="text-red-600 hover:text-red-800 ml-4"
//                 >
//                   Remove
//                 </button>
//               </div>
//             );
//           })}

//           {/* Cart total */}
//           <div className="flex justify-end mt-4">
//             <p className="text-xl font-bold">
//               Total: $
//               {cart.items
//                 .reduce(
//                   (sum, item) => sum + item.quantity * item.product.price,
//                   0
//                 )
//                 .toFixed(2)}
//             </p>
//           </div>

//           {/* Checkout button */}
//           <div className="flex justify-end mt-2">
//             <Link
//               href="/checkout"
//               className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
//             >
//               Proceed to Checkout
//             </Link>
//           </div>
//         </div>
//       ) : null}
//     </div>
//   );
// }
