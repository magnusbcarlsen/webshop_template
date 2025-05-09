// frontend/src/app/products/page.tsx
"use client";

import { fetchProducts, ProductAPI } from "@/services/product-api";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetchProducts()
      .then((data) => setProducts(data))
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <section className="p-8">
      <h1 className="text-2xl font-bold mb-4">Our Products</h1>
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
    </section>
  );
}
