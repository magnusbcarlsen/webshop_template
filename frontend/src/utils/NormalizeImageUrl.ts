// Cloudflare R2 public URL (r2.dev subdomain or custom domain)
// Set NEXT_PUBLIC_R2_PUBLIC_URL in your .env / Vercel env vars
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";

export function normalizeImageUrl(url: string): string {
  if (!url) return url;

  // Replace any legacy internal MinIO/localhost URLs with the R2 public URL
  if (R2_PUBLIC_URL) {
    const normalized = url
      .replace(
        /^https?:\/\/minio:9000\/[^/]+\//,
        `${R2_PUBLIC_URL.replace(/\/$/, "")}/`,
      )
      .replace(
        /^https?:\/\/localhost:9000\/[^/]+\//,
        `${R2_PUBLIC_URL.replace(/\/$/, "")}/`,
      );
    return normalized;
  }

  return url;
}
