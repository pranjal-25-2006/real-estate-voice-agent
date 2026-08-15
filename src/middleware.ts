import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

// Anything under these paths must stay reachable WITHOUT a dashboard login,
// because they're called by external services (Bolna, Cal.com) or are the
// login flow itself. Everything else — the dashboard UI and every other
// /api/* route — requires a logged-in session.
const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/api/voice/bolna/webhook",
  "/api/voice/calcom/webhook",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  let username: string | null = null;
  try {
    username = await verifySessionToken(token);
  } catch {
    // AUTH_SESSION_SECRET isn't set yet — treat as logged out rather than
    // crashing the whole app; the /login page and login API surface a
    // clear "auth isn't configured" message pointing at DEPLOYMENT.md.
    username = null;
  }

  if (username) {
    return NextResponse.next();
  }

  // Unauthenticated: APIs get a 401, pages get redirected to /login.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Run on everything except Next.js internals and static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
