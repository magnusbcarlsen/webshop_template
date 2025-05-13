import { fetchProductBySlug, ProductAPI } from "@/services/product-api";
import { useEffect, useState } from "react";

interface ProductDetailProps {
  slug: string;
}

export default function ProductDetail({ slug }: ProductDetailProps) {
  const [product, setProduct] = useState<ProductAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   async function loadProduct() {
  //     try {
  //       const data = await fetchProductById(productId);
  //       setProduct(data);
  //       setLoading(false);
  //     } catch (err) {
  //       setError('Failed to load product details');
  //       setLoading(false);
  //       console.error(err);
  //     }
  //   }

  //   loadProduct();
  // }, [productId]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchProductBySlug(slug)
      .then((data) => {
        setProduct(data);
        setError(null);
      })
      .catch((err) => {
        setError("Failed to load product details");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!product) return <div>Product not found</div>;

  // Get primary image or first available
  const primaryImage =
    product.images.find((img) => img.isPrimary) || product.images[0];

  return (
    <div className="product-detail">
      <h1 className="text-2xl font-bold mb-4">{product.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {product.images && product.images.length > 0 ? (
            <img
              src={primaryImage?.imageUrl}
              alt={primaryImage?.altText || product.name}
              className="w-full rounded"
            />
          ) : (
            <div className="bg-gray-200 rounded w-full h-64 flex items-center justify-center">
              No image available
            </div>
          )}

          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {product.images
                .filter((img) => !img.isPrimary)
                .map((image) => (
                  <img
                    key={image.id}
                    src={image.imageUrl}
                    alt={image.altText || `${product.name} view`}
                    className="w-full h-20 object-cover rounded"
                  />
                ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-gray-600 mb-2">
            Category: {product.category?.name || "Uncategorized"}
          </p>
          <p className="text-xl font-bold mb-4">${product.price}</p>
          {product.salePrice && (
            <p className="text-red-500 mb-4">Sale: ${product.salePrice}</p>
          )}
          <p className="mb-4">{product.description}</p>

          {product.variants && product.variants.length > 0 && (
            <div className="mb-4">
              <h3 className="font-bold mb-2">Options:</h3>
              <div className="space-y-2">
                {product.variants.map((variant) => (
                  <div key={variant.id}>
                    <span className="font-medium">Variant {variant.id}:</span> $
                    {variant.price}
                    {variant.stockQuantity > 0 ? (
                      <span className="text-green-500 ml-2">
                        In Stock ({variant.stockQuantity})
                      </span>
                    ) : (
                      <span className="text-red-500 ml-2">Out of Stock</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className="bg-[var(--primary-color)] text-white px-4 py-2 rounded">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
