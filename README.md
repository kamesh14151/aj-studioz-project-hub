# AJ Studioz Project Hub

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
