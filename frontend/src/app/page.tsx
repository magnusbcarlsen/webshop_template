// app/page.tsx
import ProductList from "@/components/products/ProductList";
import HeroSection from "@/components/HeroSection";
import { fallbackProducts } from "@/data/fallbackProduct ";
import { ProductAPI, fetchProducts } from "@/services/product-api";

export const revalidate = 60;

export const metadata = {
  title: "Portrætter og malerier lavet af Bergstrøm Art",
  keywords: [
    "portrætter",
    "malerier",
    "kunst",
    "bestillingsmaleri",
    "portrætmaleri",
    "kunstner",
    "Dina Bergstrøm",
    "Bergstrøm Art",
    "København",
    "originalkunst",
    "unikke malerier",
  ],
  description:
    "Få lavet et portræt af dig selv eller en du holder af, bestillings maleri eller portrtæt. Eller køb et færdigt maleri.",
};

export default async function Home() {
  let products: ProductAPI[] = [];
  let error = false;

  try {
    products = await fetchProducts();
  } catch (err) {
    console.error("Error fetching products:", err);
    products = fallbackProducts;
    error = true;
  }

  return (
    <>
      <HeroSection />

      <div>
        <section className="text-center p-8">
          <h2 className="text-2xl font-bold m-10">Malerier og portrætter</h2>
          {error && (
            <div className="mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-center">
              Der opstod en fejl ved indlæsning af data. Viser eksempeldata i
              stedet.
            </div>
          )}
          <ProductList products={products} />
        </section>
      </div>
    </>
  );
}
