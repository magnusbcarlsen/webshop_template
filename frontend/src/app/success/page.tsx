export default async function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Tak for din bestilling!</h1>
      <p className="text-lg mb-6">
        Din betaling er gennemført, og vi har modtaget din ordre.
      </p>
      <p className="text-sm text-gray-600">
        Du vil modtage en bekræftelsesmail med dine ordredetaljer.
      </p>
    </div>
  );
}
