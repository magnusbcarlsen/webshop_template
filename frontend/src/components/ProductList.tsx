// src/components/ProductList.tsx
import Link from "next/link";
import { ProductAPI } from "@/services/product-api";

interface ProductListProps {
  products: ProductAPI[];
}

export default function ProductList({ products }: ProductListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((p) => (
        <article key={p.id} className="border p-4 rounded-lg">
          <h2 className="text-lg font-medium">{p.name}</h2>
          <p className="text-sm text-gray-500">
            {p.category?.name ?? "Uncategorized"}
          </p>
          <p className="mt-2 font-semibold">${p.price}</p>
          <Link
            href={`/products/${p.slug}`}
            className="inline-block mt-3 text-blue-500 hover:underline"
          >
            View Details
          </Link>
        </article>
      ))}
    </div>
  );
}
