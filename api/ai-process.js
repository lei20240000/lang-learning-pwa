// Vercel 官方标准 Serverless Function，根治405 + JSON错误
export default async function handler(req, res) {
  // 1. 必须设置的CORS头，解决跨域和预检
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // 2. 【核心修复】处理OPTIONS预检请求，直接返回200，彻底解决405
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. 只允许POST请求，其他方法返回标准JSON错误，不会空
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持POST请求' });
  }

  try {
    // 4. 安全解析请求体，避免解析错误
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return res.status(400).json({ error: '请求体格式错误' });
    }

    const { text, lang } = body || {};
    if (!text || !lang) {
      return res.status(400).json({ error: '缺少text或lang参数' });
    }

    // 5. 测试返回（先保证接口通，后续加Qwen）
    return res.status(200).json({
      optimized: text,
      translated: `[${lang}] 翻译结果测试`,
      word: 'test',
      trans: '测试'
    });

  } catch (err) {
    // 6. 兜底返回，绝对不会空，彻底避免前端JSON解析错误
    return res.status(500).json({
      error: err.message,
      optimized: '出错了',
      translated: '接口异常',
      word: 'error',
      trans: '错误'
    });
  }
}
