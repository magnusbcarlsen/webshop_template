// src/app/product/[id]/page.tsx
"use client";

import { useParams } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';
import Link from 'next/link';

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params.id;
  
  // Debug what's being received
  console.log("Product ID from params:", id, typeof id);
  
  if (!id) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  const productId = parseInt(id as string, 10);
  
  // Check if the ID is valid
  console.log("Parsed product ID:", productId);
  
  if (isNaN(productId) || productId <= 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Invalid product ID: {id}</p>
        <Link href="/" className="text-blue-500">Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="text-blue-500 mb-4 inline-block">
        &larr; Back to Products
      </Link>
      <ProductDetail productId={productId} />
    </div>
  );
}