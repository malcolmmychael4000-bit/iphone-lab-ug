<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6724294b-155f-4ff0-8f86-5736b9f40237

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Inventory data

`public.parts_inventory` is the canonical inventory table used by the public catalog and admin API. The older `parts_products` table is not read or written by the app; it is left untouched so any legacy data there is not discarded.

The inventory API recognizes snake_case and PostgreSQL-folded camelCase column names. Inventory image URLs remain in the `products` Supabase Storage bucket and are kept when an edit or restore payload omits them. Running `supabase_setup.sql` creates or adds optional canonical columns without deleting existing inventory rows or image files. To add just the two screen-tier image columns to an existing deployment, run `supabase_add_tier_image_columns.sql` in the Supabase SQL Editor. Admin saves now report an error instead of silently dropping a tier image if its database column is missing.

Public catalog reads require `SUPABASE_URL` and `SUPABASE_ANON_KEY` (or their `VITE_`-prefixed equivalents) in the deployment environment. Admin inventory writes and image uploads require the server-only `SUPABASE_SERVICE_ROLE_KEY`; never expose that key in client-side code.
