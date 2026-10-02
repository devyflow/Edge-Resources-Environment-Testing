import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const isDevelopmentLocalStudio =
  process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_CONTENT_MODE === "local";

function contentSecurityPolicy(nonce: string) {
  const developmentScript = process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${developmentScript}`,
    `style-src-elem 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
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
  for (const cookie of source.cookies.getAll()) redirect.cookies.set(cookie);
  return secureHeaders(redirect, csp);
}

export async function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = contentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  let response = NextResponse.next({ request: { headers: requestHeaders } });
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  if (!isAdminRoute || isDevelopmentLocalStudio) return secureHeaders(response, csp);

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
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        for (const cookie of cookies) request.cookies.set(cookie.name, cookie.value);
        response = NextResponse.next({ request: { headers: requestHeaders } });
        for (const cookie of cookies) response.cookies.set(cookie.name, cookie.value, cookie.options);
      }
    }
  });

  const { data, error } = await supabase.auth.getClaims();
  const claims = error ? null : data?.claims;
  const isAdmin = claims?.sub === adminUserId;
  const hasMfa = claims?.aal === "aal2";
  const isLogin = request.nextUrl.pathname === "/admin/login";

  if (isLogin) {
    if (isAdmin && hasMfa) {
      const destination = request.nextUrl.clone();
      destination.pathname = "/admin";
      destination.search = "";
      return redirectWithCookies(destination, response, csp);
    }
    return secureHeaders(response, csp);
  }

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
