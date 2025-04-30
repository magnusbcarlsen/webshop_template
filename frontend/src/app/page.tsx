import Navbar from "@/components/NavBar";
import ProductList from "@/components/ProductList";


export default function Home() {
  return (
    <div className="">
      <main className="bg-[var(--background)]">

        <Navbar />
       
        <ProductList />
        
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
       
      </footer>
    </div>
  );
}
