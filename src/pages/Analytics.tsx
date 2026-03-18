import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Users,
  Star,
  Bot,
  TrendingUp,
  Clock,
  CheckCircle,
  Target,
} from "lucide-react";
import { scoreColor } from "../theme/tokens";
import { useTheme } from "../contexts/ThemeContext";
import { useBreakpoint, responsive } from "../hooks/useBreakpoint";
import { DashboardLayout } from "../components/templates/DashboardLayout";
import { GlassCard } from "../components/atoms/GlassCard";
import { StatCard } from "../components/molecules/StatCard";
import { useSearchContext } from "../contexts/SearchContext";

export function Analytics() {
  const { tokens } = useTheme();
  const bp = useBreakpoint();
  const { t } = useTranslation("analytics");
  const { getAllCandidates, searches } = useSearchContext();

  const allCandidates = getAllCandidates();

  const stats = useMemo(() => {
    const scored = allCandidates.filter((c) => c.scoreIA && c.scoreIA.total > 0);
    const avgScore = scored.length
      ? scored.reduce((acc, c) => acc + (c.scoreIA?.total || 0), 0) / scored.length
      : 0;
    const inTerna = allCandidates.filter(
      (c) => c.scoreIA && c.scoreIA.total >= 7
    ).length;
    const completedInterviews = 0;
    const conversionRate = allCandidates.length
      ? Math.round((inTerna / allCandidates.length) * 100)
      : 0;

    return {
      totalCandidates: allCandidates.length,
      totalSearches: Object.keys(searches).length,
      avgScore: avgScore.toFixed(1),
      inTerna,
      completedInterviews,
      conversionRate,
    };
  }, [allCandidates]);

  // Score distribution for bar chart
  const scoreDistribution = useMemo(() => {
    const ranges = [
      { label: "0-4", min: 0, max: 4.9, color: tokens.status.error },
      { label: "5-6", min: 5, max: 6.9, color: tokens.status.warning },
      { label: "7-8", min: 7, max: 8.9, color: tokens.status.info },
      { label: "9-10", min: 9, max: 10, color: tokens.status.success },
    ];
    return ranges.map((r) => ({
      ...r,
      count: allCandidates.filter(
        (c) =>
          c.scoreIA &&
          c.scoreIA.total >= r.min &&
          c.scoreIA.total <= r.max
      ).length,
    }));
  }, [allCandidates, tokens]);

  // Pipeline funnel
  const pipeline = useMemo(() => {
    const stages = [
      { key: "encontrado", color: tokens.text.muted },
      { key: "email_enviado", color: tokens.status.info },
      { key: "cv_recibido", color: tokens.status.warning },
      { key: "evaluado", color: tokens.accent.teal },
      { key: "en_terna", color: tokens.accent.gold },
      { key: "descartado", color: tokens.status.error },
    ];
    return stages.map((s) => ({
      ...s,
      count: allCandidates.filter((c) => c.estado === s.key).length,
    }));
  }, [allCandidates, tokens]);

  const maxPipeline = Math.max(...pipeline.map((p) => p.count), 1);

  // Competency averages
  const competencyAvg = useMemo(() => {
    const scored = allCandidates.filter((c) => c.scoreIA && c.scoreIA.total > 0);
    if (!scored.length) return [];
    const keys: { key: string; label: string }[] = [
      { key: "comunicacion", label: "Comunicacion" },
      { key: "experiencia", label: "Experiencia" },
      { key: "habilidadesTecnicas", label: "Tecnico" },
      { key: "liderazgo", label: "Liderazgo" },
      { key: "culturaFit", label: "Cultura Fit" },
      { key: "motivacion", label: "Motivacion" },
    ];
    return keys.map((k) => {
      const avg =
        scored.reduce(
          (acc, c) =>
            acc + ((c.scoreIA?.[k.key as keyof typeof c.scoreIA] as number) || 0),
          0
        ) / scored.length;
      return { label: k.label, avg: Math.round(avg * 10) / 10 };
    });
  }, [allCandidates]);

  // Top candidates
  const topCandidates = useMemo(
    () =>
      allCandidates
        .filter((c) => c.scoreIA && c.scoreIA.total > 0)
        .sort((a, b) => (b.scoreIA?.total || 0) - (a.scoreIA?.total || 0))
        .slice(0, 5),
    [allCandidates]
  );

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

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: responsive(
            bp,
            "repeat(2, 1fr)",
            "repeat(3, 1fr)",
            "repeat(6, 1fr)"
          ),
          gap: 12,
          marginBottom: 24,
        }}
      >
        <StatCard
          label={t("stats.busquedas")}
          value={stats.totalSearches}
          icon={Search}
          color={tokens.accent.teal}
        />
        <StatCard
          label={t("stats.candidatos")}
          value={stats.totalCandidates}
          icon={Users}
          color={tokens.status.info}
        />
        <StatCard
          label={t("stats.scorePromedio")}
          value={stats.avgScore}
          icon={TrendingUp}
          color={tokens.accent.gold}
        />
        <StatCard
          label={t("stats.enTerna")}
          value={stats.inTerna}
          icon={Star}
          color={tokens.accent.gold}
        />
        <StatCard
          label={t("stats.entrevistas")}
          value={stats.completedInterviews}
          icon={Bot}
          color={tokens.status.success}
        />
        <StatCard
          label={t("stats.conversion")}
          value={`${stats.conversionRate}%`}
          icon={Target}
          color={tokens.accent.teal}
        />
      </div>

      {/* Charts row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: responsive(bp, "1fr", "1fr", "1fr 1fr"),
          gap: 20,
          marginBottom: 20,
        }}
      >
        {/* Score Distribution */}
        <GlassCard>
          <h3
            style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}
          >
            {t("charts.distribucionScores")}
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 12,
              height: 140,
              paddingBottom: 24,
            }}
          >
            {scoreDistribution.map((bucket) => {
              const maxCount = Math.max(
                ...scoreDistribution.map((b) => b.count),
                1
              );
              const pct = (bucket.count / maxCount) * 100;
              return (
                <div
                  key={bucket.label}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: bucket.color,
                    }}
                  >
                    {bucket.count}
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: `${Math.max(pct, 8)}%`,
                      borderRadius: 6,
                      background: `${bucket.color}30`,
                      border: `1px solid ${bucket.color}50`,
                      transition: "height 0.5s ease",
                      minHeight: 8,
                    }}
                  />
                  <div
                    style={{
                      fontSize: 11,
                      color: tokens.text.muted,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {bucket.label}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Pipeline Funnel */}
        <GlassCard>
          <h3
            style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}
          >
            {t("charts.funnelPipeline")}
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {pipeline.map((stage) => (
              <div
                key={stage.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 90,
                    fontSize: 12,
                    color: tokens.text.secondary,
                    flexShrink: 0,
                    textTransform: "capitalize",
                  }}
                >
                  {stage.key.replace("_", " ")}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 20,
                    borderRadius: 4,
                    background: tokens.bg.surface1,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(stage.count / maxPipeline) * 100}%`,
                      height: "100%",
                      borderRadius: 4,
                      background: `${stage.color}60`,
                      transition: "width 0.5s ease",
                      minWidth: stage.count > 0 ? 4 : 0,
                    }}
                  />
                </div>
                <div
                  style={{
                    width: 28,
                    fontSize: 13,
                    fontWeight: 600,
                    color: stage.color,
                    textAlign: "right",
                  }}
                >
                  {stage.count}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Bottom row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: responsive(bp, "1fr", "1fr", "1fr 1fr"),
          gap: 20,
        }}
      >
        {/* Competency Radar (simplified as horizontal bars) */}
        <GlassCard>
          <h3
            style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}
          >
            {t("charts.competenciasPromedio")}
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {competencyAvg.map((comp) => (
              <div
                key={comp.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 100,
                    fontSize: 12,
                    color: tokens.text.secondary,
                    flexShrink: 0,
                  }}
                >
                  {comp.label}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 8,
                    borderRadius: 4,
                    background: tokens.bg.surface1,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(comp.avg / 10) * 100}%`,
                      height: "100%",
                      borderRadius: 4,
                      background: scoreColor(comp.avg),
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
                <div
                  style={{
                    width: 36,
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: "right",
                    color: scoreColor(comp.avg),
                  }}
                >
                  {comp.avg}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Top Candidates */}
        <GlassCard>
          <h3
            style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}
          >
            {t("charts.topCandidatos")}
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {topCandidates.map((c, i) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 12px",
                  background:
                    i === 0 ? `${tokens.accent.gold}08` : "transparent",
                  borderRadius: 8,
                  border:
                    i === 0
                      ? `1px solid ${tokens.accent.gold}20`
                      : `1px solid transparent`,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background:
                      i === 0
                        ? `${tokens.accent.gold}20`
                        : `${tokens.accent.teal}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color:
                      i === 0 ? tokens.accent.gold : tokens.accent.teal,
                    flexShrink: 0,
                  }}
                >
                  #{i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    {c.nombre} {c.apellido}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: tokens.text.muted,
                    }}
                  >
                    {c.cargo} · {c.empresa}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: scoreColor(c.scoreIA?.total || 0),
                  }}
                >
                  {c.scoreIA?.total}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Interview timeline */}
      <div style={{ marginTop: 20 }}>
        <GlassCard>
          <h3
            style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}
          >
            {t("charts.timelineEntrevistas")}
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            {([] as { id: string; candidatoNombre: string; etapaNombre: string; estado: string; fecha: string; scorecard?: { promedio: number } }[]).map((int, i, arr) => (
              <div
                key={int.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "12px 0",
                  borderBottom:
                    i < arr.length - 1
                      ? `1px solid ${tokens.glass.border}`
                      : "none",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background:
                      int.estado === "completada"
                        ? tokens.status.success
                        : int.estado === "en_curso"
                          ? tokens.status.warning
                          : tokens.text.muted,
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    width: 80,
                    fontSize: 12,
                    color: tokens.text.muted,
                    flexShrink: 0,
                  }}
                >
                  {int.fecha}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>
                    {int.candidatoNombre}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: tokens.text.muted,
                      marginLeft: 8,
                    }}
                  >
                    {int.etapaNombre}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {int.scorecard && (
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: scoreColor(int.scorecard.promedio),
                      }}
                    >
                      {int.scorecard.promedio}
                    </span>
                  )}
                  {int.estado === "completada" ? (
                    <CheckCircle size={14} color={tokens.status.success} />
                  ) : int.estado === "en_curso" ? (
                    <Bot size={14} color={tokens.status.warning} />
                  ) : (
                    <Clock size={14} color={tokens.text.muted} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
