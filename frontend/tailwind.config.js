// tailwind.config.js
import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export const content = [
  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/components/**/*.{js,ts,jsx,tsx}",
  "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
];

export const theme = {
  extend: {
    colors: {
      primary: {
        500: "var(--color-primary)", // uses your --color-primary
        DEFAULT: "var(--color-primary)",
        // same as 500
      },
    },
  },
};

export const darkMode = "class";

export const plugins = [
  heroui({
    // If you want Tailwind’s default common colors available, uncomment:
    // addCommonColors: true,

    themes: {
      light: {
        colors: {
          primary: { 500: "var(--color-primary)" },
          secondary: { 500: "var(--color-secondary)" },
          accent: { 500: "var(--color-accent)" },
        },
      },
      dark: {
        colors: {
          primary: "#d75615",
          secondary: { 500: "var(--color-secondary)" },
          accent: { 500: "var(--color-accent)" },
        },
      },
    },
  }),
];
