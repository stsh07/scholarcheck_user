import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../img/PRIMARY.png";
import EyeIcon from "../img/Eye.png";
import EyeOffIcon from "../img/Hide.png";

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

  // New states for showing/hiding passwords
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (Object.values(errors).some((e) => e !== "")) return;

    // Simulate submit
    alert("Reset password submitted!");
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
            <h2 className="mb-2 text-xl font-bold text-black">Reset Password</h2>
            <p className="text-4xl font-bold text-green-800">ScholarCheck</p>
            <p className="mt-4 text-sm text-gray-700">
              Enter your registered email and new password to reset your account.
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex justify-center flex-1 px-4 py-10 sm:px-6 sm:py-12">
          <div className="w-full max-w-md">
            <h2 className="mb-2 text-2xl font-bold text-black">Reset Password</h2>
            <p className="mb-6 text-sm text-black">
              Your new password must be different from your previous passwords.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* NEW PASSWORD */}
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
                    validateField("newPassword", val);
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
                >
                  <img src={showNewPassword ? EyeOffIcon : EyeIcon} alt="Toggle" className="w-5 h-5" />
                </button>
                {errors.newPassword && (
                  <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
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
                    validateField("confirmPassword", val);
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
                >
                  <img src={showConfirmPassword ? EyeOffIcon : EyeIcon} alt="Toggle" className="w-5 h-5" />
                </button>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              {/* SUBMIT BUTTON */}
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

            <p className="mt-6 text-sm text-center text-black">
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
        <p className="px-4 text-xs text-black">© 2026 ScholarCheck. All rights reserved.</p>
      </footer>
    </div>
  );
}
