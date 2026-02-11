import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../img/PRIMARY.png";
import EyeIcon from "../img/Eye.png";
import EyeOffIcon from "../img/Hide.png";

import LoginApproval from "../modals/LoginApproval";

type LoginStartResponse = { message: string; challengeId: string };
type LoginStatus = "PENDING" | "APPROVED" | "DENIED" | "EXPIRED";
type LoginStatusResponse = { status: LoginStatus };
type LoginCompleteResponse = {
  message: string;
  user: any;
  accessToken: string;
  refreshToken: string;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function loginStart(payload: { email: string; password: string }) {
  const res = await fetch(`${API_URL}/api/auth/login-start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Login start failed.");
  return data as LoginStartResponse;
}

async function loginStatus(challengeId: string) {
  const res = await fetch(`${API_URL}/api/auth/login-status/${challengeId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Failed to check login status.");
  return data as LoginStatusResponse;
}

async function loginComplete(payload: { challengeId: string }) {
  const res = await fetch(`${API_URL}/api/auth/login-complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Login complete failed.");
  return data as LoginCompleteResponse;
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // approval flow UI state
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [status, setStatus] = useState<LoginStatus>("PENDING");
  const [statusMsg, setStatusMsg] = useState<string>("");

  const pollingRef = useRef<number | null>(null);

  const stopPolling = () => {
    if (pollingRef.current) {
      window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const resetApproval = () => {
    stopPolling();
    setChallengeId(null);
    setStatus("PENDING");
    setStatusMsg("");
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  const startPolling = (cid: string) => {
    stopPolling();

    pollingRef.current = window.setInterval(async () => {
      try {
        const st = await loginStatus(cid);
        setStatus(st.status);

        if (st.status === "APPROVED") {
          stopPolling();

          const done = await loginComplete({ challengeId: cid });

          localStorage.setItem("scholarcheck_accessToken", done.accessToken);
          localStorage.setItem("scholarcheck_refreshToken", done.refreshToken);
          localStorage.setItem("scholarcheck_user", JSON.stringify(done.user));

          alert(done.message || "Login successful");
          navigate("/home", { replace: true });
        }

        if (st.status === "DENIED") {
          stopPolling();
          setStatusMsg(
            "This login was denied. If this wasn’t you, reset your password immediately."
          );
        }

        if (st.status === "EXPIRED") {
          stopPolling();
          setStatusMsg(
            "This login request expired. Please log in again to request a new approval email."
          );
        }
      } catch (e: any) {
        setStatusMsg(e?.message || "Could not check approval status.");
      }
    }, 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    // Email validation: max 30, lowercase, .com, no spaces
    if (
      trimmedEmail.length > 30 ||
      /\s/.test(trimmedEmail) ||
      /[A-Z]/.test(trimmedEmail) ||
      !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.com$/.test(trimmedEmail)
    ) {
      alert(
        "Email must be max 30 characters, lowercase only, no spaces, and end with .com"
      );
      return;
    }

    // Password validation: 8-16 chars, no spaces, uppercase, lowercase, number, special char
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
    if (!passwordRegex.test(password) || /\s/.test(password)) {
      alert(
        "Password must be 8–16 characters, include uppercase, lowercase, number, special character, and no spaces."
      );
      return;
    }

    try {
      setLoading(true);
      resetApproval();

      // Step 1: Start login -> sends email -> returns challengeId
      const res = await loginStart({ email: trimmedEmail, password });

      setChallengeId(res.challengeId);
      setStatus("PENDING");
      setStatusMsg(
        res.message ||
          "We sent a verification email. Please approve this login to continue."
      );

      // Step 2: Poll until approved/denied/expired
      startPolling(res.challengeId);
    } catch (err: any) {
      alert(err?.message || "Login failed. Check email/password.");
    } finally {
      setLoading(false);
    }
  };

  const waitingApproval = !!challengeId;

  const resendApproval = async () => {
    try {
      const trimmedEmail = email.trim();
      if (!trimmedEmail || !password) {
        alert("Please enter your email and password first.");
        return;
      }

      setLoading(true);
      resetApproval();

      const res = await loginStart({ email: trimmedEmail, password });
      setChallengeId(res.challengeId);
      setStatus("PENDING");
      setStatusMsg(res.message || "We sent a new verification email.");
      startPolling(res.challengeId);
    } catch (e: any) {
      alert(e?.message || "Failed to resend approval email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // ✅ Page wrapper: blocks horizontal scroll + allows vertical scrolling
    <div className="min-h-screen w-screen bg-white overflow-x-hidden overscroll-x-none touch-pan-y">
      {/* ✅ Extra safety layer against side-scroll */}
      <div className="w-full max-w-full overflow-x-hidden">
        {/* Modal */}
        <LoginApproval
          open={waitingApproval}
          status={status}
          message={statusMsg}
          loading={loading}
          onClose={resetApproval}
          onResend={resendApproval}
        />

        {/* HEADER */}
        <header className="w-full bg-white border-b border-gray-300 overflow-x-hidden">
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
        {/* ✅ Key change: allow the whole page to scroll naturally; prevent any child from forcing width */}
        <main className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row overflow-x-hidden">
          {/* LEFT (Desktop only) */}
          <div className="hidden lg:flex lg:w-1/2 bg-green-50">
            <div className="px-10 py-12 xl:px-12">
              <div className="max-w-md">
                <h2 className="mb-2 text-xl font-bold text-black">
                  Welcome Back to
                </h2>
                <p className="text-4xl font-bold leading-tight text-green-800 break-words">
                  ScholarCheck
                </p>
                <p className="mt-4 text-sm text-gray-700 break-words">
                  Log in to access your account and continue your scholarship
                  journey.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-start justify-center flex-1 w-full px-4 py-10 sm:px-6 sm:py-12 overflow-x-hidden">
            <div className="w-full max-w-md">
              <h2 className="text-2xl sm:text-[25px] font-bold text-black mb-2">
                Log In
              </h2>
              <p className="mb-6 text-sm font-normal text-black sm:text-base break-words">
                Please enter your credentials to access your account.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Email */}
                <div className="flex flex-col min-w-0 gap-1">
                  <label htmlFor="email" className="text-sm font-medium text-black">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    maxLength={30}
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    placeholder="Enter your email"
                    className="w-full max-w-full px-4 py-3 border rounded-lg border-black/10 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                    required
                    disabled={waitingApproval}
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col min-w-0 gap-1">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-black"
                    >
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
                      maxLength={16}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full max-w-full px-4 py-3 border rounded-lg border-black/10 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                      required
                      disabled={waitingApproval}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute w-6 h-6 -translate-y-1/2 right-3 top-1/2"
                      disabled={waitingApproval}
                    >
                      <img
                        src={showPassword ? EyeOffIcon : EyeIcon}
                        alt="Toggle password"
                        className="object-contain w-full h-full"
                      />
                    </button>
                  </div>
                </div>

                {/* Button */}
                <button
                  type="submit"
                  disabled={loading || waitingApproval}
                  className={`w-full rounded-xl py-3 font-semibold text-white transition-colors ${
                    loading || waitingApproval
                      ? "bg-green-800/60 cursor-not-allowed"
                      : "bg-green-800 hover:bg-green-900"
                  }`}
                >
                  {loading
                    ? "Logging in..."
                    : waitingApproval
                    ? "Waiting for email approval..."
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
        </main>

        {/* FOOTER */}
        <footer className="flex items-center justify-center w-full h-20 text-center bg-white border-t border-gray-200 overflow-x-hidden">
          <p className="px-4 text-xs text-black sm:text-sm break-words">
            © 2026 ScholarCheck. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
