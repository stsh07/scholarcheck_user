// src/pages/LoginPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Logo from "../img/PRIMARY.png";
import LoginErrorModal from "../modals/LoginErrorModal";

import LoginApproval from "../modals/LoginApproval";
import LoggedInSuccessfullyModal from "../modals/LoggedInSuccessfullyModal";

import { loginComplete, loginStart, loginStatus } from "../api/auth";

type LoginStatus = "PENDING" | "APPROVED" | "DENIED" | "EXPIRED";

const LOGIN_LIMIT_VERSION = "v1";
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MS = 2 * 60 * 1000;

type LoginLimitState = {
  failedAttempts: number;
  lockUntil: number;
  updatedAt: number;
};

function nowMs() {
  return Date.now();
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatRemaining(ms: number) {
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;

  if (min <= 0) return `${sec}s`;
  if (sec === 0) return `${min}m`;
  return `${min}m ${sec}s`;
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<LoginStatus>("PENDING");
  const [approvalMessage, setApprovalMessage] = useState(
    "We sent a verification email. Please approve this login to continue."
  );
  const [approvalLoading, setApprovalLoading] = useState(false);

  const [successOpen, setSuccessOpen] = useState(false);

  const challengeIdRef = useRef<string>("");

  const normalizeEmail = (v: string) => v.trim().toLowerCase();

  // Guard: If already logged in, never allow staying on /login (even via Back)
  useEffect(() => {
    const token = localStorage.getItem("scholarcheck_accessToken");
    const rawUser = localStorage.getItem("scholarcheck_user");

    const isLoggedIn = !!token && !!rawUser;

    if (isLoggedIn) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  // Login limiter helpers
  const limitKey = useMemo(() => {
    const normalized = normalizeEmail(email);
    return `scholarcheck_login_limit_${LOGIN_LIMIT_VERSION}:${normalized || "unknown"}`;
  }, [email]);

  const readLimitState = (): LoginLimitState => {
    try {
      const raw = localStorage.getItem(limitKey);
      if (!raw) {
        return { failedAttempts: 0, lockUntil: 0, updatedAt: nowMs() };
      }
      const parsed = JSON.parse(raw) as Partial<LoginLimitState>;
      return {
        failedAttempts:
          typeof parsed.failedAttempts === "number" ? parsed.failedAttempts : 0,
        lockUntil: typeof parsed.lockUntil === "number" ? parsed.lockUntil : 0,
        updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : nowMs(),
      };
    } catch {
      return { failedAttempts: 0, lockUntil: 0, updatedAt: nowMs() };
    }
  };

  const writeLimitState = (next: LoginLimitState) => {
    try {
      localStorage.setItem(limitKey, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const isLocked = (state: LoginLimitState) => state.lockUntil > nowMs();

  const clearLockIfExpired = (state: LoginLimitState) => {
    if (state.lockUntil && state.lockUntil <= nowMs()) {
      const cleared: LoginLimitState = {
        failedAttempts: 0,
        lockUntil: 0,
        updatedAt: nowMs(),
      };
      writeLimitState(cleared);
      return cleared;
    }
    return state;
  };

  // For disabling the button + showing countdown on button label
  const [lockRemainingMs, setLockRemainingMs] = useState<number>(0);

  useEffect(() => {
    const tick = () => {
      const s = clearLockIfExpired(readLimitState());
      if (isLocked(s)) {
        setLockRemainingMs(clamp(s.lockUntil - nowMs(), 0, LOCK_MS));
      } else {
        setLockRemainingMs(0);
      }
    };

    tick();
    const t = window.setInterval(tick, 250);
    return () => window.clearInterval(t);
  }, [limitKey]);

  // ---------- existing polling for approval ----------
  useEffect(() => {
    if (!approvalOpen) return;
    if (!challengeIdRef.current) return;

    let stopped = false;
    const id = challengeIdRef.current;

    const poll = async () => {
      try {
        const res = await loginStatus(id);
        if (stopped) return;

        setApprovalStatus(res.status);

        if (res.status === "APPROVED") {
          setApprovalLoading(true);
          const done = await loginComplete({ challengeId: id });

          localStorage.setItem("scholarcheck_accessToken", done.accessToken);
          localStorage.setItem("scholarcheck_refreshToken", done.refreshToken);
          localStorage.setItem("scholarcheck_user", JSON.stringify(done.user));

          setApprovalLoading(false);
          setApprovalOpen(false);

          setSuccessOpen(true);
          window.setTimeout(() => {
            setSuccessOpen(false);
            navigate("/home", { replace: true });
          }, 1600);

          return;
        }

        if (res.status === "DENIED") {
          setApprovalMessage("Login denied. If this wasn’t you, reset your password.");
        } else if (res.status === "EXPIRED") {
          setApprovalMessage("This login request expired. Please try logging in again.");
        } else {
          setApprovalMessage(
            "We sent a verification email. Please approve this login to continue."
          );
        }
      } catch (e: any) {
        // keep polling
      }
    };

    const timer = window.setInterval(poll, 1500);
    poll();

    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [approvalOpen, navigate]);

  const openError = (message?: string) => {
    setErrorMessage(message);
    setErrorOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorOpen(false);
    setErrorMessage(undefined);

    const normalized = normalizeEmail(email);

    if (!normalized || !password) {
      openError("Please enter your email and password to continue.");
      return;
    }

    // check lock before attempting
    const stateBefore = clearLockIfExpired(readLimitState());
    if (isLocked(stateBefore)) {
      const remaining = stateBefore.lockUntil - nowMs();
      openError(
        `Too many login attempts. Please try again after 2 minutes. (Time remaining: ${formatRemaining(
          remaining
        )})`
      );
      return;
    }

    try {
      setLoading(true);

      const start = await loginStart({
        email: normalized,
        password,
      });

      // successful loginStart resets attempts (approval flow begins)
      writeLimitState({
        failedAttempts: 0,
        lockUntil: 0,
        updatedAt: nowMs(),
      });

      challengeIdRef.current = start.challengeId;

      setApprovalStatus("PENDING");
      setApprovalMessage(start.message);
      setApprovalOpen(true);
    } catch (err: any) {
      // count failed attempt
      const prev = clearLockIfExpired(readLimitState());
      const nextFailed = prev.failedAttempts + 1;

      if (nextFailed > MAX_FAILED_ATTEMPTS) {
        writeLimitState({
          failedAttempts: nextFailed,
          lockUntil: nowMs() + LOCK_MS,
          updatedAt: nowMs(),
        });

        openError("Too many login attempts. Please try again after 2 minutes.");
      } else {
        writeLimitState({
          failedAttempts: nextFailed,
          lockUntil: 0,
          updatedAt: nowMs(),
        });

        openError("Invalid credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseApproval = () => {
    setApprovalOpen(false);
    setApprovalLoading(false);
    setApprovalStatus("PENDING");
    challengeIdRef.current = "";
  };

  const handleResendApproval = async () => {
    const normalized = normalizeEmail(email);
    if (!normalized || !password) return;

    const st = clearLockIfExpired(readLimitState());
    if (isLocked(st)) {
      const remaining = st.lockUntil - nowMs();
      openError(
        `Too many login attempts. Please try again after 2 minutes. (Time remaining: ${formatRemaining(
          remaining
        )})`
      );
      return;
    }

    try {
      setApprovalLoading(true);
      const start = await loginStart({
        email: normalized,
        password,
      });

      writeLimitState({
        failedAttempts: 0,
        lockUntil: 0,
        updatedAt: nowMs(),
      });

      challengeIdRef.current = start.challengeId;
      setApprovalStatus("PENDING");
      setApprovalMessage(start.message);
    } catch (err: any) {
      const prev = clearLockIfExpired(readLimitState());
      const nextFailed = prev.failedAttempts + 1;

      if (nextFailed > MAX_FAILED_ATTEMPTS) {
        writeLimitState({
          failedAttempts: nextFailed,
          lockUntil: nowMs() + LOCK_MS,
          updatedAt: nowMs(),
        });

        openError("Too many login attempts. Please try again after 2 minutes.");
      } else {
        writeLimitState({
          failedAttempts: nextFailed,
          lockUntil: 0,
          updatedAt: nowMs(),
        });

        openError("Invalid credentials.");
      }

      setApprovalMessage(err?.message || "Failed to resend approval email.");
      setApprovalStatus("EXPIRED");
    } finally {
      setApprovalLoading(false);
    }
  };

  const isSubmitDisabled = loading || lockRemainingMs > 0;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f6f6f6] flex flex-col">
      <header className="w-full border-b border-gray-200 bg-white">
        <div className="flex h-[66px] items-center px-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <img src={Logo} alt="ScholarCheck Logo" className="h-8 w-8 object-contain max-w-full" />
            <span className="truncate text-[37px] leading-none font-medium text-[#111827] scale-[0.58] origin-left">
              ScholarCheck
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="flex h-full flex-col lg:min-h-[calc(100vh-150px)] lg:flex-row">
          <section className="bg-[#e9f3ed] px-6 py-12 sm:px-10 lg:w-1/2 lg:px-24 lg:py-24">
            <div className="mx-auto w-full max-w-[470px] lg:pt-10">
              <h2 className="text-[28px] font-semibold leading-[1.1] text-[#111827] sm:text-[34px]">
                Welcome Back to
              </h2>
              <h1 className="mt-1 text-[34px] font-bold leading-[1.05] text-[#166534] sm:text-[42px]">
                ScholarCheck
              </h1>
              <p className="mt-5 max-w-[390px] text-[14px] leading-5 text-[#111827]">
                Log in to access your account and continue your scholarship journey.
              </p>
            </div>
          </section>

          <section className="px-6 py-10 sm:px-10 lg:w-1/2 lg:px-14 lg:py-24">
            <div className="mx-auto w-full max-w-[520px]">
              <h2 className="text-[28px] font-semibold leading-[1.05] text-[#111827] sm:text-[34px]">
                Log In
              </h2>
              <p className="mt-2 text-[15px] font-normal leading-5 text-[#111827]">
                Please enter your credentials to access your account.
              </p>

              <form noValidate onSubmit={handleSubmit} className="mt-12 flex flex-col gap-8">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-[16px] font-medium text-[#111827]">
                    Email
                  </label>
                  <input
                    id="email"
                    type="text"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-11 w-full rounded-md border border-[#dcdcdc] bg-white px-3 text-[16px] text-[#111827] placeholder:text-[16px] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#0b6f2f]/20"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-[16px] font-medium text-[#111827]">
                      Password
                    </label>
                    <Link to="/forgot-password" className="text-[16px] font-normal text-[#166534] hover:underline">
                      Forgot your password?
                    </Link>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-11 w-full rounded-md border border-[#dcdcdc] bg-white px-3 pr-11 text-[16px] text-[#111827] placeholder:text-[16px] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#0b6f2f]/20"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-1.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md hover:bg-black/5 active:bg-black/10"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-black/60" aria-hidden="true" />
                      ) : (
                        <Eye className="w-5 h-5 text-black/60" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className={`h-11 w-full rounded-md text-[13px] font-semibold text-white transition ${
                    isSubmitDisabled
                      ? "cursor-not-allowed bg-[#0b6f2f]/60"
                      : "bg-[#006317] hover:bg-[#005312]"
                  }`}
                >
                  {loading
                    ? "Logging in..."
                    : lockRemainingMs > 0
                    ? `Try again in ${formatRemaining(lockRemainingMs)}`
                    : "Log In"}
                </button>
              </form>

              <p className="mt-8 text-[14px] text-center text-[#111827]">
                Don’t have an account?{" "}
                <Link to="/signup" className="text-[#166534] hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="w-full border-t border-gray-200 bg-[#f6f6f6] py-8 text-center">
        <p className="text-[12px] text-[#111827]">&copy; 2026 ScholarCheck. All rights reserved.</p>
      </footer>

      <LoginApproval
        open={approvalOpen}
        status={approvalStatus}
        message={approvalMessage}
        loading={approvalLoading}
        onClose={handleCloseApproval}
        onResend={handleResendApproval}
      />

      <LoginErrorModal
        open={errorOpen}
        message={errorMessage}
        onClose={() => setErrorOpen(false)}
      />

      <LoggedInSuccessfullyModal
        open={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          navigate("/home", { replace: true });
        }}
        autoCloseMs={1600}
      />
    </div>
  );
}
