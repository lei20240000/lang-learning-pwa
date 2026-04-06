export default async function handler(req, res) {
  try {
    const { text, from, to } = req.body;
    const apiKey = process.env.QWEN_API_KEY;

    const response = await fetch("https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen3.5-flash",
        messages: [{
          role: "user",
          content: `Translate from ${from} to ${to}:\n${text}`
        }],
        temperature: 0.3
      })
    });

    const data = await response.json();
    res.status(200).json({ translated: data.choices[0].message.content.trim() });
  } catch (e) {
    res.status(500).json({ error: "Translation failed" });
  }
}
