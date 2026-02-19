import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../img/PRIMARY.png";
import { requestResetCode, verifyResetCode } from "../api/auth";

// ✅ Same rate limit rules
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

  return { inLastHour, inLastDay, kept: inLastDay };
}

function getResetRateKey(email: string) {
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

  if (inLastDay.length >= MAX_PER_DAY) {
    const oldest = inLastDay[inLastDay.length - MAX_PER_DAY];
    const retryAfterMs = oldest + ONE_DAY_MS - nowMs();
    return { allowed: false, reason: "DAY", retryAfterMs };
  }

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
    return `Too many password reset requests. Please try again after 1 hour. (Time remaining: ${remaining})`;
  }
  return `Too many password reset requests today. Please try again later. (Time remaining: ${remaining})`;
}

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const query = useQuery();
  const email = (query.get("email") || "").toLowerCase();

  const DIGITS = 6;

  const [code, setCode] = useState<string[]>(Array(DIGITS).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const inputRefs = Array.from({ length: DIGITS }, () =>
    useRef<HTMLInputElement>(null)
  );

  const rateKey = useMemo(() => getResetRateKey(email), [email]);

  // Optional: keep lock message updated while user is on this page
  useEffect(() => {
    if (!email) return;

    const tick = () => {
      const gate = checkResetLimit(rateKey);
      if (!gate.allowed && gate.reason && typeof gate.retryAfterMs === "number") {
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
  }, [rateKey, email]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < DIGITS - 1) inputRefs[index + 1].current?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Missing email. Please go back to Forgot Password.");
      return;
    }

    const joined = code.join("");
    if (code.some((d) => d === "") || joined.length !== DIGITS) {
      setError(`Please enter the ${DIGITS}-digit code.`);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await verifyResetCode({ email, code: joined });

      navigate(
        `/reset-password?email=${encodeURIComponent(email)}&resetToken=${encodeURIComponent(
          res.resetToken
        )}`
      );
    } catch (err: any) {
      setError(err?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Missing email. Please go back to Forgot Password.");
      return;
    }

    // ✅ rate limit check (Resend is also counted)
    const gate = checkResetLimit(rateKey);
    if (!gate.allowed && gate.reason && typeof gate.retryAfterMs === "number") {
      setError(lockMessage(gate.reason, gate.retryAfterMs));
      return;
    }

    setError("");
    setResending(true);

    // ✅ count this as an attempt
    commitResetAttempt(rateKey);

    try {
      await requestResetCode(email);
    } catch (err: any) {
      setError(err?.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white flex flex-col">
      {/* HEADER */}
      <header className="w-full bg-white border-b border-gray-300">
        <div className="flex items-center justify-between w-full max-w-6xl px-4 py-4 mx-auto sm:px-6">
          <div className="flex items-center gap-2">
            <img src={Logo} alt="ScholarCheck Logo" className="w-10 h-10" />
            <span className="text-xl font-semibold text-gray-900">ScholarCheck</span>
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
            <div className="px-12 py-12">
              <div className="max-w-md">
                <h2 className="mb-2 text-xl font-bold text-black">Email Verification</h2>
                <p className="text-4xl font-bold text-green-800">ScholarCheck</p>
                <p className="mt-4 text-sm text-gray-700">
                  Enter the {DIGITS}-digit code we sent to your email address.
                </p>
                {email && (
                  <p className="mt-2 text-sm font-medium text-black break-words">
                    {email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex justify-center flex-1 px-4 py-10 sm:px-6 sm:py-12 bg-white">
            <div className="w-full max-w-md">
              <h2 className="text-2xl sm:text-[25px] font-bold text-black mb-2">
                Email Verification
              </h2>
              <p className="mb-6 text-sm text-black sm:text-base">
                Enter the {DIGITS}-digit code we sent to your email address.
              </p>

              <form onSubmit={handleVerify} className="flex flex-col gap-4">
                <div className="flex justify-between gap-2 mb-2">
                  {code.map((digit, i) => (
                    <input
                      key={i}
                      ref={inputRefs[i]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className="text-xl text-center border rounded-lg w-12 h-12 sm:w-14 sm:h-14 focus:outline-none focus:ring-2 focus:ring-green-800 border-black/10"
                      required
                    />
                  ))}
                </div>

                {error && <p className="text-xs text-red-500">{error}</p>}

                <div className="flex items-center justify-center gap-1 mb-4 text-sm">
                  <span>Didn't receive code?</span>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className={`text-green-800 hover:underline ${
                      resending ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    {resending ? "Resending..." : "Resend"}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full rounded-xl py-3 font-semibold text-white transition-colors ${
                    loading
                      ? "bg-green-800/60 cursor-not-allowed"
                      : "bg-green-800 hover:bg-green-900"
                  }`}
                >
                  {loading ? "Verifying..." : "Verify"}
                </button>

                <p className="mt-6 text-sm text-center text-black sm:text-base">
                  Remembered your password?{" "}
                  <Link to="/login" className="text-green-800 hover:underline">
                    Login
                  </Link>
                </p>

                <p className="text-xs text-center text-black/70">
                  Wrong email?{" "}
                  <Link to="/forgot-password" className="text-green-800 hover:underline">
                    Go back
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="flex items-center justify-center w-full h-20 text-center bg-white border-t border-gray-200">
        <p className="px-4 text-xs text-black sm:text-sm">
          © 2026 ScholarCheck. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
