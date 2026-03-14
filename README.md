# IntentVault

IntentVault is a production-ready MVP built with Next.js, Supabase, Gemini, and Tailwind. It helps users save screenshots, links, and notes, then uses AI to explain why the item matters before the user saves it.

## What is included

- Email/password authentication with Supabase
- Google OAuth button if Supabase Google auth is configured
- Protected dashboard and item routes
- Save flow for text notes, URLs, and screenshots
- OCR for screenshots using `tesseract.js`
- AI intent classification with validated JSON output and graceful fallback
- Review step before saving
- Search, category filters, and newest/oldest sorting
- Item detail view with edit and delete support
- Supabase SQL migration with RLS policies
- Vercel-friendly Next.js app structure

## Tech stack

- Next.js App Router
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui-style components
- Supabase Auth, Postgres, and Storage
- Google Gemini API
- tesseract.js

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
GEMINI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project.

3. In Supabase SQL Editor, run the migration in [supabase/migrations/001_init.sql](/Users/tamimalahad/Documents/IntentVault/supabase/migrations/001_init.sql).

4. In Supabase Storage, create a private bucket named `item-images`.

5. In Supabase Auth:

- Enable Email auth.
- Optionally enable Google auth.
- Add your local callback URL: `http://localhost:3000/auth/callback`
- Add your deployed callback URL later as `https://your-domain.com/auth/callback`

6. Add the environment variables to `.env.local`.

7. Start the app:

```bash
npm run dev
```

8. Open `http://localhost:3000`.

## Main user flow

1. Sign up or log in.
2. Open `/items/new`.
3. Save one of:
   - a text note
   - a URL
   - a screenshot image
4. Wait for OCR and AI classification.
5. Review and edit the AI fields.
6. Save the item.
7. Browse it from the dashboard.
8. Open the detail page to edit or delete it.

## Supabase notes

- `saved_items` uses RLS so each user only accesses their own rows.
- A trigger creates or updates a row in `profiles` whenever a new auth user is created.
- Image uploads use the service role key on the server so the bucket can stay private.
- Dashboard and detail pages create signed URLs for image previews.

## Gemini behavior

- The app uses the Gemini API with the free-tier `gemini-2.5-flash-lite` model.
- It requests structured JSON for `title`, `summary`, `intent`, `category`, and `suggested_action`.
- Every response is validated with Zod before use.
- If Gemini is unavailable or returns malformed JSON, the app falls back to a heuristic classifier so the save flow still works.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Create a new Vercel project.
3. Add the same environment variables from `.env.local`.
4. In Supabase Auth, add your production callback URL:

```text
https://your-vercel-domain.vercel.app/auth/callback
```

5. Deploy.

## Project structure

```text
app/
  (auth)/              Login and signup
  (app)/               Protected product UI
  api/items/           Analyze, create, update, delete routes
actions/               Auth server actions
components/            UI, layout, and item components
lib/                   Supabase, AI, validation, helpers
supabase/migrations/   Database setup SQL
```

## What still needs improvement after MVP

- background reminders and notifications
- better URL content extraction for more websites
- bulk actions and richer dashboard analytics
- stronger storage cleanup for abandoned draft uploads
- automated tests and CI

## Manual test checklist

- Sign up with email and log in.
- Log out and log back in.
- Try Google OAuth if configured.
- Save a text note and confirm it appears on the dashboard.
- Save a URL and confirm metadata + AI classification work.
- Save a screenshot and confirm OCR text appears before analysis.
- Edit AI fields in the review step and save.
- Open the item detail page and update the item.
- Delete the item and confirm it disappears from the dashboard.
