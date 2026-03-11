import React, { useEffect, useRef, useState } from "react";
import { Loader2, X, Camera } from "lucide-react";
import { updateUserProfile } from "../api/users";

export type EditForm = {
  fullName: string;
  dob: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
};

export type EditProfileModalProps = {
  open: boolean;
  initial: EditForm;
  initialProfileImage?: string;
  onClose: () => void;
  onSaved: (updated: EditForm, updatedProfileImage?: string) => void;
};

function normalizePhilippineMobileInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  if (digits.length === 1) return digits[0] === "0" ? digits : "";
  if (digits.length >= 2) {
    if (digits[0] !== "0") return "";
    if (digits[1] !== "9") return "0";
  }
  return digits;
}

function isValidPhilippineMobile(value: string) {
  return /^09\d{9}$/.test(value.trim());
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getInitials(fullName: string) {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

function normalizeDobInput(value?: string) {
  if (!value) return "";

  const raw = String(value).trim().slice(0, 10);

  if (!raw || raw === "0000-00-00") return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  return "";
}

function resolveProfileImageUrl(imagePath?: string) {
  if (!imagePath) return "";

  const trimmed = String(imagePath).trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  const apiBase = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  return `${apiBase}${normalizedPath}`;
}

export function EditProfileModal({
  open,
  initial,
  initialProfileImage = "",
  onClose,
  onSaved,
}: EditProfileModalProps) {
  const [form, setForm] = useState<EditForm>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof EditForm, string>>>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>(
    resolveProfileImageUrl(initialProfileImage) || ""
  );

  const overlayRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = new Date();

  useEffect(() => {
    if (open) {
      setForm({
        ...initial,
        dob: normalizeDobInput(initial.dob),
      });
      setErrors({});
      setServerError("");
      setSelectedImageFile(null);
      setPreviewImage(resolveProfileImageUrl(initialProfileImage) || "");
    }
  }, [open, initial, initialProfileImage]);

  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const maxDob = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate())
    .toISOString()
    .split("T")[0];

  const minDob = new Date(today.getFullYear() - 75, today.getMonth(), today.getDate())
    .toISOString()
    .split("T")[0];

  function handleChange(
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
      | { target: { name: string; value: string } }
  ) {
    const { name, value } = e.target;
    let next = value;

    if (name === "phone") next = normalizePhilippineMobileInput(value);
    if (name === "dob") next = normalizeDobInput(value);

    setForm((prev) => ({
      ...prev,
      [name]: next,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }

  function handleChooseImage() {
    if (saving) return;
    fileInputRef.current?.click();
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setServerError("Please upload a JPG, PNG, or WEBP image only.");
      return;
    }

    if (file.size > maxSize) {
      setServerError("Image size must be 5MB or below.");
      return;
    }

    setServerError("");
    setSelectedImageFile(file);

    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
  }

  function validate() {
    const newErrors: Partial<Record<keyof EditForm, string>> = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Required";
    } else if (!isValidEmail(form.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Required";
    } else if (!isValidPhilippineMobile(form.phone)) {
      newErrors.phone = "Enter a valid Philippine mobile number starting with 09.";
    }

    if (!form.address.trim()) {
      newErrors.address = "Required";
    }

    if (form.dob) {
      const [year, month, day] = form.dob.split("-").map(Number);
      const dobDate = new Date(year, (month || 1) - 1, day || 1);

      let age = today.getFullYear() - dobDate.getFullYear();
      const m = today.getMonth() - dobDate.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
        age--;
      }

      if (dobDate > today) newErrors.dob = "Future dates are not allowed.";
      else if (age > 75) newErrors.dob = "Age cannot be above 75.";
      else if (age < 17) newErrors.dob = "Must be at least 17 years old.";
    } else {
      newErrors.dob = "Required";
    }

    if (!form.gender.trim()) {
      newErrors.gender = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    setSaving(true);
    setServerError("");

    try {
      const response = await updateUserProfile(
        {
          fullName: form.fullName,
          dob: form.dob,
          gender: form.gender,
          email: form.email,
          phone: form.phone,
          address: form.address,
        },
        selectedImageFile
      );

      const savedImage =
        response?.profileImage ||
        response?.data?.profileImage ||
        (previewImage && !previewImage.startsWith("blob:") ? previewImage : "") ||
        resolveProfileImageUrl(initialProfileImage);

      onSaved(form, savedImage);
      onClose();
    } catch (e: unknown) {
      setServerError(
        e instanceof Error ? e.message : "Failed to save profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  const initials = getInitials(form.fullName);

  const labelBase = "mb-1 block text-[11px] font-medium text-gray-600";
  const inputBase =
    "h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-[12px] text-gray-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";
  const selectBase =
    "h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-[12px] text-gray-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-4"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full max-w-[500px] rounded-xl border border-gray-200 bg-[#fcfcfc] shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between rounded-t-xl border-b border-gray-200 px-5 py-3">
          <h2 className="text-[14px] font-medium text-gray-700">Edit Profile</h2>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-5 pb-4 pt-3">
          <div className="mb-5 flex justify-center">
            <div className="relative">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile preview"
                  className="h-20 w-20 rounded-full border border-emerald-100 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-[24px] font-semibold text-emerald-700">
                  {initials}
                </div>
              )}

              {!previewImage && (
                <div className="absolute inset-0 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-[24px] font-semibold text-emerald-700">
                  {initials}
                </div>
              )}

              <button
                type="button"
                onClick={handleChooseImage}
                disabled={saving}
                className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-white shadow transition hover:bg-emerald-800 disabled:opacity-50"
                aria-label="Upload profile picture"
                title="Upload profile picture"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {serverError && (
            <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-2.5">
            <div>
              <label className={labelBase}>Full Name</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                className={inputBase}
              />
              {errors.fullName && (
                <p className="mt-1 text-[11px] text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className={labelBase}>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                min={minDob}
                max={maxDob}
                onChange={handleChange}
                className={inputBase}
              />
              {errors.dob && (
                <p className="mt-1 text-[11px] text-red-600">{errors.dob}</p>
              )}
            </div>

            <div>
              <label className={labelBase}>Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={selectBase}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-[11px] text-red-600">{errors.gender}</p>
              )}
            </div>

            <div>
              <label className={labelBase}>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className={inputBase}
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className={labelBase}>Phone Number</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="09XXXXXXXXX"
                inputMode="numeric"
                className={inputBase}
              />
              {errors.phone && (
                <p className="mt-1 text-[11px] text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className={labelBase}>Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={2}
                placeholder="Barangay, Municipality, Province"
                className="w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-[12px] text-gray-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
              {errors.address && (
                <p className="mt-1 text-[11px] text-red-600">{errors.address}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="inline-flex h-8 min-w-[82px] items-center justify-center rounded-md border border-gray-200 bg-white px-4 text-[12px] font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-8 min-w-[106px] items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-[12px] font-medium text-white transition hover:bg-emerald-800 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}