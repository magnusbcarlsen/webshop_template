// src/app/test-heroui/page.tsx
"use client";
import { Button } from "@heroui/button";
import { useEffect } from "react";

export default function TestHeroUI() {
  useEffect(() => {
    console.log("TestHeroUI component mounted");
  }, []);

  return (
    <div className="p-8 space-y-4 bg-red-100 min-h-screen">
      <h1 className="text-4xl font-bold text-black">HeroUI Test Page</h1>
      <div className="bg-blue-200 p-4 space-y-4">
        <p className="text-black">
          If you can see this blue box, CSS is working
        </p>

        {/* Regular HTML button for comparison */}
        <button className="bg-green-500 text-white p-3 rounded">
          Regular HTML Button (should always be visible)
        </button>

        {/* HeroUI buttons */}
        <div className="space-y-2">
          <Button color="primary">Button</Button>;
          <Button color="primary" size="lg">
            Primary Button
          </Button>
          <Button color="secondary" variant="bordered">
            Bordered Button
          </Button>
          <Button color="success" variant="flat">
            Flat Button
          </Button>
        </div>

        {/* Test if the components render at all */}
        <div className="text-black">
          <p>Debug info:</p>
          <p>
            Button component exists:{" "}
            {typeof Button !== "undefined" ? "Yes" : "No"}
          </p>
        </div>
      </div>
    </div>
  );
}
