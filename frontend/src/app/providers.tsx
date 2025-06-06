// // src/app/providers.tsx
// "use client";

// import * as React from "react";
// import * as HeroUIExports from "@heroui/react";

// console.log("→ raw @heroui/react namespace:", HeroUIExports);
// // Then handle default vs. named:
// const pkg = (HeroUIExports as typeof HeroUIExports & { default?: typeof HeroUIExports }).default ?? HeroUIExports;
// console.log("→ pkg (after .default fallback):", pkg);
// const { HeroUIProvider, ToastProvider } = pkg;
// console.log("→ HeroUIProvider:", HeroUIProvider);
// console.log("→ ToastProvider:", ToastProvider);
// if (
//   typeof HeroUIProvider !== "function" ||
//   typeof ToastProvider !== "function"
// ) {
//   console.error(
//     "⛔️ @heroui/react did not export HeroUIProvider/ToastProvider correctly:",
//     HeroUIExports
//   );
// }

// export function Providers({ children }: { children: React.ReactNode }) {
//   return (
//     <HeroUIProvider>
//       <ToastProvider />
//       {children}
//     </HeroUIProvider>
//   );
// }

// src/app/providers.tsx
"use client";

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import * as React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <ToastProvider />
      {children}
    </HeroUIProvider>
  );
}
