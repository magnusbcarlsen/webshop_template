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
      // Validate items
      const invalidItems = items.filter(
        (item) =>
          !item.priceId || item.priceId === "null" || item.priceId === ""
      );
      if (invalidItems.length > 0) {
        alert("Some products are missing valid price IDs");
        return;
      }

      const stripe = await stripePromise;
      if (!stripe) {
        alert("Stripe failed to load");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/stripe/create-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        alert(`Checkout failed: ${errorText}`);
        return;
      }

      const response = await res.json();
      await stripe.redirectToCheckout({ sessionId: response.id });
    } catch (error) {
      alert(
        `Error: ${error instanceof Error ? error.message : "An error occurred"}`
      );
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
