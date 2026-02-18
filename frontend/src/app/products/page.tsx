// products/page.tsx

import ProductList from "@/components/products/ProductList";
import { fallbackProducts } from "@/data/fallbackProduct ";
import { fetchProducts, ProductAPI } from "@/services/product-api";

export const dynamic = "force-dynamic";
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
