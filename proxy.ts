import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";

const protectedRoutes = ["/dashboard", "/reports", "/startups", "/synergy", "/forecast", "/alerts"];
const publicRoutes = ["/login", "/signup", "/"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path === route || path.startsWith(route + "/"));
  const isPublicRoute = publicRoutes.some((route) => path === route);

  const sessionCookie = req.cookies.get("session")?.value;
  const session = sessionCookie ? await decrypt(sessionCookie) : undefined;

  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isPublicRoute && session?.userId && path !== "/dashboard") {
    if (path === "/login" || path === "/signup") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$|.*\\.ico$).*)"],
};
