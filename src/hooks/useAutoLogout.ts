// src/hooks/useAutoLogout.ts
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { silentRefresh } from "../api/http";

const INACTIVITY_LIMIT_MS = 15 * 60 * 1000;
const REFRESH_CHECK_MS = 4 * 60 * 1000;

function hasSession() {
  const token = localStorage.getItem("scholarcheck_accessToken");
  const refreshToken = localStorage.getItem("scholarcheck_refreshToken");
  const user = localStorage.getItem("scholarcheck_user");
  return !!token && !!refreshToken && !!user;
}

function clearAuth() {
  localStorage.removeItem("scholarcheck_accessToken");
  localStorage.removeItem("scholarcheck_refreshToken");
  localStorage.removeItem("scholarcheck_user");
}

export default function useAutoLogout(redirectPath: string) {
  const navigate = useNavigate();
  const lastActivityRef = useRef<number>(Date.now());
  const timeoutIdRef = useRef<number | null>(null);

  useEffect(() => {
    const logout = () => {
      clearAuth();
      navigate(redirectPath, { replace: true });
    };

    const resetLogoutTimer = () => {
      if (timeoutIdRef.current) {
        window.clearTimeout(timeoutIdRef.current);
      }

      timeoutIdRef.current = window.setTimeout(() => {
        logout();
      }, INACTIVITY_LIMIT_MS);
    };

    const onActivity = () => {
      if (!hasSession()) return;
      lastActivityRef.current = Date.now();
      resetLogoutTimer();
    };

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((evt) =>
      window.addEventListener(evt, onActivity, { passive: true })
    );

    if (hasSession()) {
      lastActivityRef.current = Date.now();
      resetLogoutTimer();
    }

    const refreshInterval = window.setInterval(async () => {
      if (!hasSession()) return;

      const inactiveFor = Date.now() - lastActivityRef.current;
      if (inactiveFor >= INACTIVITY_LIMIT_MS) {
        logout();
        return;
      }

      const refreshed = await silentRefresh();
      if (!refreshed) {
        logout();
      }
    }, REFRESH_CHECK_MS);

    const onStorage = (e: StorageEvent) => {
      if (
        e.key === "scholarcheck_accessToken" ||
        e.key === "scholarcheck_refreshToken" ||
        e.key === "scholarcheck_user"
      ) {
        if (!hasSession()) {
          navigate(redirectPath, { replace: true });
        }
      }
    };

    window.addEventListener("storage", onStorage);

    return () => {
      if (timeoutIdRef.current) {
        window.clearTimeout(timeoutIdRef.current);
      }

      window.clearInterval(refreshInterval);

      events.forEach((evt) => window.removeEventListener(evt, onActivity));
      window.removeEventListener("storage", onStorage);
    };
  }, [navigate, redirectPath]);
}