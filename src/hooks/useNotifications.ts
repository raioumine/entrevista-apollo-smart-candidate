import { useState, useCallback } from "react";

export interface Notification {
  id: number;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (type: Notification["type"], message: string) => {
      const id = Date.now();
      setNotifications((prev) => [...prev, { id, type, message }]);
      setTimeout(
        () => setNotifications((prev) => prev.filter((n) => n.id !== id)),
        5000
      );
    },
    []
  );

  return { notifications, addNotification };
}
