import OpenAI from "openai";
import { palabrasClave } from "./keywords.js"; // lista de variaciones

//  Dominios permitidos
const allowedOrigins = [
  "https://www.hegel2052.com",
  "https://hegel2052.com",
  "https://hegel2052.vercel.app"
];

//  Helper avanzado para CORS
function corsHeaders(origin) {
  if (!origin) origin = "";
  const normalizedOrigin = origin.replace(/^https?:\/\//, "").replace(/^www\./, "");
  const allowed = allowedOrigins.some((o) =>
    o.replace(/^https?:\/\//, "").replace(/^www\./, "") === normalizedOrigin
  );

  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": allowed ? origin : "https://hegel2052.vercel.app",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

//  Endpoint principal
export async function POST(req) {
  try {
    const origin = req.headers.get("origin") || "";
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Falta el prompt" }), {
        status: 400,
        headers: corsHeaders(origin)
      });
    }

    //  Verificar si pregunta por el autor
    const text = prompt.toLowerCase();
    const preguntaAutor = palabrasClave.some((frase) => text.includes(frase));

    if (preguntaAutor) {
      const respuestaAutor =
        "Esta aplicación fue creada por **Adrián** (GitHub: https://github.com/adriancorro) con la tecnología de **ChatGPT (OpenAI)**.";
      return new Response(JSON.stringify({ result: respuestaAutor }), {
        status: 200,
        headers: corsHeaders(origin)
      });
    }

    //  Si no pregunta por el autor, responder como Hegel IA
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Respóndeme como si fueras Hegel viviendo actualmente en este mundo moderno, reflexionando sobre la sociedad contemporánea y la dialéctica del espíritu."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 800
    });

    const respuesta =
      completion.choices?.[0]?.message?.content || "Sin respuesta generada.";

    return new Response(JSON.stringify({ result: respuesta }), {
      status: 200,
      headers: corsHeaders(origin)
    });
  } catch (error) {
    console.error("Error interno:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: corsHeaders("") }
    );
  }
}

//  OPTIONS (preflight CORS)
export async function OPTIONS(req) {
  const origin = req.headers.get("origin") || "";
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}
