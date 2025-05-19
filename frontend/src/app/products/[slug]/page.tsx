// src/app/product/[slug]/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/NavBar";
import ProductDetail from "@/components/ProductDetail";
import { fetchProductBySlug, ProductAPI } from "@/services/product-api";

// Incremental Static Regeneration: revalidate this page every 60 seconds
export const revalidate = 60;

// Define a fallback product in case the API is unavailable
const fallbackProduct: ProductAPI = {
  id: 1,
  category: { id: 1, name: "Portrætter" },
  name: "Product Not Found",
  slug: "not-found",
  description: "This product could not be loaded",
  price: 0,
  salePrice: null,
  stockQuantity: 0,
  sku: "N/A",
  weight: null,
  dimensions: null,
  isFeatured: false,
  isActive: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  images: [],
  variants: [],
};

// Dynamic metadata generation based on the product
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  let product: ProductAPI | null = null;

  try {
    product = await fetchProductBySlug(params.slug);
  } catch (error) {
    console.error(
      `Error fetching product metadata for slug: ${params.slug}`,
      error
    );
    // Continue with default metadata if product fetch fails
  }

  if (!product) {
    return {
      title: "Product Not Found | Bergstrøm Art",
      description: "The requested product could not be found.",
    };
  }

  return {
    title: `${product.name} | Bergstrøm Art`,
    description:
      product.description || `View details and purchase ${product.name}`,
    keywords: [
      product.name,
      product.category?.name || "art",
      "Bergstrøm Art",
      "portræt",
      "maleri",
      product.slug,
    ],
    openGraph: {
      title: product.name,
      description:
        product.description || `Purchase ${product.name} from Bergstrøm Art`,
      images:
        product.images && product.images.length > 0
          ? [{ url: product.images[0].imageUrl }]
          : undefined,
    },
  };
}

export default async function ProductDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  let product: ProductAPI | null = null;
  let error = false;

  try {
    product = await fetchProductBySlug(params.slug);
  } catch (err) {
    console.error(`Error fetching product with slug: ${params.slug}`, err);
    error = true;
  }

  if (!product) {
    // Use fallback if product not found
    product = fallbackProduct;
    error = true;
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="text-blue-500 mb-4 inline-block">
          &larr; Back to Products
        </Link>

        {error && (
          <div className="mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm">
            Der opstod en fejl ved indlæsning af produktet. Produktet kunne ikke
            findes.
          </div>
        )}

        <ProductDetail product={product} />
      </div>
    </div>
  );
}
