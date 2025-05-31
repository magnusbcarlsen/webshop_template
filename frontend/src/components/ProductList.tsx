// src/components/ProductList.tsx
import Link from "next/link";
import { ProductAPI } from "@/services/product-api";
import { normalizeImageUrl } from "@/utils/NormalizeImageUrl";
// import { addToCartAction } from "@/actions/cartActions";
import { AddToCartButton } from "./AddToCartButton";
import Image from "next/image";

interface ProductListProps {
  products: ProductAPI[];
}

export default function ProductList({ products }: ProductListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => {
        // For each product, find its primary image (or fall back to the first)
        const primaryImage =
          product.images?.find((img) => img.isPrimary) || product.images?.[0];

        return (
          <article
            key={product.id}
            className="border p-4 rounded-lg flex flex-col justify-between"
          >
            {product.images && product.images.length > 0 && primaryImage ? (
              <div className="relative w-full h-64">
                <Image
                  src={normalizeImageUrl(primaryImage.imageUrl)}
                  alt={primaryImage.altText || product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover rounded"
                  priority={false}
                  unoptimized
                />
              </div>
            ) : (
              <div className="bg-gray-200 rounded w-full h-64 flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}

            <div className="mt-4">
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="text-sm text-gray-500">
                {product.categories.length > 0
                  ? product.categories[0].name
                  : "Uncategorized"}
              </p>
              <p className="text-sm">
                Categories:{" "}
                {product.categories.length > 0
                  ? product.categories.map((c) => c.name).join(" • ")
                  : "—"}
              </p>
              <p className="mt-2 font-bold">${product.price}</p>
            </div>

            <div className="mt-4 flex space-x-2">
              <Link
                href={`/products/${product.slug}`}
                className="flex-1 text-center py-2 border rounded text-blue-600 hover:underline"
              >
                View Details
              </Link>

              <AddToCartButton productId={product.id} quantity={1} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
