const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(
  /\/$/,
  ""
);

type JsonRecord = Record<string, any>;

async function readJsonSafe(response: Response): Promise<JsonRecord> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function getErrorMessage(data: JsonRecord, fallback: string) {
  return (
    data?.message ||
    data?.error ||
    data?.errors?.[0]?.message ||
    fallback
  );
}

export async function requestPasswordChangeOtp(
  payload: {
    userId: number;
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  },
  token?: string
) {
  const response = await fetch(`${API_BASE}/api/auth/change-password/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await readJsonSafe(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "Failed to request password change OTP.")
    );
  }

  return data;
}

export async function verifyPasswordChangeOtp(
  payload: {
    userId: number;
    otp: string;
  },
  token?: string
) {
  const response = await fetch(`${API_BASE}/api/auth/change-password/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await readJsonSafe(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "Failed to verify OTP and update password.")
    );
  }

  return data;
}

export async function resendPasswordChangeOtp(
  payload: {
    userId: number;
  },
  token?: string
) {
  const response = await fetch(`${API_BASE}/api/auth/change-password/resend-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await readJsonSafe(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Failed to resend OTP."));
  }

  return data;
}