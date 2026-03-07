// src/pages/ApplicationFormPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Layout } from "../components/Layout";
import ConfirmSubmissionModal from "../modals/ConfirmSubmissionModal";
import StatusBannerModal from "../modals/StatusBannerModal";
import SaveChangesModal from "../modals/SaveChangesModal";

import {
  getMyApplication,
  submitApplication,
  updateMyApplication,
  type ApplicationDto,
} from "../api/applications";

type FormState = {
  firstName: string;
  middleName: string;
  lastName: string;
  extension: string;
  dob: string;
  gender: string;
  address: string;
  phone: string;
  email: string;

  fatherName: string;
  fatherOccupation: string;
  fatherIncome: string;
  fatherPhone: string;

  motherName: string;
  motherOccupation: string;
  motherIncome: string;
  motherPhone: string;

  govGrant: string;

  certificateOfResidency: File | null;
  indigencyCertificate: File | null;
  governmentID: File | null;
  certificateOfEnrollment: File | null;
  assessmentForm: File | null;
};

type TextFieldName = keyof Omit<
  FormState,
  | "certificateOfResidency"
  | "indigencyCertificate"
  | "governmentID"
  | "certificateOfEnrollment"
  | "assessmentForm"
>;

type FileFieldName = keyof Pick<
  FormState,
  | "certificateOfResidency"
  | "indigencyCertificate"
  | "governmentID"
  | "certificateOfEnrollment"
  | "assessmentForm"
>;

type CustomSelectProps = {
  name: string;
  value: string;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  onChange: (e: { target: { name: string; value: string } }) => void;
};

