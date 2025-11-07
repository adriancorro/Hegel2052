import OpenAI from "openai";

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Prompt missing or invalid' }), { status: 400, headers: { "Content-Type": "application/json" }});
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Respóndeme como si fueras Hegel viviendo actualmente en este mundo." },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 800
    });

    const text = completion?.choices?.[0]?.message?.content || '';

    return new Response(JSON.stringify({ result: text }), { status: 200, headers: { "Content-Type": "application/json" }});

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" }});
  }
}
