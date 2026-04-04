import { createClient } from '@supabase/supabase-js';
export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) return res.status(403).end();
  const supabase = createClient(process.env.SUPA_URL, process.env.SUPA_SERVICE);
  const { data } = await supabase.from("learning_history").select("translated").limit(1);
  
  const sentence = data[0]?.translated || "Daily Spanish Learning";
  const img = `https://api.qrserver.com/color-matrix/?text=${encodeURIComponent(sentence)}&bg=2563eb&color=ffffff&size=600`;
  
  await supabase.from("tiktok_posts").insert({ user_id: "auto", sentence, image_url: img });
  res.json({ image: img, tip: "复制图片，手动发布到TikTok" });
}
