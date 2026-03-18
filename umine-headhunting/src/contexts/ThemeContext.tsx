import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { darkTokens, lightTokens, getGlassStyle, type ThemeTokens } from "../theme/tokens";

type ThemeMode = "dark" | "light";

interface ThemeContextType {
  mode: ThemeMode;
  tokens: ThemeTokens;
  glassStyle: ReturnType<typeof getGlassStyle>;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = "umine_theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY) as ThemeMode) || "dark";
    } catch {
      return "dark";
    }
  });

  const currentTokens = mode === "dark" ? darkTokens : lightTokens;

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem(STORAGE_KEY, m);
  }, []);

  useEffect(() => {
    document.body.style.background = currentTokens.bg.base;
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;
  }, [mode, currentTokens]);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        tokens: currentTokens,
        glassStyle: getGlassStyle(currentTokens),
        toggleMode,
        setMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
