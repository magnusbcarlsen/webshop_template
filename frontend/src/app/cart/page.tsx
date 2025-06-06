// src/app/cart/page.tsx

import ClientCart from "./ClientCart";

/**
 * A simple server component that delegates cart rendering to a client component
 * This ensures cookies are properly handled
 */
export default function CartPage() {
  return (
  
      <ClientCart />
  
  );
}