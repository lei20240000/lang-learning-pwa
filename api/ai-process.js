export default async function handler(req, res) {
  try {
    const { text, from, to } = req.body;
    const apiKey = process.env.ALI_KEY;

    if (!apiKey) return res.status(500).json({ error: "No API key" });

    const resp = await fetch("https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen3.5-flash",
        messages: [{
          role: "user",
          content: `Translate from ${from} to ${to}, only return the result:\n${text}`
        }],
        temperature: 0.1
      })
    });

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("Empty response");

    res.json({ translated: content });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Translation failed" });
  }
}
