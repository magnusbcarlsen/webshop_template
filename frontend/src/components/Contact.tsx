import Image from "next/image";

export default function Contact() {
  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <div className="xl:mt-0 lg:mt-15 w-full lg:w-1/2 h-auto lg:h-screen flex flex-col justify-center items-center bg-[var(--background)] text-[var(--foreground)] px-4 lg:px-8 py-8 lg:py-12">
        <div className="mb-6 text-center border-b-2 border-current border-solid border-b-[var(--foreground)] w-[70%] lg:w-[80%]">
          <h1 className="text-3xl lg:text-4xl font-bold pb-4">KONTAKT</h1>
        </div>
        <div className="text-center w-[90%] lg:w-[85%] max-w-4xl space-y-6">
          <p className="text-lg">
            <a
              href="mailto:db@styleunlimited.dk"
              className="hover:underline text-2xl"
            >
              db@styleunlimited.dk
            </a>
          </p>
          <p className="text-lg">
            <a href="tel:+4523618505" className="hover:underline text-2xl">
              +45 2361 8505
            </a>
          </p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 h-[50vh] lg:h-full relative">
        <Image
          src="/Dina_Bergstrøm_art_kontakt.webp"
          alt="Contact background"
          fill
          className="object-cover object-center"
          priority
        />
      </div>
    </div>
  );
}
