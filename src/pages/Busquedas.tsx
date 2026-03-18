import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Plus } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { DashboardLayout } from "../components/templates/DashboardLayout";
import { GlassCard } from "../components/atoms/GlassCard";
import { Button } from "../components/atoms/Button";
import { Badge } from "../components/atoms/Badge";
import { useSearchContext } from "../contexts/SearchContext";

export function Busquedas() {
  const navigate = useNavigate();
  const { tokens } = useTheme();
  const { t } = useTranslation("search");
  const { t: tc } = useTranslation("common");
  const { searches } = useSearchContext();

  const realSearchEntries = Object.entries(searches).map(([id, data]) => ({
    id,
    puesto: data.config.puesto || "Sin puesto",
    industria: data.config.industria || "",
    pais: data.config.pais || "",
    seniority: data.config.seniority || "",
    habilidades: data.config.habilidades || [],
    modalidad: "",
    estado: "evaluando" as const,
    candidates: data.candidates,
  }));

  return (
    <DashboardLayout>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 8,
              letterSpacing: -0.5,
            }}
          >
            {t("busquedas.title")}
          </h1>
          <p style={{ fontSize: 14, color: tokens.text.secondary }}>
            {t("busquedas.subtitle")}
          </p>
        </div>
        <Button icon={Plus} onClick={() => navigate("/nueva-busqueda")}>
          {t("busquedas.nuevaBusqueda")}
        </Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Real searches first */}
        {realSearchEntries.map((s) => {
          const enTerna = s.candidates.filter(
            (c) => c.scoreIA && c.scoreIA.total >= 7
          ).length;

          return (
            <GlassCard
              key={s.id}
              hover
              onClick={() => navigate(`/busquedas/${s.id}`)}
              style={{ cursor: "pointer", border: `1px solid ${tokens.accent.teal}30` }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <h3 style={{ fontSize: 18, fontWeight: 600 }}>
                      {s.puesto}
                    </h3>
                    <Badge status="warning" label={tc(`status.${s.estado}`)} />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      fontSize: 13,
                      color: tokens.text.secondary,
                    }}
                  >
                    <span>{s.industria}</span>
                    <span>{s.pais}</span>
                    <span>{s.seniority}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      fontSize: 12,
                      color: tokens.text.muted,
                      marginTop: 8,
                    }}
                  >
                    <span>{s.candidates.length} {tc("labels.candidatos")}</span>
                    <span>{enTerna} en terna</span>
                    <span>
                      {tc("labels.habilidades")}: {s.habilidades.slice(0, 3).join(", ")}
                      {s.habilidades.length > 3 && ` +${s.habilidades.length - 3}`}
                    </span>
                  </div>
                </div>
                <ArrowRight size={20} color={tokens.text.muted} />
              </div>
            </GlassCard>
          );
        })}

        {realSearchEntries.length === 0 && (
          <GlassCard>
            <div style={{ textAlign: "center", padding: 40, color: tokens.text.muted }}>
              <p style={{ marginBottom: 16 }}>No hay busquedas aun. Crea tu primera busqueda.</p>
              <Button icon={Plus} onClick={() => navigate("/nueva-busqueda")}>
                {t("busquedas.nuevaBusqueda")}
              </Button>
            </div>
          </GlassCard>
        )}
      </div>
    </DashboardLayout>
  );
}