type StoredUser = {
  id?: number | string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

const genders = ["Male", "Female"];

const ADDRESS_OPTIONS = [
  "Bayambang, Pangasinan",
  "Calasiao, Pangasinan",
  "Malasiqui, Pangasinan",
  "Mapandan, Pangasinan",
  "San Carlos, Pangasinan",
  "Sta. Barbara, Pangasinan",
];

function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem("scholarcheck_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={[
        "h-4 w-4 shrink-0 text-gray-600 transition-transform duration-150",
        open ? "rotate-180" : "",
      ].join(" ")}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CustomSelect({
  name,
  value,
  options,
  placeholder,
  disabled = false,
  onChange,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const showGreen = open && !disabled;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        name={name}
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen((prev) => !prev);
        }}
        className={[
          "flex w-full items-center justify-between rounded-md border bg-white px-3 py-2.5 text-left text-[14px] text-gray-900 outline-none transition-colors duration-150",
          disabled
            ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-600"
            : showGreen
            ? "border-green-800 ring-2 ring-green-200"
            : "border-gray-300",
        ].join(" ")}
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {value || placeholder}
        </span>

        <span className="ml-3 flex items-center">
          <ChevronDownIcon open={open} />
        </span>
      </button>

      {open && !disabled && (
        <div className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-md border border-green-800 bg-white shadow-lg">
          {options.map((option) => {
            const isSelected = value === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange({ target: { name, value: option } });
                  setOpen(false);
                }}
                className={[
                  "block w-full px-3 py-2 text-left text-[14px] transition-colors",
                  isSelected
                    ? "bg-green-100 text-green-900"
                    : "bg-white text-gray-800 hover:bg-green-800 hover:text-white",
                ].join(" ")}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ApplicationFormPage() {
  const storedUser = useMemo(() => getStoredUser(), []);

  const initialForm: FormState = useMemo(
    () => ({
      firstName: storedUser?.firstName || "",
      middleName: "",
      lastName: storedUser?.lastName || "",
      extension: "",
      dob: "",
      gender: "",
      address: "",
      phone: "",
      email: storedUser?.email || "",

      fatherName: "",
      fatherOccupation: "",
      fatherIncome: "",
      fatherPhone: "",

      motherName: "",
      motherOccupation: "",
      motherIncome: "",
      motherPhone: "",

      govGrant: "",

      certificateOfResidency: null,
      indigencyCertificate: null,
      governmentID: null,
      certificateOfEnrollment: null,
      assessmentForm: null,
    }),
    [storedUser]
  );

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [existing, setExisting] = useState<ApplicationDto | null>(null);
  const [readOnly, setReadOnly] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [bannerOpen, setBannerOpen] = useState(false);
  const [bannerVariant, setBannerVariant] = useState<"success" | "error" | "info">("info");
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerMessage, setBannerMessage] = useState("");

  const [saveChangesModalOpen, setSaveChangesModalOpen] = useState(false);

  const inputRefs = useRef<Partial<Record<FileFieldName, HTMLInputElement | null>>>({});
  const [removeFiles, setRemoveFiles] = useState<Partial<Record<FileFieldName, boolean>>>({});

  const objectUrlMapRef = useRef<Partial<Record<FileFieldName, string>>>({});

  const container = "mx-auto w-full max-w-6xl";

  const inputBase =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none transition-colors duration-150 focus:border-green-800 focus:ring-2 focus:ring-green-200 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed";

  const labelBase = "mb-1 block text-[13px] font-semibold text-gray-700";
  const sectionTitle = "text-[17px] md:text-[18px] font-bold text-gray-900";
  const sectionWrap = "mt-7";

  const fileItems = useMemo(
    () =>
      [
        {
          key: "certificateOfResidency",
          label: "Certificate of Residency*",
          existingUrlKey: "certificateOfResidencyUrl",
        },
        {
          key: "indigencyCertificate",
          label: "Certificate of Indigency*",
          existingUrlKey: "indigencyCertificateUrl",
        },
        {
          key: "governmentID",
          label:
            "Government-Issued ID * (PhilSys National ID/ePhilID, Passport, Driver's License, Voter's ID, etc.)",
          existingUrlKey: "governmentIDUrl",
        },
        {
          key: "certificateOfEnrollment",
          label: "Certificate of Enrollment *",
          existingUrlKey: "certificateOfEnrollmentUrl",
        },
        {
          key: "assessmentForm",
          label: "Assessment Form *",
          existingUrlKey: "assessmentFormUrl",
        },
      ] as {
        key: FileFieldName;
        label: string;
        existingUrlKey:
          | "certificateOfResidencyUrl"
          | "indigencyCertificateUrl"
          | "governmentIDUrl"
          | "certificateOfEnrollmentUrl"
          | "assessmentFormUrl";
      }[],
    []
  );

  function getApplicationIdentity(app: ApplicationDto | null) {
    if (!app) return `email:${storedUser?.email || "guest"}`;
    const maybeId = (app as any)?.id ?? (app as any)?._id ?? app.email ?? storedUser?.email;
    return String(maybeId || "guest");
  }

  function getEditUsedKey(app: ApplicationDto | null) {
    return `scholarcheck_application_edit_used:${getApplicationIdentity(app)}`;
  }

  function hasUsedOneEdit(app: ApplicationDto | null) {
    try {
      return localStorage.getItem(getEditUsedKey(app)) === "true";
    } catch {
      return false;
    }
  }

  function markOneEditUsed(app: ApplicationDto | null) {
    try {
      localStorage.setItem(getEditUsedKey(app), "true");
    } catch {
      //
    }
  }

  const editAlreadyUsed = hasUsedOneEdit(existing);
  const canEditPending = !!existing && existing.status === "Pending";
  const canEditOnce = canEditPending && !editAlreadyUsed;

  const canModifyDocs = !readOnly && (!existing || (existing.status === "Pending" && !editAlreadyUsed));

  function openBanner(variant: "success" | "error" | "info", title: string, message: string) {
    setBannerVariant(variant);
    setBannerTitle(title);
    setBannerMessage(message);
    setBannerOpen(true);
  }

  function revokeObjectUrl(field: FileFieldName) {
    const existingUrl = objectUrlMapRef.current[field];
    if (existingUrl) {
      URL.revokeObjectURL(existingUrl);
      delete objectUrlMapRef.current[field];
    }
  }

  function setFileValue(field: FileFieldName, file: File | null) {
    revokeObjectUrl(field);
    setForm((prev) => ({ ...prev, [field]: file }));
  }

  function getSelectedFileUrl(field: FileFieldName) {
    const file = form[field];
    if (!file) return "";

    const existingUrl = objectUrlMapRef.current[field];
    if (existingUrl) return existingUrl;

    const nextUrl = URL.createObjectURL(file);
    objectUrlMapRef.current[field] = nextUrl;
    return nextUrl;
  }

  function openFile(field: FileFieldName, serverUrl?: string) {
    const selectedFile = form[field];

    if (selectedFile) {
      const localUrl = getSelectedFileUrl(field);
      if (localUrl) window.open(localUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (serverUrl) {
      window.open(serverUrl, "_blank", "noopener,noreferrer");
    }
  }

  function fillFromExisting(app: ApplicationDto) {
    (Object.keys(objectUrlMapRef.current) as FileFieldName[]).forEach((field) => {
      revokeObjectUrl(field);
    });

    setForm({
      firstName: app.firstName || "",
      middleName: app.middleName || "",
      lastName: app.lastName || "",
      extension: app.extension || "",
      dob: app.dob || "",
      gender: app.gender || "",
      address: app.address || "",
      phone: app.phone || "",
      email: app.email || "",

      fatherName: app.fatherName || "",
      fatherOccupation: app.fatherOccupation || "",
      fatherIncome: app.fatherIncome || "",
      fatherPhone: app.fatherPhone || "",

      motherName: app.motherName || "",
      motherOccupation: app.motherOccupation || "",
      motherIncome: app.motherIncome || "",
      motherPhone: app.motherPhone || "",

      govGrant: app.govGrant || "",

      certificateOfResidency: null,
      indigencyCertificate: null,
      governmentID: null,
      certificateOfEnrollment: null,
      assessmentForm: null,
    });

    setRemoveFiles({});
    setErrors({});

    (Object.keys(inputRefs.current) as FileFieldName[]).forEach((k) => {
      const el = inputRefs.current[k];
      if (el) el.value = "";
    });
  }

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const app = await getMyApplication();
        if (!mounted) return;

        setExisting(app);

        if (app) {
          fillFromExisting(app);
          setReadOnly(true);
        } else {
          setForm((prev) => ({
            ...prev,
            firstName: storedUser?.firstName || "",
            lastName: storedUser?.lastName || "",
            email: storedUser?.email || "",
          }));
          setReadOnly(false);
        }
      } catch (e: any) {
        if (!mounted) return;
        setLoadError(e?.message || "Failed to load application.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
      (Object.keys(objectUrlMapRef.current) as FileFieldName[]).forEach((field) => {
        revokeObjectUrl(field);
      });
    };
  }, [storedUser]);

  function validateForm() {
    const newErrors: Record<string, string> = {};
    const today = new Date();

    const required: TextFieldName[] = [
      "firstName",
      "middleName",
      "lastName",
      "dob",
      "gender",
      "address",
      "phone",
      "email",
      "fatherName",
      "fatherOccupation",
      "fatherIncome",
      "fatherPhone",
      "motherName",
      "motherOccupation",
      "motherIncome",
      "motherPhone",
      "govGrant",
    ];

    required.forEach((k) => {
      if (!String(form[k] ?? "").trim()) newErrors[k] = "Required";
    });

    if (form.dob) {
      const dobDate = new Date(form.dob);
      const age = today.getFullYear() - dobDate.getFullYear();
      if (age > 75) newErrors.dob = "Age cannot be above 75.";
      if (age < 16) newErrors.dob = "Must be at least 16 years old.";
    }

    const fileRequired: FileFieldName[] = [
      "certificateOfResidency",
      "indigencyCertificate",
      "governmentID",
      "certificateOfEnrollment",
      "assessmentForm",
    ];

    if (!existing) {
      fileRequired.forEach((k) => {
        if (!form[k]) newErrors[k] = "File required";
      });
    } else if (existing.status === "Pending") {
      fileRequired.forEach((k) => {
        const item = fileItems.find((f) => f.key === k);
        const existingUrl = item ? ((existing as any)[item.existingUrlKey] as string) : "";
        const hasServerFile = !!existingUrl && !removeFiles[k];
        const hasNewFile = !!form[k];

        if (!hasServerFile && !hasNewFile) {
          newErrors[k] = "File required";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string } }
  ) => {
    if (readOnly) return;

    const { name, value } = e.target;
    const fieldName = name as TextFieldName;

    let newValue = value;

    const letterOnlyFields: TextFieldName[] = ["firstName", "middleName", "lastName", "extension"];
    const parentNameFields: TextFieldName[] = ["fatherName", "motherName"];
    const occupationFields: TextFieldName[] = ["fatherOccupation", "motherOccupation"];
    const numberFields: TextFieldName[] = ["fatherIncome", "motherIncome"];
    const phoneFields: TextFieldName[] = ["fatherPhone", "motherPhone", "phone"];

    if (letterOnlyFields.includes(fieldName)) {
      newValue = value.replace(/[^A-Za-z]/g, "");
      if (fieldName === "firstName") newValue = newValue.slice(0, 25);
      else newValue = newValue.slice(0, 15);
    }

    if (parentNameFields.includes(fieldName)) {
      newValue = value.replace(/[^A-Za-z. ]/g, "").slice(0, 50);
    }

    if (occupationFields.includes(fieldName)) {
      newValue = value.replace(/[^A-Za-z ]/g, "").slice(0, 20);
    }

    if (numberFields.includes(fieldName)) {
      newValue = value.replace(/[^0-9]/g, "").slice(0, 6);
    }

    if (phoneFields.includes(fieldName)) {
      newValue = value.replace(/[^0-9]/g, "").slice(0, 11);
    }

    setForm((prev) => ({ ...prev, [fieldName]: newValue }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canModifyDocs) return;

    const { name, files } = e.target;
    const fieldName = name as FileFieldName;

    if (!files || files.length === 0) return;

    const file = files[0];
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "Only PDF, PNG, and JPG files are allowed.",
      }));

      const el = inputRefs.current[fieldName];
      if (el) el.value = "";
      setFileValue(fieldName, null);
      return;
    }

    setRemoveFiles((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });

    setErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));

    setFileValue(fieldName, file);
  };

  const handleX = (fieldName: FileFieldName, hasServerFile: boolean) => {
    if (!canModifyDocs) return;

    if (hasServerFile) {
      setRemoveFiles((prev) => ({ ...prev, [fieldName]: true }));
    }

    setFileValue(fieldName, null);

    setErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));

    const el = inputRefs.current[fieldName];
    if (el) el.value = "";
  };

  function buildFormData() {
    const fd = new FormData();

    fd.append("firstName", form.firstName);
    fd.append("middleName", form.middleName);
    fd.append("lastName", form.lastName);
    fd.append("extension", form.extension);

    fd.append("dob", form.dob);
    fd.append("gender", form.gender);
    fd.append("address", form.address);
    fd.append("phone", form.phone);
    fd.append("email", form.email);

    fd.append("fatherName", form.fatherName);
    fd.append("fatherOccupation", form.fatherOccupation);
    fd.append("fatherIncome", form.fatherIncome);
    fd.append("fatherPhone", form.fatherPhone);

    fd.append("motherName", form.motherName);
    fd.append("motherOccupation", form.motherOccupation);
    fd.append("motherIncome", form.motherIncome);
    fd.append("motherPhone", form.motherPhone);

    fd.append("govGrant", form.govGrant);

    if (form.certificateOfResidency) fd.append("certificateOfResidency", form.certificateOfResidency);
    if (form.indigencyCertificate) fd.append("indigencyCertificate", form.indigencyCertificate);
    if (form.governmentID) fd.append("governmentID", form.governmentID);
    if (form.certificateOfEnrollment) fd.append("certificateOfEnrollment", form.certificateOfEnrollment);
    if (form.assessmentForm) fd.append("assessmentForm", form.assessmentForm);

    fd.append("removeFiles", JSON.stringify(removeFiles));

    return fd;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    if (!validateForm()) return;
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setSubmitLoading(true);
    try {
      const isEditingExisting = !!existing;

      const fd = buildFormData();

      if (!existing) {
        await submitApplication(fd);
      } else {
        await updateMyApplication(fd);
      }

      const updated = await getMyApplication();
      setExisting(updated);
      if (updated) fillFromExisting(updated);

      if (isEditingExisting) {
        markOneEditUsed(updated || existing);
      }

      setConfirmOpen(false);
      setReadOnly(true);

      if (isEditingExisting) {
        setSaveChangesModalOpen(true);
      } else {
        openBanner(
          "success",
          "Submission Successful!",
          "You have successfully submitted your application. Please allow time for review. You may edit your application once while it is still pending."
        );
      }
    } catch (e: any) {
      openBanner("error", "Submission Failed", e?.message || "Failed to submit your application.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleClear = () => {
    if (readOnly) return;

    (Object.keys(objectUrlMapRef.current) as FileFieldName[]).forEach((field) => {
      revokeObjectUrl(field);
    });

    setForm({
      ...initialForm,
      firstName: storedUser?.firstName || "",
      lastName: storedUser?.lastName || "",
      email: storedUser?.email || "",
    });

    setErrors({});
    setRemoveFiles({});

    (Object.keys(inputRefs.current) as FileFieldName[]).forEach((k) => {
      const el = inputRefs.current[k];
      if (el) el.value = "";
    });
  };

  const statusPillClass =
    existing &&
    [
      "inline-flex items-center rounded-xl px-3 py-1.5 text-[12px] font-semibold",
      existing.status === "Pending"
        ? "bg-[#FFEDD4] text-[#AB2D00]"
        : existing.status === "Approved"
        ? "bg-[#DBFCE7] text-[#637C30]"
        : "bg-[#FFE2E2] text-[#B51D37]",
    ].join(" ");

  return (
    <Layout>
      <div className={[container, "px-2 pt-2"].join(" ")}>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#111827] sm:text-[24px] md:text-[26px]">
              Application Form
            </h1>
            <p className="mt-1 text-[13px] font-semibold text-[#6b7280]">
              Keep your information up-to-date
            </p>
          </div>

          {existing && (
            <div className="flex items-center gap-2">
              <span className={statusPillClass || ""}>{existing.status}</span>
            </div>
          )}
        </div>

        {loading && <p className="mt-4 text-[14px] text-gray-600">Loading...</p>}

        {!loading && loadError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {loadError}
          </div>
        )}

        {!loading && existing && (
          <div className="mt-4 rounded-xl border border-gray-200 bg-[#f6f7f6] px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[14px] font-bold text-[#111827]">Application Submitted</div>
                <p className="mt-1 text-[12px] leading-relaxed text-gray-600">
                  You can edit your application once. Click the &quot;Edit Application&quot; button to make changes.
                </p>
                {editAlreadyUsed && (
                  <p className="mt-1 text-[12px] text-gray-500">
                    You have already used your one allowed edit.
                  </p>
                )}
              </div>

              {readOnly && canEditOnce && (
                <button
                  type="button"
                  onClick={() => setReadOnly(false)}
                  className="inline-flex h-[36px] items-center justify-center rounded-md bg-green-800 px-5 text-[12px] font-semibold text-white hover:bg-green-900"
                >
                  Edit Application
                </button>
              )}
            </div>
          </div>
        )}

        {!loading && existing && existing.status !== "Pending" && (
          <div
            className={[
              "mt-4 rounded-lg border px-4 py-3 text-[13px] leading-relaxed",
              existing.status === "Approved"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-700",
            ].join(" ")}
          >
            {existing.status === "Approved"
              ? "Your application has been approved. Your account is now verified for scholarship processing."
              : "Your application has been declined. If you believe this is a mistake, contact the scholarship office."}
          </div>
        )}
      </div>

      <div className={[container, "mt-5"].join(" ")}>
        <form onSubmit={handleSubmit} className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <div className={sectionTitle}>Personal Information</div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className={labelBase}>First Name *</label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className={inputBase}
                  disabled={readOnly}
                />
                {errors.firstName && <p className="mt-1 text-[12px] text-red-600">{errors.firstName}</p>}
              </div>

              <div>
                <label className={labelBase}>Middle Name *</label>
                <input
                  name="middleName"
                  value={form.middleName}
                  onChange={handleChange}
                  className={inputBase}
                  disabled={readOnly}
                />
                {errors.middleName && <p className="mt-1 text-[12px] text-red-600">{errors.middleName}</p>}
              </div>

              <div>
                <label className={labelBase}>Last Name *</label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className={inputBase}
                  disabled={readOnly}
                />
                {errors.lastName && <p className="mt-1 text-[12px] text-red-600">{errors.lastName}</p>}
              </div>

              <div>
                <label className={labelBase}>Extension (optional)</label>
                <input
                  name="extension"
                  value={form.extension}
                  onChange={handleChange}
                  className={inputBase}
                  disabled={readOnly}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className={labelBase}>Date Of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  value={form.dob}
                  onChange={handleChange}
                  className={inputBase}
                  disabled={readOnly}
                />
                {errors.dob && <p className="mt-1 text-[12px] text-red-600">{errors.dob}</p>}
              </div>

              <div>
                <label className={labelBase}>Gender (M/F)*</label>
                <CustomSelect
                  name="gender"
                  value={form.gender}
                  options={genders}
                  placeholder="Select option"
                  disabled={readOnly}
                  onChange={handleChange}
                />
                {errors.gender && <p className="mt-1 text-[12px] text-red-600">{errors.gender}</p>}
              </div>

              <div>
                <label className={labelBase}>Address *</label>
                <CustomSelect
                  name="address"
                  value={form.address}
                  options={ADDRESS_OPTIONS}
                  placeholder="Select address"
                  disabled={readOnly}
                  onChange={handleChange}
                />
                {errors.address && <p className="mt-1 text-[12px] text-red-600">{errors.address}</p>}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className={labelBase}>Phone Number *</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputBase}
                  disabled={readOnly}
                />
                {errors.phone && <p className="mt-1 text-[12px] text-red-600">{errors.phone}</p>}
              </div>

              <div>
                <label className={labelBase}>Email Address *</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputBase}
                  disabled={readOnly}
                />
                {errors.email && <p className="mt-1 text-[12px] text-red-600">{errors.email}</p>}
              </div>

              <div />
            </div>
          </div>

          <div className={sectionWrap}>
            <div className={sectionTitle}>Father&apos;s Information</div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelBase}>Full Name *</label>
                <input
                  name="fatherName"
                  value={form.fatherName}
                  onChange={handleChange}
                  className={inputBase}
                  disabled={readOnly}
                />
                {errors.fatherName && <p className="mt-1 text-[12px] text-red-600">{errors.fatherName}</p>}
              </div>

              <div>
                <label className={labelBase}>Occupation *</label>
                <input
                  name="fatherOccupation"
                  value={form.fatherOccupation}
                  onChange={handleChange}
                  className={inputBase}
                  disabled={readOnly}
                />
                {errors.fatherOccupation && <p className="mt-1 text-[12px] text-red-600">{errors.fatherOccupation}</p>}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelBase}>Monthly Income *</label>
                <input
                  name="fatherIncome"
                  value={form.fatherIncome}
                  onChange={handleChange}
                  className={inputBase}
                  disabled={readOnly}
                />
                {errors.fatherIncome && <p className="mt-1 text-[12px] text-red-600">{errors.fatherIncome}</p>}
              </div>

              <div>
                <label className={labelBase}>Phone Number*</label>
                <input
                  name="fatherPhone"
                  value={form.fatherPhone}
                  onChange={handleChange}
                  className={inputBase}
                  disabled={readOnly}
                />
                {errors.fatherPhone && <p className="mt-1 text-[12px] text-red-600">{errors.fatherPhone}</p>}
              </div>
            </div>
          </div>

          <div className={sectionWrap}>
            <div className={sectionTitle}>Mother&apos;s Information</div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelBase}>Full Name *</label>
                <input
                  name="motherName"
                  value={form.motherName}
                  onChange={handleChange}
                  className={inputBase}
                  disabled={readOnly}
                />
                {errors.motherName && <p className="mt-1 text-[12px] text-red-600">{errors.motherName}</p>}
              </div>

              <div>
                <label className={labelBase}>Occupation *</label>
                <input
                  name="motherOccupation"
                  value={form.motherOccupation}
                  onChange={handleChange}
                  className={inputBase}
                  disabled={readOnly}
                />
                {errors.motherOccupation && <p className="mt-1 text-[12px] text-red-600">{errors.motherOccupation}</p>}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelBase}>Monthly Income *</label>
                <input
                  name="motherIncome"
                  value={form.motherIncome}
                  onChange={handleChange}
                  className={inputBase}
                  disabled={readOnly}
                />
                {errors.motherIncome && <p className="mt-1 text-[12px] text-red-600">{errors.motherIncome}</p>}
              </div>

              <div>
                <label className={labelBase}>Phone Number*</label>
                <input
                  name="motherPhone"
                  value={form.motherPhone}
                  onChange={handleChange}
                  className={inputBase}
                  disabled={readOnly}
                />
                {errors.motherPhone && <p className="mt-1 text-[12px] text-red-600">{errors.motherPhone}</p>}
              </div>
            </div>
          </div>

          <div className={sectionWrap}>
            <div className={sectionTitle}>Scholarship History</div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelBase}>
                  Have you received any government grants or financial aid in the last 3 months? *
                </label>
                <CustomSelect
                  name="govGrant"
                  value={form.govGrant}
                  options={["Yes", "No"]}
                  placeholder="Select option"
                  disabled={readOnly}
                  onChange={handleChange}
                />
                {errors.govGrant && <p className="mt-1 text-[12px] text-red-600">{errors.govGrant}</p>}
              </div>
            </div>
          </div>

          <div className={sectionWrap}>
            <div className={sectionTitle}>Documents</div>

            <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-3">
              {fileItems.map((item) => {
                const selected = form[item.key];
                const existingUrl = existing ? ((existing as any)[item.existingUrlKey] as string) : "";
                const hasServerFile = !!existingUrl && !removeFiles[item.key];
                const isSelected = !!selected || hasServerFile;
                const disableChoose = !canModifyDocs || isSelected;
                const showX = canModifyDocs && isSelected;
                const canView = !!selected || hasServerFile;

                return (
                  <div key={item.key}>
                    <label className="mb-2 block text-[12px] font-medium leading-snug text-gray-700">
                      {item.label}
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        ref={(el) => {
                          inputRefs.current[item.key] = el;
                        }}
                        id={item.key}
                        type="file"
                        name={item.key}
                        onChange={handleFileChange}
                        accept=".pdf,.png,.jpg,.jpeg"
                        disabled={disableChoose}
                        className="hidden"
                      />

                      <div className="flex h-[42px] w-full items-center justify-between rounded-[6px] border border-[#cfcfcf] bg-white px-[8px]">
                        <label
                          htmlFor={item.key}
                          className={[
                            "inline-flex h-[28px] min-w-[94px] items-center justify-center rounded-[4px] border border-[#bfbfbf] bg-[#ebebeb] px-3 text-[12px] leading-none text-[#555]",
                            disableChoose ? "cursor-not-allowed text-[#b8b8b8]" : "cursor-pointer hover:bg-[#e3e3e3]",
                          ].join(" ")}
                        >
                          Choose File
                        </label>

                        {canView ? (
                          <button
                            type="button"
                            onClick={() => openFile(item.key, hasServerFile ? existingUrl : "")}
                            className="ml-3 flex-1 truncate text-right text-[12px] text-blue-600 underline underline-offset-2 hover:text-blue-700"
                            title="View uploaded file"
                          >
                            File selected
                          </button>
                        ) : (
                          <span className="ml-3 flex-1 truncate text-right text-[12px] text-[#4b4b4b]">
                            {isSelected ? "File selected" : ""}
                          </span>
                        )}
                      </div>

                      {showX && (
                        <button
                          type="button"
                          onClick={() => handleX(item.key, hasServerFile)}
                          className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-[6px] border border-[#cfcfcf] bg-white text-[13px] text-gray-600 hover:bg-gray-50"
                          title="Remove file"
                          aria-label="Remove file"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {errors[item.key] && <p className="mt-2 text-[12px] text-red-600">{errors[item.key]}</p>}
                  </div>
                );
              })}
            </div>

            {!readOnly && canEditOnce && (
              <p className="mt-3 text-[12px] text-gray-600">
                Click the file text to view it, or click ✕ to remove a selected document if you want to choose a different file.
              </p>
            )}
          </div>

          <div className="mt-10 flex justify-center gap-3">
            <button
              type="submit"
              disabled={readOnly}
              className={[
                "rounded-md px-10 py-3 text-[14px] font-semibold text-white",
                readOnly ? "cursor-not-allowed bg-green-800/50" : "bg-green-800 hover:bg-green-900",
              ].join(" ")}
            >
              {existing ? "Save Changes" : "Submit"}
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={readOnly}
              className={[
                "rounded-md px-10 py-3 text-[14px] font-semibold text-white",
                readOnly ? "cursor-not-allowed bg-gray-400/50" : "bg-gray-400 hover:bg-gray-500",
              ].join(" ")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <ConfirmSubmissionModal
        isOpen={confirmOpen}
        mode={existing ? "edit" : "submit"}
        loading={submitLoading}
        onConfirm={handleConfirmSubmit}
        onClose={() => setConfirmOpen(false)}
      />

      <StatusBannerModal
        isOpen={bannerOpen}
        variant={bannerVariant}
        title={bannerTitle}
        message={bannerMessage}
        onClose={() => {
          setBannerOpen(false);
          setReadOnly(true);
        }}
      />

      <SaveChangesModal
        isOpen={saveChangesModalOpen}
        onClose={() => setSaveChangesModalOpen(false)}
      />
    </Layout>
  );
}