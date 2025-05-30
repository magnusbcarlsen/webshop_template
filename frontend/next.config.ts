// frontend/next.config.js
import webpack from "webpack";
/** @type {import('next').NextConfig} */
const nextConfig = {
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
        // skip huge folders you don’t edit
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

  // 4) Images, ESLint, TS relax in dev
  images: {
    domains: ["localhost", "minio"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/products/**",
      },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;

// import { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   // 1) API rewrites - use environment variable for flexibility
//   async rewrites() {
//     const backendUrl = process.env.BACKEND_URL || "http://backend:3001";
//     return [
//       {
//         source: "/api/:path*",
//         destination: `${backendUrl}/api/:path*`,
//       },
//     ];
//   },

//   // 2) Security headers for all routes
//   async headers() {
//     return [
//       {
//         source: "/(.*)",
//         headers: [
//           { key: "X-Frame-Options", value: "DENY" },
//           { key: "X-Content-Type-Options", value: "nosniff" },
//           { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
//           { key: "X-XSS-Protection", value: "1; mode=block" },
//           { key: "Permissions-Policy", value: "geolocation=(), microphone=()" },
//         ],
//       },
//     ];
//   },

//   // 3) Development optimizations
//   webpack: (config, { dev }) => {
//     if (dev) {
//       // Development-specific webpack config
//       config.watchOptions = {
//         poll: 1000,
//         aggregateTimeout: 300,
//         ignored: [/node_modules/, /\.next/],
//       };
//     }
//     return config;
//   },

//   // 4) Image optimization
//   images: {
//     domains: ["localhost"], // Add your image domains here
//   },

//   // 5) ESLint and TypeScript - relaxed for development
//   eslint: {
//     ignoreDuringBuilds: true,
//   },

//   typescript: {
//     ignoreBuildErrors: true,
//   },
// };

// export default nextConfig;
