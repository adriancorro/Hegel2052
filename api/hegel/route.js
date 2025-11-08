import OpenAI from "openai";

// ✅ Función que maneja las peticiones POST (cuando el usuario hace "Preguntar")
export async function POST(req) {
  try {
    const { prompt } = await req.json();

    // Si no hay texto enviado, devolver error
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Falta el prompt" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Crear cliente OpenAI con tu clave (guardada en Vercel → Environment Variables)
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Hacer la llamada a ChatGPT (modelo rápido y económico)
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // o "gpt-4o" si tu cuenta lo permite
      messages: [
        {
          role: "system",
          content: "Respóndeme como si fueras Hegel viviendo actualmente en este mundo, reflexionando sobre la sociedad moderna."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 700
    });

    // Tomar el texto de la respuesta
    const respuesta = completion.choices?.[0]?.message?.content || "No se recibió respuesta.";

    // Devolver al navegador
    return new Response(
      JSON.stringify({ result: respuesta }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error interno:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
