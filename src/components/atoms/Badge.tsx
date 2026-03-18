import { useTheme } from "../../contexts/ThemeContext";

type Status = "success" | "warning" | "error" | "info" | "neutral";

interface BadgeProps {
  status: Status;
  label: string;
  size?: "sm" | "md";
}

export function Badge({ status, label, size = "md" }: BadgeProps) {
  const { tokens } = useTheme();

  const COLORS: Record<Status, string> = {
    success: tokens.status.success,
    warning: tokens.status.warning,
    error: tokens.status.error,
    info: tokens.status.info,
    neutral: tokens.text.muted,
  };

  const c = COLORS[status];
  const fs = size === "sm" ? 11 : 12;
  const py = size === "sm" ? 2 : 4;
  const px = size === "sm" ? 8 : 12;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: `${py}px ${px}px`,
        borderRadius: 20,
        background: `${c}15`,
        color: c,
        fontSize: fs,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: c,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}
