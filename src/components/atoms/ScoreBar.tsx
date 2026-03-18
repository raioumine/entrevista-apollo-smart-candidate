import { useTheme } from "../../contexts/ThemeContext";
import { scoreColor } from "../../theme/tokens";

interface ScoreBarProps {
  label: string;
  value: number;
  max?: number;
  showValue?: boolean;
  size?: "sm" | "md";
}

export function ScoreBar({
  label,
  value,
  max = 10,
  showValue = true,
  size = "md",
}: ScoreBarProps) {
  const { tokens } = useTheme();
  const pct = (value / max) * 100;
  const color = scoreColor(value, tokens);
  const h = size === "sm" ? 6 : 8;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: size === "sm" ? 8 : 12,
      }}
    >
      <div
        style={{
          width: size === "sm" ? 100 : 140,
          fontSize: size === "sm" ? 12 : 13,
          color: tokens.text.secondary,
          flexShrink: 0,
        }}
      >
        {label}
      </div>
      <div
        style={{
          flex: 1,
          height: h,
          borderRadius: h / 2,
          background: tokens.bg.surface1,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: h / 2,
            background: color,
            transition: "width 0.5s ease",
          }}
        />
      </div>
      {showValue && (
        <div
          style={{
            width: 40,
            fontSize: size === "sm" ? 12 : 13,
            fontWeight: 600,
            textAlign: "right",
            color,
          }}
        >
          {value}/{max}
        </div>
      )}
    </div>
  );
}
