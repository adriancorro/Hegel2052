import OpenAI from "openai";

//  Lista de dominios permitidos
const allowedOrigins = [
  "https://www.hegel2052.com",
  "https://hegel2052.com",
  "https://hegel2052.vercel.app"
];

//  Frases clave integradas (como si vinieran de keywords.js)
const palabrasClave = [
  // Español
  "quién hizo esta app", "quien hizo esta aplicación", "quien la creó",
  "quien la desarrollo", "quien la programó", "quien hizo esta web",
  "quien desarrollo esta web", "quien creó esta página", "quien creó esta ia",
  "quien creo esta inteligencia", "quien creo hegel ia", "quien hizo hegel ia",
  "como se hizo esta app", "como se desarrolló esta aplicación",
  "como se programó esto", "quien desarrolló hegel2052", "autor de esta app",
  "desarrollador de la app", "quien la creó", "quien es el autor",
  "quien programó esta app",

  // Inglés
  "who made this app", "who created this application", "who developed this site",
  "who programmed this app", "who created this website", "who made hegel ai",
  "who built this ai", "how was this made", "how was this app created",
  "developer of this site", "who is the creator", "who is the author",
  "author of this app", "who built this website"
];

//  Helper CORS
function corsHeaders(origin) {
  const isAllowed = allowedOrigins.includes(origin);
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigins[0],
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

    // Detectar preguntas sobre el autor
    const lowerPrompt = prompt.toLowerCase();
    const preguntaAutor = palabrasClave.some((frase) =>
      lowerPrompt.includes(frase)
    );

    if (preguntaAutor) {
      const respuestaAutor =
        "Esta aplicación fue creada por **Adrián** (GitHub: https://github.com/adriancorro) utilizando la tecnología de **ChatGPT (OpenAI)**.";
      return new Response(JSON.stringify({ result: respuestaAutor }), {
        status: 200,
        headers: corsHeaders(origin)
      });
    }

    // Llamada al modelo
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

// OPTIONS (preflight CORS)
export async function OPTIONS(req) {
  const origin = req.headers.get("origin") || "";
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}
