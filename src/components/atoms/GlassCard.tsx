import { type CSSProperties, type ReactNode, useCallback, useRef } from "react";
import { useTheme } from "../../contexts/ThemeContext";

interface GlassCardProps {
  children: ReactNode;
  hover?: boolean;
  glow?: string | null;
  onClick?: () => void;
  style?: CSSProperties;
  padding?: number | string;
}

export function GlassCard({
  children,
  hover = false,
  glow = null,
  onClick,
  style = {},
  padding = 24,
}: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { tokens, glassStyle } = useTheme();

  const handleEnter = useCallback(() => {
    if (hover && ref.current) {
      ref.current.style.border = `1px solid ${tokens.glass.borderHover}`;
      ref.current.style.transform = "translateY(-2px)";
    }
  }, [hover, tokens.glass.borderHover]);

  const handleLeave = useCallback(() => {
    if (hover && ref.current) {
      ref.current.style.border = `1px solid ${tokens.glass.border}`;
      ref.current.style.transform = "translateY(0)";
    }
  }, [hover, tokens.glass.border]);

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        ...glassStyle,
        padding,
        transition: "all 0.2s ease",
        cursor: onClick ? "pointer" : "default",
        boxShadow: glow
          ? `0 0 30px ${glow}`
          : tokens.glass.shadow,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
