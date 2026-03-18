import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Bot, CheckCircle, Clock, PlayCircle } from "lucide-react";
import { scoreColor } from "../theme/tokens";
import { useTheme } from "../contexts/ThemeContext";
import { useBreakpoint, responsive } from "../hooks/useBreakpoint";
import { DashboardLayout } from "../components/templates/DashboardLayout";
import { GlassCard } from "../components/atoms/GlassCard";
import { Badge } from "../components/atoms/Badge";
import { ScoreBar } from "../components/atoms/ScoreBar";
import { StatCard } from "../components/molecules/StatCard";
import { EmptyState } from "../components/atoms/EmptyState";
import { MOCK_INTERVIEWS } from "../utils/mockData";

type FilterTab = "todas" | "completadas" | "pendientes" | "en_curso";

export function Interviews() {
  const { tokens, mode } = useTheme();
  const bp = useBreakpoint();
  const { t } = useTranslation("interviews");
  const { t: tc } = useTranslation("common");
  const [filter, setFilter] = useState<FilterTab>("todas");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const completadas = MOCK_INTERVIEWS.filter((i) => i.estado === "completada").length;
    const pendientes = MOCK_INTERVIEWS.filter((i) => i.estado === "pendiente").length;
    const enCurso = MOCK_INTERVIEWS.filter((i) => i.estado === "en_curso").length;
    return { total: MOCK_INTERVIEWS.length, completadas, pendientes, enCurso };
  }, []);

  const filtered = useMemo(() => {
    if (filter === "todas") return MOCK_INTERVIEWS;
    const map: Record<FilterTab, string> = {
      todas: "",
      completadas: "completada",
      pendientes: "pendiente",
      en_curso: "en_curso",
    };
    return MOCK_INTERVIEWS.filter((i) => i.estado === map[filter]);
  }, [filter]);

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "todas", label: t("filters.todas"), count: stats.total },
    { key: "completadas", label: t("filters.completadas"), count: stats.completadas },
    { key: "pendientes", label: t("filters.pendientes"), count: stats.pendientes },
    { key: "en_curso", label: t("filters.enCurso"), count: stats.enCurso },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 8,
            letterSpacing: -0.5,
          }}
        >
          {t("title")}
        </h1>
        <p style={{ fontSize: 14, color: tokens.text.secondary }}>
          {t("subtitle")}
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: responsive(bp, "repeat(2, 1fr)", "repeat(4, 1fr)", "repeat(4, 1fr)"),
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          label={t("stats.total")}
          value={stats.total}
          icon={Bot}
          color={tokens.accent.teal}
        />
        <StatCard
          label={t("stats.completadas")}
          value={stats.completadas}
          icon={CheckCircle}
          color={tokens.status.success}
        />
        <StatCard
          label={t("stats.pendientes")}
          value={stats.pendientes}
          icon={Clock}
          color={tokens.status.warning}
        />
        <StatCard
          label={t("stats.enCurso")}
          value={stats.enCurso}
          icon={PlayCircle}
          color={tokens.status.info}
        />
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 20,
          padding: 4,
          background: tokens.bg.surface1,
          borderRadius: 12,
          width: "fit-content",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: filter === tab.key
                ? (mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)")
                : "transparent",
              color: filter === tab.key ? tokens.text.primary : tokens.text.muted,
              fontSize: 13,
              fontWeight: filter === tab.key ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "'Inter Variable', Inter, sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {tab.label}
            <span
              style={{
                fontSize: 11,
                padding: "1px 6px",
                borderRadius: 10,
                background: filter === tab.key
                  ? `${tokens.accent.teal}20`
                  : "transparent",
                color: filter === tab.key ? tokens.accent.teal : tokens.text.muted,
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Interview Cards */}
      {filtered.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon={Bot}
            title={filter === "todas" ? t("empty.title") : t("empty.filteredTitle")}
            description={filter === "todas" ? t("empty.description") : t("empty.filteredDescription")}
          />
        </GlassCard>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: responsive(bp, "1fr", "1fr", "repeat(2, 1fr)"),
            gap: 16,
          }}
        >
          {filtered.map((int) => {
            const isExpanded = expandedId === int.id;

            return (
              <GlassCard
                key={int.id}
                hover
                onClick={() => setExpandedId(isExpanded ? null : int.id)}
                glow={
                  int.scorecard
                    ? int.scorecard.recomendacion === "AVANZAR"
                      ? `${tokens.status.success}12`
                      : int.scorecard.recomendacion === "RECHAZAR"
                        ? `${tokens.status.error}12`
                        : `${tokens.status.warning}12`
                    : undefined
                }
                style={{ cursor: "pointer" }}
              >
                {/* Card header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: `linear-gradient(135deg, ${tokens.accent.teal}25, ${tokens.accent.navy}25)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 700,
                        color: tokens.accent.teal,
                        flexShrink: 0,
                      }}
                    >
                      {int.candidatoNombre.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
                        {int.candidatoNombre}
                      </div>
                      <div style={{ fontSize: 12, color: tokens.text.secondary }}>
                        {int.puesto} · {int.etapaNombre}
                      </div>
                    </div>
                  </div>
                  <Badge
                    status={
                      int.estado === "completada"
                        ? "success"
                        : int.estado === "en_curso"
                          ? "warning"
                          : "neutral"
                    }
                    label={tc("status." + int.estado)}
                  />
                </div>

                {/* Meta row */}
                <div
                  style={{
                    display: "flex",
                    gap: 20,
                    marginBottom: int.scorecard ? 16 : 0,
                  }}
                >
                  {int.scorecard && (
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          color: tokens.text.muted,
                          marginBottom: 4,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        {t("labels.score")}
                      </div>
                      <div
                        style={{
                          fontSize: 28,
                          fontWeight: 700,
                          color: scoreColor(int.scorecard.promedio),
                          lineHeight: 1,
                        }}
                      >
                        {int.scorecard.promedio}
                        <span style={{ fontSize: 14, fontWeight: 400, color: tokens.text.muted }}>/10</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: tokens.text.muted,
                        marginBottom: 4,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {t("labels.tipo")}
                    </div>
                    <div style={{ fontSize: 14, color: tokens.text.secondary }}>
                      {int.tipo}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: tokens.text.muted,
                        marginBottom: 4,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {t("labels.fecha")}
                    </div>
                    <div style={{ fontSize: 14, color: tokens.text.secondary }}>
                      {int.fecha}
                    </div>
                  </div>
                  {int.scorecard && (
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          color: tokens.text.muted,
                          marginBottom: 4,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        {t("labels.recomendacion")}
                      </div>
                      <Badge
                        status={
                          int.scorecard.recomendacion === "AVANZAR"
                            ? "success"
                            : int.scorecard.recomendacion === "RECHAZAR"
                              ? "error"
                              : "warning"
                        }
                        label={tc("recommendations." + int.scorecard.recomendacion)}
                      />
                    </div>
                  )}
                </div>

                {/* Expandable scorecard */}
                {int.scorecard && (
                  <div
                    style={{
                      paddingTop: 16,
                      borderTop: `1px solid ${tokens.glass.border}`,
                      maxHeight: isExpanded ? 500 : 0,
                      overflow: "hidden",
                      opacity: isExpanded ? 1 : 0,
                      transition: "all 0.3s ease",
                    }}
                  >
                    {/* Score bars */}
                    <ScoreBar
                      label={tc("competencias.comunicacion")}
                      value={int.scorecard.comunicacion}
                      size="sm"
                    />
                    <ScoreBar
                      label={tc("competencias.experiencia")}
                      value={int.scorecard.experiencia}
                      size="sm"
                    />
                    <ScoreBar
                      label={tc("competencias.resolucion")}
                      value={int.scorecard.resolucion}
                      size="sm"
                    />
                    <ScoreBar
                      label={tc("competencias.equipo")}
                      value={int.scorecard.equipo}
                      size="sm"
                    />
                    <ScoreBar
                      label={tc("competencias.motivacion")}
                      value={int.scorecard.motivacion}
                      size="sm"
                    />
                    <ScoreBar
                      label={tc("competencias.profesionalismo")}
                      value={int.scorecard.profesionalismo}
                      size="sm"
                    />

                    {/* AI Summary */}
                    <div
                      style={{
                        marginTop: 12,
                        padding: 12,
                        background: tokens.bg.surface1,
                        borderRadius: 8,
                        fontSize: 13,
                        color: tokens.text.secondary,
                        lineHeight: 1.6,
                      }}
                    >
                      {int.scorecard.resumen}
                    </div>

                    {/* Strengths + Red Flags */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                        marginTop: 12,
                      }}
                    >
                      <div
                        style={{
                          padding: 10,
                          background: `${tokens.status.success}08`,
                          borderRadius: 8,
                          border: `1px solid ${tokens.status.success}15`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: tokens.status.success,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            marginBottom: 6,
                          }}
                        >
                          {t("scorecard.fortalezas")}
                        </div>
                        <div style={{ fontSize: 12, color: tokens.text.secondary, lineHeight: 1.5 }}>
                          {int.scorecard.fortalezas}
                        </div>
                      </div>
                      <div
                        style={{
                          padding: 10,
                          background: `${tokens.status.error}08`,
                          borderRadius: 8,
                          border: `1px solid ${tokens.status.error}15`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: tokens.status.error,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            marginBottom: 6,
                          }}
                        >
                          {t("scorecard.redFlags")}
                        </div>
                        <div style={{ fontSize: 12, color: tokens.text.secondary, lineHeight: 1.5 }}>
                          {int.scorecard.redFlags}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expand hint */}
                {int.scorecard && (
                  <div
                    style={{
                      textAlign: "center",
                      paddingTop: isExpanded ? 0 : 12,
                      fontSize: 11,
                      color: tokens.text.muted,
                    }}
                  >
                    {isExpanded ? "" : "Click para ver scorecard completo"}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
