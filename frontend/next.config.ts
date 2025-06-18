import { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // async rewrites() {
  //   const backendUrl = process.env.BACKEND_URL ?? "http://backend:3001";
  //   return [
  //     {
  //       source: "/api/:path*",
  //       destination: `${backendUrl}/api/:path*`, // This is now correct since backend has 'api' prefix
  //     },
  //   ];
  // },

  images: {
    domains: ["localhost", "bergstromart.dk"],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  compress: true,
  poweredByHeader: false,
  trailingSlash: false,
};

export default nextConfig;
