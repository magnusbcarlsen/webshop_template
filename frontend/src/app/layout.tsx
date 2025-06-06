// src/app/layout.tsx
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Metadata } from "next";
// import ClientLayoutWrapper from "./ClientLayoutWrapper";
import Navbar from "@/components/NavBar";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });
// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Portrætter lavet af Bergstrøm Art",
  description:
    "Få lavet et portræt af dig selv eller en du holder af, bestillings maleri eller portrtæt. Eller køb et færdigt maleri.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light h-full">
      <body className={` antialiased h-full flex flex-col`}>
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}

// import "./globals.css";
// import "./test.css";
// import { Providers } from "./providers";

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en" className="light h-full">
//       <body className="antialiased h-full flex flex-col">
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   );
// }
