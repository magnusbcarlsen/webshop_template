import Navbar from "@/components/NavBar";
import ProductList from "@/components/ProductList";
import { fetchProducts, ProductAPI } from "@/services/product-api";

// Incremental Static Regeneration: revalidate this page every 60 seconds
export const revalidate = 60;

// SEO metadata for this page
export const metadata = {
  title: "Alle portræt produkter af Bergstrøm Art",
  keywords: [
    "portræt",
    "produkter",
    "webshop",
    "bestillingsportræt",
    "portrætmaler",
    "maleri",
  ],
  description:
    "Liste af alle malerier og portrætter til salg på webshoppen. Opdateres hvert minut for at vise de nyeste produkter.",
};

// Fallback products in case the API is unavailable
const fallbackProducts: ProductAPI[] = [
  {
    id: 1,
    category: { id: 1, name: "Portrætter" },
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

export default async function ProductsPage() {
  let products: ProductAPI[] = [];
  let error = false;

  try {
    // Use the updated fetchProducts function that now has the correct API path
    products = await fetchProducts();
  } catch (err) {
    console.error("Error fetching products:", err);
    // Use fallback data if API request fails
    products = fallbackProducts;
    error = true;
  }

  return (
    <div>
      <Navbar />
      <section className="p-8">
        <h1 className="text-2xl font-bold mb-4">Vores Produkter</h1>
        {error && (
          <div className="mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm">
            Der opstod en fejl ved indlæsning af data. Viser eksempeldata i
            stedet.
          </div>
        )}
        <ProductList products={products} />
      </section>
    </div>
  );
}
