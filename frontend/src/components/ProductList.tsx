// src/components/ProductList.tsx
import Link from "next/link";
import { ProductAPI } from "@/services/product-api";
import { addToCartAction } from "@/actions/cartActions";

interface ProductListProps {
  products: ProductAPI[];
}

export default function ProductList({ products }: ProductListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <article
          key={product.id}
          className="border p-4 rounded-lg flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-sm text-gray-500">
              {product.category?.name ?? "Uncategorized"}
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

            <form
              action={addToCartAction}
              className="flex-1"
              suppressHydrationWarning
            >
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="quantity" value="1" />
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
              >
                Add to Cart
              </button>
            </form>
          </div>
        </article>
      ))}
    </div>
  );
}
