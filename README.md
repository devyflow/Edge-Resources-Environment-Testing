# Devyanshu Portfolio CMS App

This is the app version of the portfolio.

- Public portfolio: `/`
- Project case page: `/projects/[id]`
- Private admin dashboard: `/admin`

## Local Preview

```bash
npm install
npm run dev
```

For an offline development studio, set `NEXT_PUBLIC_CONTENT_MODE=local`. The local
passcode is deliberately disabled as a production security boundary.

## Supabase Setup

1. Create a Supabase project.
2. In Authentication > Users, create and verify `idevyansh.agr@gmail.com`.
3. Copy that user's UUID. This is the immutable production administrator ID.
4. Open SQL Editor and run `supabase/setup.sql`.
5. Add the variables below to `.env.local` and the deployment environment.
6. Sign in at `/admin/login` and enroll an authenticator when prompted.
7. Disable public user signups and review Authentication > Rate Limits in Supabase.

Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_CONTENT_MODE=supabase
NEXT_PUBLIC_SUPABASE_ASSET_BUCKET=portfolio-assets
NEXT_PUBLIC_ADMIN_EMAIL=idevyansh.agr@gmail.com
SUPABASE_ADMIN_USER_ID=the-auth-user-uuid
```

`SUPABASE_ADMIN_USER_ID` is server-only. Do not prefix it with `NEXT_PUBLIC_`.
Never expose the Supabase service-role key in this application.

The database policies require the allowlisted user ID and an `aal2` MFA session
for content or asset writes. `/admin` checks the same conditions before rendering.
Content updates are copied to `portfolio_content_audit` for revision history.
Public reads remain enabled because the portfolio and its published media are public.

## Deployment

Deploy the `portfolio-cms-app` folder to Vercel, add the same environment variables
in Vercel Project Settings, and connect the domain in Vercel Domains. A production
deployment with local content mode or incomplete admin variables returns `503` for
admin routes instead of silently enabling the browser passcode.

After deployment, use `/admin` to add real project links, screenshots, YouTube demos, gallery notes, resume URLs, FAQs, and visibility settings.
