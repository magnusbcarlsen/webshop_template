// src/components/AddToCartButton.tsx
"use client";

import React, { useTransition } from "react";
import { toast } from "react-toastify";
import { addItemToCart } from "@/services/cart-api";

interface Props {
  productId: number;
  quantity?: number;
  className?: string;
}

export function AddToCartButton({ productId, quantity = 1, className }: Props) {
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      try {
        await addItemToCart(productId, quantity);
        toast.success("Added to cart!");
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err);
          toast.error(err.message || "Couldn’t add to cart");
        }
      }
    });
  };

  return (
    <button
      onClick={onClick}
      disabled={isPending}
      className={
        className ??
        "bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
      }
    >
      {isPending ? "Adding…" : "Add to Cart"}
    </button>
  );
}
