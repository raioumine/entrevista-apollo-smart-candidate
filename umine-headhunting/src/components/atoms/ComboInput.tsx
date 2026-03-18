import { useState, useRef, useEffect } from "react";
import { type LucideIcon, ChevronDown } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

interface ComboInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  icon?: LucideIcon;
  required?: boolean;
  allowCustom?: boolean;
}

export function ComboInput({
  label,
  placeholder = "Buscar o seleccionar...",
  value,
  onChange,
  options,
  icon: Icon,
  required = false,
  allowCustom = true,
}: ComboInputProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { tokens, mode } = useTheme();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes((open ? query : "").toLowerCase())
  );

  const displayValue = open ? query : value;
  const hoverBg = mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  return (
    <div
      ref={ref}
      style={{ display: "flex", flexDirection: "column", gap: 6, position: "relative" }}
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
              top: "50%",
              transform: "translateY(-50%)",
              color: tokens.text.muted,
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        )}
        <input
          value={displayValue}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
            if (allowCustom) onChange(e.target.value);
          }}
          onFocus={() => {
            setOpen(true);
            setQuery(value);
          }}
          onBlur={() => {
            setTimeout(() => setOpen(false), 200);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && filtered.length > 0) {
              e.preventDefault();
              onChange(filtered[0]);
              setQuery(filtered[0]);
              setOpen(false);
            }
          }}
          style={{
            width: "100%",
            padding: "10px 36px 10px " + (Icon ? "38px" : "14px"),
            background: tokens.bg.surface1,
            border: `1px solid ${open ? tokens.accent.teal : tokens.glass.border}`,
            borderRadius: 10,
            color: tokens.text.primary,
            fontSize: 14,
            fontFamily: "'Inter Variable', Inter, sans-serif",
            outline: "none",
            transition: "border-color 0.2s",
          }}
        />
        <ChevronDown
          size={14}
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
            color: tokens.text.muted,
            pointerEvents: "none",
            transition: "transform 0.2s",
          }}
        />
      </div>
      {open && filtered.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            background: tokens.bg.surface2,
            border: `1px solid ${tokens.glass.border}`,
            borderRadius: 10,
            maxHeight: 200,
            overflowY: "auto",
            zIndex: 50,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {filtered.map((opt) => (
            <div
              key={opt}
              onMouseDown={() => {
                onChange(opt);
                setQuery(opt);
                setOpen(false);
              }}
              style={{
                padding: "8px 14px",
                fontSize: 13,
                color:
                  opt === value ? tokens.accent.teal : tokens.text.secondary,
                cursor: "pointer",
                transition: "background 0.12s",
                fontWeight: opt === value ? 600 : 400,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = hoverBg)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
