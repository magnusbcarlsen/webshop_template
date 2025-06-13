import Image from "next/image";

export default function Bestilling() {
  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <div className="w-full lg:w-1/2 h-auto lg:h-screen flex flex-col justify-center items-center bg-[var(--background)] text-[var(--foreground)] py-16">
        <div className="mb-4 text-center border-b-2 border-current border-solid border-b-[var(--foreground)] w-[60%]">
          <h1 className="text-3xl font-bold pb-6">Få malet dit eget portræt</h1>
        </div>
        <div className="text-left w-[80%] lg:w-[60%] max-w-3xl mb-2">
          <p className="mb-4">
            Jeg har altid været fascineret af mennesker. Personlighed. Kant.
            Attitude. Udstråling. Og især hvad der gemmer sig bag facaden. Alt
            det, der udgør essensen i en personlighed.
          </p>
          <p className="mb-4">
            Det vil jeg gerne give min fortolkning af. Filtreret gennem
            sanserne, udtrykt på et lærred.
          </p>
          <p className="mb-4">
            Derfor er det vigtigt, at få en fornemmelse af det/de mennesker, jeg
            portrætterer. Vi starter med et foto shoot, der indeholder en
            personlig samtale inden jeg starter. Jeg tester vinkler og udfordrer
            udtrykket. Her tuner jeg mig ind på en stemning. En følelse, et
            udtryk, som er min egen personlige feeling.
          </p>
          <p className="mb-4">
            Til sidst udvælger vi i fællesskab det bedste billede, som jeg maler
            portrættet efter.
          </p>
          <p className="mb-4">
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
