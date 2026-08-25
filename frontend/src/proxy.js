import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function proxy(req) {
  const token = req.cookies.get("accesstoken")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }



  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const pathname = req.nextUrl.pathname;

    // Admin routes checking if role is admin or not
    if (pathname.startsWith("/admin")) {
      if (decoded.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/admin/:path*",
    "/orders/:path*",
    "/chat",
    "/shopping/cart/:path*",
    "/shopping/favorite/:path*"
  ],
};