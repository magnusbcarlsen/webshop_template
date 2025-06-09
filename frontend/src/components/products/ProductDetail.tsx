// src/components/ProductDetail.tsx
"use client";
import { ProductAPI } from "@/services/product-api";
import { normalizeImageUrl } from "@/utils/NormalizeImageUrl";
import NextImage from "next/image";
import { useState, useEffect } from "react";
import { AddToCartButton } from "./AddToCartButton";
import { Button } from "@heroui/react";

interface ProductDetailProps {
  product: ProductAPI;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [imageChecked, setImageChecked] = useState(false);

  const FALLBACK_SRC = "/NoImageAvailable.png";

  // Get primary image or first available
  const primaryImage =
    product.images?.find((img) => img.isPrimary) || product.images?.[0];

  const allImages = product.images || [];
  const currentImage = allImages[selectedImage] || primaryImage;

  // Normalize or fallback for current image
  const imageSrc = currentImage
    ? normalizeImageUrl(currentImage.imageUrl)
    : FALLBACK_SRC;
  const altText = currentImage
    ? currentImage.altText || product.name
    : `${product.name} (no image)`;

  const displayImageSrc = imageError ? FALLBACK_SRC : imageSrc;

  // Force check image availability on mount and when selectedImage changes
  useEffect(() => {
    if (!currentImage) return;

    setImageChecked(false);
    setImageError(false);

    const img = new window.Image();
    img.onload = () => {
      setImageError(false);
      setImageChecked(true);
    };
    img.onerror = () => {
      setImageError(true);
      setImageChecked(true);
    };
    img.src = imageSrc;
  }, [imageSrc, currentImage]);

  // Carousel navigation functions
  const nextImage = () => {
    if (allImages.length > 1) {
      setSelectedImage((prev) => (prev + 1) % allImages.length);
    }
  };

  const prevImage = () => {
    if (allImages.length > 1) {
      setSelectedImage(
        (prev) => (prev - 1 + allImages.length) % allImages.length
      );
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        prevImage();
      } else if (e.key === "ArrowRight") {
        nextImage();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [allImages.length]);

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Left Column: Product Images */}
      <div className="w-full lg:w-[60vw] h-[50vh] lg:h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-center items-center p-8 lg:p-12 relative">
        {/* Main Product Image with Carousel Controls */}
        <div className="relative w-full max-w-2xl h-[70%] mb-6 group">
          <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
            <NextImage
              src={displayImageSrc}
              alt={altText}
              fill
              className="object-contain"
              priority
              unoptimized
              onError={(e) => {
                console.error("Next/Image failed to load:", displayImageSrc);
                e.currentTarget.src = FALLBACK_SRC;
              }}
            />
          </div>

          {/* Carousel Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <Button
                isIconOnly
                variant="ghost"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onPress={prevImage}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Button>
              <Button
                isIconOnly
                variant="ghost"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onPress={nextImage}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
            </>
          )}

          {/* Image Counter */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {selectedImage + 1} / {allImages.length}
            </div>
          )}
        </div>

        {/* Thumbnail Images */}
        {allImages.length > 1 && (
          <div className="flex space-x-4 overflow-x-auto max-w-full pb-2">
            {allImages.map((image, index) => {
              const thumbSrc = normalizeImageUrl(image.imageUrl);
              return (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? "border-[var(--foreground)] opacity-100"
                      : "border-gray-300 hover:border-gray-400 opacity-70 hover:opacity-100"
                  }`}
                >
                  <NextImage
                    src={thumbSrc}
                    alt={image.altText || `${product.name} view ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_SRC;
                    }}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column: Product Information */}
      <div className="w-full lg:w-[40vw] h-auto lg:h-screen bg-gray-100 flex flex-col justify-center items-center p-8 lg:p-12">
        <div className="w-[80%] max-w-lg space-y-8">
          {/* Product Category */}
          {product.categories && product.categories.length > 0 && (
            <div className="text-sm font-medium text-gray-600 uppercase tracking-wide text-left">
              {product.categories[0].name}
            </div>
          )}

          {/* Product Name with underline styling like About page */}
          <div className="text-left border-b-2 border-current border-solid border-b-[var(--foreground)] w-full">
            <h1 className="text-4xl lg:text-6xl font-bold pb-6 leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="text-left space-y-4">
              <p className="leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Dimensions */}
          {product.dimensions && (
            <div className="text-left">
              <div className="inline-block p-4 bg-white/60 rounded-lg">
                <div className="font-semibold text-sm uppercase tracking-wide mb-1">
                  Dimensions
                </div>
                <div className="text-gray-700">{product.dimensions}</div>
              </div>
            </div>
          )}

          {/* Price */}
          <div className="text-left space-y-2">
            <div className="text-3xl lg:text-4xl font-bold">
              DKK {product.salePrice || product.price}
              {product.salePrice && (
                <span className="text-xl text-gray-400 line-through ml-3">
                  DKK {product.price}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="pt-4">
            <AddToCartButton productId={product.id} quantity={1} />
          </div>
        </div>
      </div>
    </div>
  );
}
