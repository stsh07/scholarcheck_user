import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";

type ChangePasswordStep = "password" | "otp" | "success";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  onSubmitPasswordChange: (payload: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void>;
  onVerifyOtp: (otp: string) => Promise<void>;
  onResendOtp: () => Promise<void>;
  onSuccessDone?: () => void;
  isSubmittingPassword?: boolean;
  isVerifyingOtp?: boolean;
  isResendingOtp?: boolean;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  email,
  onSubmitPasswordChange,
  onVerifyOtp,
  onResendOtp,
  onSuccessDone,
  isSubmittingPassword = false,
  isVerifyingOtp = false,
  isResendingOtp = false,
}: ChangePasswordModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<ChangePasswordStep>("password");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!isOpen) return;

    setStep("password");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setFieldErrors({});
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpError("");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && step !== "success") {
        onClose();
      }
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        step !== "success"
      ) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, step]);

  useEffect(() => {
    if (step !== "success") return;

    const timer = window.setTimeout(() => {
      onClose();
      onSuccessDone?.();
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [step, onClose, onSuccessDone]);

  useEffect(() => {
    if (step !== "otp") return;

    const timer = window.setTimeout(() => {
      otpRefs.current[0]?.focus();
    }, 50);

    return () => window.clearTimeout(timer);
  }, [step]);

  const otpValue = useMemo(() => otpDigits.join(""), [otpDigits]);

  function validatePasswordStep() {
    const errors: {
      oldPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
      general?: string;
    } = {};

    if (!oldPassword.trim()) {
      errors.oldPassword = "Old password is required.";
    }

    if (!newPassword.trim()) {
      errors.newPassword = "New password is required.";
    } else {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

      if (!passwordRegex.test(newPassword)) {
        errors.newPassword =
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
      }
    }

    if (!confirmPassword.trim()) {
      errors.confirmPassword = "Confirm password is required.";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (
      oldPassword.trim() &&
      newPassword.trim() &&
      oldPassword.trim() === newPassword.trim()
    ) {
      errors.newPassword = "New password must be different from old password.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const isValid = validatePasswordStep();
    if (!isValid) return;

    try {
      await onSubmitPasswordChange({
        oldPassword: oldPassword.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      });
      setStep("otp");
    } catch (error: any) {
      setFieldErrors({
        general:
          error?.message ||
          "Unable to process password change. Please try again.",
      });
    }
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;

    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);
    setOtpError("");

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Backspace") {
      if (otpDigits[index]) {
        const updated = [...otpDigits];
        updated[index] = "";
        setOtpDigits(updated);
        return;
      }

      if (index > 0) {
        otpRefs.current[index - 1]?.focus();
        const updated = [...otpDigits];
        updated[index - 1] = "";
        setOtpDigits(updated);
      }
    }

    if (event.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();

    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const updated = ["", "", "", "", "", ""];
    pasted.split("").forEach((char, i) => {
      updated[i] = char;
    });

    setOtpDigits(updated);
    setOtpError("");

    const targetIndex = Math.min(pasted.length, 5);
    otpRefs.current[targetIndex]?.focus();
  }

  async function handleVerifyOtp() {
    if (otpValue.length !== 6) {
      setOtpError("Please enter the 6-digit code.");
      return;
    }

    try {
      await onVerifyOtp(otpValue);
      setOtpError("");
      setStep("success");
    } catch (error: any) {
      setOtpError(error?.message || "Incorrect OTP.");
    }
  }

  async function handleResendOtpClick() {
    setOtpError("");
    try {
      await onResendOtp();
    } catch (error: any) {
      setOtpError(error?.message || "Failed to resend OTP.");
    }
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-black/45" />

      <div className="fixed inset-0 z-[101] flex items-center justify-center px-4">
        {step === "password" && (
          <div
            ref={modalRef}
            className="w-full max-w-[470px] overflow-hidden rounded-[18px] border border-gray-200 bg-[#F8F8F8] shadow-[0_18px_50px_rgba(0,0,0,0.22)]"
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h2 className="text-[18px] font-semibold text-gray-700">
                Change Password
              </h2>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="px-4 py-4">
              <div className="space-y-3">
                <PasswordInput
                  label="Old Password *"
                  placeholder="Enter old password"
                  value={oldPassword}
                  onChange={(value) => {
                    setOldPassword(value);
                    setFieldErrors((prev) => ({
                      ...prev,
                      oldPassword: undefined,
                      general: undefined,
                    }));
                  }}
                  visible={showOldPassword}
                  onToggleVisibility={() => setShowOldPassword((prev) => !prev)}
                  error={fieldErrors.oldPassword}
                />

                <PasswordInput
                  label="New Password *"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(value) => {
                    setNewPassword(value);
                    setFieldErrors((prev) => ({
                      ...prev,
                      newPassword: undefined,
                      general: undefined,
                    }));
                  }}
                  visible={showNewPassword}
                  onToggleVisibility={() => setShowNewPassword((prev) => !prev)}
                  error={fieldErrors.newPassword}
                />

                <PasswordInput
                  label="Confirm Password *"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(value) => {
                    setConfirmPassword(value);
                    setFieldErrors((prev) => ({
                      ...prev,
                      confirmPassword: undefined,
                      general: undefined,
                    }));
                  }}
                  visible={showConfirmPassword}
                  onToggleVisibility={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  error={fieldErrors.confirmPassword}
                />
              </div>

              {fieldErrors.general ? (
                <p className="mt-3 text-[12px] font-medium text-red-500">
                  {fieldErrors.general}
                </p>
              ) : null}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-[9px] border border-gray-300 bg-[#E5E7EB] px-4 py-[8px] text-[13px] font-medium text-gray-600 transition hover:bg-gray-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="rounded-[9px] bg-[#0B7A22] px-4 py-[8px] text-[13px] font-semibold text-white transition hover:bg-[#09671d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingPassword ? "Saving..." : "Save Password"}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === "otp" && (
          <div
            ref={modalRef}
            className="w-full max-w-[430px] rounded-[18px] border border-gray-200 bg-[#F8F8F8] px-4 py-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)]"
          >
            <h2 className="text-[17px] font-semibold text-gray-800">
              Email Verification
            </h2>

            <p className="mt-3 text-[13px] leading-[1.45] text-gray-700">
              A One-Time Password (OTP) has been sent to{" "}
              <span className="font-semibold text-gray-900">
                {email || "your email"}
              </span>
              . Please enter the 6-digit code below to verify your account.
            </p>

            <div className="mt-5 flex items-center gap-3">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  className="h-[44px] w-[44px] rounded-[14px] border border-gray-300 bg-white text-center text-[22px] font-semibold text-gray-800 outline-none transition focus:border-[#0B7A22] focus:ring-2 focus:ring-green-100"
                />
              ))}
            </div>

            {otpError ? (
              <p className="mt-3 text-[12px] font-medium text-red-500">
                {otpError}
              </p>
            ) : null}

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResendOtpClick}
                disabled={isResendingOtp}
                className="text-[13px] font-medium text-[#0B7A22] hover:underline disabled:opacity-60"
              >
                {isResendingOtp ? "Resending..." : "Resend OTP"}
              </button>

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp}
                className="rounded-[9px] bg-[#0B7A22] px-5 py-[8px] text-[13px] font-semibold text-white transition hover:bg-[#09671d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isVerifyingOtp ? "Checking..." : "Proceed"}
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="fixed left-1/2 top-8 z-[110] w-full max-w-[400px] -translate-x-1/2 rounded-[10px] bg-[#1FA64A] px-6 py-5 text-center shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
            <h3 className="text-[18px] font-bold text-white">
              Password Reset Successful!
            </h3>
            <p className="mt-3 text-[14px] text-white/95">
              Your password has been updated. Redirecting to home...
            </p>
          </div>
        )}
      </div>
    </>
  );
}

interface PasswordInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggleVisibility: () => void;
  error?: string;
}

function PasswordInput({
  label,
  placeholder,
  value,
  onChange,
  visible,
  onToggleVisibility,
  error,
}: PasswordInputProps) {
  return (
    <div>
      <label className="mb-1 block text-[13px] font-semibold text-gray-800">
        {label}
      </label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-[40px] w-full rounded-[8px] border border-gray-300 bg-white px-3 pr-10 text-[13px] text-gray-700 placeholder:text-gray-400 outline-none transition focus:border-[#0B7A22] focus:ring-2 focus:ring-green-100"
        />

        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0B7A22]"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {error ? (
        <p className="mt-1 text-[11px] font-medium text-red-500">{error}</p>
      ) : null}
    </div>
  );
}