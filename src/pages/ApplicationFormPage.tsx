// src/pages/ApplicationFormPage.tsx
import React, { useMemo, useState } from "react";
import { Layout } from "../components/Layout";

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

  const inputBase =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200";

  const labelBase = "mb-1 block text-[13px] font-semibold text-gray-700";
  const sectionTitle = "text-[15px] font-bold text-gray-900";
  const sectionWrap = "mt-6";

  function validateForm() {
    const newErrors: Record<string, string> = {};
    const today = new Date();

    const required: TextFieldName[] = [
      "firstName",
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
    fileRequired.forEach((k) => {
      if (!form[k]) newErrors[k] = "File required";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const fieldName = name as TextFieldName;

    let newValue = value;

    const letterOnlyFields: TextFieldName[] = [
      "firstName",
      "middleName",
      "lastName",
      "extension",
    ];
    const parentNameFields: TextFieldName[] = ["fatherName", "motherName"];
    const occupationFields: TextFieldName[] = [
      "fatherOccupation",
      "motherOccupation",
    ];
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) alert("Form submitted successfully!");
  };

  const handleClear = () => {
    setForm(initialForm);
    setErrors({});
  };

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

  return (
    <Layout>
      <div className="px-2 pt-2">
        <h1 className="text-[26px] md:text-[32px] font-bold text-gray-900">
          Application Form
        </h1>
        <p className="mt-1 text-[15px] md:text-[16px] text-gray-600">
          Keep your information up-to-date
        </p>
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
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className={inputBase}
                />
                {errors.firstName && (
                  <p className="mt-1 text-[12px] text-red-600">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className={labelBase}>Middle Name *</label>
                <input
                  name="middleName"
                  value={form.middleName}
                  onChange={handleChange}
                  className={inputBase}
                />
                {errors.middleName && (
                  <p className="mt-1 text-[12px] text-red-600">
                    {errors.middleName}
                  </p>
                )}
              </div>

              <div>
                <label className={labelBase}>Last Name *</label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className={inputBase}
                />
                {errors.lastName && (
                  <p className="mt-1 text-[12px] text-red-600">
                    {errors.lastName}
                  </p>
                )}
              </div>

              <div>
                <label className={labelBase}>Extension (optional)</label>
                <input
                  name="extension"
                  value={form.extension}
                  onChange={handleChange}
                  className={inputBase}
                  placeholder=""
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
                />
                {errors.dob && (
                  <p className="mt-1 text-[12px] text-red-600">{errors.dob}</p>
                )}
              </div>

              <div>
                <label className={labelBase}>Gender (M/F)*</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className={inputBase}
                >
                  <option value="">Select option</option>
                  {genders.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                {errors.gender && (
                  <p className="mt-1 text-[12px] text-red-600">
                    {errors.gender}
                  </p>
                )}
              </div>

              <div>
                <label className={labelBase}>Address *</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className={inputBase}
                  placeholder="Enter your address (Barangay, Province)"
                />
                {errors.address && (
                  <p className="mt-1 text-[12px] text-red-600">
                    {errors.address}
                  </p>
                )}
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
                />
                {errors.phone && (
                  <p className="mt-1 text-[12px] text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className={labelBase}>Email Address *</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputBase}
                />
                {errors.email && (
                  <p className="mt-1 text-[12px] text-red-600">{errors.email}</p>
                )}
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
                />
                {errors.fatherName && (
                  <p className="mt-1 text-[12px] text-red-600">
                    {errors.fatherName}
                  </p>
                )}
              </div>

              <div>
                <label className={labelBase}>Occupation *</label>
                <input
                  name="fatherOccupation"
                  value={form.fatherOccupation}
                  onChange={handleChange}
                  className={inputBase}
                />
                {errors.fatherOccupation && (
                  <p className="mt-1 text-[12px] text-red-600">
                    {errors.fatherOccupation}
                  </p>
                )}
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
                />
                {errors.fatherIncome && (
                  <p className="mt-1 text-[12px] text-red-600">
                    {errors.fatherIncome}
                  </p>
                )}
              </div>

              <div>
                <label className={labelBase}>Phone Number*</label>
                <input
                  name="fatherPhone"
                  value={form.fatherPhone}
                  onChange={handleChange}
                  className={inputBase}
                />
                {errors.fatherPhone && (
                  <p className="mt-1 text-[12px] text-red-600">
                    {errors.fatherPhone}
                  </p>
                )}
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
                />
                {errors.motherName && (
                  <p className="mt-1 text-[12px] text-red-600">
                    {errors.motherName}
                  </p>
                )}
              </div>

              <div>
                <label className={labelBase}>Occupation *</label>
                <input
                  name="motherOccupation"
                  value={form.motherOccupation}
                  onChange={handleChange}
                  className={inputBase}
                />
                {errors.motherOccupation && (
                  <p className="mt-1 text-[12px] text-red-600">
                    {errors.motherOccupation}
                  </p>
                )}
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
                />
                {errors.motherIncome && (
                  <p className="mt-1 text-[12px] text-red-600">
                    {errors.motherIncome}
                  </p>
                )}
              </div>

              <div>
                <label className={labelBase}>Phone Number*</label>
                <input
                  name="motherPhone"
                  value={form.motherPhone}
                  onChange={handleChange}
                  className={inputBase}
                />
                {errors.motherPhone && (
                  <p className="mt-1 text-[12px] text-red-600">
                    {errors.motherPhone}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className={sectionWrap}>
            <div className={sectionTitle}>Scholarship History</div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelBase}>
                  Have you received any government grants or financial aid in the
                  last 3 months? *
                </label>
                <select
                  name="govGrant"
                  value={form.govGrant}
                  onChange={handleChange}
                  className={inputBase}
                >
                  <option value="">Select option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {errors.govGrant && (
                  <p className="mt-1 text-[12px] text-red-600">
                    {errors.govGrant}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className={sectionWrap}>
            <div className={sectionTitle}>Documents</div>

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
                      className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                    />
                    <div className="flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2.5 text-[14px] text-gray-600">
                      <span className="truncate">
                        {form[item.key]?.name
                          ? form[item.key]!.name
                          : "Choose File"}
                      </span>
                      <span className="ml-3 shrink-0 rounded bg-gray-100 px-2 py-1 text-[12px] text-gray-700">
                        Browse
                      </span>
                    </div>
                  </div>

                  {errors[item.key] && (
                    <p className="mt-1 text-[12px] text-red-600">
                      {errors[item.key]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex justify-center gap-3">
            <button
              type="submit"
              className="rounded-md bg-green-800 px-10 py-3 text-[14px] font-semibold text-white hover:bg-green-900"
            >
              Submit
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="rounded-md bg-gray-400 px-10 py-3 text-[14px] font-semibold text-white hover:bg-gray-500"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}