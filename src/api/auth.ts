// src/api/auth.ts
import { apiFetch } from "./http";

export async function requestSignupOtp(email: string) {
  return apiFetch<{ message: string; devOtp?: string }>(
    "/api/auth/request-signup-code",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    }
  );
}

export async function signup(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  code: string;
}) {
  return apiFetch<{ message: string }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload: { email: string; password: string }) {
  return apiFetch<{
    message: string;
    user: { id: number; firstName: string; lastName: string; email: string; role?: string };
    accessToken: string;
    refreshToken: string;
  }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ============================
   ✅ Login Approval Flow
============================ */

export async function loginStart(payload: { email: string; password: string }) {
  return apiFetch<{ message: string; challengeId: string }>(
    "/api/auth/login-start",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function loginStatus(challengeId: string) {
  return apiFetch<{ status: "PENDING" | "APPROVED" | "DENIED" | "EXPIRED" }>(
    `/api/auth/login-status/${encodeURIComponent(challengeId)}`,
    { method: "GET" }
  );
}

export async function loginComplete(payload: { challengeId: string }) {
  return apiFetch<{
    message: string;
    user: { id: number; firstName: string; lastName: string; email: string; role?: string };
    accessToken: string;
    refreshToken: string;
  }>("/api/auth/login-complete", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ============================
   ✅ Forgot Password Flow
============================ */

export async function requestResetCode(email: string) {
  return apiFetch<{ message: string; devOtp?: string }>(
    "/api/auth/request-reset-code",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    }
  );
}

export async function verifyResetCode(payload: { email: string; code: string }) {
  return apiFetch<{ message: string; resetToken: string }>(
    "/api/auth/verify-reset-code",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function resetPassword(payload: {
  email: string;
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}) {
  return apiFetch<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
