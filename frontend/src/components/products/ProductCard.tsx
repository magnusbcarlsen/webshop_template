// src/components/ProductCard.tsx
"use client";

import Link from "next/link";
import { ProductAPI } from "@/services/product-api";
import { normalizeImageUrl } from "@/utils/NormalizeImageUrl";
import { AddToCartButton } from "./AddToCartButton";
import { Card, CardBody, CardFooter } from "@heroui/react";
import { useState, useEffect } from "react";

interface ProductCardProps {
  product: ProductAPI;
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageChecked, setImageChecked] = useState(false);

  // ─── Find primary image or fallback ───
  const primaryImage =
    product.images?.find((img) => img.isPrimary) || product.images?.[0] || null;

  // Normalize or fallback:
  const imageSrc = primaryImage
    ? normalizeImageUrl(primaryImage.imageUrl)
    : "/NoImageAvailable.png";
  const altText = primaryImage
    ? primaryImage.altText || product.name
    : `${product.name} (no image)`;

  const displayImageSrc = imageError ? "/NoImageAvailable.png" : imageSrc;

  // Force check image availability on mount
  useEffect(() => {
    if (!primaryImage || imageChecked) return;

    const img = new Image();
    img.onload = () => {
      setImageError(false);
      setImageChecked(true);
    };
    img.onerror = () => {
      setImageError(true);
      setImageChecked(true);
    };
    img.src = imageSrc;
  }, [imageSrc, primaryImage, imageChecked]);

  return (
    <Card
      className="
        bg-[var(--background)]
        shadow-none
        rounded-md
        transform
        transition-transform ease-in-out duration-200
        hover:scale-105
        hover:shadow-lg
        group
      "
    >
      {/* Card Body: clickable image → product detail */}
      <CardBody className="overflow-hidden p-0">
        <Link href={`/products/${product.slug}`} className="block w-full">
          <div
            className="w-full h-80 overflow-hidden rounded-t-md bg-cover bg-center bg-no-repeat bg-gray-100"
            style={{
              backgroundImage: `url(${displayImageSrc})`,
            }}
            role="img"
            aria-label={altText}
          />
        </Link>
      </CardBody>

      {/* Card Footer: title, price, AddToCartButton */}
      <CardFooter className="flex flex-col space-y-2 p-4">
        {/* Row 1: Product Name */}
        <div>
          <Link
            href={`/products/${product.slug}`}
            className="text-lg font-semibold hover:underline"
          >
            {product.name}
          </Link>
        </div>

        {/* Row 2: Product Price */}
        <div>
          <p className="text-default-500 font-semibold">DKK {product.price}</p>
        </div>

        {/* Row 3: Add To Cart Button */}
        <AddToCartButton productId={product.id} quantity={1} />
      </CardFooter>
    </Card>
  );
}
