export interface CandidateScore {
  total: number;
  comunicacion: number;
  experiencia: number;
  habilidadesTecnicas: number;
  liderazgo: number;
  culturaFit: number;
  motivacion: number;
  recomendacion: "AVANZAR" | "RECHAZAR" | "REVISAR";
  resumen: string;
  fortalezas: string[];
  debilidades: string[];
}

export interface Candidate {
  id: string;
  searchId: string;
  nombre: string;
  apellido: string;
  empresa: string;
  cargo: string;
  email: string;
  emailScore: string;
  linkedinUrl: string;
  ubicacion: string;
  estado: CandidateEstado;
  scoreIA?: CandidateScore;
  fechaScraping: string;
  enriched?: EnrichedData;
}

export interface EnrichedData {
  summary: string;
  skills: string[];
  education: string;
  experience: string;
  snippets: string[];
}

export type CandidateEstado =
  | "encontrado"
  | "email_enviado"
  | "cv_recibido"
  | "evaluado"
  | "en_terna"
  | "en_entrevista"
  | "descartado";

export const ESTADO_LABELS: Record<CandidateEstado, string> = {
  encontrado: "Encontrado",
  email_enviado: "Email Enviado",
  cv_recibido: "CV Recibido",
  evaluado: "Evaluado",
  en_terna: "En Terna",
  en_entrevista: "En Entrevista",
  descartado: "Descartado",
};

export const ESTADO_STATUS: Record<CandidateEstado, string> = {
  encontrado: "info",
  email_enviado: "warning",
  cv_recibido: "success",
  evaluado: "info",
  en_terna: "success",
  en_entrevista: "warning",
  descartado: "error",
};
