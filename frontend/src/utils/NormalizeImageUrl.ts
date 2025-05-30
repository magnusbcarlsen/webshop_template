// example util to fix up the host
const PUBLIC_MINIO =
  process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL || "http://localhost:9000";

export function normalizeImageUrl(url: string): string {
  // swap any “minio:9000” host for the one your browser knows
  return url.replace(/^https?:\/\/minio:9000/, PUBLIC_MINIO);
}
