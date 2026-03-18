import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Bot, Trophy } from "lucide-react";
import { scoreColor } from "../theme/tokens";
import { useTheme } from "../contexts/ThemeContext";
import { useBreakpoint, responsive } from "../hooks/useBreakpoint";
import { DashboardLayout } from "../components/templates/DashboardLayout";
import { GlassCard } from "../components/atoms/GlassCard";
import { Button } from "../components/atoms/Button";
import { Badge } from "../components/atoms/Badge";
import { ScoreBar } from "../components/atoms/ScoreBar";
import { useSearchContext } from "../contexts/SearchContext";

export function Terna() {
  const { tokens } = useTheme();
  const bp = useBreakpoint();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation("candidates");
  const { t: tc } = useTranslation("common");
  const { getSearch } = useSearchContext();

  const realSearch = id ? getSearch(id) : undefined;
  const candidates = realSearch?.candidates || [];

  const terna = candidates
    .filter((c) => c.scoreIA && c.scoreIA.total > 0)
    .sort((a, b) => (b.scoreIA?.total || 0) - (a.scoreIA?.total || 0))
    .slice(0, 5);

  return (
    <DashboardLayout>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate(`/busquedas/${id}`)}
          >
            {t("terna.volverAlPipeline")}
          </Button>
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: -0.5,
              }}
            >
              <span style={{ color: tokens.accent.gold }}>{t("terna.title")}</span> —
              {realSearch?.config?.puesto || "SDR Senior"}
            </h1>
            <p
              style={{
                fontSize: 14,
                color: tokens.text.secondary,
                marginTop: 4,
              }}
            >
              {t("terna.subtitle", { count: terna.length })}
            </p>
          </div>
        </div>
        {/* Tavus interview disabled in this version */}
        <Button icon={Bot} disabled style={{ opacity: 0.4 }}>
          {t("terna.iniciarEntrevistasParaTerna")} (deshabilitado)
        </Button>
      </div>

      {/* Comparison Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: responsive(bp, "1fr", `repeat(${Math.min(terna.length, 2)}, 1fr)`, `repeat(${Math.min(terna.length, 3)}, 1fr)`),
          gap: 20,
          marginBottom: 32,
        }}
      >
        {terna.map((c, i) => (
          <GlassCard
            key={c.id}
            hover
            glow={i === 0 ? `${tokens.accent.gold}15` : undefined}
            style={
              i === 0
                ? { border: `1px solid ${tokens.accent.gold}40` }
                : undefined
            }
          >
            {/* Rank */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background:
                    i === 0
                      ? `${tokens.accent.gold}20`
                      : `${tokens.accent.teal}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  color: i === 0 ? tokens.accent.gold : tokens.accent.teal,
                }}
              >
                #{i + 1}
              </div>
              {i === 0 && <Trophy size={20} color={tokens.accent.gold} />}
              <Badge
                status={
                  c.scoreIA?.recomendacion === "AVANZAR"
                    ? "success"
                    : c.scoreIA?.recomendacion === "RECHAZAR"
                      ? "error"
                      : "warning"
                }
                label={c.scoreIA?.recomendacion ? tc("recommendations." + c.scoreIA?.recomendacion) : "—"}
                size="sm"
              />
            </div>

            {/* Candidate info */}
            <h3
              style={{
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              {c.nombre} {c.apellido}
            </h3>
            <div
              style={{
                fontSize: 13,
                color: tokens.text.secondary,
                marginBottom: 4,
              }}
            >
              {c.cargo} en {c.empresa}
            </div>
            <div
              style={{
                fontSize: 12,
                color: tokens.text.muted,
                marginBottom: 16,
              }}
            >
              {c.ubicacion}
            </div>

            {/* Score */}
            <div
              style={{
                textAlign: "center",
                padding: "16px 0",
                marginBottom: 16,
                background: tokens.bg.surface1,
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  color: scoreColor(c.scoreIA?.total || 0),
                }}
              >
                {c.scoreIA?.total}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: tokens.text.muted,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {tc("labels.scoreTotalLower")}
              </div>
            </div>

            {/* Competency breakdown */}
            <div style={{ marginBottom: 16 }}>
              <ScoreBar
                label={tc("competencias.comunicacion")}
                value={c.scoreIA?.comunicacion || 0}
                size="sm"
              />
              <ScoreBar
                label={tc("competencias.experiencia")}
                value={c.scoreIA?.experiencia || 0}
                size="sm"
              />
              <ScoreBar
                label={tc("competencias.tecnico")}
                value={c.scoreIA?.habilidadesTecnicas || 0}
                size="sm"
              />
              <ScoreBar
                label={tc("competencias.liderazgo")}
                value={c.scoreIA?.liderazgo || 0}
                size="sm"
              />
              <ScoreBar
                label={tc("competencias.culturaFit")}
                value={c.scoreIA?.culturaFit || 0}
                size="sm"
              />
              <ScoreBar
                label={tc("competencias.motivacion")}
                value={c.scoreIA?.motivacion || 0}
                size="sm"
              />
            </div>

            {/* Summary */}
            <div
              style={{
                fontSize: 13,
                color: tokens.text.secondary,
                lineHeight: 1.6,
                marginBottom: 16,
                padding: 12,
                background: tokens.bg.surface1,
                borderRadius: 8,
              }}
            >
              {c.scoreIA?.resumen}
            </div>

            {/* Strengths/Weaknesses */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: tokens.status.success,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}
                >
                  {tc("labels.fortalezas")}
                </div>
                {c.scoreIA?.fortalezas.map((f) => (
                  <div
                    key={f}
                    style={{
                      fontSize: 12,
                      color: tokens.text.secondary,
                      padding: "2px 0",
                    }}
                  >
                    + {f}
                  </div>
                ))}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: tokens.status.warning,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}
                >
                  {tc("labels.areasDeMejora")}
                </div>
                {c.scoreIA?.debilidades.map((d) => (
                  <div
                    key={d}
                    style={{
                      fontSize: 12,
                      color: tokens.text.secondary,
                      padding: "2px 0",
                    }}
                  >
                    - {d}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 16,
                paddingTop: 16,
                borderTop: `1px solid ${tokens.glass.border}`,
              }}
            >
              <Button
                variant="primary"
                size="sm"
                icon={Bot}
                fullWidth
                onClick={() => {}}
              >
                {tc("buttons.entrevistar")}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => navigate(`/candidato/${c.id}`)}
              >
                {tc("buttons.verPerfil")}
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Comparison table */}
      <GlassCard>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          {t("terna.tablaComparativa")}
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${tokens.glass.border}` }}>
              <th
                style={{
                  padding: "10px 16px",
                  textAlign: "left",
                  fontSize: 11,
                  color: tokens.text.muted,
                  textTransform: "uppercase",
                }}
              >
                {t("terna.competencia")}
              </th>
              {terna.map((c) => (
                <th
                  key={c.id}
                  style={{
                    padding: "10px 16px",
                    textAlign: "center",
                    fontSize: 12,
                    fontWeight: 600,
                    color: tokens.text.primary,
                  }}
                >
                  {c.nombre}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { key: "comunicacion", label: tc("competencias.comunicacion") },
              { key: "experiencia", label: tc("competencias.experiencia") },
              { key: "habilidadesTecnicas", label: tc("competencias.tecnico") },
              { key: "liderazgo", label: tc("competencias.liderazgo") },
              { key: "culturaFit", label: tc("competencias.culturaFit") },
              { key: "motivacion", label: tc("competencias.motivacion") },
              { key: "total", label: t("terna.total") },
            ].map((comp) => (
              <tr
                key={comp.key}
                style={{
                  borderBottom: `1px solid ${tokens.glass.border}`,
                  fontWeight: comp.key === "total" ? 600 : 400,
                }}
              >
                <td
                  style={{
                    padding: "10px 16px",
                    fontSize: 13,
                    color:
                      comp.key === "total"
                        ? tokens.text.primary
                        : tokens.text.secondary,
                  }}
                >
                  {comp.label}
                </td>
                {terna.map((c) => {
                  const val =
                    c.scoreIA?.[comp.key as keyof typeof c.scoreIA] as number;
                  const maxVal = Math.max(
                    ...terna.map(
                      (t) =>
                        (t.scoreIA?.[
                          comp.key as keyof typeof t.scoreIA
                        ] as number) || 0
                    )
                  );
                  const isMax = val === maxVal;
                  return (
                    <td
                      key={c.id}
                      style={{
                        padding: "10px 16px",
                        textAlign: "center",
                        fontSize: 14,
                        fontWeight: isMax ? 700 : 400,
                        color: isMax
                          ? scoreColor(val)
                          : tokens.text.secondary,
                      }}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </DashboardLayout>
  );
}
