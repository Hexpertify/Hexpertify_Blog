-- Migration: create subscribers table
-- Run with Supabase migrations or psql against your project's database

-- ensure pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  source text DEFAULT 'website', -- e.g., 'blog', 'signup-form', 'admin'
  blog_slug text,
  status text DEFAULT 'subscribed', -- subscribed, unsubscribed, bounced
  confirmed boolean DEFAULT false,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  send_count integer DEFAULT 0,
  last_sent_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- unique index on email (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_email_ci ON public.subscribers (lower(email));

-- trigger to update updated_at on row change
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp ON public.subscribers;
CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();
