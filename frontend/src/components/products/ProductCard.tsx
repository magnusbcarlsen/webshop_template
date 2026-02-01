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

const FALLBACK_IMAGE = "/NoImageAvailable.png";

export function ProductCard({ product }: ProductCardProps) {
  const [displayImageSrc, setDisplayImageSrc] = useState<string>(FALLBACK_IMAGE);
  const [imageChecked, setImageChecked] = useState(false);

  // ─── Find primary image or fallback ───
  const primaryImage =
    product.images?.find((img) => img.isPrimary) || product.images?.[0] || null;

  // Database image URL (from MinIO)
  const databaseImageSrc = primaryImage
    ? normalizeImageUrl(primaryImage.imageUrl)
    : null;

  const altText = primaryImage
    ? primaryImage.altText || product.name
    : `${product.name} (no image)`;

  // Local static image paths (supports both .jpg and .jpeg)
  const localImageJpg = `/product-images/${product.slug}.jpg`;
  const localImageJpeg = `/product-images/${product.slug}.jpeg`;

  // Cascading fallback: local .jpg → local .jpeg → database image → placeholder
  useEffect(() => {
    if (imageChecked) return;

    const tryLoadImage = (src: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = src;
      });
    };

    const loadImage = async () => {
      // 1. Try local .jpg first
      if (await tryLoadImage(localImageJpg)) {
        setDisplayImageSrc(localImageJpg);
        setImageChecked(true);
        return;
      }

      // 2. Try local .jpeg
      if (await tryLoadImage(localImageJpeg)) {
        setDisplayImageSrc(localImageJpeg);
        setImageChecked(true);
        return;
      }

      // 3. Try database image (MinIO)
      if (databaseImageSrc && await tryLoadImage(databaseImageSrc)) {
        setDisplayImageSrc(databaseImageSrc);
        setImageChecked(true);
        return;
      }

      // 4. Use fallback placeholder
      setDisplayImageSrc(FALLBACK_IMAGE);
      setImageChecked(true);
    };

    loadImage();
  }, [localImageJpg, localImageJpeg, databaseImageSrc, imageChecked]);

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
