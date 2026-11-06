"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { KeyRound, Lock } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { passwordResetError } from "@/lib/password-reset-validation";
import s from "../admin.module.css";

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [factorId, setFactorId] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function check() {
      try {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) throw new Error("Password recovery is not configured.");
        // The browser client exchanges the PKCE email code during initialization.
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) throw new Error("This reset link is expired, invalid, or opened in a different browser. Request a new link and open it in the same browser.");
        const { data: assurance, error: assuranceError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (assuranceError) throw assuranceError;
        if (assurance.currentLevel !== "aal2" && assurance.nextLevel === "aal2") {
          const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
          if (factorsError) throw factorsError;
          const factor = factors.totp.find(item => item.status === "verified");
          if (!factor) throw new Error("This account requires a different second factor. Contact your administrator for account recovery.");
          if (active) setFactorId(factor.id);
        }
        if (active) setReady(true);
      } catch (error) {
        if (active) setError(error instanceof Error ? error.message : "Could not verify the reset link.");
      } finally {
        if (active) setChecking(false);
      }
    }
    void check();
    return () => { active = false; };
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!ready || busy) return;
    const validation = passwordResetError(password, confirmation);
    if (validation) { setError(validation); return; }
    setBusy(true);
    setError("");
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Password recovery is not configured.");
      if (factorId) {
        const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
        if (error) throw error;
      }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword("");
      setConfirmation("");
      setCode("");
      setComplete(true);
      await supabase.auth.signOut();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not update your password.");
    } finally {
      setBusy(false);
    }
  }

  return <main className={s.loginPage}>
    <form className={`${s.loginPanel} ${s.recoveryPanel}`} onSubmit={submit}>
      <KeyRound size={42} strokeWidth={1.25} />
      <span className={s.eyebrow}>ACCOUNT RECOVERY</span>
      <h1>{complete ? "Password updated." : "Choose a new password."}</h1>
      {checking ? <p role="status">Verifying your reset link...</p> : complete ? <p role="status">Sign in with your new password. Authenticator verification is still required to enter the studio.</p> : ready ? <>
        <label><span>New password</span><input type="password" autoComplete="new-password" minLength={12} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} required /></label>
        <label><span>Confirm new password</span><input type="password" autoComplete="new-password" minLength={12} maxLength={128} value={confirmation} onChange={event => setConfirmation(event.target.value)} required /></label>
        <p>Use 12 or more characters.</p>
        {factorId && <label><span>Authenticator code</span><input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, ""))} required /></label>}
        <button type="submit" disabled={busy}><Lock size={17} />{busy ? "Saving..." : "Save new password"}</button>
      </> : null}
      {error && <p className={s.error} role="alert">{error}</p>}
      {!complete && !checking && <Link href="/admin/forgot-password">Request a new reset link</Link>}
      <Link href="/admin/login">Back to sign in</Link>
    </form>
  </main>;
}
