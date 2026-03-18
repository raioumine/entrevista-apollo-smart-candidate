export interface InterviewStage {
  orden: number;
  nombre: string;
  tipo: "avatar_ia" | "avatar_ia_rrhh" | "rrhh_solo" | "hiring_manager" | "panel";
  duracionMinutos: number;
  competencias: string[];
}

export interface SearchConfig {
  id: string;
  puesto: string;
  industria: string;
  pais: string;
  empresasReferencia?: string[];
  anosExperiencia: string;
  seniority: string;
  habilidades: string[];
  idiomas: string[];
  modalidad: string;
  rangoSalarial?: { min: number; max: number };
  cantidadCandidatos: number;
  enviarColdEmail: boolean;
  plantillaEmail: string;
  etapasEntrevista: InterviewStage[];
  estado:
    | "configurando"
    | "buscando"
    | "evaluando"
    | "terna_lista"
    | "en_entrevistas"
    | "completado";
  createdAt: string;
}

export const INDUSTRIAS = [
  "AFP",
  "Alimentos",
  "Banca",
  "Construcción",
  "Energía",
  "Finanzas",
  "Forestal",
  "Inmobiliario",
  "Logística",
  "Minería",
  "Retail",
  "Salud",
  "SaaS / Software",
  "Tecnología",
  "Telecom",
  "Transporte",
  "Otro",
] as const;

export const PAISES = [
  "Chile",
  "Argentina",
  "Colombia",
  "Mexico",
  "Peru",
  "Brasil",
  "LATAM",
  "Global",
] as const;

export const SENIORITY = [
  "Junior",
  "Semi-Senior",
  "Senior",
  "Lead",
  "Manager",
  "Director",
  "VP",
  "C-Level",
] as const;

export const EXPERIENCIA = [
  "0-1 anos",
  "1-3 anos",
  "3-5 anos",
  "5-8 anos",
  "8-10 anos",
  "10+ anos",
] as const;

export const MODALIDAD = ["Presencial", "Hibrido", "Remoto"] as const;

export const IDIOMAS = [
  "Espanol",
  "Ingles",
  "Portugues",
  "Frances",
  "Aleman",
] as const;

export const STAGE_TIPOS: Record<InterviewStage["tipo"], string> = {
  avatar_ia: "Avatar IA (solo)",
  avatar_ia_rrhh: "Avatar IA + RRHH",
  rrhh_solo: "RRHH (solo)",
  hiring_manager: "Hiring Manager",
  panel: "Panel",
};

export const COMPETENCIAS = [
  "Comunicacion verbal",
  "Experiencia relevante",
  "Resolucion de problemas",
  "Trabajo en equipo",
  "Liderazgo",
  "Habilidades tecnicas",
  "Motivacion y cultura",
  "Profesionalismo",
  "Pensamiento analitico",
  "Adaptabilidad",
  "Orientacion a resultados",
  "Negociacion",
] as const;

export const PUESTOS_SUGERIDOS = [
  "SDR",
  "Account Executive",
  "Head of Sales",
  "Sales Manager",
  "Business Development Rep",
  "Customer Success Manager",
  "Data Engineer",
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Cloud Architect",
  "Product Manager",
  "Product Owner",
  "UX/UI Designer",
  "UX Researcher",
  "CTO",
  "CFO",
  "COO",
  "CEO",
  "VP de Ventas",
  "VP de Marketing",
  "VP de Tecnologia",
  "Gerente General",
  "Gerente Comercial",
  "Gerente de RRHH",
  "Gerente de Operaciones",
  "Gerente de Finanzas",
  "Gerente de Marketing",
  "Director Comercial",
  "Director de Tecnologia",
  "Controller Financiero",
  "Analista Financiero",
  "Contador Senior",
  "HR Business Partner",
  "Talent Acquisition Specialist",
  "Marketing Digital Manager",
  "Growth Hacker",
  "Community Manager",
  "Content Manager",
  "Supply Chain Manager",
  "Jefe de Logistica",
  "Project Manager",
  "Scrum Master",
  "QA Engineer",
] as const;

