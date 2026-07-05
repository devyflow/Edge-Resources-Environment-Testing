"use client";

import { createClient } from "@supabase/supabase-js";
import { defaultData } from "./default-data";
import type { PortfolioData } from "./types";

const dataKey = "devyanshu-portfolio-data-v2";
const passHashKey = "devyanshu-admin-pass-hash-v2";
const sessionKey = "devyanshu-admin-session-v2";
const contentRowId = "main";
const defaultBucket = "portfolio-assets";

export function cloneData(data: PortfolioData): PortfolioData {
  return JSON.parse(JSON.stringify(data)) as PortfolioData;
}

export function loadLocalData(): PortfolioData {
  if (typeof window === "undefined") return cloneData(defaultData);
  const raw = window.localStorage.getItem(dataKey);
  if (!raw) return cloneData(defaultData);
  try {
    return mergeData(cloneData(defaultData), JSON.parse(raw) as Partial<PortfolioData>);
  } catch {
    return cloneData(defaultData);
  }
}

export function saveLocalData(data: PortfolioData) {
  window.localStorage.setItem(dataKey, JSON.stringify(data));
}

export function resetLocalData() {
  window.localStorage.removeItem(dataKey);
  return cloneData(defaultData);
}

export function shouldUseSupabaseContent() {
  return supabaseConfigured() && process.env.NEXT_PUBLIC_CONTENT_MODE !== "local";
}

export function mergeData(base: PortfolioData, incoming: Partial<PortfolioData>) {
  return {
    ...base,
    ...incoming,
    sections: { ...base.sections, ...(incoming.sections || {}) },
    profile: { ...base.profile, ...(incoming.profile || {}) },
    resume: { ...base.resume, ...(incoming.resume || {}) },
    projects: Array.isArray(incoming.projects) ? incoming.projects : base.projects,
    notes: Array.isArray(incoming.notes) ? incoming.notes : base.notes,
    skills: { ...base.skills, ...(incoming.skills || {}) },
    experience: Array.isArray(incoming.experience) ? incoming.experience : base.experience
  };
}

export function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `project-${Date.now()}`
  );
}

export function youtubeEmbedUrl(url?: string) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    if (parsed.searchParams.get("v")) return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
    if (parsed.pathname.includes("/embed/")) return url;
    if (parsed.pathname.includes("/shorts/")) return `https://www.youtube.com/embed/${parsed.pathname.split("/shorts/")[1].split("/")[0]}`;
  } catch {
    return "";
  }
  return "";
}

export function isSignedIn() {
  return typeof window !== "undefined" && window.sessionStorage.getItem(sessionKey) === "true";
}

export function setSignedIn(value: boolean) {
  if (value) window.sessionStorage.setItem(sessionKey, "true");
  else window.sessionStorage.removeItem(sessionKey);
}

export function hasPasscode() {
  return typeof window !== "undefined" && Boolean(window.localStorage.getItem(passHashKey));
}

export async function setPasscode(passcode: string) {
  window.localStorage.setItem(passHashKey, await hashPasscode(passcode));
  setSignedIn(true);
}

export async function verifyPasscode(passcode: string) {
  const saved = window.localStorage.getItem(passHashKey);
  return Boolean(saved && saved === (await hashPasscode(passcode)));
}

export async function hashPasscode(passcode: string) {
  const bytes = new TextEncoder().encode(passcode);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function supabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function loadSupabaseData() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("portfolio_content").select("content").eq("id", contentRowId).single();
  if (error || !data?.content) return null;
  return mergeData(cloneData(defaultData), data.content as Partial<PortfolioData>);
}

export async function saveSupabaseData(content: PortfolioData) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("portfolio_content").upsert({ id: contentRowId, content, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function loadPortfolioData() {
  if (!shouldUseSupabaseContent()) return loadLocalData();
  const remote = await loadSupabaseData();
  return remote || loadLocalData();
}

export async function savePortfolioData(content: PortfolioData) {
  saveLocalData(content);
  if (shouldUseSupabaseContent()) await saveSupabaseData(content);
}

export function getConfiguredAdminEmail() {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").trim().toLowerCase();
}

export function isConfiguredAdminEmail(email?: string | null) {
  const configured = getConfiguredAdminEmail();
  if (!configured) return true;
  return configured === (email || "").trim().toLowerCase();
}

export async function getSupabaseUser() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user || null;
}

export async function signInSupabaseAdmin(email: string, password: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!isConfiguredAdminEmail(data.user?.email)) {
    await supabase.auth.signOut();
    throw new Error("This email is not allowed to manage this portfolio.");
  }
  return data.user;
}

export async function signUpSupabaseAdmin(email: string, password: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  if (!isConfiguredAdminEmail(email)) throw new Error("Use the admin email configured for this portfolio.");
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOutSupabaseAdmin() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function uploadSupabaseAsset(file: File, folder: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_ASSET_BUCKET || defaultBucket;
  const extension = file.name.split(".").pop()?.toLowerCase() || "asset";
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  const safeName = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9-]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  const path = `${safeFolder}/${Date.now()}-${crypto.randomUUID()}-${safeName || "upload"}.${extension}`;
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type || undefined,
    upsert: false
  });
  if (error) throw error;
  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicData.publicUrl;
}
