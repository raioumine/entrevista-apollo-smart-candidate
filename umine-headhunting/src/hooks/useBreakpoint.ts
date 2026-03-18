import { useState, useEffect } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

const QUERIES: Record<Breakpoint, string> = {
  mobile: "(max-width: 767px)",
  tablet: "(min-width: 768px) and (max-width: 1023px)",
  desktop: "(min-width: 1024px)",
};

function getBreakpoint(): Breakpoint {
  if (typeof window === "undefined") return "desktop";
  if (window.matchMedia(QUERIES.mobile).matches) return "mobile";
  if (window.matchMedia(QUERIES.tablet).matches) return "tablet";
  return "desktop";
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(getBreakpoint);

  useEffect(() => {
    const cleanups = (Object.entries(QUERIES) as [Breakpoint, string][]).map(
      ([key, query]) => {
        const mql = window.matchMedia(query);
        const handler = (e: MediaQueryListEvent) => {
          if (e.matches) setBp(key);
        };
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
      }
    );
    return () => cleanups.forEach((fn) => fn());
  }, []);

  return bp;
}

export function responsive<T>(
  bp: Breakpoint,
  mobile: T,
  tablet: T,
  desktop: T
): T {
  if (bp === "mobile") return mobile;
  if (bp === "tablet") return tablet;
  return desktop;
}
