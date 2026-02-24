// src/api/announcements.ts
export type Announcement = {
    id: number;
    title: string;
    message: string;
    createdAt: string;
  };
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  
  async function request<T>(path: string): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  
    const raw = await res.text();
    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = raw;
    }
  
    if (!res.ok) {
      const msg = data?.message || `Request failed (${res.status})`;
      throw new Error(msg);
    }
  
    return data as T;
  }
  
  export async function listAnnouncements() {
    return request<{ announcements: Announcement[] }>(`/api/announcements`);
  }
  
  export async function latestAnnouncement() {
    return request<{ announcement: Announcement | null }>(`/api/announcements/latest`);
  }