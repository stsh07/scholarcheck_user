import React from "react";
import { CheckCircle, Shield, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../img/PRIMARY.png"; // relative path

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ===== HEADER ===== */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-300">
        {/* Logo + Site Name */}
        <div className="flex items-center gap-2">
          <img src={Logo} alt="ScholarCheck Logo" className="object-contain w-8 h-8 md:w-10 md:h-10" />
          <span className="text-xl font-semibold text-gray-900">ScholarCheck</span>
        </div>

        {/* LOGIN BUTTON */}
        <Link
          to="/login"
          className="inline-block px-6 py-2 font-medium text-center text-white transition-colors bg-green-800 rounded-md hover:bg-green-900"
        >
          Login
        </Link>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="px-6 py-20 text-center bg-green-50">
        <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">ScholarCheck</h1>
        <p className="max-w-2xl mx-auto mb-8 text-lg leading-relaxed text-gray-700">
          ScholarCheck is your easy-to-use scholarship eligibility platform.
        </p>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="max-w-6xl px-6 py-20 mx-auto">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="p-8 text-center rounded-lg bg-green-50">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white rounded-full">
                <CheckCircle className="w-8 h-8 text-green-800" />
              </div>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900">Fast Scholarship Application</h3>
            <p className="leading-relaxed text-gray-700">
              Submit applications online through a streamlined and accessible system.
            </p>
          </div>

          <div className="p-8 text-center rounded-lg bg-green-50">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white rounded-full">
                <Shield className="w-8 h-8 text-green-800" />
              </div>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900">Blockchain Verified</h3>
            <p className="leading-relaxed text-gray-700">
              Secure records with blockchain-based hash verification for integrity and transparency.
            </p>
          </div>

          <div className="p-8 text-center rounded-lg bg-green-50">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white rounded-full">
                <Lightbulb className="w-8 h-8 text-green-800" />
              </div>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900">AI Guidance</h3>
            <p className="leading-relaxed text-gray-700">
              Get AI assistance to optimize your scholarship applications.
            </p>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="py-6 text-center bg-white border-t border-gray-200">
        <p className="text-sm text-black">© 2026 ScholarCheck. All rights reserved.</p>
      </footer>
    </div>
  );
}
