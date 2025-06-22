// components/HeroSection.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let ticking = false;

    const updateScrollY = () => {
      setScrollY(window.pageYOffset);
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollY);
        ticking = true;
      }
    };

    window.addEventListener("scroll", requestTick);

    return () => window.removeEventListener("scroll", requestTick);
  }, []);

  const scrollToNextSection = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: window.innerHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="relative h-[100vh] w-full overflow-hidden">
      {/* Text overlay */}
      <div
        className="absolute inset-0 z-10  flex flex-col items-center justify-center text-center px-4"
        style={{
          transform: `translate3d(0, ${scrollY * -0.05}px, 0)`,
        }}
      >
        <h1 className="!text-white text-4xl md:text-6xl font-bold">
          Portrætter og malerier
        </h1>
        <p className="!text-white text-xl md:text-2xl mt-4">af Bergstrøm art</p>
        <Link href="/bestilling">
          <Button
            variant="solid"
            color="primary"
            size="lg"
            className="mt-9 text-white hover:text-white"
            style={{
              transform: `translate3d(0, ${scrollY * -0.05}px, 0)`,
            }}
          >
            Bestil et maleri eller portræt
          </Button>
        </Link>
      </div>

      {/* Background image with reduced parallax */}
      <div
        className="absolute bg-center bg-cover"
        style={{
          backgroundImage: "url('/Dina_Bergstrøm_art_hero_image.webp')",
          transform: `translate3d(0, ${scrollY * 0.3}px, 0)`,
          willChange: "transform",
          top: "-20%",
          left: 0,
          right: 0,
          bottom: "-20%",
        }}
      />

      {/* Scroll down arrow */}
      <button
        onClick={scrollToNextSection}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 text-white hover:text-gray-300 transition-colors duration-200"
        style={{
          transform: `translate(-50%, ${scrollY * 0.02}px)`,
        }}
        aria-label="Scroll to next section"
      >
        <ChevronDown size={32} className="animate-bounce" />
      </button>
    </section>
  );
}
