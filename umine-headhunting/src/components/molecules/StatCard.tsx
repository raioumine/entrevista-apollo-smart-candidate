import { type LucideIcon } from "lucide-react";
import { GlassCard } from "../atoms/GlassCard";
import { useTheme } from "../../contexts/ThemeContext";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

export function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  const { tokens } = useTheme();

  return (
    <GlassCard hover padding={20}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              color: tokens.text.muted,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
        </div>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={20} color={color} />
        </div>
      </div>
    </GlassCard>
  );
}
