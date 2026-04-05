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
