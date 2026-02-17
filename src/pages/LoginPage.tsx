import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../img/PRIMARY.png";
import EyeIcon from "../img/Eye.png";
import EyeOffIcon from "../img/Hide.png";
import LoginErrorModal from "../modals/LoginErrorModal";

import LoginApproval from "../modals/LoginApproval";
import { loginComplete, loginStart, loginStatus } from "../api/auth";

type LoginStatus = "PENDING" | "APPROVED" | "DENIED" | "EXPIRED";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("Incorrect email or password.");

  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<LoginStatus>("PENDING");
  const [approvalMessage, setApprovalMessage] = useState(
    "We sent a verification email. Please approve this login to continue."
  );
  const [approvalLoading, setApprovalLoading] = useState(false);

  const challengeIdRef = useRef<string>("");

  const normalizeEmail = (v: string) => v.trim().toLowerCase();

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
          navigate("/home", { replace: true });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorOpen(false);

    const normalized = normalizeEmail(email);

    try {
      setLoading(true);

      const start = await loginStart({
        email: normalized,
        password,
      });

      challengeIdRef.current = start.challengeId;

      setApprovalStatus("PENDING");
      setApprovalMessage(start.message);
      setApprovalOpen(true);
    } catch (err: any) {
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        "Incorrect email or password.";

      setErrorMsg(msg);
      setErrorOpen(true);
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

    try {
      setApprovalLoading(true);
      const start = await loginStart({
        email: normalized,
        password,
      });

      challengeIdRef.current = start.challengeId;
      setApprovalStatus("PENDING");
      setApprovalMessage(start.message);
    } catch (err: any) {
      setApprovalMessage(err?.message || "Failed to resend approval email.");
      setApprovalStatus("EXPIRED");
    } finally {
      setApprovalLoading(false);
    }
  };

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
                <h2 className="mb-2 text-xl font-bold text-black">
                  Welcome Back to
                </h2>
                <p className="text-4xl font-bold leading-tight text-green-800">
                  ScholarCheck
                </p>
                <p className="mt-4 text-sm text-gray-700">
                  Log in to access your account and continue your scholarship
                  journey.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full max-w-full px-4 py-3 border rounded-lg border-black/10 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute w-6 h-6 -translate-y-1/2 right-3 top-1/2"
                      aria-label="Toggle password visibility"
                    >
                      <img
                        src={showPassword ? EyeOffIcon : EyeIcon}
                        alt="Toggle password"
                        className="object-contain w-full h-full"
                      />
                    </button>
                  </div>
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
                  {loading ? "Logging in..." : "Log In"}
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
        title="Incorrect Email or Password"
        message={errorMsg || "Incorrect email or password."}
        onClose={() => setErrorOpen(false)}
      />
    </div>
  );
}
