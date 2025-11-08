import OpenAI from "openai";

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return corsResponse({ error: "Falta el prompt" }, 400);
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Respóndeme como si fueras Hegel viviendo actualmente en este mundo, reflexionando sobre la sociedad moderna."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 700
    });

    const respuesta =
      completion.choices?.[0]?.message?.content || "No se recibió respuesta.";

    return corsResponse({ result: respuesta }, 200);
  } catch (error) {
    console.error("Error interno:", error);
    return corsResponse({ error: "Error interno del servidor" }, 500);
  }
}

// Función auxiliar para agregar CORS headers
function corsResponse(body, status = 200) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "https://www.hegel2052.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  return new Response(JSON.stringify(body), { status, headers });
}

//  También responder a las peticiones "OPTIONS" (preflight)
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "https://www.hegel2052.com",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}.
