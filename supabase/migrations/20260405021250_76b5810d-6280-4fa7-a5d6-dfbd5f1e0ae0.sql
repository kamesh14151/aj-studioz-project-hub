-- Add image_url column to inventory
ALTER TABLE public.inventory ADD COLUMN image_url TEXT;

-- Enable realtime for all main tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.ideas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;