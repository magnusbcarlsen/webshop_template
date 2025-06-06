// app/contact/page.tsx

import Contact from "@/components/Contact";

export const metadata = {
  title: "Contact",
  description: "kontakt Bergstrøm art",
  keywords: [
    "portræt",
    "kontakt",
    "webshop",
    "bestillingsportræt",
    "portrætmaler",
    "maleri",
  ],
};

export default function ContactPage() {
  return (
    <div className="flex flex-col h-full">
      <Contact />
    </div>
  );
}
