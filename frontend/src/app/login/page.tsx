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
    <div className="max-w-md mx-auto mt-20 px-4">
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
          isDisabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>
      </Form>
    </div>
  );
}

// "use client";
// import { useRouter } from "next/navigation";
// import { FormEvent } from "react";

// export default function LoginPage() {
//   const router = useRouter();

//   async function handleSubmit(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();
//     const formData = new FormData(event.currentTarget);
//     const email = formData.get("email") as string;
//     const password = formData.get("password") as string;

//     const response = await fetch("/api/auth/login", {
//       method: "POST",
//       credentials: "include",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ email, password }),
//     });

//     if (response.ok) {
//       const { role } = await response.json();

//       if (role.toUpperCase() === "ADMIN") {
//         router.push("/admin");
//       } else {
//         router.push("/");
//       }
//     } else {
//       console.error("Login failed");
//     }
//   }

//   return (

//       <div>
//         <h1>Login</h1>
//         <form onSubmit={handleSubmit}>
//           <input type="email" name="email" required placeholder="Email" />
//           <input
//             type="password"
//             name="password"
//             required
//             placeholder="Password"
//           />
//           <button type="submit">Login</button>
//           <div></div>
//         </form>
//       </div>

//   );
// }
