import { type CSSProperties, type ReactNode, useCallback, useRef, useMemo } from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

type Variant = "primary" | "secondary" | "danger" | "gold" | "ghost";
type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, { px: number; py: number; fs: number }> = {
  sm: { px: 12, py: 6, fs: 12 },
  md: { px: 20, py: 10, fs: 14 },
  lg: { px: 28, py: 14, fs: 16 },
};

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  icon?: LucideIcon;
  style?: CSSProperties;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  onClick,
  icon: Icon,
  style: btnStyle = {},
  fullWidth = false,
}: ButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const { tokens, mode } = useTheme();
  const s = SIZES[size];
  const isDisabled = disabled || loading;

  const v = useMemo(() => {
    const variants: Record<Variant, { bg: string; color: string; hoverBg: string }> = {
      primary: { bg: tokens.accent.teal, color: "#fff", hoverBg: tokens.accent.tealHover },
      secondary: {
        bg: mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
        color: tokens.text.primary,
        hoverBg: mode === "dark" ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)",
      },
      danger: { bg: `${tokens.status.error}20`, color: tokens.status.error, hoverBg: `${tokens.status.error}35` },
      gold: { bg: `${tokens.accent.gold}20`, color: tokens.accent.gold, hoverBg: `${tokens.accent.gold}35` },
      ghost: {
        bg: "transparent",
        color: tokens.text.secondary,
        hoverBg: mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
      },
    };
    return variants[variant];
  }, [tokens, mode, variant]);

  const handleEnter = useCallback(() => {
    if (!isDisabled && ref.current) ref.current.style.background = v.hoverBg;
  }, [isDisabled, v.hoverBg]);

  const handleLeave = useCallback(() => {
    if (!isDisabled && ref.current) ref.current.style.background = v.bg;
  }, [isDisabled, v.bg]);

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: `${s.py}px ${s.px}px`,
        background: v.bg,
        color: v.color,
        border: `1px solid ${mode === "dark" ? tokens.glass.border : "rgba(0,0,0,0.12)"}`,
        borderRadius: 10,
        fontSize: s.fs,
        fontWeight: 500,
        fontFamily: "'Inter Variable', Inter, sans-serif",
        cursor: isDisabled ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        opacity: isDisabled ? 0.5 : 1,
        width: fullWidth ? "100%" : "auto",
        ...btnStyle,
      }}
    >
      {loading ? (
        <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
      ) : (
        Icon && <Icon size={16} />
      )}
      {children}
    </button>
  );
}
