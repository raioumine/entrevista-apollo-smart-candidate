import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  Bot,
  BarChart3,
  LayoutDashboard,
  Plus,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useBreakpoint, responsive } from "../../hooks/useBreakpoint";
import { Button } from "../atoms/Button";

const NAV_ICONS = {
  dashboard: LayoutDashboard,
  busquedas: Search,
  entrevistas: Bot,
  analytics: BarChart3,
};

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tokens, mode, toggleMode } = useTheme();
  const bp = useBreakpoint();
  const { t, i18n } = useTranslation("common");
  const [menuOpen, setMenuOpen] = useState(false);

  const NAV_ITEMS = [
    { path: "/dashboard", label: t("nav.dashboard"), icon: NAV_ICONS.dashboard },
    { path: "/busquedas", label: t("nav.busquedas"), icon: NAV_ICONS.busquedas },
    { path: "/entrevistas", label: t("nav.entrevistas"), icon: NAV_ICONS.entrevistas },
    { path: "/analytics", label: t("nav.analytics"), icon: NAV_ICONS.analytics },
  ];

  const toggleLang = () => {
    const next = i18n.language?.startsWith("en") ? "es" : "en";
    i18n.changeLanguage(next);
  };

  const isMobile = bp === "mobile";
  const activeBg = mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  return (
    <>
      <header
        style={{
          padding: responsive(bp, "12px 16px", "16px 24px", "16px 40px"),
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${tokens.glass.border}`,
          background: tokens.bg.base,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: responsive(bp, 16, 24, 32) }}>
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${tokens.accent.teal}, ${tokens.accent.navy})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
                U
              </span>
            </div>
            {!isMobile && (
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.5 }}>
                  UMINE
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: tokens.text.muted,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                  }}
                >
                  {t("brand.subtitle")}
                </div>
              </div>
            )}
          </div>

          {/* Nav links — desktop/tablet */}
          {!isMobile && (
            <nav style={{ display: "flex", gap: 4 }}>
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: bp === "tablet" ? "8px 10px" : "8px 16px",
                      background: isActive ? activeBg : "none",
                      border: "none",
                      borderRadius: 8,
                      color: isActive ? tokens.text.primary : tokens.text.muted,
                      fontFamily: "'Inter Variable', Inter, sans-serif",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <item.icon size={16} />
                    {bp === "desktop" && item.label}
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right side actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Language toggle */}
          <button
            onClick={toggleLang}
            style={{
              padding: "6px 10px",
              background: "none",
              border: `1px solid ${tokens.glass.border}`,
              borderRadius: 8,
              color: tokens.text.secondary,
              fontFamily: "'Inter Variable', Inter, sans-serif",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              letterSpacing: 0.5,
            }}
          >
            {i18n.language?.startsWith("en") ? "EN" : "ES"}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleMode}
            style={{
              padding: 8,
              background: "none",
              border: `1px solid ${tokens.glass.border}`,
              borderRadius: 8,
              color: tokens.text.secondary,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* New Search button — desktop/tablet */}
          {!isMobile && (
            <Button icon={Plus} onClick={() => navigate("/nueva-busqueda")}>
              {t("nav.newSearch")}
            </Button>
          )}

          {/* Hamburger — mobile */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                padding: 8,
                background: "none",
                border: `1px solid ${tokens.glass.border}`,
                borderRadius: 8,
                color: tokens.text.primary,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isMobile && menuOpen && (
        <div
          style={{
            position: "fixed",
            top: 61,
            left: 0,
            right: 0,
            bottom: 0,
            background: tokens.bg.base,
            zIndex: 99,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            animation: "fadeIn 0.2s ease",
          }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMenuOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  background: isActive ? activeBg : "none",
                  border: "none",
                  borderRadius: 10,
                  color: isActive ? tokens.text.primary : tokens.text.secondary,
                  fontFamily: "'Inter Variable', Inter, sans-serif",
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            );
          })}
          <div style={{ marginTop: 12 }}>
            <Button
              icon={Plus}
              fullWidth
              onClick={() => {
                navigate("/nueva-busqueda");
                setMenuOpen(false);
              }}
            >
              {t("nav.newSearch")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
