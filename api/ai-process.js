export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  const { text, lang, user_id } = await req.json();
  const key = process.env.ALI_KEY;
  const supabase = (await import('@supabase/supabase-js')).createClient(process.env.SUPA_URL, process.env.SUPA_SERVICE);
  
  const r = await fetch("https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "qwen3.5-flash",
      messages: [{
        role: "system",
        content: "优化中文句式，翻译成西班牙语，提取1个核心词，只返回JSON：{optimized,translated,word,trans}"
      }, { role: "user", content: text }]
    })
  });
  const d = await r.json();
  let c = d.choices[0].message.content;
  c = c.substring(c.indexOf("{"), c.lastIndexOf("}") + 1).replace(/```/g, "");
  const result = JSON.parse(c);
  
  await supabase.from("learning_history").insert({
    user_id, original: text, optimized: result.optimized, translated: result.translated, target_lang: lang
  });
  res.json(result);
}
