import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Logo from "../img/PRIMARY.png";

export default function EmailVerificationPage() {
  const [code, setCode] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // only digits

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 3) inputRefs[index + 1].current?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.some((d) => d === "")) {
      setError("Please enter the 4-digit code.");
      return;
    }

    setError("");
    setLoading(true);
    setTimeout(() => {
      alert(`Code entered: ${code.join("")}`);
      setLoading(false);
    }, 1000);
  };

  const handleResend = () => {
    alert("Verification code resent!");
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
            <h2 className="mb-2 text-xl font-bold text-black">Email Verification</h2>
            <p className="text-4xl font-bold text-green-800">ScholarCheck</p>
            <p className="mt-4 text-sm text-gray-700">
              Enter the 4-digit code we sent to your email address.
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex justify-center flex-1 px-4 py-10 sm:px-6 sm:py-12">
          <div className="w-full max-w-md">
            <h2 className="text-2xl sm:text-[25px] font-bold text-black mb-2">
              Email Verification
            </h2>
            <p className="mb-6 text-sm text-black sm:text-base">
              Enter the 4-digit code we sent to your email address.
            </p>

            <form onSubmit={handleVerify} className="flex flex-col gap-4">
              {/* 4-digit inputs */}
              <div className="flex justify-between gap-2 mb-2">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={inputRefs[i]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="text-xl text-center border rounded-lg w-14 h-14 focus:outline-none focus:ring-2 focus:ring-green-800"
                    required
                  />
                ))}
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              {/* Resend link beside text */}
              <div className="flex items-center justify-center gap-1 mb-4 text-sm">
                <span>Didn't receive code?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-green-800 hover:underline"
                >
                  Resend
                </button>
              </div>

              {/* VERIFY BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-xl py-3 font-semibold text-white transition-colors ${
                  loading ? "bg-green-800/60 cursor-not-allowed" : "bg-green-800 hover:bg-green-900"
                }`}
              >
                {loading ? "Verifying..." : "Verify"}
              </button>

              <p className="mt-6 text-sm text-center text-black sm:text-base">
                Remembered your password?{" "}
                <Link to="/login" className="text-green-800 hover:underline">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="flex items-center justify-center w-full h-20 text-center bg-white border-t border-gray-200">
        <p className="px-4 text-xs text-black sm:text-sm">
          © 2026 ScholarCheck. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
