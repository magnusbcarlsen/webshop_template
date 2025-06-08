// src/components/ProductList.tsx
"use client";

import { ProductAPI } from "@/services/product-api";
import { ProductCard } from "./ProductCard";

interface ProductListProps {
  products: ProductAPI[];
}

export default function ProductList({ products }: ProductListProps) {
  return (
    <div className="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
