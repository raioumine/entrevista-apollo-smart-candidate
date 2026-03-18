import { useTheme } from "../../contexts/ThemeContext";

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  disabled?: boolean;
}

export function Toggle({ label, checked, onChange, description, disabled }: ToggleProps) {
  const { tokens } = useTheme();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: tokens.text.secondary,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {label}
        </div>
        {description && (
          <div style={{ fontSize: 12, color: tokens.text.muted, marginTop: 2 }}>
            {description}
          </div>
        )}
      </div>
      <button
        onClick={() => !disabled && onChange(!checked)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          border: "none",
          background: checked ? tokens.accent.teal : tokens.bg.surface3,
          position: "relative",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "background 0.2s",
          flexShrink: 0,
          opacity: disabled ? 0.4 : 1,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 22 : 2,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.2s",
          }}
        />
      </button>
    </div>
  );
}
