import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../img/PRIMARY.png";
import EyeIcon from "../img/Eye.png";
import EyeOffIcon from "../img/Hide.png";
import { requestSignupOtp, signup } from "../api/auth";

export default function SignupPage() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");

  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingSignup, setLoadingSignup] = useState(false);

  const nameRegex = /^[A-Za-z]+(?:[ '\-][A-Za-z]+)*$/;

  const normalizeName = (s: string) => s.trim().replace(/\s+/g, " ");

  // ✅ Helper logger (clean + consistent)
  const LOG_PREFIX = "[SIGNUP]";
  const log = (...args: any[]) => console.log(LOG_PREFIX, ...args);
  const warn = (...args: any[]) => console.warn(LOG_PREFIX, ...args);
  const errLog = (...args: any[]) => console.error(LOG_PREFIX, ...args);

  // Useful to know when modal opens/closes
  useEffect(() => {
    log("OTP Modal:", showOtpModal ? "OPEN" : "CLOSED");
  }, [showOtpModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fn = normalizeName(firstName).slice(0, 12);
    const ln = normalizeName(lastName).slice(0, 12);
    const trimmedEmail = email.trim();

    // ✅ DO NOT LOG PASSWORDS
    log("handleSubmit start", {
      firstName: fn,
      lastName: ln,
      email: trimmedEmail,
      passwordLength: password.length,
      confirmPasswordLength: confirmPassword.length,
    });

    // ✅ First & Last Name validation
    if (!nameRegex.test(fn) || fn.replace(/[^A-Za-z]/g, "").length < 2) {
      warn("First name validation failed", { fn });
      alert("First Name must contain 2–12 letters and no numbers.");
      return;
    }
    if (!nameRegex.test(ln) || ln.replace(/[^A-Za-z]/g, "").length < 2) {
      warn("Last name validation failed", { ln });
      alert("Last Name must contain 2–12 letters and no numbers.");
      return;
    }

    // ✅ Email validation
    const emailOk =
      trimmedEmail.length <= 30 &&
      !/\s/.test(trimmedEmail) &&
      !/[A-Z]/.test(trimmedEmail) &&
      /^[a-z0-9._%+-]+@[a-z0-9.-]+\.com$/.test(trimmedEmail);

    if (!emailOk) {
      warn("Email validation failed", { trimmedEmail });
      alert("Email must be max 30 characters, lowercase only, no spaces, and end with .com");
      return;
    }

    // ✅ Password validation: 8-16 chars, must include uppercase, lowercase, number, special char, no spaces
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

    if (!passwordRegex.test(password) || /\s/.test(password)) {
      warn("Password validation failed", {
        passwordLength: password.length,
        hasSpace: /\s/.test(password),
      });
      alert(
        "Password must be 8–16 characters, include uppercase, lowercase, number, special character, and no spaces."
      );
      return;
    }

    // ✅ Confirm Password
    if (password !== confirmPassword) {
      warn("Confirm password mismatch");
      alert("Passwords do not match!");
      return;
    }

    // ✅ Request OTP
    try {
      setLoadingOtp(true);
      log("Requesting OTP...", { email: trimmedEmail });

      const res = await requestSignupOtp(trimmedEmail);

      log("OTP request success", res);

      if (res.devOtp) {
        log("DEV OTP received (auto-filled)");
        setOtp(res.devOtp);
      } else {
        setOtp("");
      }

      setShowOtpModal(true);
    } catch (error: any) {
      errLog("OTP request failed", error);
      alert(error?.message || "Failed to send OTP. Check backend is running.");
    } finally {
      setLoadingOtp(false);
      log("handleSubmit end");
    }
  };

  const handleProceed = async () => {
    const code = otp.trim();

    log("handleProceed start", {
      otpLength: code.length,
      otpMasked: code ? `${code[0]}*****${code[5] || ""}` : "",
    });

    if (!/^\d{6}$/.test(code)) {
      warn("OTP invalid format", { codeLength: code.length });
      alert("OTP must be exactly 6 digits.");
      return;
    }

    const fn = normalizeName(firstName).slice(0, 12);
    const ln = normalizeName(lastName).slice(0, 12);
    const trimmedEmail = email.trim();

    try {
      setLoadingSignup(true);

      log("Calling signup API...", {
        firstName: fn,
        lastName: ln,
        email: trimmedEmail,
        otpLength: code.length,
      });

      const res = await signup({
        firstName: fn,
        lastName: ln,
        email: trimmedEmail,
        password,
        confirmPassword,
        code,
      });

      log("Signup success", res);

      alert(res.message);
      setShowOtpModal(false);
      navigate("/login");
    } catch (error: any) {
      errLog("Signup failed", error);
      alert(error?.message || "Signup failed. OTP might be wrong/expired.");
    } finally {
      setLoadingSignup(false);
      log("handleProceed end");
    }
  };

  const handleResend = async () => {
    const trimmedEmail = email.trim();
    log("Resend OTP start", { email: trimmedEmail });

    try {
      setLoadingOtp(true);
      const res = await requestSignupOtp(trimmedEmail);

      log("Resend OTP success", res);
      alert(res.message);

      if (res.devOtp) setOtp(res.devOtp);
      else setOtp("");
    } catch (error: any) {
      errLog("Resend OTP failed", error);
      alert(error?.message || "Failed to resend OTP.");
    } finally {
      setLoadingOtp(false);
      log("Resend OTP end");
    }
  };

  // ✅ OTP input helpers
  const setOtpDigit = (index: number, digit: string) => {
    const sanitized = digit.replace(/\D/g, "");
    if (!sanitized) return;

    const chars = otp.split("");
    chars[index] = sanitized[0];
    const nextOtp = chars.join("").slice(0, 6);

    setOtp(nextOtp);

    log("OTP digit set", { index, digit: sanitized[0], otpNow: nextOtp });

    const next = document.getElementById(`otp-${index + 1}`) as HTMLInputElement | null;
    if (next) next.focus();
  };

  const clearOtpDigit = (index: number) => {
    const chars = otp.split("");
    chars[index] = "";
    const nextOtp = chars.join("");
    setOtp(nextOtp);

    log("OTP digit cleared", { index, otpNow: nextOtp });

    const prev = document.getElementById(`otp-${index - 1}`) as HTMLInputElement | null;
    if (prev) prev.focus();
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
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

      {/* MAIN */}
      <main className="flex flex-col w-full max-w-6xl mx-auto lg:flex-row">
        {/* LEFT (Desktop only) */}
        <div className="hidden px-10 py-12 lg:flex lg:w-1/2 bg-green-50 xl:px-12">
          <div className="max-w-md">
            <h2 className="mb-2 text-xl font-bold text-black">Welcome to</h2>
            <p className="text-4xl font-bold leading-tight text-green-800">
              ScholarCheck
            </p>
            <p className="mt-4 text-sm text-gray-700">
              Create your account to start checking scholarship eligibility.
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-start justify-center flex-1 w-full px-4 py-10 sm:px-6 sm:py-12">
          <div className="w-full max-w-md">
            <h2 className="text-2xl sm:text-[25px] font-bold text-black mb-2">
              Sign Up
            </h2>
            <p className="mb-6 text-sm font-normal text-black sm:text-base">
              Please enter your details to create an account.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Names */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col min-w-0 gap-1">
                  <label htmlFor="firstName" className="text-sm font-medium text-black">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    maxLength={12}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full max-w-full px-4 py-2 border rounded-lg border-black/10 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex flex-col min-w-0 gap-1">
                  <label htmlFor="lastName" className="text-sm font-medium text-black">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    maxLength={12}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full max-w-full px-4 py-2 border rounded-lg border-black/10 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                    required
                  />
                </div>
              </div>

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
                  className="w-full max-w-full px-4 py-2 border rounded-lg border-black/10 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                  required
                />
              </div>

              {/* Password */}
              <div className="flex flex-col min-w-0 gap-1">
                <label htmlFor="password" className="text-sm font-medium text-black">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    maxLength={16}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full max-w-full px-4 py-2 border rounded-lg border-black/10 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassword(!showPassword);
                      log("toggle showPassword", { next: !showPassword });
                    }}
                    className="absolute w-6 h-6 -translate-y-1/2 right-3 top-1/2"
                  >
                    <img
                      src={showPassword ? EyeOffIcon : EyeIcon}
                      alt="Toggle password"
                      className="object-contain w-full h-full"
                    />
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col min-w-0 gap-1">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-black">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    maxLength={16}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full max-w-full px-4 py-2 border rounded-lg border-black/10 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassword(!showPassword);
                      log("toggle showPassword", { next: !showPassword });
                    }}
                    className="absolute w-6 h-6 -translate-y-1/2 right-3 top-1/2"
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
                disabled={loadingOtp}
                className={`w-full rounded-xl py-3 font-semibold text-white transition-colors ${
                  loadingOtp
                    ? "bg-green-800/60 cursor-not-allowed"
                    : "bg-green-800 hover:bg-green-900"
                }`}
              >
                {loadingOtp ? "Sending OTP..." : "Sign Up"}
              </button>
            </form>

            <p className="mt-6 text-sm text-center text-black sm:text-base">
              Already have an account?{" "}
              <Link to="/login" className="text-green-800 hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-2xl">
            <h3 className="mb-2 text-xl font-bold text-black">Email Verification</h3>
            <p className="mb-4 text-sm text-black break-words">
              A One-Time Password (OTP) has been sent to <strong>{email}</strong>.
              Please enter the 6-digit code below to verify your account.
            </p>

            {/* OTP Input */}
            <div className="flex justify-between gap-2 mb-4">
              {[...Array(6)].map((_, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[index] || ""}
                  onChange={(e) => setOtpDigit(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace") {
                      e.preventDefault();
                      clearOtpDigit(index);
                    }
                  }}
                  title={`OTP digit ${index + 1}`}
                  placeholder="0"
                  className="w-12 h-12 text-xl text-center border rounded-lg border-black/10 focus:outline-none focus:ring-2 focus:ring-green-800"
                />
              ))}
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={loadingOtp}
                className={`text-sm text-green-800 hover:underline ${
                  loadingOtp ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {loadingOtp ? "Resending..." : "Resend OTP"}
              </button>

              <button
                type="button"
                disabled={otp.length !== 6 || loadingSignup}
                onClick={handleProceed}
                className={`px-4 py-2 text-white rounded-lg ${
                  otp.length === 6 && !loadingSignup
                    ? "bg-green-800 hover:bg-green-900"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {loadingSignup ? "Creating..." : "Proceed"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="flex items-center justify-center w-full h-20 text-center bg-white border-t border-gray-200">
        <p className="px-4 text-xs text-black sm:text-sm">
          © 2026 ScholarCheck. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
