import webpack from "webpack";
import { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker optimization in production
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,

  // 1) API rewrites
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL ?? "http://backend:3001";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },

  // 2) Security headers
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

  // 3) Development optimizations
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
          "**/src/app/**",
        ],
      };
    } else {
      // Production optimizations
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
            },
          },
        },
      };
    }
    return config;
  },

  // 4) Images configuration for both development and production
  images: {
    // Legacy domains array for backwards compatibility
    domains: [
      "localhost",
      "minio",
      // Add your production domain here - replace with actual domain
      "bergstromart.dk",
      "console.bergstromart.dk",
    ],

    // Modern remotePatterns for more specific control
    remotePatterns: [
      // Development MinIO (localhost:9000)
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/products/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/static/**",
      },
      // Production MinIO (through nginx proxy)
      {
        protocol: "https",
        hostname: "bergstromart.dk", 
        pathname: "/products/**",
      },
      {
        protocol: "https",
        hostname: "bergstromart.dk", 
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "bergstromart.dk", 
        pathname: "/static/**",
      },
      // MinIO container direct access (for development docker-compose)
      {
        protocol: "http",
        hostname: "minio",
        port: "9000",
        pathname: "/**",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },

  // Environment variables that should be available in the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_MINIO_PUBLIC_URL: process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL,
    MINIO_API_HOST: process.env.MINIO_API_HOST,
    MINIO_API_PORT: process.env.MINIO_API_PORT,
  },

  // 5) ESLint and TypeScript - keep your existing settings
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Production optimizations
  compress: true,
  swcMinify: true,
  poweredByHeader: false,

  // Experimental features for better performance
  experimental: {
    esmExternals: true,
    optimizeCss: true,
  },

  // Trailing slash handling
  trailingSlash: false,
};

export default nextConfig;
