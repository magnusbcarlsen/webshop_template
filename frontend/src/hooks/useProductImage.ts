"use client";

import { useState, useEffect } from "react";
import { normalizeImageUrl } from "@/utils/NormalizeImageUrl";

export const FALLBACK_IMAGE = "/NoImageAvailable.png";

const LOCAL_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif", "gif", "svg"];

interface ProductImageEntry {
  imageUrl: string;
  altText: string | null;
  isPrimary: boolean;
}

function tryLoadImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

/**
 * Resolves the best available image for a product.
 *
 * Priority:
 *  1. Database / R2 image (via normalizeImageUrl)
 *  2. Local static file at /product-images/{slug}.{ext}
 *  3. Fallback placeholder
 */
export function useProductImage(
  slug: string,
  images?: ProductImageEntry[],
  selectedIndex = 0,
) {
  const [src, setSrc] = useState(FALLBACK_IMAGE);
  const [loaded, setLoaded] = useState(false);

  const allImages = images ?? [];
  const primaryImage =
    allImages.find((img) => img.isPrimary) || allImages[0] || null;
  const currentImage = allImages[selectedIndex] ?? primaryImage;

  const dbSrc = currentImage ? normalizeImageUrl(currentImage.imageUrl) : null;
  const altText = currentImage
    ? currentImage.altText || slug
    : `${slug} (no image)`;

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    const resolve = async () => {
      // 1. Try database / R2 image
      if (dbSrc && (await tryLoadImage(dbSrc))) {
        if (!cancelled) { setSrc(dbSrc); setLoaded(true); }
        return;
      }

      // 2. Try local static files across all common formats
      for (const ext of LOCAL_EXTENSIONS) {
        const localPath = `/product-images/${slug}.${ext}`;
        if (await tryLoadImage(localPath)) {
          if (!cancelled) { setSrc(localPath); setLoaded(true); }
          return;
        }
      }

      // 3. Fallback
      if (!cancelled) { setSrc(FALLBACK_IMAGE); setLoaded(true); }
    };

    setLoaded(false);
    resolve();

    return () => { cancelled = true; };
  }, [dbSrc, slug, selectedIndex]);

  const onError = () => setSrc(FALLBACK_IMAGE);

  return { src, altText, loaded, onError };
}
