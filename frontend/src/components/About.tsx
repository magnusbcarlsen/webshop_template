import Image from "next/image";

export default function About() {
  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <div className="w-full lg:w-1/2 h-[80vh] lg:h-screen relative">
        <Image
          src="/About_Dina_bergstrøm_art_portræt.jpg"
          alt="Om Dina Bergstrøm Art"
          fill
          className="object-cover object-[50%_30%] lg:object-center"
          priority
        />
      </div>
      <div className="xl:mt-0 lg:mt-15 w-full lg:w-1/2 h-auto lg:h-screen flex flex-col justify-center items-center bg-[var(--background)] text-[var(--foreground)] px-4 lg:px-8 py-8 lg:py-12">
        <div className="mb-6 text-center border-b-2 border-current border-solid border-b-[var(--foreground)] w-[70%] lg:w-[80%]">
          <h1 className="text-3xl lg:text-4xl font-bold pb-4">
            OM BERGSTRØM ART
          </h1>
        </div>
        <div className="text-left w-[90%] lg:w-[85%] max-w-4xl space-y-4">
          <p>
            Jeg bor og maler på Vesterbro i København Jeg har gennem hele livet
            brugt min kreative hjerne i mange forskellige discipliner som
            tegning, tekstiltryk, tøjdesign, som stylist og indenfor innovation.
          </p>
          <p>
            Men det er i maleriet jeg endelig føler mig ægte hjemme. Jeg
            navigerer gennem min kunstverden med et skræddersyet dogme for hvert
            maleri. Det er ikke bare portrætter; det er eksperimenter i farver
            og form, hvor jeg konsekvent udfordrer mine egne grænser og regler.
          </p>
          <p>
            Hvert maleri har sit eget sæt af teknikker og redskaber, som jeg
            omhyggeligt vælger for at forme en unik fortælling. Jeg stræber
            efter at fange et øjeblik, hvor følelserne er intense eller måske
            netop det øjeblik, hvor mange døre åbner sig. Min intuitive tilgang
            til maleriet bringer ofte stærke farver i spil og jeg insisterer på
            at videregive positiv energi. Velkommen til min verden af
            portrætter.
          </p>
        </div>
      </div>
    </div>
  );
}
