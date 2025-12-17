import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function enqueueNotification(data: {
  post_slug: string;
  title?: string;
  description?: string;
  payload?: any;
  scheduled_at?: string | null;
}) {
  const record = {
    post_slug: data.post_slug,
    title: data.title || null,
    description: data.description || null,
    payload: data.payload || null,
    scheduled_at: data.scheduled_at || null,
  } as any;

  const { data: inserted, error } = await supabaseAdmin.from('notifications').insert([record]).select().limit(1);
  if (error) {
    throw error;
  }
  return inserted?.[0] || null;
}

export async function fetchPendingNotifications(limit = 10) {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function markNotificationStatus(id: string, status: string, opts?: { last_error?: string }) {
  const { last_error } = opts || {};
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .update({ status, last_error })
    .eq('id', id)
    .select()
    .limit(1);
  if (error) throw error;
  return data?.[0] || null;
}
