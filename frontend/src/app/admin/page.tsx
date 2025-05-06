// app/src/app/admin/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  // 1. grab the HttpOnly JWT cookie
  const jwt = (await cookies()).get("jwt")?.value;

  // 2. call your Nest API, forwarding the same cookie
  const res = await fetch(`${process.env.BACKEND_URL}/api/admin`, {
    headers: { cookie: `jwt=${jwt}` },
    // ensure we always revalidate on each request
    cache: "no-store",
  });

  // 3. if not authorized, bounce back to /login
  if (res.status === 401) {
    redirect("/login");
  }

  // 4. otherwise render the data
  const data = await res.json();
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