export const HABILIDADES_POR_AREA: Record<string, string[]> = {
  ventas: [
    "Salesforce", "HubSpot", "Cold calling", "B2B SaaS", "Negociacion",
    "Prospecting", "Pipeline management", "CRM", "Cierre de ventas",
    "Account management", "Upselling", "Cross-selling", "Venta consultiva",
  ],
  tecnologia: [
    "Python", "JavaScript", "TypeScript", "React", "Node.js", "SQL",
    "AWS", "GCP", "Azure", "Docker", "Kubernetes", "CI/CD", "Git",
    "REST APIs", "GraphQL", "Microservices", "MongoDB", "PostgreSQL",
  ],
  data: [
    "Python", "SQL", "Machine Learning", "TensorFlow", "PyTorch",
    "Pandas", "Data Visualization", "Tableau", "Power BI", "ETL",
    "Big Data", "Spark", "Airflow", "Statistics", "A/B Testing",
  ],
  marketing: [
    "Marketing Digital", "SEO/SEM", "Google Ads", "Meta Ads",
    "Content Marketing", "Email Marketing", "Analytics", "Copywriting",
    "Growth Hacking", "Branding", "Social Media", "Inbound Marketing",
  ],
  finanzas: [
    "Financial Modeling", "Excel Avanzado", "SAP", "Contabilidad IFRS",
    "Analisis financiero", "Presupuestos", "Auditoria", "Tax planning",
    "M&A", "Valorizacion", "Tesoreria", "ERP",
  ],
  rrhh: [
    "Talent Acquisition", "Employer Branding", "Compensaciones",
    "Desarrollo organizacional", "Gestion del desempeno", "Cultura",
    "Onboarding", "Capacitacion", "Legislacion laboral", "Payroll",
  ],
  operaciones: [
    "Supply Chain", "Logistica", "Lean Manufacturing", "Six Sigma",
    "Project Management", "Agile/Scrum", "ERP", "SAP",
    "Mejora continua", "KPIs", "Gestion de proveedores",
  ],
  producto: [
    "Product Management", "Agile/Scrum", "User Research", "Roadmapping",
    "A/B Testing", "Analytics", "Figma", "Jira", "PRDs",
    "Stakeholder management", "Go-to-market", "OKRs",
  ],
  diseno: [
    "Figma", "Sketch", "Adobe XD", "UX Research", "UI Design",
    "Design Systems", "Prototyping", "Wireframing", "User Testing",
    "Accesibilidad", "Responsive Design", "Interaction Design",
  ],
  general: [
    "Liderazgo", "Comunicacion", "Trabajo en equipo", "Problem solving",
    "Pensamiento estrategico", "Gestion de proyectos", "Adaptabilidad",
    "Orientacion a resultados", "Toma de decisiones", "Innovacion",
  ],
};

export function getHabilidadesSugeridas(puesto: string): string[] {
  const p = puesto.toLowerCase();
  const areas: string[] = [];

  if (/sdr|sales|account|comercial|ventas|business dev/i.test(p)) areas.push("ventas");
  if (/engineer|developer|devops|cloud|full.?stack|front|back|software|cto/i.test(p)) areas.push("tecnologia");
  if (/data|machine|ml |analytics|scientist/i.test(p)) areas.push("data");
  if (/marketing|growth|community|content|seo/i.test(p)) areas.push("marketing");
  if (/financ|controller|contador|cfo|treasury/i.test(p)) areas.push("finanzas");
  if (/rrhh|hr |talent|people|recurso/i.test(p)) areas.push("rrhh");
  if (/operacion|supply|logistic|coo/i.test(p)) areas.push("operaciones");
  if (/product|pm |owner/i.test(p)) areas.push("producto");
  if (/ux|ui|design|diseno/i.test(p)) areas.push("diseno");
  if (/gerente|director|vp |ceo|head|manager|lead/i.test(p)) areas.push("general");

  if (areas.length === 0) areas.push("general");

  const seen = new Set<string>();
  const result: string[] = [];
  for (const area of areas) {
    for (const h of HABILIDADES_POR_AREA[area] || []) {
      if (!seen.has(h)) {
        seen.add(h);
        result.push(h);
      }
    }
  }
  return result;
}
