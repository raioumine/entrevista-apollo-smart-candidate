import { type ReactNode } from "react";
import { Navbar } from "../organisms/Navbar";
import { useTheme } from "../../contexts/ThemeContext";
import { useBreakpoint, responsive } from "../../hooks/useBreakpoint";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { tokens } = useTheme();
  const bp = useBreakpoint();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: tokens.bg.base,
        color: tokens.text.primary,
        fontFamily: "'Inter Variable', Inter, sans-serif",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 15% 15%, rgba(0,128,129,0.06) 0%, transparent 50%), radial-gradient(ellipse at 85% 85%, rgba(0,0,129,0.04) 0%, transparent 50%)",
        }}
      />
      <Navbar />
      <main style={{ padding: responsive(bp, "16px", "20px 24px", "24px 40px"), position: "relative" }}>
        {children}
      </main>
    </div>
  );
}
