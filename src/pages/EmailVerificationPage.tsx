// src/pages/EmailVerificationPage.tsx
import React, { useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../img/PRIMARY.png";
import { requestResetCode, verifyResetCode } from "../api/auth";

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

  const inputRefs = Array.from({ length: DIGITS }, () => useRef<HTMLInputElement>(null));

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
      // ✅ FIX: verifyResetCode expects ONE argument (payload object)
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

    setError("");
    setResending(true);

    try {
      await requestResetCode(email);
    } catch (err: any) {
      setError(err?.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-screen min-h-screen bg-white">
      {/* HEADER */}
      <header className="w-full bg-white border-b border-gray-300">
        <div className="flex items-center justify-between w-full max-w-6xl px-4 py-4 mx-auto sm:px-6">
          <div className="flex items-center gap-2">
            <img src={Logo} alt="ScholarCheck Logo" className="w-10 h-10" />
            <span className="text-xl font-semibold text-gray-900">ScholarCheck</span>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex flex-col w-full max-w-6xl mx-auto lg:flex-row">
        {/* LEFT */}
        <div className="hidden px-12 py-12 lg:flex lg:w-1/2 bg-green-50">
          <div className="max-w-md">
            <h2 className="mb-2 text-xl font-bold text-black">Email Verification</h2>
            <p className="text-4xl font-bold text-green-800">ScholarCheck</p>
            <p className="mt-4 text-sm text-gray-700">
              Enter the {DIGITS}-digit code we sent to your email address.
            </p>
            {email && <p className="mt-2 text-sm font-medium text-black break-words">{email}</p>}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex justify-center flex-1 px-4 py-10 sm:px-6 sm:py-12">
          <div className="w-full max-w-md">
            <h2 className="text-2xl sm:text-[25px] font-bold text-black mb-2">Email Verification</h2>
            <p className="mb-6 text-sm text-black sm:text-base">
              Enter the {DIGITS}-digit code we sent to your email address.
            </p>

            <form onSubmit={handleVerify} className="flex flex-col gap-4">
              {/* OTP inputs */}
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
                    className="text-xl text-center border rounded-lg w-12 h-12 sm:w-14 sm:h-14 focus:outline-none focus:ring-2 focus:ring-green-800"
                    required
                  />
                ))}
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              {/* Resend */}
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

              {/* VERIFY BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-xl py-3 font-semibold text-white transition-colors ${
                  loading ? "bg-green-800/60 cursor-not-allowed" : "bg-green-800 hover:bg-green-900"
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
      </main>

      {/* FOOTER */}
      <footer className="flex items-center justify-center w-full h-20 text-center bg-white border-t border-gray-200">
        <p className="px-4 text-xs text-black sm:text-sm">© 2026 ScholarCheck. All rights reserved.</p>
      </footer>
    </div>
  );
}
