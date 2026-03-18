import { Building2, Bot, ExternalLink, Eye, Star } from "lucide-react";
import { scoreColor } from "../../theme/tokens";
import { useTheme } from "../../contexts/ThemeContext";
import { Badge } from "../atoms/Badge";
import { Button } from "../atoms/Button";
import type { Candidate } from "../../types/candidate";
import { ESTADO_LABELS, ESTADO_STATUS } from "../../types/candidate";

interface CandidateRowProps {
  candidate: Candidate;
  selected: boolean;
  onSelect: () => void;
  onInterview: () => void;
  onView: () => void;
  onTerna: () => void;
}

export function CandidateRow({
  candidate: c,
  selected,
  onSelect,
  onInterview,
  onView,
  onTerna,
}: CandidateRowProps) {
  const { tokens, mode } = useTheme();
  const hoverBg = mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";

  return (
    <tr
      style={{
        borderBottom: `1px solid ${tokens.glass.border}`,
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = hoverBg)
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = "transparent")
      }
    >
      <td style={{ padding: "12px 16px" }}>
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          style={{ accentColor: tokens.accent.teal }}
        />
      </td>
      <td style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `${tokens.accent.teal}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: tokens.accent.teal,
              }}
            >
              {c.nombre[0]}
              {c.apellido[0]}
            </span>
          </div>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>
              {c.nombre} {c.apellido}
            </div>
            <div style={{ fontSize: 12, color: tokens.text.muted }}>
              {c.email}
            </div>
          </div>
        </div>
      </td>
      <td style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Building2 size={14} color={tokens.text.muted} />
          <span style={{ fontSize: 13 }}>{c.empresa}</span>
        </div>
        <div style={{ fontSize: 12, color: tokens.text.muted }}>{c.cargo}</div>
      </td>
      <td style={{ padding: "12px 16px" }}>
        {c.linkedinUrl && (
          <a
            href={c.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: tokens.status.info,
              textDecoration: "none",
            }}
          >
            LinkedIn <ExternalLink size={10} />
          </a>
        )}
      </td>
      <td style={{ padding: "12px 16px" }}>
        {c.scoreIA ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 50,
                height: 6,
                borderRadius: 3,
                background: tokens.bg.surface1,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${(c.scoreIA.total / 10) * 100}%`,
                  height: "100%",
                  borderRadius: 3,
                  background: scoreColor(c.scoreIA.total, tokens),
                }}
              />
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: scoreColor(c.scoreIA.total, tokens),
              }}
            >
              {c.scoreIA.total}
            </span>
          </div>
        ) : (
          <span style={{ fontSize: 12, color: tokens.text.muted }}>—</span>
        )}
      </td>
      <td style={{ padding: "12px 16px" }}>
        <Badge
          status={ESTADO_STATUS[c.estado] as "success" | "warning" | "error" | "info" | "neutral"}
          label={ESTADO_LABELS[c.estado]}
          size="sm"
        />
      </td>
      <td style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: 4 }}>
          <Button variant="secondary" size="sm" icon={Eye} onClick={onView}>
            Ver
          </Button>
          {c.estado !== "descartado" && c.estado !== "en_entrevista" && (
            <Button variant="secondary" size="sm" icon={Bot} onClick={onInterview}>
              Entrevistar
            </Button>
          )}
          {c.scoreIA && c.estado !== "en_terna" && c.estado !== "descartado" && (
            <Button variant="gold" size="sm" icon={Star} onClick={onTerna}>
              Terna
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
