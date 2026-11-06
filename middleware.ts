import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { withAuthDeadline } from "./lib/auth-deadline";

const isDevelopmentLocalStudio =
  process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_CONTENT_MODE === "local";

function contentSecurityPolicy() {
  const developmentScript = process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${developmentScript}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "media-src 'self' data: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join("; ");
}

function secureHeaders(response: NextResponse, csp: string) {
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  return response;
}

function redirectWithCookies(url: URL, source: NextResponse, csp: string) {
  const redirect = NextResponse.redirect(url);
  redirect.headers.set("Cache-Control", "private, no-store");
  for (const cookie of source.cookies.getAll()) redirect.cookies.set(cookie);
  return secureHeaders(redirect, csp);
}

export async function middleware(request: NextRequest) {
  const csp = contentSecurityPolicy();
  const pathname = request.nextUrl.pathname;
  if (pathname.toLowerCase().startsWith("/admin") && !pathname.startsWith("/admin")) {
    const destination = request.nextUrl.clone();
    destination.pathname = pathname.replace(/^\/admin/i, "/admin");
    return secureHeaders(NextResponse.redirect(destination), csp);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Content-Security-Policy", csp);

  let response = NextResponse.next({ request: { headers: requestHeaders } });
  const isAdminRoute = pathname.startsWith("/admin");
  const isPublicAdminAsset = pathname === "/admin/manifest.webmanifest";
  if (!isAdminRoute || isPublicAdminAsset || isDevelopmentLocalStudio) return secureHeaders(response, csp);
  response.headers.set("Cache-Control", "private, no-store");
  // The public login form must remain reachable when session refresh is unavailable.
  if (["/admin/login", "/admin/forgot-password", "/admin/reset-password"].includes(pathname)) return secureHeaders(response, csp);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const adminUserId = process.env.SUPABASE_ADMIN_USER_ID;
  if (!url || !key || !adminUserId || process.env.NEXT_PUBLIC_CONTENT_MODE === "local") {
    return secureHeaders(
      new NextResponse("The production admin is unavailable because its secure authentication environment is incomplete.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
      }),
      csp
    );
  }

  const supabase = createServerClient(url, key, {
    global: {
      fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(3500) })
    },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        for (const cookie of cookies) request.cookies.set(cookie.name, cookie.value);
        response = NextResponse.next({ request: { headers: requestHeaders } });
        response.headers.set("Cache-Control", "private, no-store");
        for (const cookie of cookies) response.cookies.set(cookie.name, cookie.value, cookie.options);
      }
    }
  });

  const result = await withAuthDeadline(() => supabase.auth.getClaims());
  if (!result.ok) {
    return secureHeaders(new NextResponse(
      'Authentication is temporarily unavailable. Please try again shortly, or open /admin/login to sign in again.',
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "private, no-store", "Retry-After": "10" } }
    ), csp);
  }
  const { data, error } = result.value;
  const claims = error ? null : data?.claims;
  const isAdmin = claims?.sub === adminUserId;
  const hasMfa = claims?.aal === "aal2";
  if (!claims || !isAdmin || !hasMfa) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/admin/login";
    destination.search = !claims ? "" : isAdmin ? "?step=mfa" : "?error=not-authorized";
    return redirectWithCookies(destination, response, csp);
  }

  return secureHeaders(response, csp);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|pdf)$).*)"]
};
