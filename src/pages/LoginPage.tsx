import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../img/PRIMARY.png";
import EyeIcon from "../img/Eye.png";
import EyeOffIcon from "../img/Hide.png";
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
        failedAttempts: typeof parsed.failedAttempts === "number" ? parsed.failedAttempts : 0,
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

      // RULE:
      // Attempts 1..5 → show ONLY "Invalid credentials."
      // Attempt 6 → lock 2 minutes + show "Too many login attempts..."
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

        // Always the same message (no attempt count)
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

    // if locked, block resend too (consistent)
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

      // successful loginStart resets attempts
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
    <div className="min-h-screen overflow-x-hidden bg-white flex flex-col">
      <header className="w-full bg-white border-b border-gray-300">
        <div className="flex items-center justify-between w-full max-w-6xl gap-3 px-4 py-4 mx-auto sm:px-6">
          <div className="flex items-center min-w-0 gap-2">
            <img
              src={Logo}
              alt="ScholarCheck Logo"
              className="object-contain w-8 h-8 max-w-full sm:h-10 sm:w-10"
            />
            <span className="text-lg font-semibold text-gray-900 truncate sm:text-xl">
              ScholarCheck
            </span>
          </div>
        </div>
      </header>

      <main className="relative flex-1">
        <div className="pointer-events-none absolute inset-0">
          <div className="h-full w-1/2 bg-[#F0FDF4]" />
        </div>

        <div className="relative flex flex-col w-full max-w-6xl mx-auto lg:flex-row lg:min-h-[calc(100vh-80px)]">
          <div className="hidden lg:flex lg:w-1/2">
            <div className="px-10 py-12 xl:px-12">
              <div className="max-w-md">
                <h2 className="mb-2 text-xl font-bold text-black">Welcome Back to</h2>
                <p className="text-4xl font-bold leading-tight text-green-800">
                  ScholarCheck
                </p>
                <p className="mt-4 text-sm text-gray-700">
                  Log in to access your account and continue your scholarship journey.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start justify-center flex-1 w-full px-4 py-10 sm:px-6 sm:py-12 bg-white">
            <div className="w-full max-w-md">
              <h2 className="text-2xl sm:text-[25px] font-bold text-black mb-2">
                Log In
              </h2>
              <p className="mb-6 text-sm font-normal text-black sm:text-base">
                Please enter your credentials to access your account.
              </p>

              <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col min-w-0 gap-1">
                  <label htmlFor="email" className="text-sm font-medium text-black">
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
                    className="w-full max-w-full px-4 py-3 border rounded-lg border-black/10 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex flex-col min-w-0 gap-1">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <label htmlFor="password" className="text-sm font-medium text-black">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-green-800 shrink-0 hover:underline"
                    >
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
                      className="w-full max-w-full px-4 py-3 pr-12 border rounded-lg border-black/10 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center bg-transparent p-0 border-0 focus:outline-none"
                      aria-label="Toggle password visibility"
                    >
                      <img
                        src={showPassword ? EyeOffIcon : EyeIcon}
                        alt="Toggle password"
                        className="object-contain w-5 h-5"
                        draggable={false}
                      />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className={`w-full rounded-xl py-3 font-semibold text-white transition-colors ${
                    isSubmitDisabled
                      ? "bg-green-800/60 cursor-not-allowed"
                      : "bg-green-800 hover:bg-green-900"
                  }`}
                >
                  {loading
                    ? "Logging in..."
                    : lockRemainingMs > 0
                    ? `Try again in ${formatRemaining(lockRemainingMs)}`
                    : "Log In"}
                </button>
              </form>

              <p className="mt-6 text-sm text-center text-black sm:text-base">
                Don't have an account?{" "}
                <Link to="/signup" className="text-green-800 hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="flex items-center justify-center w-full h-20 text-center bg-white border-t border-gray-200">
        <p className="px-4 text-xs text-black sm:text-sm">
          © 2026 ScholarCheck. All rights reserved.
        </p>
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
