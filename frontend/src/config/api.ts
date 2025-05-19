// FRONTEND/src/config/api.ts

/**
 * Resolve API root depending on environment.
 * - On the server (SSR/SSG), calls your backend directly.
 * - On the client, proxies via Next.js `/api` (so nginx or Vercel can route).
 */
export function getBaseUrl(): string {
  if (typeof window === "undefined") {
    // Server-side: pick up your BACKEND_URL or default to localhost Docker name
    const backend = process.env.BACKEND_URL ?? "http://backend:3001";
    return `${backend}/api`;
  }
  // Client-side: relative proxy through Next.js
  return "/api";
}

// And export a singleton if you like:
export const API_ROOT = getBaseUrl();
