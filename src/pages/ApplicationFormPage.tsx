// src/pages/ApplicationFormPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Layout } from "../components/Layout";

import ConfirmModal from "../modals/ConfirmModal";
import StatusBannerModal from "../modals/StatusBannerModal";

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

const genders = ["Male", "Female"];

export default function ApplicationFormPage() {
  const initialForm: FormState = {
    firstName: "",
    middleName: "",
    lastName: "",
    extension: "",
    dob: "",
    gender: "",
    address: "",
    phone: "",
    email: "",

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
  };

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [existing, setExisting] = useState<ApplicationDto | null>(null);
  const [readOnly, setReadOnly] = useState(false);

  // confirmation + banners
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [bannerOpen, setBannerOpen] = useState(false);
  const [bannerVariant, setBannerVariant] = useState<"success" | "error" | "info">("info");
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerMessage, setBannerMessage] = useState("");

  const inputBase =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed";

  const labelBase = "mb-1 block text-[13px] font-semibold text-gray-700";
  const sectionTitle = "text-[15px] font-bold text-gray-900";
  const sectionWrap = "mt-6";

  const fileItems = useMemo(
    () =>
      [
        { key: "certificateOfResidency", label: "Certificate of Residency*" },
        { key: "indigencyCertificate", label: "Certificate of Indigency*" },
        {
          key: "governmentID",
          label:
            "Government-issued ID (PhilSys National ID/PHUMID/Passport, Driver’s License, Voter’s ID, etc)*",
        },
        { key: "certificateOfEnrollment", label: "Certificate of Enrollment*" },
        { key: "assessmentForm", label: "Assessment Form*" },
      ] as { key: FileFieldName; label: string }[],
    []
  );

  function openBanner(variant: "success" | "error" | "info", title: string, message: string) {
    setBannerVariant(variant);
    setBannerTitle(title);
    setBannerMessage(message);
    setBannerOpen(true);
  }

  function fillFromExisting(app: ApplicationDto) {
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

      // cannot prefill files in browser
      certificateOfResidency: null,
      indigencyCertificate: null,
      governmentID: null,
      certificateOfEnrollment: null,
      assessmentForm: null,
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
          // lock after submit; edit only if Pending
          setReadOnly(true);
        } else {
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    // require files on first submit only
    if (!existing) {
      const fileRequired: FileFieldName[] = [
        "certificateOfResidency",
        "indigencyCertificate",
        "governmentID",
        "certificateOfEnrollment",
        "assessmentForm",
      ];
      fileRequired.forEach((k) => {
        if (!form[k]) newErrors[k] = "File required";
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (readOnly) return;

    const { name, value } = e.target;
    const fieldName = name as TextFieldName;

    let newValue = value;

    const letterOnlyFields: TextFieldName[] = ["firstName", "middleName", "lastName", "extension"];
    const parentNameFields: TextFieldName[] = ["fatherName", "motherName"];
    const occupationFields: TextFieldName[] = ["fatherOccupation", "motherOccupation"];
    const numberFields: TextFieldName[] = ["fatherIncome", "motherIncome"];
    const phoneFields: TextFieldName[] = ["fatherPhone", "motherPhone", "phone"];
    const addressFields: TextFieldName[] = ["address"];

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

    if (addressFields.includes(fieldName)) {
      newValue = newValue.slice(0, 50);
    }

    setForm((prev) => ({ ...prev, [fieldName]: newValue }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;

    const { name, files } = e.target;
    const fieldName = name as FileFieldName;

    if (files && files.length > 0) {
      const file = files[0];
      const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];

      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: "Only PDF, PNG, JPG allowed.",
        }));
        setForm((prev) => ({ ...prev, [fieldName]: null }));
        return;
      }

      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
      setForm((prev) => ({ ...prev, [fieldName]: file }));
    }
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
      const fd = buildFormData();

      if (!existing) {
        await submitApplication(fd);
      } else {
        await updateMyApplication(fd);
      }

      const updated = await getMyApplication();
      setExisting(updated);
      if (updated) fillFromExisting(updated);

      setConfirmOpen(false);
      setReadOnly(true);

      openBanner(
        "success",
        "Submission Successful!",
        "You have successfully submitted your application. Please allow time for review. Once approved, you will be certified and included in the blockchain logging process."
      );
    } catch (e: any) {
      openBanner("error", "Submission Failed", e?.message || "Failed to submit your application.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleClear = () => {
    if (readOnly) return;
    setForm(initialForm);
    setErrors({});
  };

  const canEdit = !!existing && existing.status === "Pending";

  return (
    <Layout>
      <div className="px-2 pt-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-[26px] md:text-[32px] font-bold text-gray-900">Application Form</h1>
            <p className="mt-1 text-[15px] md:text-[16px] text-gray-600">Keep your information up-to-date</p>
          </div>

          {existing && (
            <div className="flex items-center gap-2">
              <span
                className={[
                  "inline-flex items-center rounded-xl px-3 py-1.5 text-[12px] font-semibold",
                  existing.status === "Pending"
                    ? "bg-[#FFEDD4] text-[#AB2D00]"
                    : existing.status === "Approved"
                    ? "bg-[#DBFCE7] text-[#637C30]"
                    : "bg-[#FFE2E2] text-[#B51D37]",
                ].join(" ")}
              >
                {existing.status}
              </span>

              {readOnly && canEdit && (
                <button
                  type="button"
                  onClick={() => setReadOnly(false)}
                  className="rounded-md border border-emerald-700 bg-white px-6 py-2 text-[13px] font-semibold text-gray-800 hover:bg-gray-50"
                >
                  Edit
                </button>
              )}
            </div>
          )}
        </div>

        {loading && <p className="mt-4 text-[14px] text-gray-600">Loading...</p>}

        {!loading && loadError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {loadError}
          </div>
        )}

        {!loading && existing && existing.status !== "Pending" && (
          <div
            className={[
              "mt-4 rounded-lg border px-4 py-3 text-[13px] leading-relaxed",
              existing.status === "Approved"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700",
            ].join(" ")}
          >
            {existing.status === "Approved"
              ? "Your application has been approved. This account will be certified and included in the blockchain logging process."
              : "Your application has been declined. If you believe this is a mistake, contact the scholarship office."}
          </div>
        )}
      </div>

      <div className="mt-5">
        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-5xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div>
            <div className={sectionTitle}>Personal Information</div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className={labelBase}>First Name *</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} className={inputBase} disabled={readOnly} />
                {errors.firstName && <p className="mt-1 text-[12px] text-red-600">{errors.firstName}</p>}
              </div>

              <div>
                <label className={labelBase}>Middle Name *</label>
                <input name="middleName" value={form.middleName} onChange={handleChange} className={inputBase} disabled={readOnly} />
                {errors.middleName && <p className="mt-1 text-[12px] text-red-600">{errors.middleName}</p>}
              </div>

              <div>
                <label className={labelBase}>Last Name *</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} className={inputBase} disabled={readOnly} />
                {errors.lastName && <p className="mt-1 text-[12px] text-red-600">{errors.lastName}</p>}
              </div>

              <div>
                <label className={labelBase}>Extension (optional)</label>
                <input name="extension" value={form.extension} onChange={handleChange} className={inputBase} disabled={readOnly} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className={labelBase}>Date Of Birth *</label>
                <input type="date" name="dob" value={form.dob} onChange={handleChange} className={inputBase} disabled={readOnly} />
                {errors.dob && <p className="mt-1 text-[12px] text-red-600">{errors.dob}</p>}
              </div>

              <div>
                <label className={labelBase}>Gender (M/F)*</label>
                <select name="gender" value={form.gender} onChange={handleChange} className={inputBase} disabled={readOnly}>
                  <option value="">Select option</option>
                  {genders.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                {errors.gender && <p className="mt-1 text-[12px] text-red-600">{errors.gender}</p>}
              </div>

              <div>
                <label className={labelBase}>Address *</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className={inputBase}
                  placeholder="Enter your address (Barangay, Province)"
                  disabled={readOnly}
                />
                {errors.address && <p className="mt-1 text-[12px] text-red-600">{errors.address}</p>}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className={labelBase}>Phone Number *</label>
                <input name="phone" value={form.phone} onChange={handleChange} className={inputBase} disabled={readOnly} />
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
                <input name="fatherName" value={form.fatherName} onChange={handleChange} className={inputBase} disabled={readOnly} />
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
                <input name="fatherIncome" value={form.fatherIncome} onChange={handleChange} className={inputBase} disabled={readOnly} />
                {errors.fatherIncome && <p className="mt-1 text-[12px] text-red-600">{errors.fatherIncome}</p>}
              </div>

              <div>
                <label className={labelBase}>Phone Number*</label>
                <input name="fatherPhone" value={form.fatherPhone} onChange={handleChange} className={inputBase} disabled={readOnly} />
                {errors.fatherPhone && <p className="mt-1 text-[12px] text-red-600">{errors.fatherPhone}</p>}
              </div>
            </div>
          </div>

          <div className={sectionWrap}>
            <div className={sectionTitle}>Mother&apos;s Information</div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelBase}>Full Name *</label>
                <input name="motherName" value={form.motherName} onChange={handleChange} className={inputBase} disabled={readOnly} />
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
                <input name="motherIncome" value={form.motherIncome} onChange={handleChange} className={inputBase} disabled={readOnly} />
                {errors.motherIncome && <p className="mt-1 text-[12px] text-red-600">{errors.motherIncome}</p>}
              </div>

              <div>
                <label className={labelBase}>Phone Number*</label>
                <input name="motherPhone" value={form.motherPhone} onChange={handleChange} className={inputBase} disabled={readOnly} />
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
                <select name="govGrant" value={form.govGrant} onChange={handleChange} className={inputBase} disabled={readOnly}>
                  <option value="">Select option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {errors.govGrant && <p className="mt-1 text-[12px] text-red-600">{errors.govGrant}</p>}
              </div>
            </div>
          </div>

          <div className={sectionWrap}>
            <div className={sectionTitle}>Documents</div>

            {existing && (
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 text-[13px]">
                {existing.certificateOfResidencyUrl && (
                  <a className="text-emerald-800 underline" href={existing.certificateOfResidencyUrl} target="_blank" rel="noreferrer">
                    View Certificate of Residency
                  </a>
                )}
                {existing.indigencyCertificateUrl && (
                  <a className="text-emerald-800 underline" href={existing.indigencyCertificateUrl} target="_blank" rel="noreferrer">
                    View Certificate of Indigency
                  </a>
                )}
                {existing.governmentIDUrl && (
                  <a className="text-emerald-800 underline" href={existing.governmentIDUrl} target="_blank" rel="noreferrer">
                    View Government ID
                  </a>
                )}
                {existing.certificateOfEnrollmentUrl && (
                  <a className="text-emerald-800 underline" href={existing.certificateOfEnrollmentUrl} target="_blank" rel="noreferrer">
                    View Certificate of Enrollment
                  </a>
                )}
                {existing.assessmentFormUrl && (
                  <a className="text-emerald-800 underline" href={existing.assessmentFormUrl} target="_blank" rel="noreferrer">
                    View Assessment Form
                  </a>
                )}
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
              {fileItems.map((item) => (
                <div key={item.key}>
                  <label className={labelBase}>{item.label}</label>

                  <div className="relative">
                    <input
                      type="file"
                      name={item.key}
                      onChange={handleFileChange}
                      accept=".pdf,.png,.jpg,.jpeg"
                      disabled={readOnly}
                      className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                    />
                    <div className="flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2.5 text-[14px] text-gray-600">
                      <span className="truncate">{form[item.key]?.name ? form[item.key]!.name : "Choose File"}</span>
                      <span className="ml-3 shrink-0 rounded bg-gray-100 px-2 py-1 text-[12px] text-gray-700">Browse</span>
                    </div>
                  </div>

                  {errors[item.key] && <p className="mt-1 text-[12px] text-red-600">{errors[item.key]}</p>}
                </div>
              ))}
            </div>

            {existing && canEdit && !readOnly && (
              <p className="mt-3 text-[12px] text-gray-600">You may re-upload documents if you need to replace them.</p>
            )}
          </div>

          <div className="mt-10 flex justify-center gap-3">
            <button
              type="submit"
              disabled={readOnly}
              className={[
                "rounded-md px-10 py-3 text-[14px] font-semibold text-white",
                readOnly ? "bg-green-800/50 cursor-not-allowed" : "bg-green-800 hover:bg-green-900",
              ].join(" ")}
            >
              {existing ? "Save" : "Submit"}
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={readOnly}
              className={[
                "rounded-md px-10 py-3 text-[14px] font-semibold text-white",
                readOnly ? "bg-gray-400/50 cursor-not-allowed" : "bg-gray-400 hover:bg-gray-500",
              ].join(" ")}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* ✅ Confirm modal (Are you sure?) */}
      <ConfirmModal
        isOpen={confirmOpen}
        title="Confirm Submission"
        message="Are you sure you want to submit your application? Please make sure all your details are accurate before submitting."
        confirmText={existing ? "Save" : "Submit"}
        cancelText="Cancel"
        loading={submitLoading}
        onConfirm={handleConfirmSubmit}
        onClose={() => setConfirmOpen(false)}
      />

      {/* ✅ Success/Error banner */}
      <StatusBannerModal
        isOpen={bannerOpen}
        variant={bannerVariant}
        title={bannerTitle}
        message={bannerMessage}
        onClose={() => {
          setBannerOpen(false);
          // after success, keep locked
          setReadOnly(true);
        }}
      />
    </Layout>
  );
}