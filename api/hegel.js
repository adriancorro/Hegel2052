import OpenAI from "openai";

//  Lista de dominios permitidos
const allowedOrigins = [
  "https://www.hegel2052.com",
  "https://hegel2052.com",
  "https://hegel2052.vercel.app"
];

//  Helper para CORS dinámico
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

    // 🧠 Comprobación de autor (palabras clave en español e inglés)
    const text = prompt.toLowerCase();

    const palabrasClave = [
      // Español
      "quien hizo esta app",
      "quién hizo esta app",
      "quien hizo esta aplicacion",
      "quien creo esta app",
      "quien creó esta app",
      "quien desarrollo esta app",
      "quien desarrolló esta app",
      "quien programo esta app",
      "quien programó esta app",
      "quien diseño esta app",
      "como se creo esta app",
      "como se creó esta app",
      "como se hizo esta app",
      "como se desarrollo esta app",
      "como se desarrolló esta app",
      "como se programo esta app",
      "como se programó esta app",
      "como se construyo esta app",
      "como se construyó esta app",
      "quien hizo esta web",
      "quien hizo esta página",
      "quien desarrollo esta web",
      "quien desarrolló esta página",
      "como se creó esta web",
      "como se desarrollo esta web",
      // Inglés
      "who created this app",
      "who made this app",
      "who built this app",
      "who designed this app",
      "who developed this app",
      "how was this app created",
      "how was this app built",
      "how was this app made",
      "who created this website",
      "who made this website",
      "who developed this website",
      "who built this website",
      "how was this website created",
      "how was this website built"
    ];

    const preguntaAutor = palabrasClave.some((frase) => text.includes(frase));

    if (preguntaAutor) {
      const respuestaAutor =
        "Esta aplicación fue creada por **Adrián** (GitHub: https://github.com/adriancorro) con la tecnología de **ChatGPT (OpenAI)**.";
      return new Response(JSON.stringify({ result: respuestaAutor }), {
        status: 200,
        headers: corsHeaders(origin)
      });
    }

    //  Si no pregunta por el autor, continuar con la respuesta normal de Hegel
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

//  Preflight OPTIONS
export async function OPTIONS(req) {
  const origin = req.headers.get("origin") || "";
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}
