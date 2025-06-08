import About from "@/components/About";

export const metadata = {
  title: "Om Bergstrøm Art",
  description: "om Bergstrøm Art og passionen for kunst og portrætmaleri",
  keywords: [
    "om",
    "om Bergstrøm Art",
    "kunst",
    "portrætmaler",
    "maleri",
    "webshop",
    "bestillingsportræt",
  ],
};

export default function AboutPage() {
  return (
    <div className="flex flex-col h-screen">
      <About />
    </div>
  );
}
