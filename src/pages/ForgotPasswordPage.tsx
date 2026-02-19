import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../img/PRIMARY.png";
import { requestResetCode } from "../api/auth";

// ✅ Rate limit config
const RATE_VERSION = "v1";
const MAX_PER_HOUR = 3;
const MAX_PER_DAY = 5;
const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type RateState = {
  timestamps: number[]; // epoch ms
};

function nowMs() {
  return Date.now();
}

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function formatRemaining(ms: number) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;

  if (min <= 0) return `${sec}s`;
  if (sec === 0) return `${min}m`;
  return `${min}m ${sec}s`;
}

function pruneTimestamps(timestamps: number[]) {
  const now = nowMs();
  const hourAgo = now - ONE_HOUR_MS;
  const dayAgo = now - ONE_DAY_MS;

  const inLastHour = timestamps.filter((t) => t > hourAgo);
  const inLastDay = timestamps.filter((t) => t > dayAgo);

  // keep only last 24h to avoid unbounded growth
  return { inLastHour, inLastDay, kept: inLastDay };
}

function getResetRateKey(email: string) {
  // per email per browser/device
  return `scholarcheck_user_forgotpass_rate_${RATE_VERSION}:${email || "unknown"}`;
}

function readRateState(key: string): RateState {
  return safeJsonParse<RateState>(localStorage.getItem(key), { timestamps: [] });
}

function writeRateState(key: string, state: RateState) {
  localStorage.setItem(key, JSON.stringify(state));
}

function checkResetLimit(key: string): {
  allowed: boolean;
  reason?: "HOUR" | "DAY";
  retryAfterMs?: number;
} {
  const st = readRateState(key);
  const { inLastHour, inLastDay } = pruneTimestamps(st.timestamps);

  // ✅ daily limit first (stronger cap)
  if (inLastDay.length >= MAX_PER_DAY) {
    // next allowed after the oldest of the last MAX_PER_DAY expires (24h window)
    const oldest = inLastDay[inLastDay.length - MAX_PER_DAY];
    const retryAfterMs = oldest + ONE_DAY_MS - nowMs();
    return { allowed: false, reason: "DAY", retryAfterMs };
  }

  // ✅ hourly limit
  if (inLastHour.length >= MAX_PER_HOUR) {
    const oldest = inLastHour[inLastHour.length - MAX_PER_HOUR];
    const retryAfterMs = oldest + ONE_HOUR_MS - nowMs();
    return { allowed: false, reason: "HOUR", retryAfterMs };
  }

  return { allowed: true };
}

function commitResetAttempt(key: string) {
  const st = readRateState(key);
  const next = pruneTimestamps([...st.timestamps, nowMs()]).kept;
  writeRateState(key, { timestamps: next });
}

