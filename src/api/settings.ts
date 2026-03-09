// src/api/settings.ts
import { apiFetch } from "./http";

export function getApplicationsOpen() {
  return apiFetch<{ applicationsOpen: boolean }>(
    "/api/settings/applications-open",
    {
      method: "GET",
    }
  );
}