import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../img/PRIMARY.png";
import EyeIcon from "../img/Eye.png";
import EyeOffIcon from "../img/Hide.png";
import { login } from "../api/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(password)) {
      alert(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    try {
      setLoading(true);

      const res = await login({ email: email.trim(), password });

      localStorage.setItem("scholarcheck_accessToken", res.accessToken);
      localStorage.setItem("scholarcheck_refreshToken", res.refreshToken);
      localStorage.setItem("scholarcheck_user", JSON.stringify(res.user));

      alert(res.message);
      navigate("/");
    } catch (err: any) {
      alert(err?.message || "Login failed. Check email/password.");
    } finally {
      setLoading(false);
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
            <h2 className="mb-2 text-xl font-bold text-black">Welcome Back to</h2>
            <p className="text-4xl font-bold leading-tight text-green-800">ScholarCheck</p>
            <p className="mt-4 text-sm text-gray-700">
              Log in to access your account and continue your scholarship journey.
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex w-full flex-1 items-start justify-center px-4 sm:px-6 py-10 sm:py-12">
          <div className="w-full max-w-md">
            <h2 className="text-2xl sm:text-[25px] font-bold text-black mb-2">Log In</h2>
            <p className="mb-6 text-sm sm:text-base font-normal text-black">
              Please enter your credentials to access your account.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  className="w-full max-w-full rounded-lg border border-black/10 px-4 py-3 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                  required
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1 min-w-0">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <label htmlFor="password" className="text-sm font-medium text-black">
                    Password
                  </label>
                  <Link to="/forgot-password" className="shrink-0 text-sm text-green-800 hover:underline">
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
                    className="w-full max-w-full rounded-lg border border-black/10 px-4 py-3 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
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

            <p className="mt-6 text-center text-black text-sm sm:text-base">
              Don't have an account?{" "}
              <Link to="/signup" className="text-green-800 hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-gray-200 bg-white py-6 text-center">
        <p className="px-4 text-xs sm:text-sm text-black">
          © 2026 ScholarCheck. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
