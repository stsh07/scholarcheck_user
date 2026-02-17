// src/pages/ApplicationFormPage.tsx
import React, { useState } from "react";
import { Layout } from "../components/Layout";

type FormState = {
  firstName: string;
  middleName: string;
  lastName: string;
  extension: string;
  dob: string;
  gender: string;
  address: string;

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

export default function ApplicationFormPage() {
  // ===============================
  // Form state
  // ===============================
  const initialForm: FormState = {
    firstName: "",
    middleName: "",
    lastName: "",
    extension: "",
    dob: "",
    gender: "",
    address: "",

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
  const genders = ["Male", "Female"];

  // ===============================
  // Handle input changes (TEXT + SELECT ONLY)
  // ===============================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Only allow text/select fields here
    const fieldName = name as TextFieldName;

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
    const phoneFields: TextFieldName[] = ["fatherPhone", "motherPhone"];
    const addressFields: TextFieldName[] = ["address"];

    let newValue = value;

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

  // ===============================
  // File change with type validation
  // ===============================
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

  // ===============================
  // Handle blur validation
  // ===============================
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    validateField(e.target.name);
  };

  // ===============================
  // Validate single field
  // ===============================
  const validateField = (name: string) => {
    const newErrors: Record<string, string> = {};
    const today = new Date();

    switch (name) {
      case "firstName":
        if (!form.firstName) newErrors.firstName = "First Name is required.";
        break;
      case "middleName":
        if (!form.middleName) newErrors.middleName = "Middle Name is required.";
        break;
      case "lastName":
        if (!form.lastName) newErrors.lastName = "Last Name is required.";
        break;
      case "dob":
        if (!form.dob) newErrors.dob = "Date of Birth required.";
        else {
          const dobDate = new Date(form.dob);
          const age = today.getFullYear() - dobDate.getFullYear();
          if (age > 75) newErrors.dob = "Age cannot be above 75.";
          if (age < 16) newErrors.dob = "You must be at least 16 years old.";
        }
        break;
      case "gender":
        if (!form.gender) newErrors.gender = "Gender required.";
        break;
      case "address":
        if (!form.address) newErrors.address = "Address required.";
        break;

      case "fatherName":
        if (!form.fatherName) newErrors.fatherName = "Father's name required.";
        break;
      case "fatherOccupation":
        if (!form.fatherOccupation)
          newErrors.fatherOccupation = "Father's occupation required.";
        break;
      case "fatherIncome":
        if (!form.fatherIncome)
          newErrors.fatherIncome = "Father's income required.";
        break;
      case "fatherPhone":
        if (!form.fatherPhone)
          newErrors.fatherPhone = "Father's phone required.";
        break;

      case "motherName":
        if (!form.motherName) newErrors.motherName = "Mother's name required.";
        break;
      case "motherOccupation":
        if (!form.motherOccupation)
          newErrors.motherOccupation = "Mother's occupation required.";
        break;
      case "motherIncome":
        if (!form.motherIncome)
          newErrors.motherIncome = "Mother's income required.";
        break;
      case "motherPhone":
        if (!form.motherPhone)
          newErrors.motherPhone = "Mother's phone required.";
        break;

      case "govGrant":
        if (!form.govGrant)
          newErrors.govGrant = "Please select an option.";
        break;

      case "certificateOfResidency":
      case "indigencyCertificate":
      case "governmentID":
      case "certificateOfEnrollment":
      case "assessmentForm": {
        const k = name as FileFieldName;
        if (!form[k]) newErrors[k] = "File required.";
        break;
      }
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
  };

  // ===============================
  // Full form validation (FIXED)
  // ===============================
  const validateForm = () => {
    const fields = [
      "firstName",
      "middleName",
      "lastName",
      "dob",
      "gender",
      "address",
      "fatherName",
      "fatherOccupation",
      "fatherIncome",
      "fatherPhone",
      "motherName",
      "motherOccupation",
      "motherIncome",
      "motherPhone",
      "govGrant",
      "certificateOfResidency",
      "indigencyCertificate",
      "governmentID",
      "certificateOfEnrollment",
      "assessmentForm",
    ];

    // Build errors in one go (avoids stale state issue)
    const newErrors: Record<string, string> = {};
    const today = new Date();

    for (const name of fields) {
      switch (name) {
        case "firstName":
          if (!form.firstName) newErrors.firstName = "First Name is required.";
          break;
        case "middleName":
          if (!form.middleName) newErrors.middleName = "Middle Name is required.";
          break;
        case "lastName":
          if (!form.lastName) newErrors.lastName = "Last Name is required.";
          break;
        case "dob":
          if (!form.dob) newErrors.dob = "Date of Birth required.";
          else {
            const dobDate = new Date(form.dob);
            const age = today.getFullYear() - dobDate.getFullYear();
            if (age > 75) newErrors.dob = "Age cannot be above 75.";
            if (age < 16) newErrors.dob = "You must be at least 16 years old.";
          }
          break;
        case "gender":
          if (!form.gender) newErrors.gender = "Gender required.";
          break;
        case "address":
          if (!form.address) newErrors.address = "Address required.";
          break;

        case "fatherName":
          if (!form.fatherName) newErrors.fatherName = "Father's name required.";
          break;
        case "fatherOccupation":
          if (!form.fatherOccupation)
            newErrors.fatherOccupation = "Father's occupation required.";
          break;
        case "fatherIncome":
          if (!form.fatherIncome)
            newErrors.fatherIncome = "Father's income required.";
          break;
        case "fatherPhone":
          if (!form.fatherPhone)
            newErrors.fatherPhone = "Father's phone required.";
          break;

        case "motherName":
          if (!form.motherName) newErrors.motherName = "Mother's name required.";
          break;
        case "motherOccupation":
          if (!form.motherOccupation)
            newErrors.motherOccupation = "Mother's occupation required.";
          break;
        case "motherIncome":
          if (!form.motherIncome)
            newErrors.motherIncome = "Mother's income required.";
          break;
        case "motherPhone":
          if (!form.motherPhone)
            newErrors.motherPhone = "Mother's phone required.";
          break;

        case "govGrant":
          if (!form.govGrant)
            newErrors.govGrant = "Please select an option.";
          break;

        case "certificateOfResidency":
          if (!form.certificateOfResidency)
            newErrors.certificateOfResidency = "File required.";
          break;
        case "indigencyCertificate":
          if (!form.indigencyCertificate)
            newErrors.indigencyCertificate = "File required.";
          break;
        case "governmentID":
          if (!form.governmentID) newErrors.governmentID = "File required.";
          break;
        case "certificateOfEnrollment":
          if (!form.certificateOfEnrollment)
            newErrors.certificateOfEnrollment = "File required.";
          break;
        case "assessmentForm":
          if (!form.assessmentForm) newErrors.assessmentForm = "File required.";
          break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===============================
  // Handle submit
  // ===============================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) alert("Form submitted successfully!");
  };

  // ===============================
  // Reset form
  // ===============================
  const handleDelete = () => {
    setForm(initialForm);
    setErrors({});
  };

  // ===============================
  // UI
  // ===============================
  const personalFields: { name: TextFieldName; label: string }[] = [
    { name: "firstName", label: "First Name" },
    { name: "middleName", label: "Middle Name" },
    { name: "lastName", label: "Last Name" },
    { name: "extension", label: "Extension" },
  ];

  return (
    <Layout>
      <h1 className="mb-4 text-3xl font-bold">Application Form</h1>

      <form
        onSubmit={handleSubmit}
        className="p-6 mt-6 space-y-6 bg-white border border-gray-200 rounded-lg shadow-sm"
      >
        {/* Personal Information */}
        <section>
          <h2 className="mb-2 text-xl font-bold">Personal Information</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            {personalFields.map((field) => (
              <div key={field.name}>
                <label className="block mb-1 font-medium">{field.label} *</label>
                <input
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={field.label}
                  className="w-full px-3 py-2 border rounded"
                />
                {errors[field.name] && (
                  <p className="text-xs text-red-500">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-3">
            <div>
              <label className="block mb-1 font-medium">Date of Birth *</label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border rounded"
              />
              {errors.dob && (
                <p className="text-xs text-red-500">{errors.dob}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 font-medium">Gender *</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Select Gender</option>
                {genders.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {errors.gender && (
                <p className="text-xs text-red-500">{errors.gender}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 font-medium">Address *</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Address"
                className="w-full px-3 py-2 border rounded"
              />
              {errors.address && (
                <p className="text-xs text-red-500">{errors.address}</p>
              )}
            </div>
          </div>
        </section>

        {/* Parent Info */}
        <section>
          <h2 className="mt-4 mb-2 text-xl font-bold">Father's Information</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-1 font-medium">Full Name *</label>
              <input
                name="fatherName"
                value={form.fatherName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Full Name"
                className="w-full px-3 py-2 border rounded"
              />
              {errors.fatherName && (
                <p className="text-xs text-red-500">{errors.fatherName}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 font-medium">Occupation *</label>
              <input
                name="fatherOccupation"
                value={form.fatherOccupation}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Occupation"
                className="w-full px-3 py-2 border rounded"
              />
              {errors.fatherOccupation && (
                <p className="text-xs text-red-500">
                  {errors.fatherOccupation}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-2 sm:grid-cols-2">
            <div>
              <label className="block mb-1 font-medium">Monthly Income *</label>
              <input
                name="fatherIncome"
                value={form.fatherIncome}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Monthly Income"
                className="w-full px-3 py-2 border rounded"
              />
              {errors.fatherIncome && (
                <p className="text-xs text-red-500">{errors.fatherIncome}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 font-medium">Phone Number *</label>
              <input
                name="fatherPhone"
                value={form.fatherPhone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Phone Number"
                className="w-full px-3 py-2 border rounded"
              />
              {errors.fatherPhone && (
                <p className="text-xs text-red-500">{errors.fatherPhone}</p>
              )}
            </div>
          </div>

          <h2 className="mt-4 mb-2 text-xl font-bold">Mother's Information</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-1 font-medium">Full Name *</label>
              <input
                name="motherName"
                value={form.motherName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Full Name"
                className="w-full px-3 py-2 border rounded"
              />
              {errors.motherName && (
                <p className="text-xs text-red-500">{errors.motherName}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 font-medium">Occupation *</label>
              <input
                name="motherOccupation"
                value={form.motherOccupation}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Occupation"
                className="w-full px-3 py-2 border rounded"
              />
              {errors.motherOccupation && (
                <p className="text-xs text-red-500">
                  {errors.motherOccupation}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-2 sm:grid-cols-2">
            <div>
              <label className="block mb-1 font-medium">Monthly Income *</label>
              <input
                name="motherIncome"
                value={form.motherIncome}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Monthly Income"
                className="w-full px-3 py-2 border rounded"
              />
              {errors.motherIncome && (
                <p className="text-xs text-red-500">{errors.motherIncome}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 font-medium">Phone Number *</label>
              <input
                name="motherPhone"
                value={form.motherPhone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Phone Number"
                className="w-full px-3 py-2 border rounded"
              />
              {errors.motherPhone && (
                <p className="text-xs text-red-500">{errors.motherPhone}</p>
              )}
            </div>
          </div>

          {/* Scholarship History */}
          <h2 className="mt-6 mb-2 text-xl font-bold">Scholarship History</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-1 font-medium">
                Have you received any government grants or financial aid in the
                last 3 months? *
              </label>
              <select
                name="govGrant"
                value={form.govGrant}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              {errors.govGrant && (
                <p className="text-xs text-red-500">{errors.govGrant}</p>
              )}
            </div>
          </div>
        </section>

        {/* Documents */}
        <section>
          <h2 className="mt-4 mb-2 text-xl font-bold">Documents</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {(
              [
                { key: "certificateOfResidency", label: "Certificate of Residency" },
                { key: "indigencyCertificate", label: "Indigency Certificate" },
                { key: "governmentID", label: "Government ID" },
                { key: "certificateOfEnrollment", label: "Certificate of Enrollment" },
                { key: "assessmentForm", label: "Assessment Form" },
              ] as { key: FileFieldName; label: string }[]
            ).map((file) => (
              <div key={file.key}>
                <label className="block mb-1 font-medium">{file.label} *</label>
                <input
                  type="file"
                  name={file.key}
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border rounded"
                  accept=".pdf,.png,.jpg,.jpeg"
                />
                {errors[file.key] && (
                  <p className="text-xs text-red-500">{errors[file.key]}</p>
                )}

                {form[file.key] && (
                  <p className="mt-1 text-xs text-gray-600">
                    Selected: <span className="font-medium">{form[file.key]!.name}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            type="submit"
            className="px-6 py-3 font-semibold text-white bg-green-800 rounded hover:bg-green-900"
          >
            Submit
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="px-6 py-3 font-semibold text-white bg-red-600 rounded hover:bg-red-700"
          >
            Clear
          </button>
        </div>
      </form>
    </Layout>
  );
}
