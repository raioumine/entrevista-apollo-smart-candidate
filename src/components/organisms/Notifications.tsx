import { CheckCircle, AlertCircle, Loader2, AlertTriangle } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import type { Notification } from "../../hooks/useNotifications";

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Loader2,
  warning: AlertTriangle,
};

interface NotificationsProps {
  notifications: Notification[];
}

export function Notifications({ notifications }: NotificationsProps) {
  const { tokens } = useTheme();

  const COLORS = {
    success: tokens.status.success,
    error: tokens.status.error,
    info: tokens.status.info,
    warning: tokens.status.warning,
  };

  if (notifications.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {notifications.map((n) => {
        const Icon = ICONS[n.type];
        const color = COLORS[n.type];
        return (
          <div
            key={n.id}
            style={{
              animation: "slideIn 0.3s ease",
              padding: "12px 20px",
              borderRadius: 12,
              background: tokens.bg.surface2,
              border: `1px solid ${color}30`,
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              backdropFilter: "blur(12px)",
              maxWidth: 400,
            }}
          >
            <Icon
              size={16}
              color={color}
              style={
                n.type === "info"
                  ? { animation: "spin 1s linear infinite" }
                  : undefined
              }
            />
            <span style={{ color: tokens.text.primary }}>{n.message}</span>
          </div>
        );
      })}
    </div>
  );
}
