import { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1) Rewrite /api/* to your NestJS backend
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/api/:path*",
      },
    ];
  },

  // 2) Apply security headers to every response
  async headers() {
    return [
      {
        // Match all routes in your Next.js app
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Permissions-Policy", value: "geolocation=(), microphone=()" },
          // If you want to own CSP here instead of in Nginx or Helmet:
          // { key: 'Content-Security-Policy', value: "default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline'; frame-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
