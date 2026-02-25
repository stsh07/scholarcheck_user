// src/api/http.ts
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

type ApiInit = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

function isFormData(body: any) {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

async function parseJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

export async function apiFetch<T>(path: string, options: ApiInit = {}): Promise<T> {
  const token = localStorage.getItem("scholarcheck_accessToken") || "";

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  // attach token if available
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  // set JSON content type only if NOT FormData
  if (options.body && !isFormData(options.body) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await parseJson(res);

  if (!res.ok) {
    const message = (data && (data.message as string)) || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}