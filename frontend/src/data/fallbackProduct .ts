// fallbackProduct.ts

import { ProductAPI } from "@/services/product-api";

export const fallbackProducts: ProductAPI[] = [
  {
    id: 1,
    categories: [{ id: 1, name: "Portrætter" }],
    name: "Example Product",
    slug: "example-product",
    description: "This is a fallback product for testing",
    price: 1200,
    salePrice: null,
    stockQuantity: 10,
    sku: "EX-123",
    weight: null,
    dimensions: null,
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    images: [],
    variants: [],
  },
];
