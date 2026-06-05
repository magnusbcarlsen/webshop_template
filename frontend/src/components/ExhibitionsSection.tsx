// frontend/src/components/ExhibitionsSection.tsx
import Image from "next/image";
import {
  fetchActiveExhibitions,
  ExhibitionAPI,
} from "@/services/exhibition-api";

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const sameMonth =
    startDate.getUTCFullYear() === endDate.getUTCFullYear() &&
    startDate.getUTCMonth() === endDate.getUTCMonth();

  const fullFormatter = new Intl.DateTimeFormat("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  if (sameMonth) {
    const dayFormatter = new Intl.DateTimeFormat("da-DK", {
      day: "numeric",
      timeZone: "UTC",
    });
    // e.g. "15.–30. juni 2026"
    return `${dayFormatter.format(startDate)}.–${fullFormatter.format(endDate)}`;
  }
  return `${fullFormatter.format(startDate)} – ${fullFormatter.format(endDate)}`;
}

async function loadExhibitions(): Promise<ExhibitionAPI[]> {
  try {
    return await fetchActiveExhibitions();
  } catch (err) {
    console.error("Error fetching exhibitions:", err);
    return [];
  }
}

export default async function ExhibitionsSection() {
  const exhibitions = await loadExhibitions();
  if (exhibitions.length === 0) return null;

  return (
    <section className="px-4 py-12 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8">
        Kommende udstillinger
      </h2>
      <div className="space-y-6">
        {exhibitions.map((ex) => (
          <article
            key={ex.id}
            className="flex flex-col md:flex-row gap-6 border border-gray-200 rounded-lg p-6 bg-white shadow-sm"
          >
            {ex.imageUrl && (
              <div className="relative w-full md:w-64 h-48 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                <Image
                  src={ex.imageUrl}
                  alt={ex.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">{ex.title}</h3>
              <p className="text-sm text-gray-500 mb-1">
                {formatDateRange(ex.eventStartDate, ex.eventEndDate)}
              </p>
              <p className="text-sm font-medium text-gray-700 mb-3">
                {ex.location}
              </p>
              <p className="text-gray-700 mb-4 whitespace-pre-line">
                {ex.description}
              </p>
              {ex.externalUrl && (
                <a
                  href={ex.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-blue-600 hover:underline font-medium"
                >
                  Læs mere →
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
