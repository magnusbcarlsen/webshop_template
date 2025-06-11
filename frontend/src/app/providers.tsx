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
