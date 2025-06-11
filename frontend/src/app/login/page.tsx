"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button } from "@heroui/react";

export default function LoginPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<{ login?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({ email: "", password: "" });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const response = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formValues),
    });

    if (response.ok) {
      const { role } = await response.json();
      router.push(role.toUpperCase() === "ADMIN" ? "/admin" : "/");
    } else {
      setErrors({ login: "Invalid email or password" });
    }

    setIsSubmitting(false);
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
