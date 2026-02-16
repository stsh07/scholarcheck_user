import React from "react";

interface OtpModalProps {
  email: string;
  otp: string;
  setOtp: (otp: string) => void;
  onClose: () => void;
  onProceed: () => void;
  loadingOtp: boolean;
  loadingSignup: boolean;
  requestResendOtp: () => void;
}

export default function OtpModal({
  email,
  otp,
  setOtp,
  onClose,
  onProceed,
  loadingOtp,
  loadingSignup,
  requestResendOtp,
}: OtpModalProps) {
  // OTP helpers
  const setOtpDigit = (index: number, digit: string) => {
    const sanitized = digit.replace(/\D/g, "");
    if (!sanitized) return;

    const chars = otp.split("");
    chars[index] = sanitized[0];
    const nextOtp = chars.join("").slice(0, 6);

    setOtp(nextOtp);

    const next = document.getElementById(
      `otp-${index + 1}`
    ) as HTMLInputElement | null;
    if (next) next.focus();
  };

  const clearOtpDigit = (index: number) => {
    const chars = otp.split("");
    chars[index] = "";
    setOtp(chars.join(""));

    const prev = document.getElementById(
      `otp-${index - 1}`
    ) as HTMLInputElement | null;
    if (prev) prev.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-x-hidden bg-black/50">
      <div className="w-full max-w-md p-6 overflow-x-hidden bg-white shadow-lg sm:p-8 rounded-2xl">
        <h3 className="mb-2 text-xl font-bold text-black">Email Verification</h3>
        <p className="mb-4 text-sm text-black break-words">
          A One-Time Password (OTP) has been sent to{" "}
          <strong className="break-words">{email}</strong>. Please enter the 6-digit code below to verify your account.
        </p>

        {/* OTP INPUTS */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          {[...Array(6)].map((_, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otp[index] || ""}
              onChange={(e) => setOtpDigit(index, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace") {
                  e.preventDefault();
                  clearOtpDigit(index);
                }
              }}
              title={`OTP digit ${index + 1}`}
              placeholder="0"
              className="w-10 h-10 text-xl text-center border rounded-lg sm:w-12 sm:h-12 border-black/10 focus:outline-none focus:ring-2 focus:ring-green-800"
            />
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          {/* RESEND OTP */}
          <button
            type="button"
            onClick={requestResendOtp}
            disabled={loadingOtp}
            className={`text-sm text-green-800 hover:underline ${
              loadingOtp ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loadingOtp ? "Resending..." : "Resend OTP"}
          </button>

          {/* PROCEED BUTTON */}
          <button
            type="button"
            disabled={otp.length !== 6 || loadingSignup}
            onClick={onProceed}
            className={`w-full sm:w-auto px-4 py-2 text-white rounded-lg ${
              otp.length === 6 && !loadingSignup
                ? "bg-green-800 hover:bg-green-900"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loadingSignup ? "Creating..." : "Proceed"}
          </button>
        </div>

        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className="absolute text-gray-500 top-3 right-3 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
