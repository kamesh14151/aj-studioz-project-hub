-- Promote login names `review2` and `review3` to admin for existing users and future signups.
-- This matches users whose email local-part is review2/review3 (e.g. review3@domain.com).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  login_name TEXT;
  is_admin_login BOOLEAN;
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );

  login_name := split_part(lower(NEW.email), '@', 1);
  is_admin_login := login_name IN ('review2', 'review3');

  IF is_admin_login THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    UPDATE public.profiles
    SET role = 'admin'
    WHERE user_id = NEW.id;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DO $$
DECLARE
  u RECORD;
BEGIN
  FOR u IN
    SELECT id
    FROM auth.users
    WHERE split_part(lower(email), '@', 1) IN ('review2', 'review3')
  LOOP
    INSERT INTO public.user_roles (user_id, role)
    VALUES (u.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    UPDATE public.profiles
    SET role = 'admin'
    WHERE user_id = u.id;
  END LOOP;
END
$$;