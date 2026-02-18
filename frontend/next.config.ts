import { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Permissions-Policy", value: "geolocation=(), microphone=()" },
        ],
      },
    ];
  },

  // Development optimizations
  webpack: (config: webpack.Configuration, { dev }: { dev: boolean }) => {
    if (dev) {
      config.watchOptions = {
        // use event-based watching if possible:
        poll: false,
        // debounce rebuilds:
        aggregateTimeout: 300,
        // skip huge folders you don't edit
        ignored: [
          "**/node_modules/**",
          "**/.next/**",
          "**/public/**",
          "**/src/config/**",
          "**/src/services/**",
          // ← skip all your App routes & sub-folders
          "**/src/app/**",
        ],
      };
    }
    return config;
  },

  // Images configuration
  images: {
    domains: ["localhost", "bergstromart.dk", "minio"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/products/**",
      },
    ],
  },

  // Build configurations
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Proxy /api requests to Railway backend
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL || "http://backend:3001"}/api/:path*`,
      },
    ];
  },

  // Performance and security
  compress: true,
  poweredByHeader: false,
  trailingSlash: false,
};

export default nextConfig;
