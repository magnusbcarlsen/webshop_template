"use client";

import React, { useTransition } from "react";
import { Button } from "@heroui/react";
import { addItemToCart } from "@/services/cart-api";
import { addToast } from "@heroui/react";

interface Props {
  productId: number;
  quantity?: number;
  className?: string;
}

export function AddToCartButton({ productId, quantity = 1, className }: Props) {
  const [isPending, startTransition] = useTransition();

  const onPress = () => {
    startTransition(async () => {
      try {
        await addItemToCart(productId, quantity);

        // Show a "success" toast that links to /cart:
        addToast({
          title: "Tilføjet til kurv",
          description: (
            <span>
              Se din{" "}
              <a href="/cart" className="underline">
                kurv
              </a>
              .
            </span>
          ),
          color: "success",
        });
      } catch (err: unknown) {
        let msg = "Kunne ikke tilføje til kurv";
        if (err instanceof Error && err.message) {
          msg = err.message;
        }

        // Show an "error" toast:
        addToast({
          title: "Fejl",
          description: msg,
          color: "danger",
        });
      }
    });
  };

  return (
    <Button
      color="primary"
      variant="ghost"
      onPress={onPress}
      className={`${className} hover:text-white`}
      disabled={isPending}
    >
      {isPending ? "Tilføjer…" : "Tilføj til kurv"}
    </Button>
  );
}
