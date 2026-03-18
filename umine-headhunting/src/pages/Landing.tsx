import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  Bot,
  Mail,
  Users,
  Target,
  Zap,
  BarChart3,
  Shield,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useBreakpoint, responsive } from "../hooks/useBreakpoint";
import { GlassCard } from "../components/atoms/GlassCard";
import { Button } from "../components/atoms/Button";

export function Landing() {
  const navigate = useNavigate();
  const { tokens } = useTheme();
  const bp = useBreakpoint();
  const { t } = useTranslation("landing");
  const { t: tc } = useTranslation("common");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: tokens.bg.base,
        color: tokens.text.primary,
        fontFamily: "'Inter Variable', Inter, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* Background effects */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 20% 20%, rgba(0,128,129,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(226,191,54,0.04) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(0,0,129,0.03) 0%, transparent 70%)",
        }}
      />

      {/* Navbar */}
      <header
        style={{
          padding: responsive(bp, "16px", "20px 32px", "20px 60px"),
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${tokens.accent.teal}, ${tokens.accent.navy})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
              U
            </span>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>
              {tc("brand.name")}
            </div>
            <div
              style={{
                fontSize: 10,
                color: tokens.text.muted,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              {tc("brand.tagline")}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
          >
            {tc("buttons.iniciarSesion")}
          </Button>
          <Button onClick={() => navigate("/nueva-busqueda")}>
            {tc("buttons.empezarGratis")}
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section
        style={{
          padding: responsive(bp, "40px 16px 40px", "60px 32px 60px", "80px 60px 60px"),
          maxWidth: 1200,
          margin: "0 auto",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            background: `${tokens.accent.gold}15`,
            border: `1px solid ${tokens.accent.gold}30`,
            borderRadius: 20,
            marginBottom: 32,
          }}
        >
          <Sparkles size={14} color={tokens.accent.gold} />
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: tokens.accent.gold,
            }}
          >
            {t("hero.badge")}
          </span>
        </div>

        <h1
          style={{
            fontSize: "clamp(36px, 5vw, 64px)",
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: 24,
            letterSpacing: -1,
          }}
        >
          {t("hero.titleLine1")}
          <br />
          <span
            style={{
              background: `linear-gradient(135deg, ${tokens.accent.teal}, ${tokens.accent.gold})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t("hero.titleHighlight")}
          </span>{" "}
          {t("hero.titleLine2")}
        </h1>

        <p
          style={{
            fontSize: 18,
            color: tokens.text.secondary,
            maxWidth: 600,
            margin: "0 auto 40px",
            lineHeight: 1.6,
          }}
        >
          {t("hero.subtitle")}
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Button
            size="lg"
            icon={ArrowRight}
            onClick={() => navigate("/nueva-busqueda")}
          >
            {t("hero.ctaPrimary")}
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() =>
              document
                .getElementById("como-funciona")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            {t("hero.ctaSecondary")}
          </Button>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: responsive(bp, "repeat(2, 1fr)", "repeat(2, 1fr)", "repeat(4, 1fr)"),
            gap: responsive(bp, 12, 16, 24),
            marginTop: responsive(bp, 40, 60, 80),
          }}
        >
          {[
            { value: t("stats.configTime"), label: t("stats.configLabel") },
            { value: t("stats.empresas"), label: t("stats.empresasLabel") },
            { value: t("stats.competencias"), label: t("stats.competenciasLabel") },
            { value: t("stats.precision"), label: t("stats.precisionLabel") },
          ].map((stat) => (
            <GlassCard key={stat.label} hover padding={20}>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: tokens.accent.teal,
                  marginBottom: 4,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 13, color: tokens.text.muted }}>
                {stat.label}
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section
        id="como-funciona"
        style={{
          padding: "80px 60px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2
            style={{
              fontSize: 36,
              fontWeight: 700,
              marginBottom: 16,
              letterSpacing: -0.5,
            }}
          >
            {t("howItWorks.title")}
          </h2>
          <p style={{ fontSize: 16, color: tokens.text.secondary }}>
            {t("howItWorks.subtitle")}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: responsive(bp, "1fr", "1fr", "repeat(3, 1fr)"),
            gap: responsive(bp, 16, 20, 24),
          }}
        >
          {[
            {
              step: "01",
              icon: Target,
              title: t("howItWorks.step1.title"),
              desc: t("howItWorks.step1.desc"),
              color: tokens.accent.teal,
            },
            {
              step: "02",
              icon: Zap,
              title: t("howItWorks.step2.title"),
              desc: t("howItWorks.step2.desc"),
              color: tokens.accent.gold,
            },
            {
              step: "03",
              icon: Bot,
              title: t("howItWorks.step3.title"),
              desc: t("howItWorks.step3.desc"),
              color: tokens.status.success,
            },
          ].map((item) => (
            <GlassCard key={item.step} hover>
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: `${item.color}20`,
                  marginBottom: 16,
                  lineHeight: 1,
                }}
              >
                {item.step}
              </div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `${item.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <item.icon size={24} color={item.color} />
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: tokens.text.secondary,
                  lineHeight: 1.6,
                }}
              >
                {item.desc}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section
        style={{
          padding: responsive(bp, "40px 16px", "40px 32px 60px", "40px 60px 80px"),
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: responsive(bp, 32, 40, 60) }}>
          <h2
            style={{
              fontSize: responsive(bp, 24, 30, 36),
              fontWeight: 700,
              marginBottom: 16,
              letterSpacing: -0.5,
            }}
          >
            {t("features.title")}
          </h2>
          <p style={{ fontSize: 16, color: tokens.text.secondary }}>
            {t("features.subtitle")}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: responsive(bp, "1fr", "repeat(2, 1fr)", "repeat(3, 1fr)"),
            gap: 16,
          }}
        >
          {[
            {
              icon: Search,
              title: t("features.prospeccion.title"),
              desc: t("features.prospeccion.desc"),
            },
            {
              icon: Mail,
              title: t("features.coldEmail.title"),
              desc: t("features.coldEmail.desc"),
            },
            {
              icon: BarChart3,
              title: t("features.scoring.title"),
              desc: t("features.scoring.desc"),
            },
            {
              icon: Users,
              title: t("features.terna.title"),
              desc: t("features.terna.desc"),
            },
            {
              icon: Bot,
              title: t("features.entrevistas.title"),
              desc: t("features.entrevistas.desc"),
            },
            {
              icon: Shield,
              title: t("features.multiEtapa.title"),
              desc: t("features.multiEtapa.desc"),
            },
          ].map((feat) => (
            <GlassCard key={feat.title} hover padding={20}>
              <feat.icon
                size={20}
                color={tokens.accent.teal}
                style={{ marginBottom: 12 }}
              />
              <h4
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                {feat.title}
              </h4>
              <p
                style={{
                  fontSize: 13,
                  color: tokens.text.secondary,
                  lineHeight: 1.5,
                }}
              >
                {feat.desc}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section
        style={{
          padding: "60px",
          maxWidth: 800,
          margin: "0 auto 80px",
          textAlign: "center",
        }}
      >
        <GlassCard
          style={{
            background: `linear-gradient(135deg, ${tokens.accent.teal}10, ${tokens.accent.navy}10)`,
            border: `1px solid ${tokens.accent.teal}30`,
          }}
        >
          <h2
            style={{
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 12,
              letterSpacing: -0.5,
            }}
          >
            {t("cta.title")}
          </h2>
          <p
            style={{
              fontSize: 15,
              color: tokens.text.secondary,
              marginBottom: 24,
            }}
          >
            {t("cta.subtitle")}
          </p>
          <Button
            size="lg"
            icon={ArrowRight}
            onClick={() => navigate("/nueva-busqueda")}
          >
            {t("cta.button")}
          </Button>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: responsive(bp, "20px 16px", "24px 32px", "24px 60px"),
          borderTop: `1px solid ${tokens.glass.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 12, color: tokens.text.muted }}>
          {tc("footer.copyright")}
        </div>
        <div
          style={{
            display: "flex",
            gap: 24,
            fontSize: 12,
            color: tokens.text.muted,
          }}
        >
          <span style={{ cursor: "pointer" }}>{tc("footer.privacidad")}</span>
          <span style={{ cursor: "pointer" }}>{tc("footer.terminos")}</span>
          <span style={{ cursor: "pointer" }}>{tc("footer.contacto")}</span>
        </div>
      </footer>
    </div>
  );
}
