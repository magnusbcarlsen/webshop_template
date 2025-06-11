// frontend/components/CheckoutButton.tsx
import { loadStripe } from "@stripe/stripe-js";
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export function CheckoutButton({
  items,
}: {
  items: { priceId: string; quantity: number }[];
}) {
  const handleClick = async () => {
    const stripe = await stripePromise;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/stripe/create-session`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      }
    );
    const { id } = await res.json();
    await stripe!.redirectToCheckout({ sessionId: id });
  };

  return <button onClick={handleClick}>Pay with Stripe</button>;
}
