import type { Candidate, CandidateScore } from "../types/candidate";

const N8N_BASE = import.meta.env.VITE_N8N_BASE || "https://rai-dev.app.n8n.cloud/webhook";

// --- TEST MODE ---
// Cuando TEST_MODE=true, todos los emails salen a TEST_EMAIL
// Los emails reales de candidatos se preservan en emailOriginal
const TEST_MODE = import.meta.env.VITE_TEST_MODE === "true";
const TEST_EMAIL = import.meta.env.VITE_TEST_EMAIL || "raimundo@umine.com";

function safeEmail(candidateEmail: string): string {
  return TEST_MODE ? TEST_EMAIL : candidateEmail;
}

export const isTestMode = TEST_MODE;
export const testEmail = TEST_EMAIL;

// --- TAVUS INTERVIEW DISABLED ---
// createInterview() commented out - this repo does not use Tavus avatar interviews
// To re-enable, uncomment this block and the n8n "Avatar Entrevistador" workflow
//
// interface CreateInterviewInput {
//   nombre_candidato: string;
//   email_candidato: string;
//   puesto: string;
//   departamento?: string;
//   habilidades_clave?: string;
//   notas_cv?: string;
//   duracion_max_minutos?: number;
// }
//
// interface CreateInterviewResponse {
//   success: boolean;
//   message: string;
//   data: {
//     conversation_id: string;
//     conversation_url: string;
//     candidato: string;
//     puesto: string;
//     email_enviado_a: string;
//   };
// }
//
// export async function createInterview(
//   data: CreateInterviewInput
// ): Promise<CreateInterviewResponse> {
//   const payload = { ...data, email_candidato: safeEmail(data.email_candidato) };
//   const resp = await fetch(`${N8N_BASE}/nueva-entrevista`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });
//   if (!resp.ok) throw new Error("Error creating interview");
//   return resp.json();
// }

interface SearchInput {
  puesto: string;
  industria: string;
  pais: string;
  empresas_referencia?: string[];
  anos_experiencia: string;
  seniority: string;
  habilidades: string[];
  idiomas: string[];
  modalidad: string;
  cantidad_candidatos: number;
  enviar_cold_email: boolean;
  plantilla_email?: string;
  descripcion_puesto?: string;
  preguntas_screening?: string[];
  etapas_entrevista?: Array<{
    orden: number;
    nombre: string;
    tipo: string;
    duracion_minutos: number;
    competencias: string[];
  }>;
}

export interface N8nSearchResponse {
  success: boolean;
  search_id: string;
  candidatos_encontrados: number;
  candidatos: N8nCandidate[];
}

interface N8nCandidate {
  id: string;
  searchId: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  cargo: string;
  empresa: string;
  email: string;
  emailScore: string;
  linkedinUrl: string;
  ubicacion: string;
  industria: string;
  domain: string;
  estado: string;
  fechaScraping: string;
  scoreTotal: number;
  scoreExperiencia: number;
  scoreHabilidades: number;
  scoreSeniority: number;
  scoreIndustria: number;
  scoreLiderazgo: number;
  scoreCultura: number;
  recomendacion: string;
  resumenIA: string;
  fortalezas: string;
  debilidades: string;
  preguntasEntrevista: string;
  fechaEvaluacion: string;
  [key: string]: unknown;
}

function safeJsonParse(val: string | string[]): string[] {
  if (Array.isArray(val)) return val;
  if (!val || val === "[]") return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    return val ? [val] : [];
  }
}

export function transformN8nCandidate(raw: N8nCandidate): Candidate {
  const scoreIA: CandidateScore | undefined =
    raw.scoreTotal > 0
      ? {
          total: Math.round(raw.scoreTotal / 10 * 10) / 10,
          comunicacion: Math.round(raw.scoreSeniority / 10 * 10) / 10,
          experiencia: Math.round(raw.scoreExperiencia / 10 * 10) / 10,
          habilidadesTecnicas: Math.round(raw.scoreHabilidades / 10 * 10) / 10,
          liderazgo: Math.round(raw.scoreLiderazgo / 10 * 10) / 10,
          culturaFit: Math.round(raw.scoreCultura / 10 * 10) / 10,
          motivacion: Math.round(raw.scoreIndustria / 10 * 10) / 10,
          recomendacion: (raw.recomendacion as "AVANZAR" | "RECHAZAR" | "REVISAR") || "REVISAR",
          resumen: raw.resumenIA || "",
          fortalezas: safeJsonParse(raw.fortalezas),
          debilidades: safeJsonParse(raw.debilidades),
        }
      : undefined;

  return {
    id: raw.id || `cand-${raw.searchId}-${Date.now().toString(36)}`,
    searchId: raw.searchId,
    nombre: raw.nombre || raw.nombreCompleto || "",
    apellido: raw.apellido || "",
    empresa: raw.empresa || "",
    cargo: raw.cargo || "",
    email: raw.email || "",
    emailScore: raw.emailScore || "No disponible",
    linkedinUrl: raw.linkedinUrl || "",
    ubicacion: raw.ubicacion || "",
    estado: (raw.estado as Candidate["estado"]) || "evaluado",
    scoreIA,
    fechaScraping: raw.fechaScraping || new Date().toISOString().split("T")[0],
  };
}

export async function launchSearch(data: SearchInput): Promise<N8nSearchResponse> {
  // En test mode, forzar enviar_cold_email=false para no enviar emails a candidatos reales
  const payload = TEST_MODE ? { ...data, enviar_cold_email: false } : data;
  const resp = await fetch(`${N8N_BASE}/nueva-busqueda`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error("Error launching search");
  return resp.json();
}

export async function sendColdEmail(data: {
  candidato_email: string;
  candidato_nombre: string;
  puesto: string;
  plantilla: string;
}): Promise<{ success: boolean }> {
  const payload = { ...data, candidato_email: safeEmail(data.candidato_email) };
  const resp = await fetch(`${N8N_BASE}/cold-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error("Error sending cold email");
  return resp.json();
}

export async function evaluateCandidate(data: {
  candidato_id: string;
  nombre: string;
  cargo: string;
  empresa: string;
  linkedin_url: string;
  requisitos_puesto: string;
  habilidades_requeridas: string[];
}): Promise<{ success: boolean; score: Record<string, unknown> }> {
  const resp = await fetch(`${N8N_BASE}/evaluar-candidato`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!resp.ok) throw new Error("Error evaluating candidate");
  return resp.json();
}
