import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
  const isAuthRoute = nextUrl.pathname.startsWith('/sign-in') || nextUrl.pathname.startsWith('/sign-up');
  const isPublicRoute = nextUrl.pathname === '/';

  if (isAuthRoute) {
    if (isAuthenticated) {
      const role = (req.auth?.user as any)?.role;
      return NextResponse.redirect(new URL(role === 'JUDGE' ? '/judge/dashboard' : '/lawyer/dashboard', nextUrl));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/sign-in', nextUrl));
  }

  // Cross-role protection
  if (isAuthenticated) {
    const role = (req.auth?.user as any)?.role;
    if (role === 'LAWYER' && nextUrl.pathname.startsWith('/judge')) {
      return NextResponse.redirect(new URL('/lawyer/dashboard', nextUrl));
    }
    if (role === 'JUDGE' && nextUrl.pathname.startsWith('/lawyer')) {
      return NextResponse.redirect(new URL('/judge/dashboard', nextUrl));
    }
  }

  return NextResponse.next();
});
