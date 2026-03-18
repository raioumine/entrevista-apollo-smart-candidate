import { type LucideIcon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  const { tokens } = useTheme();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: `${tokens.accent.teal}10`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Icon size={24} color={tokens.accent.teal} />
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: tokens.text.secondary,
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      {description && (
        <div
          style={{
            fontSize: 13,
            color: tokens.text.muted,
            maxWidth: 300,
          }}
        >
          {description}
        </div>
      )}
    </div>
  );
}
