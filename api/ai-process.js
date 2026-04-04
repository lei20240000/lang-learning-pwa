import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  try {
    // 自动解析请求，兼容所有格式
    let body;
    try {
      body = await req.json();
    } catch {
      throw new Error("参数格式错误");
    }

    const { text, lang } = body;
    if (!text || !lang) throw new Error("请输入内容");

    // 初始化数据库
    const supabase = createClient(process.env.SUPA_URL, process.env.SUPA_SERVICE);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("请登录");

    // 测试返回（先屏蔽AI，验证请求是否正常）
    const result = {
      optimized: text,
      translated: "测试翻译",
      word: "test",
      trans: "测试"
    };

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
