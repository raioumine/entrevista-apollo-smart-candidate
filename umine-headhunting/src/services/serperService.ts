const SERPER_API_KEY = import.meta.env.VITE_SERPER_API_KEY || "";
const SERPER_BASE = "https://google.serper.dev";

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

interface SerperResponse {
  organic: SerperResult[];
  knowledgeGraph?: {
    title?: string;
    description?: string;
    attributes?: Record<string, string>;
  };
}

async function searchGoogle(query: string, num = 5): Promise<SerperResponse> {
  const resp = await fetch(`${SERPER_BASE}/search`, {
    method: "POST",
    headers: {
      "X-API-KEY": SERPER_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, num }),
  });
  if (!resp.ok) throw new Error(`Serper error: ${resp.status}`);
  return resp.json();
}

export interface EnrichedProfile {
  linkedinUrl: string;
  summary: string;
  skills: string[];
  education: string;
  experience: string;
  location: string;
  snippets: string[];
}

export async function findLinkedInUrl(
  name: string,
  company: string
): Promise<string> {
  const results = await searchGoogle(
    `"${name}" "${company}" site:linkedin.com/in`,
    3
  );
  const match = results.organic?.find((r) =>
    r.link.includes("linkedin.com/in/")
  );
  return match?.link || "";
}

export async function searchCandidateInfo(
  name: string,
  company: string,
  title: string
): Promise<string[]> {
  const results = await searchGoogle(
    `"${name}" "${company}" "${title}" experience OR skills OR education`,
    5
  );
  return (results.organic || []).map(
    (r) => `${r.title}: ${r.snippet}`
  );
}

export async function enrichCandidate(
  name: string,
  company: string,
  title: string
): Promise<EnrichedProfile> {
  const [linkedinUrl, snippets] = await Promise.all([
    findLinkedInUrl(name, company),
    searchCandidateInfo(name, company, title),
  ]);

  return {
    linkedinUrl,
    summary: "",
    skills: [],
    education: "",
    experience: "",
    location: "",
    snippets,
  };
}

export async function enrichCandidateFull(
  name: string,
  company: string,
  title: string,
  groqSynthesize?: (snippets: string[], name: string, title: string) => Promise<{
    summary: string;
    skills: string[];
    education: string;
    experience: string;
    location: string;
  }>
): Promise<EnrichedProfile> {
  const base = await enrichCandidate(name, company, title);

  if (groqSynthesize && base.snippets.length > 0) {
    const synthesized = await groqSynthesize(base.snippets, name, title);
    return { ...base, ...synthesized };
  }

  return base;
}
