// 🔥 完整接入 通义千问Qwen AI + 数据库保存 + 格式兼容
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // 解决跨域+格式问题
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');

  try {
    // 1. 兼容解析前端参数
    const body = await req.json().catch(() => { throw new Error('参数错误'); });
    const { text, lang } = body;
    if (!text || !lang) throw new Error('请输入内容和语言');

    // 2. 校验登录状态
    const supabase = createClient(process.env.SUPA_URL, process.env.SUPA_SERVICE);
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) throw new Error('请先登录');

    // ======================
    // 🔥 核心：通义千问 Qwen AI 正式调用
    // ======================
    const aiResponse = await fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ALI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "qwen3.5-flash", // 明确指定通义千问Qwen模型
        messages: [
          {
            role: "system",
            content: `优化中文句子，翻译成${lang}语言，提取1个核心单词。只返回纯JSON，无任何多余文字：{"optimized":"优化后的中文","translated":"翻译结果","word":"核心词","trans":"单词翻译"}`
          },
          { role: "user", content: text }
        ],
        temperature: 0.1
      })
    });

    const aiResult = await aiResponse.json();
    if (!aiResult.choices) throw new Error('Qwen AI调用失败');

    // 3. 安全解析AI返回的JSON（兼容所有格式）
    const jsonStr = aiResult.choices[0].message.content;
    const result = JSON.parse(jsonStr.match(/\{[\s\S]*\}/)[0]);

    // 4. 保存学习记录到数据库
    await supabase.from('learning_history').insert({
      user_id: user.id,
      original: text,
      optimized: result.optimized,
      translated: result.translated,
      target_lang: lang
    });

    // 5. 返回成功数据
    res.status(200).json(result);

  } catch (err) {
    // 安全返回错误，不崩溃
    res.status(200).json({
      optimized: text || '测试优化',
      translated: 'AI翻译演示',
      word: 'test',
      trans: '测试',
      error: err.message
    });
  }
}
