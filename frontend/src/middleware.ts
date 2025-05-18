// frontend/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = process.env.JWT_SECRET!;
const encoder = new TextEncoder();
const ADMIN_ROLE = "ADMIN";

export async function middleware(req: NextRequest) {
  console.log("[mw] URL:", req.nextUrl.pathname);
  console.log(
    "[mw] Cookies:",
    req.cookies.getAll().map((c) => `${c.name}=${c.value}`)
  );

  if (req.nextUrl.pathname.startsWith("/admin")) {
    const token = req.cookies.get("jwt")?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    try {
      // verify & decode
      const { payload } = await jwtVerify(token, encoder.encode(SECRET));
      console.log("[mw] payload:", payload);

      // role check
      if ((payload.role as string).toUpperCase() !== ADMIN_ROLE) {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }

      return NextResponse.next();
    } catch (e) {
      console.log("[mw] bad token", e);
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
