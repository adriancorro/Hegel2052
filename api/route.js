import OpenAI from "openai";

// Lista de dominios permitidos
const allowedOrigins = [
  "https://www.hegel2052.com",
  "https://hegel2052.com",
  "https://hegel2052.vercel.app",
  "http://localhost:3000",   // para desarrollo local
  "http://127.0.0.1:3000"
];

//  Helper CORS
function corsHeaders(origin) {
  const isAllowed = allowedOrigins.includes(origin);
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigins[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

//  Normalizador de texto universal
function normalizeText(text) {
  return text
    .toLowerCase() // pasa todo a minúsculas
    .normalize("NFD") // separa letras y tildes
    .replace(/[\u0300-\u036f]/g, ""); // elimina las tildes
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

    //  Preprocesar todas las palabras clave solo una vez (más eficiente)
    const normalizedKeywords = palabrasClave.map((frase) =>
      normalizeText(frase)
    );

    //  Normalizar también el texto del usuario
    const normalizedPrompt = normalizeText(prompt);

    //  Verificar coincidencia sin importar acentos o mayúsculas
    const preguntaAutor = normalizedKeywords.some((frase) =>
      normalizedPrompt.includes(frase)
    );

    if (preguntaAutor) {
      const respuestaAutor =
        "Esta aplicación fue creada por **Adrián Corro** (GitHub: [https://github.com/adriancorro](https://github.com/adriancorro)) con la tecnología de **OpenAI (ChatGPT)**.";
      return new Response(JSON.stringify({ result: respuestaAutor }), {
        status: 200,
        headers: corsHeaders(origin)
      });
    }

    //  Inicializar cliente OpenAI
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    //  Generar respuesta de Hegel IA
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

//  Endpoint GET (para pruebas)
export async function GET() {
  return new Response(
    JSON.stringify({
      status: "✅ API funcionando correctamente. Usa POST para enviar prompts."
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
