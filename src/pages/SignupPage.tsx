import { useState } from "react";
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

  // 8–16 chars, upper, lower, number, special
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

  const normalizeName = (s: string) => s.trim().replace(/\s+/g, " ");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fn = normalizeName(firstName);
    const ln = normalizeName(lastName);

    if (!nameRegex.test(fn) || fn.replace(/[^A-Za-z]/g, "").length < 2) {
      alert("First Name must contain at least 2 letters and no numbers.");
      return;
    }
    if (!nameRegex.test(ln) || ln.replace(/[^A-Za-z]/g, "").length < 2) {
      alert("Last Name must contain at least 2 letters and no numbers.");
      return;
    }

    if (!passwordRegex.test(password)) {
      alert(
        "Password must be 8–16 characters and include uppercase, lowercase, number, and special character (@$!%*?&)."
      );
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      setLoadingOtp(true);
      const res = await requestSignupOtp(email.trim());

      if (res.devOtp) setOtp(res.devOtp);
      else setOtp("");

      setShowOtpModal(true);
    } catch (err: any) {
      alert(err?.message || "Failed to send OTP. Check backend is running.");
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleProceed = async () => {
    if (!/^\d{6}$/.test(otp.trim())) {
      alert("OTP must be exactly 6 digits.");
      return;
    }

    const fn = normalizeName(firstName);
    const ln = normalizeName(lastName);

    try {
      setLoadingSignup(true);

      const res = await signup({
        firstName: fn,
        lastName: ln,
        email: email.trim(),
        password,
        confirmPassword,
        code: otp.trim(),
      });

      alert(res.message);
      setShowOtpModal(false);
      navigate("/login");
    } catch (err: any) {
      alert(err?.message || "Signup failed. OTP might be wrong/expired.");
    } finally {
      setLoadingSignup(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoadingOtp(true);
      const res = await requestSignupOtp(email.trim());
      alert(res.message);

      if (res.devOtp) setOtp(res.devOtp);
      else setOtp("");
    } catch (err: any) {
      alert(err?.message || "Failed to resend OTP.");
    } finally {
      setLoadingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* HEADER */}
      <header className="w-full border-b border-gray-300 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 py-4">
          <div className="flex min-w-0 items-center gap-2">
            <img
              src={Logo}
              alt="ScholarCheck Logo"
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain max-w-full"
            />
            <span className="truncate text-lg sm:text-xl font-semibold text-gray-900">
              ScholarCheck
            </span>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto flex w-full max-w-6xl flex-col lg:flex-row">
        {/* LEFT (Desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 bg-green-50 px-10 xl:px-12 py-12">
          <div className="max-w-md">
            <h2 className="mb-2 text-xl font-bold text-black">Welcome to</h2>
            <p className="text-4xl font-bold leading-tight text-green-800">ScholarCheck</p>
            <p className="mt-4 text-sm text-gray-700">
              Create your account to start checking scholarship eligibility.
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex w-full flex-1 items-start justify-center px-4 sm:px-6 py-10 sm:py-12">
          <div className="w-full max-w-md">
            <h2 className="text-2xl sm:text-[25px] font-bold text-black mb-2">Sign Up</h2>
            <p className="mb-6 text-sm sm:text-base font-normal text-black">
              Please enter your details to create an account.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 min-w-0">
                  <label htmlFor="firstName" className="text-sm font-medium text-black">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full max-w-full rounded-lg border border-black/10 px-4 py-2 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1 min-w-0">
                  <label htmlFor="lastName" className="text-sm font-medium text-black">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full max-w-full rounded-lg border border-black/10 px-4 py-2 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1 min-w-0">
                <label htmlFor="email" className="text-sm font-medium text-black">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full max-w-full rounded-lg border border-black/10 px-4 py-2 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                  required
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1 min-w-0">
                <label htmlFor="password" className="text-sm font-medium text-black">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full max-w-full rounded-lg border border-black/10 px-4 py-2 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2"
                  >
                    <img
                      src={showPassword ? EyeOffIcon : EyeIcon}
                      alt="Toggle password"
                      className="h-full w-full object-contain"
                    />
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1 min-w-0">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-black">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full max-w-full rounded-lg border border-black/10 px-4 py-2 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2"
                  >
                    <img
                      src={showPassword ? EyeOffIcon : EyeIcon}
                      alt="Toggle password"
                      className="h-full w-full object-contain"
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

            <p className="mt-6 text-center text-black text-sm sm:text-base">
              Already have an account?{" "}
              <Link to="/login" className="text-green-800 hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* OTP MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 overflow-x-hidden">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-lg">
            <h3 className="mb-2 text-lg sm:text-xl font-bold text-black">
              Email Verification
            </h3>
            <p className="mb-4 text-sm text-black break-words">
              A One-Time Password (OTP) has been sent to <strong>{email}</strong>. Please
              enter the 6-digit code below to verify your account.
            </p>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter OTP"
              className="w-full max-w-full mb-4 rounded-lg border border-black/10 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-800"
            />

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
                disabled={!/^\d{6}$/.test(otp) || loadingSignup}
                onClick={handleProceed}
                className={`rounded-lg px-4 py-2 text-white ${
                  /^\d{6}$/.test(otp) && !loadingSignup
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
      <footer className="w-full border-t border-gray-200 bg-white py-6 text-center">
        <p className="px-4 text-xs sm:text-sm text-black">
          © 2026 ScholarCheck. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
