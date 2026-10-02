# Admin security status

Work resumed on October 2, 2026. The production security foundation is now in
the application and `supabase/setup.sql`:

- Cookie-based Supabase sessions and server-side `/admin` route checks.
- Immutable Auth user ID allowlisting plus mandatory `aal2` MFA for writes.
- Private authorization helper, RLS-protected content and uploads, and audit
  snapshots for content changes.
- Development-only local passcode; production fails closed when configuration is
  missing or local mode is requested.
- Nonce-based CSP and standard browser security headers.

Before the first deployment, create the Supabase Auth administrator, run the SQL,
configure the environment variables, enroll MFA, disable public signup, and review
the hosted Auth rate limits. The remaining product work is:

- Protect drafts and hidden/private content at the data-access layer.
- Support projects, media, background photos, resume versions, ordering and
  section visibility through draft, preview and publish workflows.
- Preserve existing content and routes through a migration with a rollback path.
- Test unauthorized access, uploads, public/draft separation and session expiry.
