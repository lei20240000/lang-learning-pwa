import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // 统一设置响应头
  res.setHeader('Content-Type', 'application/json');

  try {
    // 1. 解析请求参数
    const { text, lang } = await req.json();
    if (!text || !lang) throw new Error('参数缺失');

    // 2. 获取当前登录用户
    const supabase = createClient(process.env.SUPA_URL, process.env.SUPA_SERVICE);
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) throw new Error('请先登录');

    // 3. AI翻译优化（通义千问官方兼容接口）
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
          content: `优化中文句子，翻译成${lang}语言，提取1个核心单词，严格返回JSON格式：{"optimized":"优化后的中文","translated":"翻译结果","word":"核心词","trans":"单词翻译"}`
        }, { role: 'user', content: text }]
      })
    });

    const aiData = await aiRes.json();
    if (!aiData.choices) throw new Error('AI服务异常');

    // 4. 解析AI结果
    const result = JSON.parse(aiData.choices[0].message.content.replace(/```json|```/g, ''));

    // 5. 保存学习记录
    await supabase.from('learning_history').insert({
      user_id: user.id,
      original: text,
      optimized: result.optimized,
      translated: result.translated,
      target_lang: lang
    });

    // 6. 返回成功结果
    res.status(200).json(result);

  } catch (err) {
    // 错误返回（解决加载转圈）
    res.status(400).json({ error: err.message });
  }
}
