"use client";

import Link from "next/link";
import { useState } from "react";
import { KeyRound, Mail } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import s from "../admin.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Password recovery is not configured.");
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin/reset-password`
      });
      if (error) throw error;
      setSent(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not request a reset. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <main className={s.loginPage}>
    <form className={`${s.loginPanel} ${s.recoveryPanel}`} onSubmit={submit}>
      <KeyRound size={42} strokeWidth={1.25} />
      <span className={s.eyebrow}>ACCOUNT RECOVERY</span>
      <h1>Reset your password.</h1>
      {sent ? <p role="status">If an account exists for that email, a reset link has been requested. Check your inbox and spam folder. Open the link in this same browser on this device.</p> : <>
        <p>Enter your administrator email to request a password reset link.</p>
        <label><span>Email</span><input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required maxLength={254} /></label>
        <button type="submit" disabled={busy}><Mail size={17} />{busy ? "Sending..." : "Send reset link"}</button>
      </>}
      {error && <p className={s.error} role="alert">{error}</p>}
      <Link href="/admin/login">Back to sign in</Link>
    </form>
  </main>;
}
