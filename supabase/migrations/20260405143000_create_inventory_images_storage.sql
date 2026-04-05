-- Create a public bucket for inventory images used by admin inventory management.
INSERT INTO storage.buckets (id, name, public)
VALUES ('inventory-images', 'inventory-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to view inventory images.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Inventory images are publicly readable'
  ) THEN
    CREATE POLICY "Inventory images are publicly readable"
      ON storage.objects
      FOR SELECT
      TO authenticated
      USING (bucket_id = 'inventory-images');
  END IF;
END
$$;

-- Allow only admins to upload inventory images.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins can upload inventory images'
  ) THEN
    CREATE POLICY "Admins can upload inventory images"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'inventory-images' AND public.has_role(auth.uid(), 'admin'));
  END IF;
END
$$;

-- Allow only admins to update inventory images.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins can update inventory images'
  ) THEN
    CREATE POLICY "Admins can update inventory images"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (bucket_id = 'inventory-images' AND public.has_role(auth.uid(), 'admin'))
      WITH CHECK (bucket_id = 'inventory-images' AND public.has_role(auth.uid(), 'admin'));
  END IF;
END
$$;

-- Allow only admins to delete inventory images.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins can delete inventory images'
  ) THEN
    CREATE POLICY "Admins can delete inventory images"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id = 'inventory-images' AND public.has_role(auth.uid(), 'admin'));
  END IF;
END
$$;
