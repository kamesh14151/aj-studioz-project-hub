-- Add payment lifecycle and delivery metadata to bookings.
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled')),
  ADD COLUMN IF NOT EXISTS delivery_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (delivery_status IN ('pending', 'packed', 'shipped', 'delivered')),
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS invoice_number TEXT,
  ADD COLUMN IF NOT EXISTS order_group_id UUID,
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS delivery_address TEXT,
  ADD COLUMN IF NOT EXISTS delivery_city TEXT,
  ADD COLUMN IF NOT EXISTS delivery_state TEXT,
  ADD COLUMN IF NOT EXISTS delivery_pincode TEXT;

CREATE INDEX IF NOT EXISTS idx_bookings_user_payment_status
  ON public.bookings(user_id, payment_status);

CREATE INDEX IF NOT EXISTS idx_bookings_order_delivery_status
  ON public.bookings(order_group_id, delivery_status);

CREATE INDEX IF NOT EXISTS idx_bookings_order_group
  ON public.bookings(order_group_id);
