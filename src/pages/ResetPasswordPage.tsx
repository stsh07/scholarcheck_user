import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../img/PRIMARY.png";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const MAX_EMAIL_LEN = 50;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

  const validateField = (name: string, value: string) => {
    let message = "";

    switch (name) {
      case "email":
        if (!value.trim()) message = "Email is required.";
        else if (value.length > MAX_EMAIL_LEN)
          message = `Maximum ${MAX_EMAIL_LEN} characters.`;
        else if (!emailRegex.test(value)) message = "Enter a valid email.";
        break;
      case "newPassword":
        if (!value) message = "New password is required.";
        else if (!passwordRegex.test(value))
          message =
            "8–16 chars, uppercase, lowercase, number, special char, no spaces.";
        break;
      case "confirmPassword":
        if (!value) message = "Confirm your password.";
        else if (value !== newPassword) message = "Passwords do not match.";
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    validateField("email", email);
    validateField("newPassword", newPassword);
    validateField("confirmPassword", confirmPassword);

    // Stop if any errors exist
    if (Object.values(errors).some((e) => e !== "")) return;

    // For now just simulate submit
    alert("Reset password submitted!");
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
              <h2 className="mb-2 text-xl font-bold text-black">Reset Password</h2>
              <p className="text-4xl font-bold leading-tight text-green-800 break-words">
                ScholarCheck
              </p>
              <p className="mt-4 text-sm text-gray-700 break-words">
                Enter your registered email and new password to reset your account.
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-start justify-center flex-1 w-full px-4 py-10 overflow-x-hidden sm:px-6 sm:py-12">
            <div className="w-full max-w-md">
              <h2 className="text-2xl sm:text-[25px] font-bold text-black mb-2">
                Reset Password
              </h2>
              <p className="mb-6 text-sm font-normal text-black break-words sm:text-base">
                Fill out the form below to reset your password.
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
                      validateField("email", val);
                    }}
                    placeholder="Enter your registered email"
                    className={`w-full max-w-full px-4 py-3 border rounded-lg placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent ${
                      errors.email ? "border-red-500 focus:ring-red-500" : "border-black/10"
                    }`}
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* NEW PASSWORD */}
                <div className="flex flex-col min-w-0 gap-1">
                  <label htmlFor="newPassword" className="text-sm font-medium text-black">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    maxLength={16}
                    value={newPassword}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\s/g, "");
                      setNewPassword(val);
                      validateField("newPassword", val);
                    }}
                    placeholder="Enter new password"
                    className={`w-full max-w-full px-4 py-3 border rounded-lg placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent ${
                      errors.newPassword ? "border-red-500 focus:ring-red-500" : "border-black/10"
                    }`}
                    required
                  />
                  {errors.newPassword && (
                    <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>
                  )}
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="flex flex-col min-w-0 gap-1">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-black">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    maxLength={16}
                    value={confirmPassword}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\s/g, "");
                      setConfirmPassword(val);
                      validateField("confirmPassword", val);
                    }}
                    placeholder="Confirm new password"
                    className={`w-full max-w-full px-4 py-3 border rounded-lg placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent ${
                      errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-black/10"
                    }`}
                    required
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={loading || Object.values(errors).some((e) => e !== "")}
                  className={`w-full rounded-xl py-3 font-semibold text-white transition-colors ${
                    loading || Object.values(errors).some((e) => e !== "")
                      ? "bg-green-800/60 cursor-not-allowed"
                      : "bg-green-800 hover:bg-green-900"
                  }`}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>

              <p className="mt-6 text-sm text-center text-black sm:text-base">
                Back to{" "}
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
