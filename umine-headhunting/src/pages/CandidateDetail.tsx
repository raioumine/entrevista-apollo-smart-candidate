import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ExternalLink,
  Mail,
  Building2,
  MapPin,
  Bot,
  Star,
  XCircle,
} from "lucide-react";
import { scoreColor } from "../theme/tokens";
import { useTheme } from "../contexts/ThemeContext";
import { useBreakpoint, responsive } from "../hooks/useBreakpoint";
import { DashboardLayout } from "../components/templates/DashboardLayout";
import { GlassCard } from "../components/atoms/GlassCard";
import { Button } from "../components/atoms/Button";
import { Badge } from "../components/atoms/Badge";
import { ScoreBar } from "../components/atoms/ScoreBar";
import { useSearchContext } from "../contexts/SearchContext";
import { ESTADO_STATUS } from "../types/candidate";

export function CandidateDetail() {
  const { tokens } = useTheme();
  const bp = useBreakpoint();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation("candidates");
  const { t: tc } = useTranslation("common");

  const { findCandidate } = useSearchContext();
  const candidate = id ? findCandidate(id) : undefined;
  const interviews: import("../types/interview").Interview[] = [];

  if (!candidate) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", padding: 80, color: tokens.text.muted }}>
          <p>{t("detail.notFound")}</p>
          <p style={{ fontSize: 12, marginTop: 8 }}>ID: {id}</p>
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
            style={{ marginTop: 16 }}
          >
            Volver
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const c = candidate;

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate(-1)}
        >
          {tc("buttons.volver")}
        </Button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: responsive(bp, "1fr", "1fr", "1fr 340px"),
          gap: 24,
        }}
      >
        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Profile header */}
          <GlassCard>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: `linear-gradient(135deg, ${tokens.accent.teal}30, ${tokens.accent.navy}30)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    fontWeight: 700,
                    color: tokens.accent.teal,
                  }}
                >
                  {c.nombre?.[0] || ""}
                  {c.apellido?.[0] || ""}
                </div>
                <div>
                  <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
                    {c.nombre} {c.apellido}
                  </h1>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      color: tokens.text.secondary,
                      fontSize: 14,
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Building2 size={14} /> {t("detail.cargoEn", { cargo: c.cargo, empresa: c.empresa })}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <MapPin size={14} /> {c.ubicacion}
                    </span>
                  </div>
                </div>
              </div>
              <Badge
                status={ESTADO_STATUS[c.estado] as "success" | "warning" | "error" | "info" | "neutral"}
                label={tc("status." + c.estado)}
              />
            </div>

            {/* Contact */}
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 20,
                paddingTop: 16,
                borderTop: `1px solid ${tokens.glass.border}`,
              }}
            >
              <a
                href={`mailto:${c.email}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  background: tokens.bg.surface1,
                  borderRadius: 8,
                  fontSize: 13,
                  color: tokens.text.secondary,
                  textDecoration: "none",
                  border: `1px solid ${tokens.glass.border}`,
                }}
              >
                <Mail size={14} /> {c.email}
                <Badge
                  status={c.emailScore === "Verificado" ? "success" : "warning"}
                  label={tc("emailScore." + c.emailScore)}
                  size="sm"
                />
              </a>
              {c.linkedinUrl && (
                <a
                  href={c.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    background: tokens.bg.surface1,
                    borderRadius: 8,
                    fontSize: 13,
                    color: tokens.status.info,
                    textDecoration: "none",
                    border: `1px solid ${tokens.glass.border}`,
                  }}
                >
                  {tc("labels.linkedin")} <ExternalLink size={12} />
                </a>
              )}
            </div>
          </GlassCard>

          {/* AI Summary */}
          {c.scoreIA && (
            <GlassCard>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                {t("detail.evaluacionIA")}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: tokens.text.secondary,
                  lineHeight: 1.7,
                  marginBottom: 20,
                }}
              >
                {c.scoreIA.resumen}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    padding: 16,
                    background: tokens.bg.surface1,
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: tokens.status.success,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 8,
                    }}
                  >
                    {tc("labels.fortalezas")}
                  </div>
                  {c.scoreIA.fortalezas.map((f) => (
                    <div
                      key={f}
                      style={{
                        fontSize: 13,
                        color: tokens.text.secondary,
                        padding: "3px 0",
                      }}
                    >
                      + {f}
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    padding: 16,
                    background: tokens.bg.surface1,
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: tokens.status.warning,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 8,
                    }}
                  >
                    {tc("labels.areasDeMejora")}
                  </div>
                  {c.scoreIA.debilidades.map((d) => (
                    <div
                      key={d}
                      style={{
                        fontSize: 13,
                        color: tokens.text.secondary,
                        padding: "3px 0",
                      }}
                    >
                      - {d}
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}

          {/* Enriched Profile (from Google/Serper) */}
          {c.enriched && (c.enriched.summary || c.enriched.skills.length > 0 || c.enriched.education || c.enriched.experience) && (
            <GlassCard>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                Perfil Enriquecido (Google)
              </h3>
              {c.enriched.summary && (
                <p style={{ fontSize: 14, color: tokens.text.secondary, lineHeight: 1.7, marginBottom: 16 }}>
                  {c.enriched.summary}
                </p>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {c.enriched.experience && (
                  <div style={{ padding: 16, background: tokens.bg.surface1, borderRadius: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: tokens.accent.teal, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                      Experiencia
                    </div>
                    <div style={{ fontSize: 13, color: tokens.text.secondary, lineHeight: 1.6 }}>
                      {c.enriched.experience}
                    </div>
                  </div>
                )}
                {c.enriched.education && (
                  <div style={{ padding: 16, background: tokens.bg.surface1, borderRadius: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: tokens.accent.navy, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                      Educacion
                    </div>
                    <div style={{ fontSize: 13, color: tokens.text.secondary, lineHeight: 1.6 }}>
                      {c.enriched.education}
                    </div>
                  </div>
                )}
              </div>
              {c.enriched.skills.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: tokens.text.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                    Skills detectados
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {c.enriched.skills.map((s) => (
                      <span
                        key={s}
                        style={{
                          padding: "4px 10px",
                          background: `${tokens.accent.teal}15`,
                          border: `1px solid ${tokens.accent.teal}30`,
                          borderRadius: 6,
                          fontSize: 12,
                          color: tokens.accent.teal,
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>
          )}

          {/* Interview History */}
          {interviews.length > 0 && (
            <GlassCard>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                {t("detail.historialEntrevistas")}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {interviews.map((int) => (
                  <div
                    key={int.id}
                    style={{
                      padding: 16,
                      background: tokens.bg.surface1,
                      borderRadius: 12,
                      border: `1px solid ${tokens.glass.border}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>
                          {int.etapaNombre}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: tokens.text.muted,
                          }}
                        >
                          {int.tipo} · {int.fecha}
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
                        size="sm"
                      />
                    </div>
                    {int.scorecard && (
                      <div
                        style={{
                          fontSize: 13,
                          color: tokens.text.secondary,
                          marginTop: 8,
                          paddingTop: 8,
                          borderTop: `1px solid ${tokens.glass.border}`,
                        }}
                      >
                        {t("detail.scoreLabel", { score: int.scorecard.promedio })} ·{" "}
                        <span
                          style={{
                            color: scoreColor(int.scorecard.promedio),
                            fontWeight: 600,
                          }}
                        >
                          {tc("recommendations." + int.scorecard.recomendacion)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Score card */}
          {c.scoreIA && (
            <GlassCard
              glow={`${scoreColor(c.scoreIA.total)}10`}
              style={{
                border: `1px solid ${scoreColor(c.scoreIA.total)}30`,
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 700,
                    color: scoreColor(c.scoreIA.total),
                  }}
                >
                  {c.scoreIA.total}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: tokens.text.muted,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {tc("labels.scoreTotal")}
                </div>
                <Badge
                  status={
                    c.scoreIA.recomendacion === "AVANZAR"
                      ? "success"
                      : c.scoreIA.recomendacion === "RECHAZAR"
                        ? "error"
                        : "warning"
                  }
                  label={tc("recommendations." + c.scoreIA.recomendacion)}
                />
              </div>

              <ScoreBar label={tc("competencias.comunicacion")} value={c.scoreIA.comunicacion} />
              <ScoreBar label={tc("competencias.experiencia")} value={c.scoreIA.experiencia} />
              <ScoreBar label={tc("competencias.tecnico")} value={c.scoreIA.habilidadesTecnicas} />
              <ScoreBar label={tc("competencias.liderazgo")} value={c.scoreIA.liderazgo} />
              <ScoreBar label={tc("competencias.culturaFit")} value={c.scoreIA.culturaFit} />
              <ScoreBar label={tc("competencias.motivacion")} value={c.scoreIA.motivacion} />
            </GlassCard>
          )}

          {/* Actions */}
          <GlassCard>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Tavus interview disabled in this version */}
              <Button icon={Bot} fullWidth disabled style={{ opacity: 0.4 }}>
                {tc("buttons.iniciarEntrevista")} (deshabilitado)
              </Button>
              <Button variant="gold" icon={Star} fullWidth>
                {tc("buttons.agregarTerna")}
              </Button>
              <Button variant="secondary" icon={Mail} fullWidth>
                {tc("buttons.enviarEmail")}
              </Button>
              <Button variant="danger" icon={XCircle} fullWidth>
                {tc("buttons.descartar")}
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
