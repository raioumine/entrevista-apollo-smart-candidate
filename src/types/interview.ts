export interface Interview {
  id: string;
  candidatoId: string;
  candidatoNombre: string;
  puesto: string;
  etapa: number;
  etapaNombre: string;
  tipo: string;
  estado: "pendiente" | "en_curso" | "completada";
  conversationUrl?: string;
  scorecard?: Scorecard;
  fecha: string;
}

export interface Scorecard {
  comunicacion: number;
  experiencia: number;
  resolucion: number;
  equipo: number;
  motivacion: number;
  profesionalismo: number;
  promedio: number;
  recomendacion: "AVANZAR" | "RECHAZAR" | "SEGUNDA ENTREVISTA";
  resumen: string;
  fortalezas: string;
  redFlags: string;
}
