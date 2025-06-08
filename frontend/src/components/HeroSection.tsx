"use client";

import { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

export default function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Background moves slower than scroll (0 to -10px)
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -10]);

  // Text moves even slower (0 to -30px)
  const textY = useTransform(scrollYProgress, [0, 1], [0, -30]);

  return (
    <section ref={ref} className="relative h-[70vh] overflow-hidden">
      <motion.div
        style={{
          y: bgY,
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/Dina_Bergstrøm_art_kontakt.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="absolute inset-0 bg-cover bg-center"
        // 🔥 no bg-fixed, we animate y position instead!
        // ✅ combine image + overlay into one background
      />

      <motion.div
        style={{ y: textY }}
        className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 z-10"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-[var(--background)]">
          Portrætter og malerier
        </h1>
        <p className="text-xl md:text-2xl mt-4 text-[var(--background)]">
          af Bergstrøm art
        </p>
      </motion.div>
    </section>
  );
}
