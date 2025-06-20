"use client";
import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button } from "@heroui/react";
import { api, CSRFService } from "@/services/csrf.service";

export default function LoginPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<{ login?: string; csrf?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({ email: "", password: "" });
  const [csrfReady, setCsrfReady] = useState(false);

  // Initialize CSRF protection on component mount
  useEffect(() => {
    const initializeCSRF = async () => {
      try {
        await CSRFService.getToken();
        setCsrfReady(true);
        console.log("🛡️ CSRF protection initialized");
      } catch (error) {
        console.error("Failed to initialize CSRF protection:", error);
        setErrors({
          csrf: "Security initialization failed. Please refresh the page.",
        });
      }
    };

    initializeCSRF();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Don't proceed if CSRF is not ready
    if (!csrfReady) {
      setErrors({ csrf: "Security not ready. Please wait..." });
      return;
    }
    setIsSubmitting(true);
    setErrors({});

    try {
      // UPDATED: Use the secure API method (no /api prefix)
      const response = await api.post("/auth/login", formValues);

      if (response.ok) {
        const { role } = await response.json();
        console.log("✅ Login successful");

        // Clear form on success
        setFormValues({ email: "", password: "" });

        // Redirect based on role
        router.push(role.toUpperCase() === "ADMIN" ? "/admin" : "/");
      } else {
        // Handle different error status codes
        if (response.status === 403) {
          setErrors({ login: "Access denied. Please check your credentials." });
        } else if (response.status === 429) {
          setErrors({
            login: "Too many login attempts. Please try again later.",
          });
        } else {
          const errorData = await response.json().catch(() => ({}));
          setErrors({
            login: errorData.message || "Invalid email or password",
          });
        }
      }
    } catch (error) {
      console.error("Login error:", error);

      // Handle different types of errors
      if (error instanceof Error) {
        if (error.message.includes("CSRF")) {
          setErrors({
            csrf: "Security token expired. Please refresh the page.",
          });
        } else if (error.message.includes("fetch")) {
          setErrors({
            login: "Network error. Please check your connection.",
          });
        } else {
          setErrors({
            login: "An unexpected error occurred. Please try again.",
          });
        }
      } else {
        setErrors({
          login: "Login failed. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 px-4 h-full">
      <h1 className="text-2xl font-semibold mb-6">Login</h1>

      <Form onSubmit={handleSubmit} className="space-y-4">
        <Input
          isRequired
          name="email"
          type="email"
          label="Email"
          placeholder="Enter your email"
          labelPlacement="outside"
          value={formValues.email}
          onValueChange={(email) =>
            setFormValues((prev) => ({ ...prev, email }))
          }
        />

        <Input
          isRequired
          name="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          labelPlacement="outside"
          value={formValues.password}
          onValueChange={(password) =>
            setFormValues((prev) => ({ ...prev, password }))
          }
        />

        {errors.login && <p className="text-sm text-red-500">{errors.login}</p>}

        <Button
          type="submit"
          color="primary"
          variant="solid"
          className="!text-white !hover:text-white w-full"
          size="lg"
          isDisabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>
      </Form>
    </div>
  );
}
