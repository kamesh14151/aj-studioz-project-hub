CREATE TABLE IF NOT EXISTS public.community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'community_messages'
      AND policyname = 'Community messages are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Community messages are viewable by authenticated users"
      ON public.community_messages
      FOR SELECT TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'community_messages'
      AND policyname = 'Users can insert own community messages'
  ) THEN
    CREATE POLICY "Users can insert own community messages"
      ON public.community_messages
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'community_messages'
      AND policyname = 'Users can delete own community messages'
  ) THEN
    CREATE POLICY "Users can delete own community messages"
      ON public.community_messages
      FOR DELETE TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'community_messages'
      AND policyname = 'Admins can manage community messages'
  ) THEN
    CREATE POLICY "Admins can manage community messages"
      ON public.community_messages
      FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END
$$;