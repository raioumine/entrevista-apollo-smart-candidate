import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Candidate } from "../types/candidate";
import type { SearchConfig } from "../types/search";

interface SearchData {
  config: Partial<SearchConfig>;
  candidates: Candidate[];
}

interface SearchContextType {
  searches: Record<string, SearchData>;
  addSearch: (searchId: string, config: Partial<SearchConfig>, candidates: Candidate[]) => void;
  getSearch: (searchId: string) => SearchData | undefined;
  getAllCandidates: () => Candidate[];
  findCandidate: (candidateId: string) => Candidate | undefined;
}

const SearchContext = createContext<SearchContextType | null>(null);

const STORAGE_KEY = "umine_searches";

function loadFromSession(): Record<string, SearchData> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToSession(data: Record<string, SearchData>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // silent fail
  }
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searches, setSearches] = useState<Record<string, SearchData>>(loadFromSession);

  const addSearch = useCallback((searchId: string, config: Partial<SearchConfig>, candidates: Candidate[]) => {
    setSearches((prev) => {
      const next = { ...prev, [searchId]: { config, candidates } };
      saveToSession(next);
      return next;
    });
  }, []);

  const getSearch = useCallback((searchId: string) => {
    return searches[searchId];
  }, [searches]);

  const getAllCandidates = useCallback(() => {
    return Object.values(searches).flatMap((s) => s.candidates);
  }, [searches]);

  const findCandidate = useCallback((candidateId: string) => {
    for (const search of Object.values(searches)) {
      const found = search.candidates.find((c) => c.id === candidateId);
      if (found) return found;
    }
    return undefined;
  }, [searches]);

  return (
    <SearchContext.Provider value={{ searches, addSearch, getSearch, getAllCandidates, findCandidate }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearchContext must be used within SearchProvider");
  return ctx;
}
