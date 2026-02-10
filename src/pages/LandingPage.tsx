import { CheckCircle, Shield, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../img/PRIMARY.png";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ===== HEADER ===== */}
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

          <Link
            to="/login"
            className="shrink-0 rounded-md bg-green-800 px-4 sm:px-6 py-2 text-sm sm:text-base font-medium text-white transition-colors hover:bg-green-900"
          >
            Login
          </Link>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="w-full bg-green-50">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-14 sm:py-20 text-center">
          <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
            ScholarCheck
          </h1>
          <p className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-gray-700">
            ScholarCheck is your easy-to-use scholarship eligibility platform.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/signup"
              className="w-full sm:w-auto rounded-xl bg-green-800 px-6 py-3 text-center font-semibold text-white hover:bg-green-900 transition-colors"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto rounded-xl border border-green-800 px-6 py-3 text-center font-semibold text-green-800 hover:bg-green-100 transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-14 sm:py-20">
        <div className="grid w-full gap-6 sm:gap-8 md:grid-cols-3">
          <div className="rounded-2xl bg-green-50 p-6 sm:p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-white p-3">
                <CheckCircle className="h-8 w-8 text-green-800" />
              </div>
            </div>
            <h3 className="mb-3 text-lg sm:text-xl font-semibold text-gray-900">
              Fast Scholarship Application
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-gray-700">
              Submit applications online through a streamlined and accessible system.
            </p>
          </div>

          <div className="rounded-2xl bg-green-50 p-6 sm:p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-white p-3">
                <Shield className="h-8 w-8 text-green-800" />
              </div>
            </div>
            <h3 className="mb-3 text-lg sm:text-xl font-semibold text-gray-900">
              Blockchain Verified
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-gray-700">
              Secure records with blockchain-based hash verification for integrity and transparency.
            </p>
          </div>

          <div className="rounded-2xl bg-green-50 p-6 sm:p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-white p-3">
                <Lightbulb className="h-8 w-8 text-green-800" />
              </div>
            </div>
            <h3 className="mb-3 text-lg sm:text-xl font-semibold text-gray-900">
              AI Guidance
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-gray-700">
              Get AI assistance to optimize your scholarship applications.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200 bg-white py-6 text-center">
        <p className="px-4 text-xs sm:text-sm text-black">
          © 2026 ScholarCheck. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
