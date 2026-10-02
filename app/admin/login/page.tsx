"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Aperture, KeyRound, Lock, LogOut, ShieldCheck } from "lucide-react";
import {
  getSupabaseUser,
  isConfiguredAdminEmail,
  signInSupabaseAdmin,
  signOutSupabaseAdmin,
  supabaseConfigured
} from "@/lib/content-store";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import s from "../admin.module.css";

type LoginStep = "credentials" | "enroll" | "verify";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);

  async function prepareMfa() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) throw new Error("Secure admin authentication is not configured.");

    const { data: assurance, error: assuranceError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assuranceError) throw assuranceError;
    if (assurance.currentLevel === "aal2") {
      router.replace("/admin");
      router.refresh();
      return;
    }

    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) throw factorsError;
    const verified = factors.totp.find((factor) => factor.status === "verified");
    if (verified) {
      setFactorId(verified.id);
      setStep("verify");
      return;
    }

    for (const factor of factors.totp.filter((item) => item.status !== "verified")) {
      await supabase.auth.mfa.unenroll({ factorId: factor.id });
    }
    const { data: enrollment, error: enrollmentError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "DevyFlow Studio"
    });
    if (enrollmentError) throw enrollmentError;
    setFactorId(enrollment.id);
    setQrCode(enrollment.totp.qr_code);
    setSecret(enrollment.totp.secret);
    setStep("enroll");
  }

  useEffect(() => {
    async function resume() {
      setUnauthorized(new URLSearchParams(window.location.search).get("error") === "not-authorized");
      if (!supabaseConfigured()) return;
      const user = await getSupabaseUser();
      if (!user) return;
      if (!isConfiguredAdminEmail(user.email)) {
        await signOutSupabaseAdmin();
        setStatus("This account is not permitted to manage the portfolio.");
        return;
      }
      try {
        await prepareMfa();
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not prepare two-step verification.");
      }
    }
    void resume();
    // prepareMfa is intentionally run once to resume an existing Supabase session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitCredentials(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      await signInSupabaseAdmin(email, password);
      setPassword("");
      await prepareMfa();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  async function submitMfa(event: React.FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !factorId) return;
    setBusy(true);
    setStatus("");
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.trim() });
      if (error) throw error;
      await supabase.auth.refreshSession();
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "That verification code was not accepted.");
    } finally {
      setBusy(false);
    }
  }

  async function changeAccount() {
    await signOutSupabaseAdmin();
    setStep("credentials");
    setCode("");
    setFactorId("");
    setQrCode("");
    setSecret("");
    setStatus("");
  }

  return (
    <main className={s.loginPage}>
      <form className={s.loginPanel} onSubmit={step === "credentials" ? submitCredentials : submitMfa}>
        {step === "credentials" ? <Aperture size={42} strokeWidth={1.25} /> : <ShieldCheck size={42} strokeWidth={1.25} />}
        <span className={s.eyebrow}>SECURE ADMIN</span>
        <h1>{step === "credentials" ? "Open the studio." : step === "enroll" ? "Protect the studio." : "Verify it is you."}</h1>

        {step === "credentials" ? (
          <>
            <p>Use the administrator account. Editing requires both your password and authenticator.</p>
            <label><span>Email</span><input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label><span>Password</span><input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          </>
        ) : (
          <>
            {step === "enroll" && qrCode && <div className={s.qrFrame}><img src={qrCode} alt="Authenticator enrollment QR code" /></div>}
            <p>{step === "enroll" ? "Scan the code in an authenticator app, then enter its six-digit code. Keep the setup key somewhere private." : "Enter the current six-digit code from your authenticator app."}</p>
            {step === "enroll" && secret && <code className={s.mfaSecret}>{secret}</code>}
            <label><span>Verification code</span><input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} required /></label>
          </>
        )}

        {(status || unauthorized) && <p className={s.error} role="alert">{status || "That account is authenticated but is not the configured portfolio administrator."}</p>}
        <button type="submit" disabled={busy}>{step === "credentials" ? <Lock size={17} /> : <KeyRound size={17} />}{busy ? "Checking..." : step === "credentials" ? "Continue securely" : "Verify and enter"}</button>
        {step !== "credentials" && <button type="button" className={s.secondaryLoginAction} onClick={() => void changeAccount()}><LogOut size={16} />Use another account</button>}
        <Link href="/preview/entry">Return to the portfolio</Link>
      </form>
    </main>
  );
}
