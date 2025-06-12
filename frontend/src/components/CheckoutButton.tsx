import { Button } from "@heroui/react";
import { loadStripe } from "@stripe/stripe-js";
import React from "react";

interface CheckoutButtonProps {
  items: { priceId: string; quantity: number }[];
  className?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  items,
  className,
  isDisabled,
  isLoading,
}) => {
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
  );

  const handleClick = async () => {
    const stripe = await stripePromise;
    // ⚠️ make sure BASE_URL ends with /api
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/stripe/create-session`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      }
    );

    if (!res.ok) {
      console.error("create-session failed:", await res.text());
      return;
    }
    const { id } = await res.json();
    await stripe!.redirectToCheckout({ sessionId: id });
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
