import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = [/^\/$/, /^\/sign-in/, /^\/sign-up/, /^\/api\/auth\//, /^\/api\/(ping|diag)$/];

// Fast cookie-presence gate. Real verification (signature + expiry) happens
// server-side in layouts via lib/serverUser.ts — firebase-admin cannot run on
// the edge runtime.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_ROUTES.some((r) => r.test(pathname))) {
    return NextResponse.next();
  }

  const hasSession = req.cookies.get("__session")?.value;
  if (!hasSession) {
    const signInUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
