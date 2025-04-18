import { fetchProductById } from "@/services/api";
import { useEffect, useState } from "react";


interface ProductImage {
    image_id: number;
    url: string;
    is_primary: boolean;
    sort_order: number;
  }
  
  interface ProductVariant {
    variant_id: number;
    variant_name: string;
    variant_value: string;
  }
  
  interface Product {
    product_id: number;
    name: string;
    description: string;
    price: number;
    category_name: string;
    images: ProductImage[];
    variants: ProductVariant[];
  }
  
  interface ProductDetailProps {
    productId: number;
  }

export default function ProductDetail({ productId  }: ProductDetailProps) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
        async function loadProduct() {
          try {
            const data = await fetchProductById(productId);
            setProduct(data);
            setLoading(false);
          } catch (err) {
            setError('Failed to load product details');
            setLoading(false);
            console.error(err);
          }
        }
  
      loadProduct();
    }, [productId]);
  
    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!product) return <div>Product not found</div>;   
  
    return (
        <div className="product-detail">
          <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[0].url} 
                  alt={product.name} 
                  className="w-full rounded"
                />
              ) : (
                <div className="bg-gray-200 rounded w-full h-64 flex items-center justify-center">
                  No image available
                </div>
              )}
              
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {product.images.slice(1).map(image => (
                    <img 
                      key={image.image_id} 
                      src={image.url} 
                      alt={`${product.name} view`} 
                      className="w-full h-20 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <p className="text-gray-600 mb-2">Category: {product.category_name}</p>
              <p className="text-xl font-bold mb-4">${product.price}</p>
              <p className="mb-4">{product.description}</p>
              
              {product.variants && product.variants.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-bold mb-2">Options:</h3>
                  <div className="space-y-2">
                    {product.variants.map(variant => (
                      <div key={variant.variant_id}>
                        <span className="font-medium">{variant.variant_name}:</span> {variant.variant_value}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <button className="bg-blue-500 text-white px-4 py-2 rounded">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      );
    }