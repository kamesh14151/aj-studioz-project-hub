# AJ Studioz Project Hub

## Core Features

- Idea Hub: create, edit, and delete your own ideas.
- Problem Statements: ministry + description cards with full PDF view.
- Video Discussion Community: per-video comments for authenticated users.
- Inventory: pre-book flow, cart checkout, and fallback catalog display when DB inventory is empty.
- Orders: paid order history with invoice PDF download.

## Payments (Dodo)

The checkout edge function now uses Dodo Payments.

Set these Supabase function secrets before using pre-book checkout:

- `DODO_API_KEY`: API key from Dodo Payments dashboard.
- `DODO_PRODUCT_ID`: Product identifier used for the `Pre-book ₹5` payment.
- `DODO_API_BASE_URL` (optional): Defaults to `https://api.dodopayments.com`.
- `DODO_CHECKOUT_ENDPOINT` (optional): Explicit checkout endpoint. If not set, function tries:
	- `${DODO_API_BASE_URL}/v1/checkouts`
	- `${DODO_API_BASE_URL}/v1/checkout-sessions`

Deploy/update the edge function after setting secrets:

```bash
supabase functions deploy create-checkout
```

## Testing Credentials

Use the following credentials only for testing/staging:

- Admin test login: `sona06@gmail.com`
- Password (testing only): `2006`

Notes:

- Admin role assignment is handled by Supabase migrations for allowed test logins.
- If this user does not exist yet, create it in Supabase Auth Users with the above password.
- Do not use these credentials in production. Rotate or remove before go-live.

## Admin Logins (Role Rules)

Admin role is granted through SQL migrations for these test accounts:

- `review2@...` (email local-part `review2`)
- `review3@...` (email local-part `review3`)
- `sona06@gmail.com`

Related migrations:

- `20260413123000_add_review2_admin_login.sql`
- `20260413124500_add_review3_admin_login.sql`
- `20260413130000_add_sona06_admin_login.sql`

Note: password setup/reset is managed in Supabase Auth Users.

## Inventory Seeding

Proper inventory catalog migration:

- `20260413143000_seed_proper_inventory_catalog.sql`

Includes a realistic 30-item component catalog and normalizes stock values.

Fallback behavior:

- If DB inventory is empty, the student dashboard shows built-in catalog from `src/data/defaultInventoryCatalog.ts`.

## Video Discussion Community

Per-video comments are stored in `public.video_comments` via:

- `20260413134500_create_video_comments_discussion.sql`

Policy model:

- Authenticated users can view comments.
- Users can insert/delete their own comments.
- Admins can manage all comments.

## Vercel Auto-Migrations

This project is configured to run SQL migrations automatically during Vercel build.

Flow on deploy:

- `npm run build:vercel`
- runs `npm run migrate:vercel`
- then runs `vite build`

Required Vercel environment variable:

- `SUPABASE_DB_URL` (preferred) or `DATABASE_URL`

Notes:

- Migration files are read from `supabase/migrations` in filename order.
- Applied migrations are tracked in `public.app_migrations`.
- If DB URL is missing, migration step is skipped and build continues.
