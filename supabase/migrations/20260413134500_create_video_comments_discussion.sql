CREATE TABLE IF NOT EXISTS public.video_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_key TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.video_comments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'video_comments'
      AND policyname = 'Video comments are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Video comments are viewable by authenticated users"
      ON public.video_comments
      FOR SELECT TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'video_comments'
      AND policyname = 'Users can insert own video comments'
  ) THEN
    CREATE POLICY "Users can insert own video comments"
      ON public.video_comments
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'video_comments'
      AND policyname = 'Users can delete own comments'
  ) THEN
    CREATE POLICY "Users can delete own comments"
      ON public.video_comments
      FOR DELETE TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'video_comments'
      AND policyname = 'Admins can manage video comments'
  ) THEN
    CREATE POLICY "Admins can manage video comments"
      ON public.video_comments
      FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END
$$;