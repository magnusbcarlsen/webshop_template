// Cloudflare R2 public URL (r2.dev subdomain or custom domain)
// Set NEXT_PUBLIC_R2_PUBLIC_URL in your .env / Vercel env vars
const R2_PUBLIC_URL = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "").replace(
  /\/$/,
  "",
);

export function normalizeImageUrl(url: string): string {
  if (!url) return url;
  if (!R2_PUBLIC_URL) return url;

  // Already pointing at R2 — return as-is
  try {
    if (new URL(url).hostname === new URL(R2_PUBLIC_URL).hostname) return url;
  } catch {
    // invalid URL — fall through
  }

  // Replace any internal MinIO or localhost URL (with or without bucket prefix)
  // e.g. http://minio:9000/products/uuid.jpg  → R2_PUBLIC_URL/uuid.jpg
  //      http://localhost:9000/uuid.jpg        → R2_PUBLIC_URL/uuid.jpg
  if (/^https?:\/\/(minio|localhost)(:\d+)?\//.test(url)) {
    const filename = url.split("/").pop();
    if (filename) return `${R2_PUBLIC_URL}/${filename}`;
  }

  return url;
}
