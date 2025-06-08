import ProductList from "@/components/products/ProductList";
import { fallbackProducts } from "@/data/fallbackProduct ";
import { ProductAPI, fetchProducts } from "@/services/product-api";
import Image from "next/image";

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

// app/page.tsx
export default async function Home() {
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
    <>
      <section className="relative h-[70vh] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-fixed bg-center bg-cover"
          style={{ backgroundImage: "url('/Dina_Bergstrøm_art_kontakt.jpg')" }}
        ></div>

        <div className="fixed inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-[var(--background)]">
            Portrætter og malerier
          </h1>
          <p className="text-xl md:text-2xl mt-4 text-[var(--background)]">
            af Bergstrøm art
          </p>
        </div>
      </section>

      <div>
        <section className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Malerier og portrætter</h2>
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
