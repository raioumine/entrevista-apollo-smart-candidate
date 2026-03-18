import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || "",
  dangerouslyAllowBrowser: true,
});

interface ParsedSearch {
  puesto: string;
  industria: string;
  pais: string;
  seniority: string;
  anosExperiencia: string;
  habilidades: string[];
  modalidad: string;
  cantidad: number;
}

export async function parseNaturalLanguageSearch(
  query: string
): Promise<ParsedSearch | null> {
  if (!import.meta.env.VITE_GROQ_API_KEY) return null;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `Eres un parser de busquedas de headhunting. Dado un texto en lenguaje natural, extrae los parametros de busqueda de candidatos.

Responde SOLO con JSON valido, sin markdown ni explicaciones. Usa este formato exacto:
{
  "puesto": "titulo del puesto",
  "industria": "industria (opciones: AFP, Alimentos, Banca, Construcción, Energía, Finanzas, Forestal, Inmobiliario, Logística, Minería, Retail, Salud, SaaS / Software, Tecnología, Telecom, Transporte)",
  "pais": "pais (opciones: Chile, Argentina, Colombia, Mexico, Peru, Brasil, LATAM, Global)",
  "seniority": "nivel (opciones: Junior, Semi-Senior, Senior, Lead, Manager, Director, VP, C-Level)",
  "anosExperiencia": "rango (opciones: 0-1 anos, 1-3 anos, 3-5 anos, 5-8 anos, 8-10 anos, 10+ anos)",
  "habilidades": ["habilidad1", "habilidad2"],
  "modalidad": "modalidad (opciones: Presencial, Hibrido, Remoto)",
  "cantidad": 25
}

Si un campo no se menciona, usa estos defaults:
- pais: "Chile"
- seniority: "Senior"
- anosExperiencia: "3-5 anos"
- modalidad: "Hibrido"
- cantidad: 25
- habilidades: [] (vacio)

Ejemplos:
- "Busco un SDR para SaaS en Chile con experiencia en Salesforce" -> puesto: "SDR", industria: "SaaS / Software", habilidades: ["Salesforce"]
- "Necesito 10 data engineers senior para mineria en Peru" -> puesto: "Data Engineer", industria: "Minería", pais: "Peru", cantidad: 10
- "Gerente comercial con 10 años en banca" -> puesto: "Gerente Comercial", industria: "Banca", anosExperiencia: "10+ anos", seniority: "Manager"`,
      },
      { role: "user", content: query },
    ],
    temperature: 0.1,
    max_tokens: 300,
  });

  const text = response.choices[0]?.message?.content?.trim();
  if (!text) return null;

  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export async function generateJobDescription(
  puesto: string,
  industria: string,
  seniority: string = "Senior"
): Promise<string | null> {
  if (!import.meta.env.VITE_GROQ_API_KEY) return null;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `Eres un experto en RRHH y headhunting en LATAM. Genera una descripcion de puesto profesional y concisa en espanol.

La descripcion debe incluir:
1. Resumen del rol (2-3 oraciones)
2. Responsabilidades principales (4-5 bullet points)
3. Requisitos clave (4-5 bullet points)
4. Nice to have (2-3 bullet points)

Usa un tono profesional pero cercano. No uses markdown con #, solo texto plano con bullet points usando •.
Maximo 250 palabras.`,
      },
      {
        role: "user",
        content: `Genera la descripcion para: ${puesto} (${seniority}) en la industria ${industria}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 600,
  });

  return response.choices[0]?.message?.content?.trim() || null;
}

export async function generateInterviewQuestions(
  puesto: string,
  industria: string,
  habilidades: string[],
  competencias: string[]
): Promise<string[] | null> {
  if (!import.meta.env.VITE_GROQ_API_KEY) return null;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `Eres un entrevistador experto de RRHH especializado en screening inicial con IA.
Genera preguntas de entrevista de filtro que un avatar de IA hara al candidato.

Las preguntas deben ser:
- Abiertas (no si/no)
- Enfocadas en evaluar competencias reales
- Progresivas (de general a especifica)
- Adaptadas al puesto e industria

Responde SOLO con un JSON array de strings, sin markdown ni explicaciones.
Ejemplo: ["Pregunta 1", "Pregunta 2", "Pregunta 3"]

Genera entre 5 y 8 preguntas.`,
      },
      {
        role: "user",
        content: `Puesto: ${puesto}
Industria: ${industria}
Habilidades clave: ${habilidades.join(", ") || "No especificadas"}
Competencias a evaluar: ${competencias.join(", ") || "Comunicacion, Experiencia, Motivacion"}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 800,
  });

  const text = response.choices[0]?.message?.content?.trim();
  if (!text) return null;

  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function suggestEmpresasByIndustria(
  industria: string,
  pais: string = "Chile"
): Promise<string[] | null> {
  if (!import.meta.env.VITE_GROQ_API_KEY) return null;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `Eres un experto en el mercado laboral de LATAM. Dado una industria y pais, sugiere entre 3 y 5 empresas relevantes de esa industria en ese pais donde podriamos encontrar buenos candidatos.

Responde SOLO con un JSON array de strings con los nombres de empresas, sin markdown ni explicaciones.
Ejemplo: ["Empresa 1", "Empresa 2", "Empresa 3"]`,
      },
      {
        role: "user",
        content: `Industria: ${industria}, Pais: ${pais}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 200,
  });

  const text = response.choices[0]?.message?.content?.trim();
  if (!text) return null;

  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function synthesizeProfile(
  snippets: string[],
  name: string,
  title: string
): Promise<{
  summary: string;
  skills: string[];
  education: string;
  experience: string;
  location: string;
}> {
  if (!import.meta.env.VITE_GROQ_API_KEY || snippets.length === 0) {
    return { summary: "", skills: [], education: "", experience: "", location: "" };
  }

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `Eres un investigador de headhunting. A partir de fragmentos de busqueda de Google sobre un candidato, extrae informacion estructurada de su perfil profesional.

Responde SOLO con JSON valido, sin markdown ni explicaciones. Usa este formato:
{
  "summary": "Resumen profesional de 2-3 oraciones",
  "skills": ["skill1", "skill2", "skill3"],
  "education": "Educacion (universidad, carrera, grado) o vacio si no hay info",
  "experience": "Resumen de experiencia laboral relevante en 2-3 oraciones",
  "location": "Ciudad, Pais si se puede determinar"
}

Si no encuentras informacion suficiente para un campo, dejalo vacio ("" o []).
No inventes informacion. Solo extrae lo que aparece en los datos.`,
      },
      {
        role: "user",
        content: `Candidato: ${name}
Cargo actual: ${title}

Datos encontrados en Google:
${snippets.join("\n\n")}`,
      },
    ],
    temperature: 0.1,
    max_tokens: 500,
  });

  const text = response.choices[0]?.message?.content?.trim();
  if (!text) return { summary: "", skills: [], education: "", experience: "", location: "" };

  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return { summary: "", skills: [], education: "", experience: "", location: "" };
  }
}

export function isGroqConfigured(): boolean {
  return !!import.meta.env.VITE_GROQ_API_KEY;
}
