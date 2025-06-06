// src/components/ProductCard.tsx
"use client";

import Link from "next/link";
import { ProductAPI } from "@/services/product-api";
import { normalizeImageUrl } from "@/utils/NormalizeImageUrl";
import { AddToCartButton } from "./AddToCartButton";
import { Card, CardBody, CardFooter, Image } from "@heroui/react";

interface ProductCardProps {
  product: ProductAPI;
}

export function ProductCard({ product }: ProductCardProps) {
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

  return (
    <Card
      shadow="sm"
      className="
        bg-[var(--background)]
        
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
          <div className="w-full h-80 overflow-hidden rounded-t-md">
            <Image
              alt={altText}
              src={imageSrc}
              fallbackSrc="/NoImageAvailable.png"
              className="block w-full object-cover rounded-t-md"
              radius="none"
              shadow="none"
            />
          </div>
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
