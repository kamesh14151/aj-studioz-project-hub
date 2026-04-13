DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'ideas'
      AND policyname = 'Users can update own ideas'
  ) THEN
    CREATE POLICY "Users can update own ideas" ON public.ideas
      FOR UPDATE TO authenticated
      USING (auth.uid() = author_id)
      WITH CHECK (auth.uid() = author_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'ideas'
      AND policyname = 'Users can delete own ideas'
  ) THEN
    CREATE POLICY "Users can delete own ideas" ON public.ideas
      FOR DELETE TO authenticated
      USING (auth.uid() = author_id);
  END IF;
END
$$;