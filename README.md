# Devyanshu Portfolio CMS App

This is the app version of the portfolio.

- Public portfolio: `/`
- Project case page: `/projects/[id]`
- Hidden admin dashboard: `/admin`

## Local Preview

```bash
npm install
npm run dev
```

The app still works without Supabase in local fallback mode. For production, use Supabase.

## Supabase Setup

1. Create a Supabase project.
2. Open Supabase SQL Editor.
3. Run `supabase/setup.sql`.
4. In Supabase Auth, create your admin user using the same email that appears in `portfolio_admins`.
5. Copy the project URL and anon/publishable key into `.env.local` and Vercel.

Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_CONTENT_MODE=supabase
NEXT_PUBLIC_SUPABASE_ASSET_BUCKET=portfolio-assets
NEXT_PUBLIC_ADMIN_EMAIL=idevyansh.agr@gmail.com
```

Do not expose the Supabase service role key in this frontend app.

## Deployment

Deploy the `portfolio-cms-app` folder to Vercel, add the same environment variables in Vercel Project Settings, then connect the GoDaddy domain in Vercel Domains.

After deployment, use `/admin` to add real project links, screenshots, YouTube demos, gallery notes, resume URLs, FAQs, and visibility settings.
