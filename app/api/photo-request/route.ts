import { NextResponse } from "next/server";
import { loadPortfolioDataServer } from "@/lib/portfolio-data-server";
import { normalizePhotography } from "@/lib/photography-content";

type PhotoRequestBody = {
  name?: string;
  email?: string;
  purpose?: string;
  note?: string;
  company?: string;
  photoSlug?: string;
  photoCode?: string;
  photoTitle?: string;
  pageUrl?: string;
};

type RequestWindow = { count: number; resetAt: number };
const requestWindowMs = 10 * 60 * 1000;
const requestLimit = 5;
const rateLimitStore = (globalThis as typeof globalThis & { photoRequestLimits?: Map<string, RequestWindow> }).photoRequestLimits
  ?? new Map<string, RequestWindow>();
(globalThis as typeof globalThis & { photoRequestLimits?: Map<string, RequestWindow> }).photoRequestLimits = rateLimitStore;

function clean(value: unknown, limit: number) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function requestAddress(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")?.trim()
    || "unknown";
}

function consumeRequest(address: string) {
  const now = Date.now();
  const current = rateLimitStore.get(address);
  if (!current || current.resetAt <= now) {
    rateLimitStore.set(address, { count: 1, resetAt: now + requestWindowMs });
    return { allowed: true, retryAfter: 0 };
  }
  if (current.count >= requestLimit) {
    return { allowed: false, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  }
  current.count += 1;
  return { allowed: true, retryAfter: 0 };
}

export async function POST(request: Request) {
  const rateLimit = consumeRequest(requestAddress(request));
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Too many requests. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
    );
  }

  let body: PhotoRequestBody;
  try {
    body = await request.json() as PhotoRequestBody;
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  if (clean(body.company, 120)) return NextResponse.json({ ok: true });

  const name = clean(body.name, 80);
  const email = clean(body.email, 120);
  const purpose = clean(body.purpose, 100);
  const note = clean(body.note, 600);
  const photoSlug = clean(body.photoSlug, 120);
  const photoCode = clean(body.photoCode, 80);
  const photoTitle = clean(body.photoTitle, 120);
  const pageUrl = clean(body.pageUrl, 500);

  if (!name || !purpose || !photoSlug || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: "Add your name, email, and intended use." }, { status: 400 });
  }

  const content = normalizePhotography((await loadPortfolioDataServer()).photography);
  const photo = content.posts.find((item) => item.slug === photoSlug && item.visible);
  if (!content.requests.enabled || !photo) return NextResponse.json({ message: "This frame is not accepting requests." }, { status: 404 });

  const recipient = content.requests.email.trim();
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.PHOTO_REQUEST_FROM_EMAIL;
  if (!recipient || !apiKey || !from) {
    return NextResponse.json({ deliveryUnavailable: true, message: "Email delivery is not configured yet." }, { status: 503 });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [recipient],
      reply_to: email,
      subject: `Frame request: ${photoCode || photo.displayCode || photo.slug} / ${photoTitle || photo.title}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Purpose: ${purpose}`,
        `Frame: ${photoCode || photo.displayCode || photo.slug}`,
        `Photo: ${photoTitle || photo.title}`,
        `Page: ${pageUrl}`,
        "",
        note || "No additional note."
      ].join("\n")
    })
  });

  if (!response.ok) return NextResponse.json({ message: "Email delivery failed. Please try again." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
