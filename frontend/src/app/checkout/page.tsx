// app/checkout/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import NextImage from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import Link from "next/link";
import {
  Button,
  Input,
  Checkbox,
  Card,
  CardBody,
  CardHeader,
  Divider,
} from "@heroui/react";
import { CartAPI } from "@/services/cart-api";
import { useProductImage } from "@/hooks/useProductImage";
import { CheckoutButton } from "@/components/CheckoutButton";

function CheckoutItemImage({
  slug,
  images,
}: {
  slug: string;
  images?: { imageUrl: string; altText: string | null; isPrimary: boolean }[];
}) {
  const { src, altText, onError } = useProductImage(slug, images);

  return (
    <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
      <NextImage
        src={src}
        alt={altText}
        fill
        className="object-cover"
        unoptimized
        onError={onError}
      />
    </div>
  );
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CustomerDetails {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export default function ClientCheckout() {
  const [cart, setCart] = useState<CartAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingSession, setCreatingSession] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Denmark",
    phone: "",
  });

  // Load the cart
  useEffect(() => {
    async function loadCart() {
      try {
        const response = await fetch("/api/carts/items", {
          credentials: "include",
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setCart(data);
      } catch (err) {
        console.error("Failed to load cart:", err);
        setError(
          `Failed to load your cart: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      } finally {
        setLoading(false);
      }
    }
    loadCart();
  }, []);

  // Compute totals
  const subtotal = cart
    ? cart.items.reduce(
        (sum, item) => sum + item.quantity * item.product.price,
        0
      )
    : 0;

  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  // Handle form input changes
  const handleInputChange = (field: keyof CustomerDetails, value: string) => {
    setCustomerDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validate form
  const isFormValid = () => {
    const required = [
      "email",
      "firstName",
      "lastName",
      "address",
      "city",
      "postalCode",
      "phone",
    ];
    return (
      required.every(
        (field) => customerDetails[field as keyof CustomerDetails].trim() !== ""
      ) && agreeTerms
    );
  };

  // Handle checkout regurlar... ikke nødvendigt i nuværende setup
  async function handleCheckout() {
    if (!cart || cart.items.length === 0 || !isFormValid()) {
      return;
    }
    setCreatingSession(true);

    const lineItems = cart.items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: lineItems,
          customerDetails: customerDetails,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Checkout failed: ${txt}`);
      }

      const { sessionId } = await res.json();

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe.js failed to load.");
      }
      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      console.error(err);
      setError(
        `Failed to create checkout session: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      setCreatingSession(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading checkout...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col lg:flex-row h-screen">
        <div className="w-full flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg">
              <p>Error: {error}</p>
            </div>
            <Link
              href="/cart"
              className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col lg:flex-row h-screen">
        <div className="w-full flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-bold mb-6">Checkout</h1>
            <p className="text-xl mb-6">Your cart is empty.</p>
            <Link
              href="/products"
              className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Left Column: Customer Details Form */}
      <div className="w-full lg:w-[70vw] h-auto lg:h-screen overflow-y-scroll scrollbar-none bg-[var(--background)] text-[var(--foreground)]">
        <div className="p-8 lg:p-12">
          {/* Page Title */}
          <div
            className="mb-6 mt-6 text-left border-b-2 border-current border-b-[var(--foreground)]
                w-full sm:max-w-lg md:max-w-md lg:max-w-sm"
          >
            <h1 className="font-bold pb-6">Checkout</h1>
          </div>

          {/* Customer Details Form */}
          <div className="space-y-8">
            <Card className="shadow-none border border-gray-200">
              <CardHeader>
                <h2 className="text-xl lg:text-2xl font-bold">
                  Contact Information
                </h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="your@email.com"
                  value={customerDetails.email}
                  onValueChange={(value) => handleInputChange("email", value)}
                  isRequired
                  variant="bordered"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    placeholder="John"
                    value={customerDetails.firstName}
                    onValueChange={(value) =>
                      handleInputChange("firstName", value)
                    }
                    isRequired
                    variant="bordered"
                  />
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    value={customerDetails.lastName}
                    onValueChange={(value) =>
                      handleInputChange("lastName", value)
                    }
                    isRequired
                    variant="bordered"
                  />
                </div>

                <Input
                  label="Phone Number"
                  placeholder="+45 12 34 56 78"
                  value={customerDetails.phone}
                  onValueChange={(value) => handleInputChange("phone", value)}
                  isRequired
                  variant="bordered"
                />
              </CardBody>
            </Card>

            <Card className="shadow-none border border-gray-200">
              <CardHeader>
                <h2 className="text-xl lg:text-2xl font-bold">
                  Shipping Address
                </h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <Input
                  label="Street Address"
                  placeholder="123 Main Street"
                  value={customerDetails.address}
                  onValueChange={(value) => handleInputChange("address", value)}
                  isRequired
                  variant="bordered"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="City"
                    placeholder="Copenhagen"
                    value={customerDetails.city}
                    onValueChange={(value) => handleInputChange("city", value)}
                    isRequired
                    variant="bordered"
                  />
                  <Input
                    label="Postal Code"
                    placeholder="1000"
                    value={customerDetails.postalCode}
                    onValueChange={(value) =>
                      handleInputChange("postalCode", value)
                    }
                    isRequired
                    variant="bordered"
                  />
                </div>

                <Input
                  label="Country"
                  value={customerDetails.country}
                  onValueChange={(value) => handleInputChange("country", value)}
                  isRequired
                  variant="bordered"
                />
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Right Column: Order Summary */}
      <div className="mb-4 w-full lg:w-[30vw] h-auto lg:h-screen bg-gray-100 flex flex-col justify-center items-center relative">
        <div className="w-[80%] max-w-md space-y-8">
          <div className="text-left space-y-4">
            <h2 className="text-2xl font-bold">Order Summary</h2>

            {/* Cart Items */}
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {cart.items.map((item) => {
                return (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 bg-white/60 p-3 rounded-lg"
                  >
                    <CheckoutItemImage
                      slug={item.product.slug}
                      images={item.product.images}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate text-sm">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-sm font-semibold">
                      DKK {(item.quantity * item.product.price).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-b border-gray-300 pb-4">
              <div className="flex justify-between items-center text-lg">
                <span>Subtotal</span>
                <span className="font-bold">DKK {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span>Shipping</span>
                <span className="font-bold">
                  {shipping === 0 ? "Free" : `DKK ${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold mt-2 pt-2 border-t border-gray-300">
                <span>Total</span>
                <span>DKK {total.toFixed(2)}</span>
              </div>
              <p className="text-left text-sm text-gray-600 mt-2">
                Taxes included in price
              </p>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start space-x-2">
            <Checkbox
              isSelected={agreeTerms}
              onValueChange={setAgreeTerms}
              size="sm"
            />
            <span className="text-sm text-gray-700">
              I agree to the{" "}
              <Link href="/terms" className="underline hover:text-black">
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-black">
                Privacy Policy
              </Link>
            </span>
          </div>

          {/* Checkout Button */}
          <CheckoutButton
            items={cart.items.map((item) => ({
              priceId: item.product.stripePriceId,
              quantity: item.quantity,
            }))}
            isDisabled={!isFormValid() || creatingSession}
            isLoading={creatingSession}
            className="bg-black text-white hover:bg-gray-800 py-4 text-lg font-semibold w-full"
          />

          {!isFormValid() && (
            <p className="text-sm text-red-600 text-center">
              Please fill in all required fields and agree to terms
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
