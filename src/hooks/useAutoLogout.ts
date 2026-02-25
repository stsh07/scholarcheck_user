// src/hooks/useAutoLogout.ts
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; 

export default function useAutoLogout(redirectPath: string) {
  const navigate = useNavigate();

  useEffect(() => {
    let timeoutId: number | undefined;

    const clearAuth = () => {
      localStorage.removeItem("scholarcheck_accessToken");
      localStorage.removeItem("scholarcheck_refreshToken");
      localStorage.removeItem("scholarcheck_user");
    };

    const logout = () => {
      clearAuth();
      navigate(redirectPath, { replace: true });
    };

    const resetTimer = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(logout, INACTIVITY_LIMIT_MS);
    };

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    const hasSession = () => {
      const token = localStorage.getItem("scholarcheck_accessToken");
      const user = localStorage.getItem("scholarcheck_user");
      return !!token && !!user;
    };

    const onActivity = () => {
      if (!hasSession()) return;
      resetTimer();
    };

    events.forEach((evt) => window.addEventListener(evt, onActivity, { passive: true }));

    if (hasSession()) resetTimer();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "scholarcheck_accessToken" || e.key === "scholarcheck_user") {
        const token = localStorage.getItem("scholarcheck_accessToken");
        const user = localStorage.getItem("scholarcheck_user");
        if (!token || !user) {
          navigate(redirectPath, { replace: true });
        }
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      events.forEach((evt) => window.removeEventListener(evt, onActivity));
      window.removeEventListener("storage", onStorage);
    };
  }, [navigate, redirectPath]);
}