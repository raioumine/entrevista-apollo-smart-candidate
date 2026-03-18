import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  Users,
  Bot,
  BarChart3,
  ArrowRight,
  Star,
  Mail,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useBreakpoint, responsive } from "../hooks/useBreakpoint";
import { DashboardLayout } from "../components/templates/DashboardLayout";
import { GlassCard } from "../components/atoms/GlassCard";
import { Button } from "../components/atoms/Button";
import { Badge } from "../components/atoms/Badge";
import { StatCard } from "../components/molecules/StatCard";
import { useSearchContext } from "../contexts/SearchContext";
import type { SearchConfig } from "../types/search";

export function Dashboard() {
  const navigate = useNavigate();
  const { tokens } = useTheme();
  const bp = useBreakpoint();
  const { t } = useTranslation("dashboard");
  const { t: tc } = useTranslation("common");
  const { searches, getAllCandidates } = useSearchContext();

  const realSearchList: (SearchConfig & { candidateCount: number })[] = Object.entries(searches).map(([id, data]) => ({
    id,
    puesto: data.config.puesto || "Sin puesto",
    industria: data.config.industria || "",
    pais: data.config.pais || "",
    seniority: data.config.seniority || "",
    habilidades: data.config.habilidades || [],
    idiomas: [],
    anosExperiencia: "",
    modalidad: "",
    cantidadCandidatos: data.candidates.length,
    enviarColdEmail: false,
    plantillaEmail: "",
    etapasEntrevista: [],
    estado: "evaluando" as const,
    createdAt: data.config.createdAt || new Date().toISOString(),
    candidateCount: data.candidates.length,
  }));

  const allCandidates = getAllCandidates();
  const allSearches = realSearchList;

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 8,
            letterSpacing: -0.5,
          }}
        >
          {t("welcome.title")}
        </h1>
        <p style={{ fontSize: 14, color: tokens.text.secondary }}>
          {t("welcome.subtitle")}
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: responsive(bp, "1fr", "repeat(2, 1fr)", "repeat(4, 1fr)"),
          gap: 16,
          marginBottom: 32,
        }}
      >
        <StatCard
          label={t("stats.busquedasActivas")}
          value={allSearches.length}
          icon={Search}
          color={tokens.accent.teal}
        />
        <StatCard
          label={t("stats.candidatosEnPipeline")}
          value={allCandidates.length}
          icon={Users}
          color={tokens.status.info}
        />
        <StatCard
          label={t("stats.enTerna")}
          value={allCandidates.filter((c) => c.scoreIA && c.scoreIA.total >= 7).length}
          icon={Star}
          color={tokens.accent.gold}
        />
        <StatCard
          label={t("stats.entrevistasCompletadas")}
          value={0}
          icon={Bot}
          color={tokens.status.success}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: responsive(bp, "1fr", "1fr", "1fr 400px"),
          gap: 24,
        }}
      >
        {/* Active searches */}
        <GlassCard>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>
              {t("sections.busquedasActivas")}
            </h2>
            <Button
              variant="secondary"
              size="sm"
              icon={ArrowRight}
              onClick={() => navigate("/busquedas")}
            >
              {tc("buttons.verTodas")}
            </Button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {allSearches.slice(0, 5).map((s) => (
              <div
                key={s.id}
                onClick={() => navigate(`/busquedas/${s.id}`)}
                style={{
                  padding: 16,
                  background: tokens.bg.surface1,
                  borderRadius: 12,
                  border: `1px solid ${tokens.glass.border}`,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor =
                    tokens.glass.borderHover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = tokens.glass.border)
                }
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 15,
                        marginBottom: 4,
                      }}
                    >
                      {s.puesto}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: tokens.text.secondary,
                      }}
                    >
                      {s.industria} · {s.pais}
                    </div>
                  </div>
                  <Badge
                    status={
                      s.estado === "buscando"
                        ? "info"
                        : s.estado === "evaluando"
                          ? "warning"
                          : "success"
                    }
                    label={s.estado.replace("_", " ")}
                    size="sm"
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    fontSize: 12,
                    color: tokens.text.muted,
                  }}
                >
                  <span>{s.candidateCount} candidatos</span>
                  <span>{s.seniority}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recent activity */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <GlassCard>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              {t("sections.actividadReciente")}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                {
                  icon: Star,
                  text: t("activity.agregadaATerna"),
                  time: t("activity.hace2h"),
                  color: tokens.accent.gold,
                },
                {
                  icon: Bot,
                  text: t("activity.entrevistaCompletada"),
                  time: t("activity.hace3h"),
                  color: tokens.status.success,
                },
                {
                  icon: BarChart3,
                  text: t("activity.candidatosEvaluados"),
                  time: t("activity.hace5h"),
                  color: tokens.status.info,
                },
                {
                  icon: Mail,
                  text: t("activity.coldEmailsEnviados"),
                  time: t("activity.hace6h"),
                  color: tokens.accent.teal,
                },
                {
                  icon: Users,
                  text: t("activity.apolloEncontro"),
                  time: t("activity.hace8h"),
                  color: tokens.accent.teal,
                },
              ].map((act, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: `${act.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <act.icon size={14} color={act.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13 }}>{act.text}</div>
                    <div
                      style={{
                        fontSize: 11,
                        color: tokens.text.muted,
                      }}
                    >
                      {act.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Pipeline funnel */}
          <GlassCard>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              {t("sections.pipeline")}
            </h2>
            {[
              { label: t("pipeline.encontrados"), value: allCandidates.filter(c => c.estado === "encontrado").length || 9, color: tokens.status.info },
              {
                label: t("pipeline.emailEnviado"),
                value: allCandidates.filter(c => c.estado === "email_enviado").length || 7,
                color: tokens.status.warning,
              },
              { label: t("pipeline.cvRecibido"), value: allCandidates.filter(c => c.estado === "cv_recibido").length || 5, color: tokens.accent.teal },
              { label: t("pipeline.evaluados"), value: allCandidates.filter(c => c.estado === "evaluado").length || 5, color: tokens.status.info },
              { label: t("pipeline.enTerna"), value: allCandidates.filter(c => c.estado === "en_terna" || (c.scoreIA && c.scoreIA.total >= 7)).length || 3, color: tokens.accent.gold },
              { label: t("pipeline.descartados"), value: allCandidates.filter(c => c.estado === "descartado").length || 1, color: tokens.status.error },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom:
                    i < 5
                      ? `1px solid ${tokens.glass.border}`
                      : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: item.color,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      color: tokens.text.secondary,
                    }}
                  >
                    {item.label}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: item.color,
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
