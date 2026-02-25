// src/api/applications.ts
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("scholarcheck_accessToken") || "";
}

async function parseJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

async function apiFetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });

  const data = await parseJson(res);

  if (!res.ok) {
    const message = (data && (data.message as string)) || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}

export type ApplicationStatus = "Pending" | "Approved" | "Declined";

export type ApplicationDto = {
  id: number;
  userId: number;

  // status + timestamps
  status: ApplicationStatus;
  submittedAt?: string;

  // personal
  firstName: string;
  middleName: string;
  lastName: string;
  extension?: string;
  dob: string;
  gender: string;
  address: string;
  phone: string;
  email: string;

  // father
  fatherName: string;
  fatherOccupation: string;
  fatherIncome: string;
  fatherPhone: string;

  // mother
  motherName: string;
  motherOccupation: string;
  motherIncome: string;
  motherPhone: string;

  // history
  govGrant: string;

  // document URLs (served by backend)
  certificateOfResidencyUrl?: string;
  indigencyCertificateUrl?: string;
  governmentIDUrl?: string;
  certificateOfEnrollmentUrl?: string;
  assessmentFormUrl?: string;
};

/**
 * GET current user's application
 * Backend should return either:
 * - { application: ApplicationDto | null }
 * OR directly ApplicationDto | null
 */
export async function getMyApplication(): Promise<ApplicationDto | null> {
  const data = await apiFetchJson<any>("/api/applications/me", { method: "GET" });

  // supports both response shapes:
  if (data && typeof data === "object" && "application" in data) {
    return (data.application as ApplicationDto) || null;
  }

  return (data as ApplicationDto) || null;
}

/**
 * Submit (create) application
 * Uses multipart/form-data (FormData)
 */
export async function submitApplication(formData: FormData): Promise<{ message: string }> {
  const token = getToken();

  const res = await fetch(`${API_URL}/api/applications`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // IMPORTANT: do NOT set Content-Type for FormData
    },
    body: formData,
  });

  const data = await parseJson(res);

  if (!res.ok) {
    const message = (data && (data.message as string)) || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as { message: string };
}

/**
 * Update my application (only if Pending)
 * Uses multipart/form-data (FormData)
 */
export async function updateMyApplication(formData: FormData): Promise<{ message: string }> {
  const token = getToken();

  const res = await fetch(`${API_URL}/api/applications/me`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // IMPORTANT: do NOT set Content-Type for FormData
    },
    body: formData,
  });

  const data = await parseJson(res);

  if (!res.ok) {
    const message = (data && (data.message as string)) || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as { message: string };
}