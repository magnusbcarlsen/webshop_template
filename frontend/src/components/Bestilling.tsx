import Image from "next/image";

export default function Bestilling() {
  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <div className="xl:mt-0 lg:mt-15 w-full lg:w-1/2 h-auto lg:h-screen flex flex-col justify-center items-center bg-[var(--background)] text-[var(--foreground)] px-4 lg:px-8 py-8 lg:py-12">
        <div className="mb-6 text-center border-b-2 border-current border-solid border-b-[var(--foreground)] w-[70%] lg:w-[80%]">
          <h1 className="text-3xl lg:text-4xl font-bold pb-4">
            Få malet dit eget portræt
          </h1>
        </div>
        <div className="text-left w-[90%] lg:w-[85%] max-w-4xl space-y-4">
          <p>
            Jeg har altid været fascineret af mennesker. Personlighed. Kant.
            Attitude. Udstråling. Og især hvad der gemmer sig bag facaden. Alt
            det, der udgør essensen i en personlighed.
          </p>
          <p>
            Det vil jeg gerne give min fortolkning af. Filtreret gennem
            sanserne, udtrykt på et lærred.
          </p>
          <p>
            Derfor er det vigtigt, at få en fornemmelse af det/de mennesker, jeg
            portrætterer. Vi starter med et foto shoot, der indeholder en
            personlig samtale inden jeg starter. Jeg tester vinkler og udfordrer
            udtrykket. Her tuner jeg mig ind på en stemning. En følelse, et
            udtryk, som er min egen personlige feeling.
          </p>
          <p>
            Til sidst udvælger vi i fællesskab det bedste billede, som jeg maler
            portrættet efter.
          </p>
          <p>
            Hvis billedet skal være en overraskelse til den portrætterede,
            finder vi selvfølgelig en løsning på det udfra eksisterende
            billeder.
          </p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 h-[50vh] lg:h-full relative">
        <Image
          src="/bestillings_portraet.png"
          alt="Bestil dit eget portræt - Dina Bergstrøm Art"
          fill
          className="object-cover object-center"
          priority
        />
      </div>
    </div>
  );
}
