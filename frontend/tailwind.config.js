// tailwind.config.js
import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#d75615",
        secondary: "#64748b",
        accent: "#eb763b",
      },
      fontFamily: {
        sans: [
          "var(--font-sans)", 
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: {
        h1: "2rem",
        h2: "1.5rem",
        p: "1rem",
      },
    },
  },
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: "#d75615",
            secondary: "#64748b",
            accent: "#eb763b",
          },
        },
        dark: {
          colors: {
            primary: "#d75615",
            secondary: "#64748b",
            accent: "#eb763b",
          },
        },
      },
      variants: {
        ghost: {
          primary: {
            // default text keeps your brand color
            DEFAULT: "text-primary",
            // on hover, swap in white
            hover: "text-white",
          },
          // you can do the same for secondary/accent if you like:
          secondary: {
            DEFAULT: "text-secondary",
            hover: "text-white",
          },
          accent: {
            DEFAULT: "text-accent",
            hover: "text-white",
          },
        },
      },
    }),
  ],
};

export default config;
