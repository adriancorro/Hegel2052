import OpenAI from "openai";

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await client.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "Respóndeme como si fueras Hegel viviendo actualmente en este mundo."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    return new Response(
      JSON.stringify({ result: completion.choices[0].message.content }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Error en el servidor" }),
      { status: 500 }
    );
  }
}
