import { useState, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { X, Building2, Search } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { EMPRESAS_CHILE, INDUSTRIAS_CHILE } from "../../data/empresasChile";

interface EmpresaSelectorProps {
  label?: string;
  selected: string[];
  onChange: (empresas: string[]) => void;
  industriaFilter?: string;
}

export function EmpresaSelector({
  label,
  selected,
  onChange,
  industriaFilter,
}: EmpresaSelectorProps) {
  const { t } = useTranslation("common");
  const { t: tCand } = useTranslation("candidates");
  const [query, setQuery] = useState("");
  const [filterIndustria, setFilterIndustria] = useState("Todas");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { tokens } = useTheme();

  const activeIndustria = industriaFilter || filterIndustria;

  const filtered = useMemo(() => {
    return EMPRESAS_CHILE.filter((e) => {
      const matchIndustria =
        activeIndustria === "Todas" || e.industria === activeIndustria;
      const matchQuery =
        !query ||
        e.nombre.toLowerCase().includes(query.toLowerCase()) ||
        e.industria.toLowerCase().includes(query.toLowerCase());
      const notSelected = !selected.includes(e.nombre);
      return matchIndustria && matchQuery && notSelected;
    });
  }, [query, activeIndustria, selected]);

  const addEmpresa = (nombre: string) => {
    if (!selected.includes(nombre)) {
      onChange([...selected, nombre]);
    }
    setQuery("");
  };

  const addCustom = () => {
    const trimmed = query.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
    setQuery("");
  };

  const removeEmpresa = (nombre: string) => {
    onChange(selected.filter((e) => e !== nombre));
  };

  const getIndustria = (nombre: string) => {
    const emp = EMPRESAS_CHILE.find((e) => e.nombre === nombre);
    return emp?.industria;
  };

  return (
    <div
      ref={containerRef}
      style={{ display: "flex", flexDirection: "column", gap: 6 }}
    >
      {label && (
        <label
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: tokens.text.secondary,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {label}
        </label>
      )}

      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 }}>
          {selected.map((nombre) => {
            const industria = getIndustria(nombre);
            return (
              <span
                key={nombre}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  background: `${tokens.accent.teal}15`,
                  border: `1px solid ${tokens.accent.teal}30`,
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  color: tokens.text.primary,
                }}
              >
                <Building2 size={12} color={tokens.accent.teal} />
                {nombre}
                {industria && (
                  <span
                    style={{
                      fontSize: 10,
                      color: tokens.text.muted,
                      padding: "1px 6px",
                      background: tokens.bg.surface2,
                      borderRadius: 4,
                    }}
                  >
                    {industria}
                  </span>
                )}
                <X
                  size={12}
                  style={{ cursor: "pointer", color: tokens.text.muted }}
                  onClick={() => removeEmpresa(nombre)}
                />
              </span>
            );
          })}
        </div>
      )}

      <div style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          {!industriaFilter && (
            <select
              value={filterIndustria}
              onChange={(e) => setFilterIndustria(e.target.value)}
              style={{
                padding: "9px 12px",
                background: tokens.bg.surface1,
                border: `1px solid ${tokens.glass.border}`,
                borderRadius: 10,
                color: tokens.text.secondary,
                fontSize: 13,
                fontFamily: "'Inter Variable', Inter, sans-serif",
                outline: "none",
                minWidth: 140,
              }}
            >
              {INDUSTRIAS_CHILE.map((ind) => (
                <option
                  key={ind}
                  value={ind}
                  style={{ background: tokens.bg.surface2 }}
                >
                  {ind === "Todas" ? t("labels.todasLasIndustrias") : ind}
                </option>
              ))}
            </select>
          )}

          <div style={{ flex: 1, position: "relative" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: tokens.text.muted,
              }}
            />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 200)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (filtered.length > 0) {
                    addEmpresa(filtered[0].nombre);
                  } else if (query.trim()) {
                    addCustom();
                  }
                }
              }}
              placeholder={tCand("empresaSelector.buscarPlaceholder")}
              style={{
                width: "100%",
                padding: "9px 12px 9px 34px",
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
        </div>

        {open && (query || activeIndustria !== "Todas") && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: tokens.bg.surface2,
              border: `1px solid ${tokens.glass.border}`,
              borderRadius: 12,
              marginTop: 4,
              maxHeight: 240,
              overflowY: "auto",
              zIndex: 20,
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            {filtered.length > 0 ? (
              filtered.slice(0, 12).map((emp) => (
                <div
                  key={emp.nombre}
                  onMouseDown={() => addEmpresa(emp.nombre)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    cursor: "pointer",
                    transition: "background 0.15s",
                    borderBottom: `1px solid ${tokens.glass.border}`,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = `${tokens.accent.teal}10`)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Building2 size={14} color={tokens.accent.teal} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: tokens.text.primary }}>
                        {emp.nombre}
                      </div>
                      <div style={{ fontSize: 11, color: tokens.text.muted }}>
                        {emp.website}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      color: tokens.text.muted,
                      padding: "2px 8px",
                      background: tokens.bg.surface1,
                      borderRadius: 4,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {emp.industria}
                  </span>
                </div>
              ))
            ) : query.trim() ? (
              <div
                onMouseDown={addCustom}
                style={{
                  padding: "12px 14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: tokens.accent.teal,
                  fontSize: 13,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = `${tokens.accent.teal}10`)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {t("labels.agregarEmpresaPersonalizada", { query: query.trim() })}
              </div>
            ) : (
              <div
                style={{
                  padding: "16px 14px",
                  textAlign: "center",
                  color: tokens.text.muted,
                  fontSize: 13,
                }}
              >
                {t("labels.noEmpresasEncontradas")}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ fontSize: 11, color: tokens.text.muted }}>
        {selected.length > 0
          ? t("labels.empresasSeleccionadas", { count: selected.length })
          : t("labels.empresasDisponibles")}
      </div>
    </div>
  );
}
