import { Button } from "@heroui/react";
import { loadStripe } from "@stripe/stripe-js";
import React from "react";

interface CheckoutButtonProps {
  items: { priceId: string; quantity: number }[];
  isDisabled?: boolean;
  isLoading?: boolean;
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  items,
  isDisabled,
  isLoading,
}) => {
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
  );

  const handleClick = async () => {
    try {
      console.log("🚀 CheckoutButton clicked");
      console.log("🔍 Environment variables:", {
        API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
        STRIPE_KEY_EXISTS: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      });

      console.log("📦 Items to checkout:", items);

      // Validate items
      const invalidItems = items.filter(
        (item) =>
          !item.priceId || item.priceId === "null" || item.priceId === ""
      );
      if (invalidItems.length > 0) {
        console.error("❌ Invalid items found:", invalidItems);
        alert("Some products are missing valid price IDs");
        return;
      }

      console.log("💳 Loading Stripe...");
      const stripe = await stripePromise;
      if (!stripe) {
        console.error("❌ Stripe failed to load");
        alert("Stripe failed to load");
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/stripe/create-session`;
      console.log("🌐 Calling API:", apiUrl);

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      console.log("📡 API Response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ API call failed:", errorText);
        alert(`Checkout failed: ${errorText}`);
        return;
      }

      const response = await res.json();
      console.log("✅ Session created:", response);

      console.log("🔄 Redirecting to Stripe...");
      await stripe.redirectToCheckout({ sessionId: response.id });
    } catch (error) {
      console.error("💥 Checkout error:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <Button
      color="primary"
      variant="solid"
      disabled={isDisabled || isLoading}
      className="text-white text-md w-full"
      onPress={handleClick}
    >
      Pay with Stripe
    </Button>
  );
};

// import { Button } from "@heroui/react";
// import { loadStripe } from "@stripe/stripe-js";
// import React from "react";

// interface CheckoutButtonProps {
//   items: { priceId: string; quantity: number }[];
//   isDisabled?: boolean;
//   isLoading?: boolean;
// }

// export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
//   items,
//   isDisabled,
//   isLoading,
// }) => {
//   const stripePromise = loadStripe(
//     process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
//   );

//   const handleClick = async () => {
//     const stripe = await stripePromise;

//     const res = await fetch(
//       `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/stripe/create-session`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ items }),
//       }
//     );

//     if (!res.ok) {
//       console.error("create-session failed:", await res.text());
//       return;
//     }
//     const { id } = await res.json();
//     await stripe!.redirectToCheckout({ sessionId: id });
//   };

//   return (
//     <Button
//       color="primary"
//       variant="solid"
//       disabled={isDisabled || isLoading}
//       className="text-white text-md w-full"
//       onPress={handleClick}
//     >
//       Pay with Stripe
//     </Button>
//   );
// };
