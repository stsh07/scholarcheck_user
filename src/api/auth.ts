import { apiFetch } from "./http";

export async function requestSignupOtp(email: string) {
  return apiFetch<{ message: string; devOtp?: string }>("/api/auth/request-signup-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
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
