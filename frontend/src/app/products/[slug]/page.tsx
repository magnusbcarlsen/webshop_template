// src/app/product/[id]/page.tsx
"use client";

import { useParams } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';
import Link from 'next/link';

export default function ProductDetailsPage() {
  const params = useParams();
  const slug = params.slug;
  
  // Debug what's being received
  console.log("Product slug from prams:", slug, typeof slug);
  
  if (!slug) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  
  // Check if the ID is valid
  console.log("Parsed slug:", slug);
  
  if (typeof slug !== 'string' ) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Invalid product </p>
        <Link href="/" className="text-blue-500">Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="text-blue-500 mb-4 inline-block">
        &larr; Back to Products
      </Link>
      <ProductDetail slug={slug} />
    </div>
  );
}