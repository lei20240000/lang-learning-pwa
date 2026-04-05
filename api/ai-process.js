import express from 'express';
import fetch from 'node-fetch';
const app = express();
app.use(express.json());
app.use(express.static('.'));

// 从服务器环境变量读取 API Key（商业化安全）
const API_KEY = process.env.DASHSCOPE_API_KEY;
// 新加坡 Qwen 兼容接口
const QWEN_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";
const MODEL = "qwen3.5-flash";

// 最初的接口结构：/api/ai-process
app.post('/api/ai-process', async (req, res) => {
  const { text, source, target } = req.body;
  try {
    const resp = await fetch(QWEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{
          role: "user",
          content: `Translate from ${source} to ${target}, only return result: ${text}`
        }]
      })
    });
    const data = await resp.json();
    res.json({ translated: data.choices[0].message.content.trim() });
  } catch (e) {
    res.status(500).json({ error: "Error" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
