import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
export default async function handler(req, res) {
  const sig = req.headers["x-signature"];
  const secret = process.env.WEBHOOK_SECRET;
  const hmac = crypto.createHmac("sha256", secret).update(JSON.stringify(req.body)).digest("hex");
  
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(hmac))) return res.status(403).end();
  const { user_id, amount, order_id } = req.body.meta;
  const supabase = createClient(process.env.SUPA_URL, process.env.SUPA_SERVICE);

  const { data } = await supabase.from("payment_logs").select("*").eq("order_id", order_id).single();
  if (data) return res.json({ success: false });

  await supabase.from("payment_logs").insert({ user_id, order_id, amount, status: "success" });
  const exp = new Date();
  if (amount == 4.99) exp.setDate(exp.getDate() + 90);
  if (amount == 14.99) exp.setDate(exp.getDate() + 365);
  if (amount == 29.99) exp.setFullYear(2099);

  await supabase.from("users").update({
    membership: "premium", expiry_at: exp.toISOString(), is_lifetime: amount == 29.99
  }).eq("id", user_id);
  res.json({ success: true });
}
