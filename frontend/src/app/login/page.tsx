"use client";
import Navbar from "@/components/NavBar";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export default function LoginPage() {
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const response = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    // const response = await fetch(
    //   `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
    //   {
    //     method: "POST",
    //     credentials: "include",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ email, password }),
    //   }
    // );

    if (response.ok) {
      const { role } = await response.json();

      if (role.toUpperCase() === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } else {
      console.error("Login failed");
    }
  }

  return (
    <div>
      <Navbar />
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" required placeholder="Email" />
        <input
          type="password"
          name="password"
          required
          placeholder="Password"
        />
        <button type="submit">Login</button>
        <div></div>
      </form>
    </div>
  );
}
