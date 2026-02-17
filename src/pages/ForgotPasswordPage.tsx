// src/pages/ForgotPasswordPage.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../img/PRIMARY.png";
import { requestResetCode } from "../api/auth";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [serverMsg, setServerMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const MAX_EMAIL_LEN = 50;

  // ✅ match backend (.com only)
  const emailComOnlyRegex = /^[^\s@]+@[A-Z0-9-]+(\.[A-Z0-9-]+)*\.com$/i;

  const validateEmail = (raw: string) => {
    const trimmed = raw.trim().replace(/\s/g, "").toLowerCase();

    if (!trimmed) return "Email is required.";
    if (trimmed.length > MAX_EMAIL_LEN) return `Maximum ${MAX_EMAIL_LEN} characters.`;
    if (!emailComOnlyRegex.test(trimmed)) return "Email must be a valid address ending in .com";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleaned = email.trim().replace(/\s/g, "").toLowerCase();
    const msg = validateEmail(cleaned);
    if (msg) {
      setError(msg);
      return;
    }

    setError("");
    setServerMsg("");
    setLoading(true);

    try {
      const res = await requestResetCode(cleaned);

      // optional: show devOtp if your backend returns it
      if (res.devOtp) {
        setServerMsg(`DEV OTP: ${res.devOtp}`);
      } else {
        setServerMsg(res.message || "Reset code sent.");
      }

      // ✅ go to verification page
      navigate(`/email-verification?email=${encodeURIComponent(cleaned)}`);
    } catch (err: any) {
      setError(err?.message || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen overflow-x-hidden bg-white overscroll-x-none touch-pan-y">
      <div className="w-full max-w-full overflow-x-hidden">
        {/* HEADER */}
        <header className="w-full overflow-x-hidden bg-white border-b border-gray-300">
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

        {/* MAIN */}
        <main className="flex flex-col w-full max-w-6xl mx-auto overflow-x-hidden lg:flex-row">
          {/* LEFT (Desktop only) */}
          <div className="hidden px-10 py-12 lg:flex lg:w-1/2 bg-green-50 xl:px-12">
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

          {/* RIGHT */}
          <div className="flex items-start justify-center flex-1 w-full px-4 py-10 overflow-x-hidden sm:px-6 sm:py-12">
            <div className="w-full max-w-md">
              <h2 className="text-2xl sm:text-[25px] font-bold text-black mb-2">
                Forgot Password
              </h2>
              <p className="mb-6 text-sm font-normal text-black break-words sm:text-base">
                Enter your registered email to receive a verification code.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* EMAIL */}
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

                {/* BUTTON */}
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
        </main>

        {/* FOOTER */}
        <footer className="flex items-center justify-center w-full h-20 text-center bg-white border-t border-gray-200">
          <p className="px-4 text-xs text-black break-words sm:text-sm">
            © 2026 ScholarCheck. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
