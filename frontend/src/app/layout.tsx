// src/app/layout.tsx
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Metadata } from "next";
// import ClientLayoutWrapper from "./ClientLayoutWrapper";
import Navbar from "@/components/NavBar";
import Footer from "@/components/footer";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Portrætter lavet af Bergstrøm Art",
  description:
    "Få lavet et portræt af dig selv eller en du holder af, bestillings maleri eller portrtæt. Eller køb et færdigt maleri.",
  keywords: [
    "portræt",
    "portrætter",
    "portrætmaleri",
    "portrætmaler",
    "maleri",
    "maler",
    "kunst",
    "unik kunst",
    "unik maleri",
    "unik kunstner",
    "unik kunstmaler",
    "kunstner",
    "kunstmaler",
    "kunstmaleri",
    "bestillingsmaleri",
    "bestillingsportræt",
    "bestillingskunst",
    "bestillingskunstmaleri",
    "bestillingskunstner",
    "bestillingsportrætmaler",
    "bestillingsportrætmaleri",
    "portrætkunst",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da" className={`${inter.variable} h-full`}>
      <body className={`light h-full flex flex-col`}>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
