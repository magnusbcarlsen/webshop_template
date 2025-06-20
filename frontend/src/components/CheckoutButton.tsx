import { Button } from "@heroui/react";
import { loadStripe } from "@stripe/stripe-js";
import React from "react";
import { api } from "@/services/csrf.service"; // ADD THIS IMPORT

interface CheckoutButtonProps {
  items: { priceId: string; quantity: number }[];
  isDisabled?: boolean;
  isLoading?: boolean;
  className?: string; // Added className prop for styling flexibility
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  items,
  isDisabled,
  isLoading,
  className,
}) => {
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
  );

  const handleClick = async () => {
    try {
      const stripe = await stripePromise;

      if (!stripe) {
        console.error("Stripe failed to load");
        return;
      }

      // UPDATED: Use CSRF-protected API call (no /api prefix)
      const res = await api.post("/stripe/create-session", { items });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("create-session failed:", errorText);
        return;
      }

      const { id } = await res.json();
      await stripe.redirectToCheckout({ sessionId: id });
    } catch (error) {
      console.error("Checkout failed:", error);
      // You might want to show user-friendly error message here
    }
  };

  return (
    <Button
      color="primary"
      variant="solid"
      disabled={isDisabled || isLoading}
      className={className || "text-white text-md w-full"}
      onPress={handleClick}
    >
      {isLoading ? "Processing..." : "Pay with Stripe"}
    </Button>
  );
};