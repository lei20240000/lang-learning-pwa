import { createClient } from '@supabase/supabase-js';
export default async function handler(req, res) {
  const supabase = createClient(process.env.SUPA_URL, process.env.SUPA_SERVICE);
  const { data: { user } } = await supabase.auth.getUser();
  const exp = new Date();
  exp.setDate(exp.getDate() + 7);
  await supabase.from("users").update({
    membership: "premium", expiry_at: exp.toISOString(), trial_used: true
  }).eq("id", user.id);
  res.json({ ok: true });
}
