import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../img/PRIMARY.png";
import EyeIcon from "../img/Eye.png";
import EyeOffIcon from "../img/Hide.png";
import { resetPassword } from "../api/auth";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const query = useQuery();

  const email = (query.get("email") || "").toLowerCase();
  const resetToken = query.get("resetToken") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
    page: "",
  });

  const [loading, setLoading] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[\S]{8,16}$/;

  const validateAll = (np: string, cp: string) => {
    const next = { newPassword: "", confirmPassword: "", page: "" };

    if (!email || !resetToken) {
      next.page = "Missing reset session. Please restart Forgot Password.";
    }

    if (!np) next.newPassword = "New password is required.";
    else if (!passwordRegex.test(np))
      next.newPassword =
        "8–16 chars, uppercase, lowercase, number, 1 special char, no spaces.";

    if (!cp) next.confirmPassword = "Confirm your password.";
    else if (cp !== np) next.confirmPassword = "Passwords do not match.";

    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = validateAll(newPassword, confirmPassword);
    setErrors(nextErrors);

    if (Object.values(nextErrors).some((v) => v !== "")) return;

    setLoading(true);
    try {
      await resetPassword({
        email,
        resetToken,
        newPassword,
        confirmPassword,
      });

      navigate("/login");
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        page: err?.message || "Failed to reset password.",
      }));
    } finally {
      setLoading(false);
    }
  };

  const disabled =
    loading ||
    !!errors.page ||
    !!errors.newPassword ||
    !!errors.confirmPassword ||
    !newPassword ||
    !confirmPassword;

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
                <h2 className="mb-2 text-xl font-bold text-black">Reset Password</h2>
                <p className="text-4xl font-bold text-green-800">ScholarCheck</p>
                <p className="mt-4 text-sm text-gray-700">
                  Enter your new password to reset your account.
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
              <h2 className="mb-2 text-2xl font-bold text-black">Reset Password</h2>
              <p className="mb-6 text-sm text-black">
                Your new password must be different from your previous passwords.
              </p>

              {errors.page && (
                <div className="p-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                  {errors.page}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="relative flex flex-col gap-1">
                  <label htmlFor="newPassword" className="text-sm font-medium text-black">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    maxLength={16}
                    value={newPassword}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\s/g, "");
                      setNewPassword(val);
                      const next = validateAll(val, confirmPassword);
                      setErrors((prev) => ({ ...prev, ...next, page: prev.page }));
                    }}
                    placeholder="Enter new password"
                    className={`w-full px-4 py-3 border rounded-lg placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent ${
                      errors.newPassword ? "border-red-500 focus:ring-red-500" : "border-black/10"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute top-9 right-3"
                    aria-label="Toggle new password visibility"
                  >
                    <img
                      src={showNewPassword ? EyeOffIcon : EyeIcon}
                      alt="Toggle"
                      className="w-5 h-5"
                    />
                  </button>
                  {errors.newPassword && (
                    <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>
                  )}
                </div>

                <div className="relative flex flex-col gap-1">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-black">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    maxLength={16}
                    value={confirmPassword}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\s/g, "");
                      setConfirmPassword(val);
                      const next = validateAll(newPassword, val);
                      setErrors((prev) => ({ ...prev, ...next, page: prev.page }));
                    }}
                    placeholder="Confirm new password"
                    className={`w-full px-4 py-3 border rounded-lg placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent ${
                      errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-black/10"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute top-9 right-3"
                    aria-label="Toggle confirm password visibility"
                  >
                    <img
                      src={showConfirmPassword ? EyeOffIcon : EyeIcon}
                      alt="Toggle"
                      className="w-5 h-5"
                    />
                  </button>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={disabled}
                  className={`w-full rounded-xl py-3 font-semibold text-white transition-colors ${
                    disabled
                      ? "bg-green-800/60 cursor-not-allowed"
                      : "bg-green-800 hover:bg-green-900"
                  }`}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>

              <p className="mt-6 text-sm text-center text-black">
                Back to{" "}
                <Link to="/login" className="text-green-800 hover:underline">
                  Login
                </Link>
              </p>

              <p className="mt-2 text-xs text-center text-black/70">
                Missing session? Restart{" "}
                <Link to="/forgot-password" className="text-green-800 hover:underline">
                  Forgot Password
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="flex items-center justify-center w-full h-20 text-center bg-white border-t border-gray-200">
        <p className="px-4 text-xs text-black">
          © 2026 ScholarCheck. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
