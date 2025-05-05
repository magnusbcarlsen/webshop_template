// app/src/app/admin/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  // 1. grab the HttpOnly JWT cookie
  const jwt = (await cookies()).get("jwt")?.value;
  console.log("jwt cookie:", jwt); // should log your token string

  if (!jwt) {
    console.log("No jwt cookie, redirecting to login");
    redirect("/login");
  }

  const baseURL = process.env.BACKEND_URL!;
  if (!baseURL) {
    console.error("BACKEND_URL is not defined");
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }
  console.log("baseURL", baseURL);

  // 2. call your Nest API, forwarding the same cookie
  const res = await fetch(`${process.env.BACKEND_URL}/api/admin`, {
    headers: { cookie: `jwt=${jwt}` },
    // ensure we always revalidate on each request
    cache: "no-store",
  });

  // 3. if not authorized, bounce back to /login
  if (res.status === 401) {
    console.log("Redirecting to /login");
    redirect("/login");
  }

  // 4. otherwise render the data
  const { message, firstName, lastName } = await res.json();

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>
        {message} {firstName} {lastName}
      </p>
    </div>
  );
}
