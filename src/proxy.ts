import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { decrypt } from '@/lib/session';

// Define route permissions
const routePermissions: Record<string, string[]> = {
  '/dashboard': ['admin', 'synergy', 'founder'],
  '/reports': ['admin', 'founder', 'synergy'],
  '/synergy': ['admin', 'synergy'],
  '/forecast': ['admin', 'founder'],
  '/mentor': ['founder'],
  '/startups': ['admin'],
  '/alerts': ['admin', 'synergy'],
};

// Protected routes that require authentication
const protectedRoutes = Object.keys(routePermissions);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // If it's a protected route, verify session
  if (isProtectedRoute) {
    const sessionCookie = request.cookies.get('session')?.value;
    
    // If no session exists, redirect to login
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Verify JWT and Role
    const session = await decrypt(sessionCookie);
    if (!session || !session.role) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based Access Control
    const matchingRoute = protectedRoutes.find(route => pathname.startsWith(route));
    if (matchingRoute) {
      const allowedRoles = routePermissions[matchingRoute];
      if (!allowedRoles.includes(session.role as string)) {
        // User doesn't have permission, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  // If user is logged in and tries to access login or root, redirect to dashboard
  if (pathname === '/login' || pathname === '/') {
    const sessionCookie = request.cookies.get('session')?.value;
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
