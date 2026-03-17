export interface NotificationDto {
  id: number;
  user_id: number;
  type: "announcement" | "application_approved" | "application_declined";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const API_BASE =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:8000";

export async function fetchNotifications(_userId: number, token?: string): Promise<NotificationDto[]> {
  const res = await fetch(`${API_BASE}/api/notifications`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to fetch notifications");
  }

  const data = await res.json();
  return Array.isArray(data?.notifications) ? data.notifications : [];
}

export async function markNotificationAsRead(
  id: number,
  _userId: number,
  token?: string
) {
  const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to mark notification as read");
  }

  return res.json();
}

export async function markAllNotificationsAsRead(_userId: number, token?: string) {
  const res = await fetch(`${API_BASE}/api/notifications/read-all`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to mark all notifications as read");
  }

  return res.json();
}
