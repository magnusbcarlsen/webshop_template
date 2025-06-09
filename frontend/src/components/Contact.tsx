// components/Contact.tsx
import Image from "next/image";

export default function Contact() {
  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* 
          Left pane:
          - w-full on mobile (100% width)
          - lg:w-1/2 on desktop (50% width)
          - h-auto on mobile, so it only takes as much height as its content
          - lg:h-screen on desktop, so it’s exactly 100vh
          - flex + justify-center + items-center to center the text on desktop,
            but on mobile it’s fine too (it will center within its own height).
          - py-16 on mobile gives a bit of vertical breathing room.
        */}
      <div className="w-full lg:w-1/2 h-auto lg:h-screen flex flex-col justify-center items-center bg-[var(--background)] text-[var(--foreground)] py-16">
        <div className="mb-4 text-center border-b-2 border-current border-solid border-b-[var(--foreground)] w-[50%] ">
          <h1 className="text-5xl font-bold pb-6 ">CONTACT</h1>
        </div>
        <p className="text-lg mb-4">
          <a
            href="mailto:db@styleunlimited.dk"
            className="hover:underline text-2xl"
          >
            db@styleunlimited.dk
          </a>
        </p>
        <p className="text-lg">
          <a href="tel:+4512345678" className="hover:underline text-2xl">
            +45 2361 8505
          </a>
        </p>
      </div>

      {/* Right half: full-height background image */}
      <div className="w-full lg:w-1/2 flex-1 relative">
        <Image
          src="/Dina_Bergstrøm_art_kontakt.webp"
          alt="Contact background"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>
    </div>
  );
}
