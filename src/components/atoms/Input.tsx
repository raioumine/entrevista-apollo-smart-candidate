import { type LucideIcon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

interface Option {
  value: string;
  label: string;
}

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  icon?: LucideIcon;
  options?: Option[];
  required?: boolean;
  multiline?: boolean;
  rows?: number;
}

export function Input({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  icon: Icon,
  options,
  required = false,
  multiline = false,
  rows = 4,
}: InputProps) {
  const { tokens, mode } = useTheme();

  const arrowColor = mode === "dark" ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.38)";

  const baseStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    paddingLeft: Icon ? 38 : 14,
    background: tokens.bg.surface1,
    border: `1px solid ${tokens.glass.border}`,
    borderRadius: 10,
    color: tokens.text.primary,
    fontSize: 14,
    fontFamily: "'Inter Variable', Inter, sans-serif",
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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
          {required && (
            <span style={{ color: tokens.status.error, marginLeft: 4 }}>*</span>
          )}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {Icon && (
          <Icon
            size={16}
            style={{
              position: "absolute",
              left: 12,
              top: multiline ? 14 : "50%",
              transform: multiline ? "none" : "translateY(-50%)",
              color: tokens.text.muted,
              pointerEvents: "none",
            }}
          />
        )}
        {options ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              ...baseStyle,
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(arrowColor)}' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
              paddingRight: 32,
            }}
          >
            {options.map((o) => (
              <option
                key={o.value}
                value={o.value}
                style={{ background: tokens.bg.surface2 }}
              >
                {o.label}
              </option>
            ))}
          </select>
        ) : multiline ? (
          <textarea
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            style={{ ...baseStyle, resize: "vertical", minHeight: 80 }}
            onFocus={(e) =>
              (e.target.style.borderColor = tokens.accent.teal)
            }
            onBlur={(e) =>
              (e.target.style.borderColor = tokens.glass.border)
            }
          />
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={baseStyle}
            onFocus={(e) =>
              (e.target.style.borderColor = tokens.accent.teal)
            }
            onBlur={(e) =>
              (e.target.style.borderColor = tokens.glass.border)
            }
          />
        )}
      </div>
    </div>
  );
}
