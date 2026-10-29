# Supabase setup

## 1. Create a project

Create a project at https://supabase.com/, then open the project dashboard.

From **Project Settings -> API**, copy:

- Project URL -> `VITE_SUPABASE_URL`
- Publishable key or legacy anon key -> `VITE_SUPABASE_ANON_KEY`

Never put a `service_role` key in the browser or in GitHub Pages.

## 2. Create the database and storage

Open **SQL Editor**, create a new query, paste the complete contents of `supabase/schema.sql`, and run it.

The script creates the `memories` table, the public `memory-images` Storage bucket, RLS policies, and Realtime publication.

The policies intentionally allow anonymous visitors to read, create, and delete shared memories. This matches the current shared-board behavior; add authentication before using private memories.

## 3. Local development

Copy `.env.example` to `.env.local` and fill in the two Supabase values, then restart Vite:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

## 4. GitHub Pages

In **Repository Settings -> Secrets and variables -> Actions**, add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Then rerun the Pages workflow. Existing Firebase and Cloudinary secrets are no longer used by the application and can be deleted from GitHub.
