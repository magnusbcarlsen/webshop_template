// src/app/api/test-cookies/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const cartId = (await cookieStore).get("cartId");

  return NextResponse.json({
    message: "Cookie test",
    cartId: cartId?.value || "No cartId cookie found",
    allCookies: (await cookieStore)
      .getAll()
      .map((c) => ({ name: c.name, value: c.value })),
  });
}

export async function POST() {
  const cookieStore = cookies();

  // Set a test cookie
  (
    await // Set a test cookie
    cookieStore
  ).set("testCookie", "testValue", {
    httpOnly: false,
    maxAge: 60 * 60, // 1 hour
    path: "/",
    sameSite: "lax",
  });

  return NextResponse.json({
    message: "Test cookie set",
  });
}
