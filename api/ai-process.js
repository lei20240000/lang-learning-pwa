import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  try {
    const { text, lang } = await req.json();
    if (!text || !lang) throw new Error('请输入内容');

    const supabase = createClient(process.env.SUPA_URL, process.env.SUPA_SERVICE);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('请先登录');

    // AI 请求（强制返回纯JSON）
    const aiRes = await fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ALI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen3.5-flash',
        messages: [{
          role: 'system',
          content: `你是翻译助手，优化中文句子，翻译成${lang}，提取核心词。只返回JSON，无其他文字：{"optimized":"","translated":"","word":"","trans":""}`
        }, { role: 'user', content: text }]
      })
    });

    const aiData = await aiRes.json();
    const content = aiData.choices[0].message.content;
    
    // 🔥 终极修复：正则自动提取JSON字符串，兼容所有格式
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI返回格式错误');
    
    const result = JSON.parse(jsonMatch[0]);

    // 保存记录
    await supabase.from('learning_history').insert({
      user_id: user.id, original: text,
      optimized: result.optimized, translated: result.translated, target_lang: lang
    });

    res.status(200).json(result);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
