import Navbar from "@/components/NavBar";

export default function Home() {
  return (
    <div className="">
      <main className="bg-[var(--background)]">
        <Navbar />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
    </div>
  );
}
