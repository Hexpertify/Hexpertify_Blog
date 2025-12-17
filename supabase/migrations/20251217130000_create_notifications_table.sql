-- Migration: create notifications table for background email jobs

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug text NOT NULL,
  title text,
  description text,
  status text DEFAULT 'pending', -- pending, processing, sent, failed
  attempts integer DEFAULT 0,
  last_error text,
  scheduled_at timestamptz,
  payload jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications (status);
