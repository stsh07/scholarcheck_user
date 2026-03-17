// src/pages/SignupPage.tsx
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../img/PRIMARY.png";
import EyeIcon from "../img/Eye.png";
import EyeOffIcon from "../img/Hide.png";
import { requestSignupOtp, signup } from "../api/auth";
import OtpModal from "../modals/OtpModal";
import SignedUpSuccessfullyModal from "../modals/SignUpSuccessfullyModal";
import LoginErrorModal from "../modals/LoginErrorModal";

export default function SignupPage() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingSignup, setLoadingSignup] = useState(false);

  const [showSignupSuccess, setShowSignupSuccess] = useState(false);

  const [errorModal, setErrorModal] = useState({ open: false, title: "", message: "" });
  const showError = (title: string, message: string) =>
    setErrorModal({ open: true, title, message });
  const closeError = () => setErrorModal((prev) => ({ ...prev, open: false }));

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const MAX_NAME_LEN = 25;
  const MAX_EMAIL_LEN = 50;

  const nameRegex = /^[A-Za-z]+(?:[ '\-][A-Za-z]+)*$/;
  const emailRegex = /^[^\s@]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.com$/i;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[\S]{8,16}$/;

  const normalizeName = (s: string) => s.trim().replace(/\s+/g, " ");
  const normalizeEmail = (s: string) => s.trim().toLowerCase();

  const validateOne = (
    field: keyof typeof errors,
    value: string,
    ctx?: { password?: string }
  ) => {
    let message = "";

    if (field === "firstName") {
      if (!value.trim()) message = "First Name is required.";
      else if (value.length > MAX_NAME_LEN) message = `Maximum ${MAX_NAME_LEN} characters.`;
      else if (!nameRegex.test(value)) message = "Letters only. No numbers allowed.";
    }

    if (field === "lastName") {
      if (!value.trim()) message = "Last Name is required.";
      else if (value.length > MAX_NAME_LEN) message = `Maximum ${MAX_NAME_LEN} characters.`;
      else if (!nameRegex.test(value)) message = "Letters only. No numbers allowed.";
    }

    if (field === "email") {
      const v = normalizeEmail(value);
      if (!v) message = "Email is required.";
      else if (v.length > MAX_EMAIL_LEN) message = `Maximum ${MAX_EMAIL_LEN} characters.`;
      else if (!emailRegex.test(v)) message = "Email must be a valid address ending in .com";
    }

    if (field === "password") {
      if (!value) message = "Password is required.";
      else if (!passwordRegex.test(value)) {
        message = "8–16 chars, uppercase, lowercase, number, special char (no spaces).";
      }
    }

    if (field === "confirmPassword") {
      if (!value) message = "Confirm your password.";
      else if (value !== (ctx?.password ?? "")) message = "Passwords do not match.";
    }

    return message;
  };

  const validateAndSetField = (field: keyof typeof errors, value: string) => {
    const msg = validateOne(field, value, { password });
    setErrors((prev) => ({ ...prev, [field]: msg }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = {
      firstName: validateOne("firstName", firstName),
      lastName: validateOne("lastName", lastName),
      email: validateOne("email", email),
      password: validateOne("password", password),
      confirmPassword: validateOne("confirmPassword", confirmPassword, { password }),
    };

    setErrors(nextErrors);
    if (Object.values(nextErrors).some((m) => m)) return;

    try {
      setLoadingOtp(true);
      const trimmedEmail = normalizeEmail(email);

      const res = await requestSignupOtp(trimmedEmail);

      if (res.devOtp) setOtp(res.devOtp);
      else setOtp("");

      setShowOtpModal(true);
    } catch (error: any) {
      showError("Sign Up Failed", error?.message || "Failed to send OTP. Check backend.");
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleProceed = async () => {
    if (!/^\d{6}$/.test(otp)) {
      showError("Invalid OTP", "OTP must be exactly 6 digits.");
      return;
    }

    try {
      setLoadingSignup(true);

      const res = await signup({
        firstName: normalizeName(firstName),
        lastName: normalizeName(lastName),
        email: normalizeEmail(email),
        password,
        confirmPassword,
        code: otp,
      });

      setShowOtpModal(false);
      setShowSignupSuccess(true);
      setOtp("");

      console.log(res?.message || "Signup successful");
    } catch (error: any) {
      showError("Sign Up Failed", error?.message || "Signup failed. OTP might be wrong/expired.");
    } finally {
      setLoadingSignup(false);
    }
  };

  const emailValueForApi = useMemo(() => normalizeEmail(email), [email]);

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
                <h2 className="mb-2 text-xl font-bold text-black">Welcome to</h2>
                <p className="text-4xl font-bold leading-tight text-green-800 break-words">
                  ScholarCheck
                </p>
                <p className="mt-4 text-sm text-gray-700 break-words">
                  Create your account to start checking scholarship eligibility.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start justify-center flex-1 w-full px-4 py-10 sm:px-6 sm:py-12 bg-white">
            <div className="w-full max-w-md">
              <h2 className="text-2xl sm:text-[25px] font-bold text-black mb-2">
                Sign Up
              </h2>
              <p className="mb-6 text-sm font-normal text-black break-words sm:text-base">
                Please enter your details to create an account.
              </p>

              <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col min-w-0 gap-1">
                    <label htmlFor="firstName" className="text-sm font-medium text-black">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      maxLength={MAX_NAME_LEN}
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        validateAndSetField("firstName", e.target.value);
                      }}
                      placeholder="First name"
                      className={`w-full max-w-full px-4 py-2 border rounded-lg placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent ${
                        errors.firstName ? "border-red-500 focus:ring-red-500" : "border-black/10"
                      }`}
                      required
                    />
                    {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
                  </div>

                  <div className="flex flex-col min-w-0 gap-1">
                    <label htmlFor="lastName" className="text-sm font-medium text-black">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      maxLength={MAX_NAME_LEN}
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        validateAndSetField("lastName", e.target.value);
                      }}
                      placeholder="Last name"
                      className={`w-full max-w-full px-4 py-2 border rounded-lg placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent ${
                        errors.lastName ? "border-red-500 focus:ring-red-500" : "border-black/10"
                      }`}
                      required
                    />
                    {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="flex flex-col min-w-0 gap-1">
                  <label htmlFor="email" className="text-sm font-medium text-black">
                    Email
                  </label>
                  <input
                    id="email"
                    type="text"
                    inputMode="email"
                    autoComplete="email"
                    maxLength={MAX_EMAIL_LEN}
                    value={email}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\s/g, "");
                      setEmail(val);
                      validateAndSetField("email", val);
                    }}
                    placeholder="Enter your email"
                    className={`w-full max-w-full px-4 py-2 border rounded-lg placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent ${
                      errors.email ? "border-red-500 focus:ring-red-500" : "border-black/10"
                    }`}
                    required
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>

                <div className="flex flex-col min-w-0 gap-1">
                  <label htmlFor="password" className="text-sm font-medium text-black">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      maxLength={16}
                      value={password}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\s/g, "");
                        setPassword(val);
                        validateAndSetField("password", val);
                        if (confirmPassword) validateAndSetField("confirmPassword", confirmPassword);
                      }}
                      placeholder="Enter your password"
                      className={`w-full max-w-full px-4 py-2 pr-12 border rounded-lg placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent ${
                        errors.password ? "border-red-500 focus:ring-red-500" : "border-black/10"
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
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
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                </div>

                <div className="flex flex-col min-w-0 gap-1">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-black">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      maxLength={16}
                      value={confirmPassword}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\s/g, "");
                        setConfirmPassword(val);
                        validateAndSetField("confirmPassword", val);
                      }}
                      placeholder="Confirm your password"
                      className={`w-full max-w-full px-4 py-2 pr-12 border rounded-lg placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent ${
                        errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-black/10"
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center bg-transparent p-0 border-0 focus:outline-none"
                      aria-label="Toggle confirm password visibility"
                    >
                      <img
                        src={showConfirmPassword ? EyeOffIcon : EyeIcon}
                        alt="Toggle confirm password"
                        className="object-contain w-5 h-5"
                        draggable={false}
                      />
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loadingOtp}
                  className={`w-full rounded-xl py-3 font-semibold text-white transition-colors ${
                    loadingOtp ? "bg-green-800/60 cursor-not-allowed" : "bg-green-800 hover:bg-green-900"
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
        </div>

        {showOtpModal && (
          <OtpModal
            email={emailValueForApi}
            otp={otp}
            setOtp={setOtp}
            onClose={() => setShowOtpModal(false)}
            onProceed={handleProceed}
            loadingOtp={loadingOtp}
            loadingSignup={loadingSignup}
            requestResendOtp={async () => {
              try {
                setLoadingOtp(true);
                const res = await requestSignupOtp(emailValueForApi);
                showError("OTP Sent", res.message);
                if (res.devOtp) setOtp(res.devOtp);
              } catch (err: any) {
                showError("Resend Failed", err?.message || "Failed to resend OTP.");
              } finally {
                setLoadingOtp(false);
              }
            }}
          />
        )}

        <LoginErrorModal
          open={errorModal.open}
          title={errorModal.title}
          message={errorModal.message}
          onClose={closeError}
        />

        <SignedUpSuccessfullyModal
          open={showSignupSuccess}
          onClose={() => {
            setShowSignupSuccess(false);
            navigate("/login");
          }}
          autoCloseMs={2000}
        />
      </main>

      <footer className="flex items-center justify-center w-full h-20 text-center bg-white border-t border-gray-200">
        <p className="px-4 text-xs text-black break-words sm:text-sm">
          © 2026 ScholarCheck. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