function lockMessage(reason: "HOUR" | "DAY", retryAfterMs: number) {
  const remaining = formatRemaining(retryAfterMs);
  if (reason === "HOUR") {
    // user asked: wait 1 hour for 4th attempt within hour
    return `Too many password reset requests. Please try again after 1 hour. (Time remaining: ${remaining})`;
  }
  return `Too many password reset requests today. Please try again later. (Time remaining: ${remaining})`;
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [serverMsg, setServerMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const MAX_EMAIL_LEN = 50;
  const emailComOnlyRegex = /^[^\s@]+@[A-Z0-9-]+(\.[A-Z0-9-]+)*\.com$/i;

  const cleanedEmail = useMemo(
    () => email.trim().replace(/\s/g, "").toLowerCase(),
    [email]
  );

  const rateKey = useMemo(() => getResetRateKey(cleanedEmail), [cleanedEmail]);

  // Optional: keep lock message fresh while locked (so remaining time updates)
  useEffect(() => {
    if (!cleanedEmail) return;

    const tick = () => {
      const gate = checkResetLimit(rateKey);
      if (!gate.allowed && gate.reason && typeof gate.retryAfterMs === "number") {
        // Only update if user is currently seeing a lock error or has an empty error
        // (avoid overwriting validation errors while typing)
        if (
          error.startsWith("Too many password reset requests") ||
          error.startsWith("Too many password reset requests today")
        ) {
          setError(lockMessage(gate.reason, gate.retryAfterMs));
        }
      }
    };

    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rateKey, cleanedEmail]);

  const validateEmail = (raw: string) => {
    const trimmed = raw.trim().replace(/\s/g, "").toLowerCase();

    if (!trimmed) return "Email is required.";
    if (trimmed.length > MAX_EMAIL_LEN) return `Maximum ${MAX_EMAIL_LEN} characters.`;
    if (!emailComOnlyRegex.test(trimmed)) return "Email must be a valid address ending in .com";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleaned = cleanedEmail;
    const msg = validateEmail(cleaned);
    if (msg) {
      setError(msg);
      return;
    }

    // ✅ rate limit check (3/hour, 5/day)
    const gate = checkResetLimit(rateKey);
    if (!gate.allowed && gate.reason && typeof gate.retryAfterMs === "number") {
      setServerMsg("");
      setError(lockMessage(gate.reason, gate.retryAfterMs));
      return;
    }

    setError("");
    setServerMsg("");
    setLoading(true);

    // ✅ count this as an attempt (valid email submission)
    commitResetAttempt(rateKey);

    try {
      const res = await requestResetCode(cleaned);

      if (res.devOtp) setServerMsg(`DEV OTP: ${res.devOtp}`);
      else setServerMsg(res.message || "Reset code sent.");

      navigate(`/email-verification?email=${encodeURIComponent(cleaned)}`);
    } catch (err: any) {
      setError(err?.message || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white flex flex-col">
      {/* HEADER */}
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

      {/* ✅ HALF-PAGE GREEN BG */}
      <main className="relative flex-1">
        <div className="pointer-events-none absolute inset-0">
          <div className="h-full w-1/2 bg-[#F0FDF4]" />
        </div>

        <div className="relative flex flex-col w-full max-w-6xl mx-auto lg:flex-row lg:min-h-[calc(100vh-80px)]">
          {/* LEFT */}
          <div className="hidden lg:flex lg:w-1/2">
            <div className="px-10 py-12 xl:px-12">
              <div className="max-w-md">
                <h2 className="mb-2 text-xl font-bold text-black">Forgot Password?</h2>
                <p className="text-4xl font-bold leading-tight text-green-800 break-words">
                  ScholarCheck
                </p>
                <p className="mt-4 text-sm text-gray-700 break-words">
                  Enter your registered email to receive a verification code.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-start justify-center flex-1 w-full px-4 py-10 sm:px-6 sm:py-12 bg-white">
            <div className="w-full max-w-md">
              <h2 className="text-2xl sm:text-[25px] font-bold text-black mb-2">
                Forgot Password
              </h2>
              <p className="mb-6 text-sm font-normal text-black break-words sm:text-base">
                Enter your registered email to receive a verification code.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col min-w-0 gap-1">
                  <label htmlFor="email" className="text-sm font-medium text-black">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    maxLength={MAX_EMAIL_LEN}
                    value={email}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\s/g, "");
                      setEmail(val);
                      setError(validateEmail(val));
                    }}
                    placeholder="Enter your registered email"
                    className={`w-full max-w-full px-4 py-3 border rounded-lg placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent ${
                      error ? "border-red-500 focus:ring-red-500" : "border-black/10"
                    }`}
                    required
                  />

                  {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                  {!error && serverMsg && (
                    <p className="mt-1 text-xs text-green-800">{serverMsg}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !!error}
                  className={`w-full rounded-xl py-3 font-semibold text-white transition-colors ${
                    loading || !!error
                      ? "bg-green-800/60 cursor-not-allowed"
                      : "bg-green-800 hover:bg-green-900"
                  }`}
                >
                  {loading ? "Sending..." : "Send"}
                </button>
              </form>

              <p className="mt-6 text-sm text-center text-black sm:text-base">
                Remembered your password?{" "}
                <Link to="/login" className="text-green-800 hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="flex items-center justify-center w-full h-20 text-center bg-white border-t border-gray-200">
        <p className="px-4 text-xs text-black break-words sm:text-sm">
          © 2026 ScholarCheck. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
