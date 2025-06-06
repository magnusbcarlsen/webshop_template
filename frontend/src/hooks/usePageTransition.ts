// "use client";

// import { useEffect, useState } from "react";
// import { usePathname } from "next/navigation";

// export function usePageTransition() {
//   const pathname = usePathname();
//   const [isTransitioning, setIsTransitioning] = useState(false);
//   const [direction, setDirection] = useState<"forward" | "backward">("forward");

//   useEffect(() => {
//     setIsTransitioning(true);
//     const timer = setTimeout(() => {
//       setIsTransitioning(false);
//     }, 500); // Match your animation duration

//     return () => clearTimeout(timer);
//   }, [pathname]);

//   return { isTransitioning, direction, setDirection };
// }
