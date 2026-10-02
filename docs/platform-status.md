# DevyFlow: current features and next workflow

Verified from the local code on 2026-10-01. The camera experience is an isolated
prototype at `/preview/camera`, not a replacement deployed to production.

## Welcome and portfolio direction preview

The newer entry point is `/preview/entry`. This preview is separate from the
production homepage, Supabase content, and admin interface.

- Welcome: tactile experience dial, keyboard and pointer selection, photographic
  scene changes, direct selection buttons, and a shutter-curtain entry transition.
- The Engineer: `/preview/entry/work`, with a concise introduction, selected
  projects, resume/contact/social links, and a working JSON Desk alongside work.
- Beyond the Code: `/preview/entry/personal`. The existing photographic simulation
  is reused here without a Work/Photos mode switch. Personal content remains a
  later phase; credited reference photographs are not the owner's photographs.
- DevyFlow case: same-tab preview at `/preview/entry/work/devyflow`, using an
  actual existing website screenshot. Other project entries remain case drafts.
- JSON Desk: native JSON validation, formatting, minification, clipboard copy,
  and download. Input stays in memory on the device and is limited to 250,000
  characters. This does not publish the other seeded tools as working utilities.
- Audio: original browser synthesis for shutter clicks and the optional River
  Study drone/bell ambience. No third-party recordings or samples are bundled.
  Music starts only on request; shutter mute is remembered. Audio pauses when
  the document is hidden. Music is a direction sample, not an authentic recording
  from Varanasi or a claimed traditional composition.
- Comparison preview: `/preview/entry-layouts`, desktop 1366px and mobile 390px.

Keep this as a reviewable direction before replacing the public homepage. Confirm
the names, personal photographs, case details, and sound character before release.

## Working camera prototype

- Work and Photos modes, selected with buttons or a physical-style dial.
- Dials accept clicks, vertical dragging, arrow keys, Home, and End.
- Work mode shows overview, architecture, or source notes using the depth dial.
- Same-tab links to existing project routes; repository links where available.
- Photos mode includes three credited reference photographs, tap-to-focus,
  simulated aperture/depth, exposure adjustment, color/monochrome, framing grid,
  optional synthesized shutter sound, reset, and an enlarged view.
- Capture records a frame and its settings in memory for the current page session.
- Playback preserves each frame's settings and can export a JPEG.
- No webcam, file upload, account, or server-side capture is involved.
- Narrow-screen controls, light/dark surroundings, reduced-motion support,
  keyboard controls, and labeled buttons.
- `/preview/camera/layouts` presents live 1366px desktop and 390px mobile viewports.
- `/preview/camera/mobile` is a separate direct mobile preview.

Photographs are references, not Devyanshu's work. Credits are displayed and listed
in `public/camera-preview/CREDITS.md`. The Portfolio CMS example is only a local
demonstration of the current codebase; it is not a newly published CMS project.

## Existing portfolio application

| Feature | Current implementation |
| --- | --- |
| Public homepage | Profile, projects and filters, skills, experience, field notes, resume, contact |
| Project pages | Same-tab routes, screenshots carousel, YouTube embed, problem/solution/build, workflow, challenges, learning, FAQs, external links |
| Theme and motion | Light/dark mode, animated hero text, CSS motion, responsive breakpoints |
| Admin access | Server-gated `/admin`; Supabase Auth, fixed user ID allowlist, and required TOTP MFA; local passcode only in development |
| Project editing | Edit, add, remove, or hide project entries; screenshots, thumbnails, descriptions, tags, FAQs, URLs |
| Gallery editing | Edit, add, remove, or hide field notes; captions and real image uploads |
| Visibility | Homepage and case-page section toggles; project/note visibility flags |
| Resume | Public PDF and editable download/request URLs; no PDF upload field in the admin yet |
| Skills and experience | Editable rows in the Skills tab |
| Content backup | JSON export/import/default-draft controls plus database audit snapshots for each content change |
| Content storage | One `portfolio_content` JSON document in production; browser-local content only in explicit development mode |
| Upload storage | Supabase public `portfolio-assets` bucket; image upload control |
| Authorization | Server route guard plus RLS requiring the allowlisted Auth UUID and an `aal2` session for content and storage writes |
| Contact | A mailto form that opens the visitor's mail client; no inbox or email bot |

## Started but not working product features

The earlier draft added `FreeTool`, `JournalPost`, and publishing-status types and
sample data. These are schema scaffolding only. There are no public Tools/Journal
routes, working utility engines, blog editor, publishing scheduler, newsletter,
social posting integration, or lead inbox. Draft text in seed data is not a
verified account of personal accomplishments or already shipped utilities.

## Current availability

- `https://devyflow.in` resolves and returned HTTP 200 on this audit.
- The configured `vsrcwwzzemibatwybvzv.supabase.co` hostname returned NXDOMAIN
  using Google's public resolver. The dashboard must be checked before deciding
  whether to restore the project or replace its configuration.
- With that backend unreachable, remote login, saves, uploads, and the SQL
  migration cannot be validated against the hosted project. Public pages use
  their checked-in defaults; production admin routes fail closed.
- The production environment configuration and live database policies have not
  been inspected from authenticated dashboards in this pass.

## Current workflow

Visitor: homepage -> project -> screenshots/demo/case details -> resume or email.

Owner: `/admin/login` -> password -> authenticator code -> edit/upload -> Save ->
RLS-authorized content document and audit snapshot in Supabase -> public pages
load it. Local mode saves only in the current browser and is development-only.
This production workflow requires restoring the backend and applying the current SQL.

Developer: change application code -> build and test -> commit/push -> Vercel
deployment. Admin content changes do not require a code deployment.

## Recommended next implementation order

1. Evaluate this small camera preview. Decide which controls help visitors and
   keep a direct Work/resume/contact path for recruiters.
2. Restore Supabase and export existing content/assets before migration.
3. Agree on shared types and API examples so frontend and backend can be developed
   independently. Give each task a clear file boundary and acceptance criteria.
4. Replace the single JSON document with separate projects, posts, media, tools,
   revisions, and settings records. Preserve existing URLs and content in a
versioned migration with a rollback path.
5. Build admin workflow: create draft -> edit -> preview -> publish or schedule ->
   revise/archive. Public reads must exclude unpublished records at the database
   or server layer, not just filter them in the browser.
6. Add a media library with upload, caption, alt text, author/credit, focal point,
   and image usage. Add PDF upload/version management for the resume.
7. Deliver one complete free tool and one complete Journal publishing workflow.
   Test actual visitor utility before expanding the catalog.
8. Add contact delivery and a small inbox; social distribution can follow after
   publishing has a stable source of truth.

## Existing gaps to address during that work

- Visibility flags currently hide cards in the UI, but the full JSON document is
  publicly readable. Hidden is not private.
- The current project route can open hidden entries and substitutes the first
  project for unknown slugs. Unpublished entries need access enforcement and
  unknown slugs need a real not-found response.
- The admin YouTube profile URL is editable, but the homepage's Project demos
  action currently scrolls to Work rather than opening that channel.
- Project screenshots and claims still require the owner's confirmation.
- Captures in the prototype reset on reload; persistence is not yet a requirement.

Use stronger review for authentication, migrations, public/draft separation, and
file permissions. Routine CRUD, fixtures, forms, and focused tests can be assigned
to smaller models after the contracts are defined.
