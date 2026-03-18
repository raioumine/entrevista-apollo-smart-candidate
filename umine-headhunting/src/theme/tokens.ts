// UMINE Design System Tokens
// Glassmorphism + Minimalismo Corporativo + Accesibilidad Universal

export const darkTokens = {
  bg: {
    base: "#121212",
    surface1: "#1E1E1E",
    surface2: "#2C2C2C",
    surface3: "#333333",
  },
  glass: {
    dark: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.08)",
    borderHover: "rgba(255,255,255,0.15)",
    shadow: "0 4px 30px rgba(0,0,0,0.1)",
    blur: "blur(12px)",
  },
  text: {
    primary: "rgba(255,255,255,0.87)",
    secondary: "rgba(255,255,255,0.60)",
    muted: "rgba(255,255,255,0.38)",
  },
  accent: {
    teal: "#008081",
    tealHover: "#009999",
    navy: "#000081",
    gold: "#E2BF36",
  },
  status: {
    success: "#00d68f",
    warning: "#f0a030",
    error: "#ff4757",
    info: "#00c8ff",
  },
} as const;

export const lightTokens = {
  bg: {
    base: "#F8F9FA",
    surface1: "#FFFFFF",
    surface2: "#F0F1F3",
    surface3: "#E8E9EB",
  },
  glass: {
    dark: "rgba(0,0,0,0.04)",
    border: "rgba(0,0,0,0.10)",
    borderHover: "rgba(0,0,0,0.18)",
    shadow: "0 4px 30px rgba(0,0,0,0.06)",
    blur: "blur(12px)",
  },
  text: {
    primary: "rgba(0,0,0,0.87)",
    secondary: "rgba(0,0,0,0.60)",
    muted: "rgba(0,0,0,0.38)",
  },
  accent: {
    teal: "#007070",
    tealHover: "#008888",
    navy: "#000070",
    gold: "#C9A520",
  },
  status: {
    success: "#00b377",
    warning: "#d08a20",
    error: "#e03040",
    info: "#0099cc",
  },
} as const;

export type ThemeTokens = {
  bg: { base: string; surface1: string; surface2: string; surface3: string };
  glass: { dark: string; border: string; borderHover: string; shadow: string; blur: string };
  text: { primary: string; secondary: string; muted: string };
  accent: { teal: string; tealHover: string; navy: string; gold: string };
  status: { success: string; warning: string; error: string; info: string };
};

// Backward compatibility — used during migration
export const tokens = darkTokens;

export const scoreColor = (score: number, t?: ThemeTokens): string => {
  const s = t?.status ?? darkTokens.status;
  if (score >= 7) return s.success;
  if (score >= 5) return s.warning;
  return s.error;
};

export const getGlassStyle = (t: ThemeTokens) =>
  ({
    background: t.glass.dark,
    backdropFilter: t.glass.blur,
    WebkitBackdropFilter: t.glass.blur,
    border: `1px solid ${t.glass.border}`,
    borderRadius: "16px",
    boxShadow: t.glass.shadow,
  }) as const;

export const glassStyle = getGlassStyle(darkTokens);
