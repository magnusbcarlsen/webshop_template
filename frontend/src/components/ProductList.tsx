"use client";

import { fetchProducts } from "@/services/api";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Product{
  product_id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string;
  price: string; // Note: the JSON has this as a string, not a number
  sale_price: string | null;
  stock_quantity: number;
  sku: string;
  weight: string;
  dimensions: string;
  is_featured: number;
  is_active: number;
  created_at: string;
  updated_at: string;
  category_name: string;
  // These might be undefined in your current API response
  // images?: ProductImage[];
  // variants?: ProductVariant[];
}

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      async function loadProducts() {
        try {
          const data = await fetchProducts();
          setProducts(data);
          setLoading(false);
        } catch (err) {
          setError('Failed to load products');
          setLoading(false);
          console.error(err);
        }
      }
  
      loadProducts();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;   

    return (
        <div className="product-list">
          <h1>Our Products</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.product_id} className="border p-4 rounded">
                <h2 className="text-lg font-bold">{product.name}</h2>
                <p className="text-gray-600">{product.category_name}</p>
                <p className="mt-2">${product.price}</p>
                <Link href={`/products/${product.product_id}`} className="mt-2 text-blue-500">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      );
    }

