import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../img/PRIMARY.png";
import EyeIcon from "../img/Eye.png";
import EyeOffIcon from "../img/Hide.png";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // You can also add validation for confirm password here
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Signup submitted", { fullName, email, password });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ===== HEADER ===== */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-300">
        <div className="flex items-center gap-2">
          <img
            src={Logo}
            alt="ScholarCheck Logo"
            className="object-contain w-8 h-8 md:w-10 md:h-10"
          />
          <span className="text-xl font-semibold text-gray-900">ScholarCheck</span>
        </div>
      </header>

      <main className="flex flex-1">
        {/* ===== LEFT COLUMN - Welcome / Background ===== */}
        <div className="flex-col justify-start hidden w-1/2 p-12 lg:flex bg-green-50">
          <h2 className="text-[20px] font-bold leading-[24px] text-black mb-2">
            Welcome to
          </h2>
          <p className="text-[40px] font-bold leading-[48px] text-green-800">
            ScholarCheck
          </p>
        </div>

        {/* ===== RIGHT COLUMN - Signup Form on plain background ===== */}
        <div className="flex flex-col justify-start flex-1 p-20">
          <h2 className="text-[25px] font-bold text-black mb-2">Sign Up</h2>
          <p className="mb-6 text-base font-normal text-black">
            Please enter your details to create an account.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col max-w-md gap-4">
            {/* Full Name Input */}
            <div className="flex flex-col gap-1">
              <label htmlFor="fullName" className="text-sm font-medium text-black">
                Full Name
              </label>
                <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-2 border rounded-lg border-black/10 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                required
                />
            </div>

            {/* Email Input */}
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium text-black">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border rounded-lg border-black/10 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                required
              />
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="text-sm font-medium text-black">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2 border rounded-lg border-black/10 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute w-6 h-6 -translate-y-1/2 right-3 top-1/2"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <img
                    src={showPassword ? EyeOffIcon : EyeIcon}
                    alt={showPassword ? "Hide password" : "Show password"}
                    className="object-contain w-full h-full"
                  />
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-black">
                  Confirm Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-2 border rounded-lg border-black/10 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute w-6 h-6 -translate-y-1/2 right-3 top-1/2"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <img
                    src={showPassword ? EyeOffIcon : EyeIcon}
                    alt={showPassword ? "Hide password" : "Show password"}
                    className="object-contain w-full h-full"
                  />
                </button>
              </div>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              className="w-full py-3 font-semibold text-white transition-colors bg-green-800 rounded-xl hover:bg-green-900"
            >
              Sign Up
            </button>
          </form>

          {/* Log In Link */}
          <p className="mt-6 text-center text-black">
            Already have an account?{" "}
            <Link to="/login" className="text-green-800 hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="py-6 text-center bg-white border-t border-gray-200">
        <p className="text-sm text-black">© 2026 ScholarCheck. All rights reserved.</p>
      </footer>
    </div>
  );
}
