import OpenAI from "openai";

// 🌍 Lista de dominios permitidos
const allowedOrigins = [
  "https://www.hegel2052.com",
  "https://hegel2052.com",
  "https://hegel2052.vercel.app",
  "http://localhost:3000",   // para desarrollo local
  "http://127.0.0.1:3000"
];

// 🧩 Helper CORS
function corsHeaders(origin) {
  const isAllowed = allowedOrigins.includes(origin);
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigins[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

//  Endpoint principal (POST)
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

    //  Cargar palabras clave dinámicamente
    const { palabrasClave } = await import(`${process.cwd()}/api/keywords.js`);

    //  Verificar si la pregunta es sobre el autor
    const lowerPrompt = prompt.toLowerCase();
    const preguntaAutor = palabrasClave.some((frase) =>
      lowerPrompt.includes(frase)
    );

    if (preguntaAutor) {
      const respuestaAutor =
        "Esta aplicación fue creada por **Adrián** (GitHub: https://github.com/adriancorro) con la tecnología de **ChatGPT (OpenAI)**.";
      return new Response(JSON.stringify({ result: respuestaAutor }), {
        status: 200,
        headers: corsHeaders(origin)
      });
    }

    //  Inicializar cliente OpenAI
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // 🗣️ Generar respuesta
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
    console.error("🛑 Error interno:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor",
        detalle: error.message
      }),
      { status: 500, headers: corsHeaders("") }
    );
  }
}

//  Endpoint GET (para pruebas rápidas)
export async function GET() {
  return new Response(
    JSON.stringify({
      status: "✅ API funcionando. Usa método POST para enviar prompts."
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    }
  );
}

//  OPTIONS (preflight CORS)
export async function OPTIONS(req) {
  const origin = req.headers.get("origin") || "";
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}