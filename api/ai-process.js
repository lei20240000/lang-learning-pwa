export default async function handler(req, res) {
  try {
    const { text, from, to } = req.body;
    // ✅ 关键修复：变量名和你Vercel里的 ALI_KEY 完全一致
    const apiKey = process.env.ALI_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API key not found in environment variables" });
    }

    const response = await fetch(
      "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen3.5-flash",
          messages: [
            {
              role: "user",
              content: `Translate the following text from ${from} to ${to}, only return the translated content without any extra explanation:\n${text}`
            }
          ],
          temperature: 0.1,
        }),
      }
    );

    const data = await response.json();

    // 🔒 多层安全校验，彻底杜绝 undefined
    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      console.error("API response:", data);
      throw new Error("No valid translation returned from Qwen API");
    }

    res.status(200).json({ translated: content });

  } catch (err) {
    console.error("Translation error:", err);
    res.status(500).json({ 
      error: "Translation failed", 
      details: err.message 
    });
  }
}
