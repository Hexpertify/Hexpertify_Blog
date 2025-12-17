-- Create a convenient view for subscriptions and seed test rows

-- View: subscriptions_view (select commonly needed fields)
CREATE OR REPLACE VIEW public.subscriptions_view AS
SELECT
  id,
  email,
  name,
  source,
  blog_slug,
  status,
  confirmed,
  confirmed_at,
  unsubscribed_at,
  send_count,
  last_sent_at,
  metadata,
  created_at,
  updated_at
FROM public.subscribers;

-- Seed: insert a couple of test subscribers if not exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.subscribers WHERE lower(email) = lower('test1@example.com')) THEN
    INSERT INTO public.subscribers (email, name, source, blog_slug, confirmed, confirmed_at, created_at)
    VALUES ('test1@example.com', 'Test User 1', 'seed', NULL, true, now(), now());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.subscribers WHERE lower(email) = lower('test2@example.com')) THEN
    INSERT INTO public.subscribers (email, name, source, blog_slug, confirmed, confirmed_at, created_at)
    VALUES ('test2@example.com', 'Test User 2', 'seed', NULL, false, NULL, now());
  END IF;
END;
$$ LANGUAGE plpgsql;
