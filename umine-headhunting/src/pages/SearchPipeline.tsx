import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Users,
  Mail,
  BarChart3,
  Star,
  Bot,
  Search,
  ArrowLeft,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useBreakpoint, responsive } from "../hooks/useBreakpoint";
import { DashboardLayout } from "../components/templates/DashboardLayout";
import { GlassCard } from "../components/atoms/GlassCard";
import { Button } from "../components/atoms/Button";
import { Badge } from "../components/atoms/Badge";
import { StatCard } from "../components/molecules/StatCard";
import { CandidateRow } from "../components/molecules/CandidateRow";
import { useNotifications } from "../hooks/useNotifications";
import { Notifications } from "../components/organisms/Notifications";
import { useSearchContext } from "../contexts/SearchContext";
import type { CandidateEstado } from "../types/candidate";

export function SearchPipeline() {
  const { tokens } = useTheme();
  const bp = useBreakpoint();
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("search");
  const { notifications, addNotification } = useNotifications();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  const { getSearch } = useSearchContext();
  const realSearch = id ? getSearch(id) : undefined;

  const search = realSearch?.config || { puesto: "", industria: "", pais: "", seniority: "", habilidades: [] as string[], estado: "evaluando" as const };
  const candidates = realSearch?.candidates || [];

  const filtered = useMemo(
    () =>
      candidates.filter((c) => {
        const matchSearch =
          `${c.nombre} ${c.apellido} ${c.empresa}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchStatus =
          filterStatus === "todos" || c.estado === filterStatus;
        return matchSearch && matchStatus;
      }),
    [candidates, searchQuery, filterStatus]
  );

  const stats = useMemo(() => {
    const byStatus = (s: CandidateEstado) =>
      candidates.filter((c) => c.estado === s).length;
    return {
      total: candidates.length,
      emailEnviado: byStatus("email_enviado") + byStatus("cv_recibido") + byStatus("evaluado") + byStatus("en_terna") + byStatus("en_entrevista"),
      evaluados: byStatus("evaluado") + byStatus("en_terna"),
      enTerna: byStatus("en_terna"),
    };
  }, [candidates]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <DashboardLayout>
      <Notifications notifications={notifications} />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate("/busquedas")}
          >
            {t("pipeline.volver")}
          </Button>
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: -0.5,
              }}
            >
              {search.puesto}
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 4,
              }}
            >
              <Badge status="info" label={search.industria} size="sm" />
              <Badge status="neutral" label={search.pais} size="sm" />
              <Badge
                status={
                  search.estado === "evaluando"
                    ? "warning"
                    : search.estado === "terna_lista"
                      ? "success"
                      : "info"
                }
                label={search.estado.replace("_", " ").toUpperCase()}
                size="sm"
              />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            variant="gold"
            icon={Star}
            onClick={() => navigate(`/busquedas/${id}/terna`)}
          >
            {t("pipeline.verTerna", { count: stats.enTerna })}
          </Button>
        </div>
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
          label={t("pipeline.candidatos")}
          value={stats.total}
          icon={Users}
          color={tokens.accent.teal}
        />
        <StatCard
          label={t("pipeline.emailsEnviados")}
          value={stats.emailEnviado}
          icon={Mail}
          color={tokens.status.info}
        />
        <StatCard
          label={t("pipeline.evaluadosPorIA")}
          value={stats.evaluados}
          icon={BarChart3}
          color={tokens.status.warning}
        />
        <StatCard
          label={t("pipeline.enTerna")}
          value={stats.enTerna}
          icon={Star}
          color={tokens.accent.gold}
        />
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1, position: "relative" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: tokens.text.muted,
            }}
          />
          <input
            placeholder={t("pipeline.buscarPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 40px",
              background: tokens.bg.surface1,
              border: `1px solid ${tokens.glass.border}`,
              borderRadius: 10,
              color: tokens.text.primary,
              fontSize: 14,
              fontFamily: "'Inter Variable', Inter, sans-serif",
              outline: "none",
            }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "10px 14px",
            background: tokens.bg.surface1,
            border: `1px solid ${tokens.glass.border}`,
            borderRadius: 10,
            color: tokens.text.primary,
            fontSize: 14,
            fontFamily: "'Inter Variable', Inter, sans-serif",
            outline: "none",
          }}
        >
          <option value="todos" style={{ background: tokens.bg.surface2 }}>
            {t("pipeline.todosEstados")}
          </option>
          <option value="encontrado" style={{ background: tokens.bg.surface2 }}>
            {t("pipeline.encontrados")}
          </option>
          <option
            value="email_enviado"
            style={{ background: tokens.bg.surface2 }}
          >
            {t("pipeline.emailEnviado")}
          </option>
          <option
            value="cv_recibido"
            style={{ background: tokens.bg.surface2 }}
          >
            {t("pipeline.cvRecibido")}
          </option>
          <option value="evaluado" style={{ background: tokens.bg.surface2 }}>
            {t("pipeline.evaluados")}
          </option>
          <option value="en_terna" style={{ background: tokens.bg.surface2 }}>
            {t("pipeline.enTernaFilter")}
          </option>
          <option value="descartado" style={{ background: tokens.bg.surface2 }}>
            {t("pipeline.descartados")}
          </option>
        </select>
        {selected.size > 0 && (
          <Button
            icon={Bot}
            onClick={() =>
              addNotification(
                "info",
                `Iniciando entrevistas para ${selected.size} candidatos...`
              )
            }
          >
            {t("pipeline.entrevistarCount", { count: selected.size })}
          </Button>
        )}
      </div>

      {/* Table */}
      <GlassCard padding={0} style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${tokens.glass.border}` }}>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontSize: 11,
                  color: tokens.text.muted,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  fontWeight: 500,
                }}
              >
                <input
                  type="checkbox"
                  style={{ accentColor: tokens.accent.teal }}
                  checked={
                    selected.size === filtered.length && filtered.length > 0
                  }
                  onChange={() =>
                    selected.size === filtered.length
                      ? setSelected(new Set())
                      : setSelected(new Set(filtered.map((c) => c.id)))
                  }
                />
              </th>
              {[
                t("pipeline.tableHeaders.candidato"),
                t("pipeline.tableHeaders.empresa"),
                t("pipeline.tableHeaders.linkedin"),
                t("pipeline.tableHeaders.scoreIA"),
                t("pipeline.tableHeaders.estado"),
                t("pipeline.tableHeaders.acciones"),
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: 11,
                    color: tokens.text.muted,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 500,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <CandidateRow
                key={c.id}
                candidate={c}
                selected={selected.has(c.id)}
                onSelect={() => toggleSelect(c.id)}
                onInterview={() =>
                  addNotification("info", `Creando entrevista para ${c.nombre}...`)
                }
                onView={() => navigate(`/candidato/${c.id}`)}
                onTerna={() =>
                  addNotification("success", `${c.nombre} agregado a la terna`)
                }
              />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: tokens.text.muted,
            }}
          >
            {t("pipeline.noResults")}
          </div>
        )}
      </GlassCard>
    </DashboardLayout>
  );
}
