// src/api/http.ts
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

type ApiInit = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
  _retry?: boolean;
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

function getAccessToken() {
  return localStorage.getItem("scholarcheck_accessToken") || "";
}

function getRefreshToken() {
  return localStorage.getItem("scholarcheck_refreshToken") || "";
}

function clearAuthStorage() {
  localStorage.removeItem("scholarcheck_accessToken");
  localStorage.removeItem("scholarcheck_refreshToken");
  localStorage.removeItem("scholarcheck_user");
}

function redirectToLogin() {
  const currentPath = window.location.pathname;
  if (currentPath !== "/login") {
    window.location.replace("/login");
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function requestNewAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuthStorage();
    redirectToLogin();
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });

        const data = await parseJson(res);

        if (!res.ok || !data?.accessToken) {
          clearAuthStorage();
          redirectToLogin();
          return null;
        }

        localStorage.setItem("scholarcheck_accessToken", data.accessToken);
        return data.accessToken as string;
      } catch {
        clearAuthStorage();
        redirectToLogin();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export async function apiFetch<T>(path: string, options: ApiInit = {}): Promise<T> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && !isFormData(options.body) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await parseJson(res);

  if (res.status === 401 && !options._retry) {
    const newAccessToken = await requestNewAccessToken();

    if (newAccessToken) {
      const retryHeaders: Record<string, string> = {
        Accept: "application/json",
        ...(options.headers || {}),
        Authorization: `Bearer ${newAccessToken}`,
      };

      if (options.body && !isFormData(options.body) && !retryHeaders["Content-Type"]) {
        retryHeaders["Content-Type"] = "application/json";
      }

      const retryRes = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: retryHeaders,
      });

      const retryData = await parseJson(retryRes);

      if (!retryRes.ok) {
        const retryMessage =
          (retryData && (retryData.message as string)) ||
          `Request failed (${retryRes.status})`;
        throw new Error(retryMessage);
      }

      return retryData as T;
    }
  }

  if (!res.ok) {
    const message = (data && (data.message as string)) || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}

export async function silentRefresh(): Promise<boolean> {
  const newToken = await requestNewAccessToken();
  return !!newToken;
}

export function clearAuthAndRedirect() {
  clearAuthStorage();
  redirectToLogin();
}