import { useState } from "react";
import { Layout } from "../components/Layout";

export default function ApplicationFormPage() {
  // ===============================
  // Form state
  // ===============================
  const initialForm = {
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
    certificateOfResidency: null as File | null,
    indigencyCertificate: null as File | null,
    governmentID: null as File | null,
    certificateOfEnrollment: null as File | null,
    assessmentForm: null as File | null,
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const genders = ["Male", "Female"];

  // ===============================
  // Handle input changes
  // ===============================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    const letterOnlyFields = ["firstName", "middleName", "lastName", "extension"];
    const parentNameFields = ["fatherName", "motherName"];
    const occupationFields = ["fatherOccupation", "motherOccupation"];
    const numberFields = ["fatherIncome", "motherIncome"];
    const phoneFields = ["fatherPhone", "motherPhone"];
    const addressFields = ["address"];

    let newValue = value;

    if (letterOnlyFields.includes(name)) {
      newValue = value.replace(/[^A-Za-z]/g, "");
      if (name === "firstName") newValue = newValue.slice(0, 25);
      else newValue = newValue.slice(0, 15);
    }

    if (parentNameFields.includes(name)) {
      newValue = value.replace(/[^A-Za-z. ]/g, "").slice(0, 50);
    }

    if (occupationFields.includes(name)) {
      newValue = value.replace(/[^A-Za-z ]/g, "").slice(0, 20);
    }

    if (numberFields.includes(name)) {
      newValue = value.replace(/[^0-9]/g, "");
      newValue = newValue.slice(0, 6);
    }

    if (phoneFields.includes(name)) {
      newValue = value.replace(/[^0-9]/g, "");
      newValue = newValue.slice(0, 11);
    }

    if (addressFields.includes(name)) {
      newValue = newValue.slice(0, 50);
    }

    setForm((prev) => ({ ...prev, [name]: newValue }));
  };

  // ===============================
  // File change with type validation
  // ===============================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, [name]: "Only PDF, PNG, JPG allowed." }));
        setForm((prev) => ({ ...prev, [name]: null }));
        return;
      }
      setErrors((prev) => ({ ...prev, [name]: "" }));
      setForm((prev) => ({ ...prev, [name]: file }));
    }
  };

  // ===============================
  // Handle blur validation
  // ===============================
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        if (!form.fatherOccupation) newErrors.fatherOccupation = "Father's occupation required.";
        break;
      case "fatherIncome":
        if (!form.fatherIncome) newErrors.fatherIncome = "Father's income required.";
        break;
      case "fatherPhone":
        if (!form.fatherPhone) newErrors.fatherPhone = "Father's phone required.";
        break;
      case "motherName":
        if (!form.motherName) newErrors.motherName = "Mother's name required.";
        break;
      case "motherOccupation":
        if (!form.motherOccupation) newErrors.motherOccupation = "Mother's occupation required.";
        break;
      case "motherIncome":
        if (!form.motherIncome) newErrors.motherIncome = "Mother's income required.";
        break;
      case "motherPhone":
        if (!form.motherPhone) newErrors.motherPhone = "Mother's phone required.";
        break;
      case "certificateOfResidency":
      case "indigencyCertificate":
      case "governmentID":
      case "certificateOfEnrollment":
      case "assessmentForm":
        if (!form[name as keyof typeof form]) newErrors[name] = "File required.";
        break;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
  };

  // ===============================
  // Full form validation
  // ===============================
  const validateForm = () => {
    const fields = [
      "firstName","middleName","lastName","dob","gender","address",
      "fatherName","fatherOccupation","fatherIncome","fatherPhone",
      "motherName","motherOccupation","motherIncome","motherPhone",
      "certificateOfResidency","indigencyCertificate","governmentID",
      "certificateOfEnrollment","assessmentForm"
    ];
    fields.forEach(validateField);
    return Object.values(errors).every((e) => e === "");
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
            {[
              { name: "firstName", label: "First Name" },
              { name: "middleName", label: "Middle Name" },
              { name: "lastName", label: "Last Name" },
              { name: "extension", label: "Extension" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block mb-1 font-medium">{field.label} *</label>
                <input
                  name={field.name}
                  value={form[field.name as keyof typeof form]}
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
              {errors.dob && <p className="text-xs text-red-500">{errors.dob}</p>}
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
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
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
              {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
            </div>
          </div>

        </section>

        {/* Parent Info */}
        <section>
          <h2 className="mt-4 mb-2 text-xl font-bold">Father's Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { name: "fatherName", label: "Full Name" },
              { name: "fatherOccupation", label: "Occupation" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block mb-1 font-medium">{field.label} *</label>
                <input
                  name={field.name}
                  value={form[field.name as keyof typeof form]}
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

          <div className="grid grid-cols-1 gap-4 mt-2 sm:grid-cols-2">
            {[
              { name: "fatherIncome", label: "Monthly Income" },
              { name: "fatherPhone", label: "Phone Number" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block mb-1 font-medium">{field.label} *</label>
                <input
                  name={field.name}
                  value={form[field.name as keyof typeof form]}
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

          <h2 className="mt-4 mb-2 text-xl font-bold">Mother's Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { name: "motherName", label: "Full Name" },
              { name: "motherOccupation", label: "Occupation" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block mb-1 font-medium">{field.label} *</label>
                <input
                  name={field.name}
                  value={form[field.name as keyof typeof form]}
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

          <div className="grid grid-cols-1 gap-4 mt-2 sm:grid-cols-2">
            {[
              { name: "motherIncome", label: "Monthly Income" },
              { name: "motherPhone", label: "Phone Number" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block mb-1 font-medium">{field.label} *</label>
                <input
                  name={field.name}
                  value={form[field.name as keyof typeof form]}
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
        </section>

        {/* Documents */}
        <section>
          <h2 className="mt-4 mb-2 text-xl font-bold">Documents</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { key: "certificateOfResidency", label: "Certificate of Residency" },
              { key: "indigencyCertificate", label: "Indigency Certificate" },
              { key: "governmentID", label: "Government ID" },
              { key: "certificateOfEnrollment", label: "Certificate of Enrollment" },
              { key: "assessmentForm", label: "Assessment Form" },
            ].map((file) => (
              <div key={file.key}>
                <label className="block mb-1 font-medium">{file.label} *</label>
                <input
                  type="file"
                  name={file.key}
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border rounded"
                />
                {errors[file.key] && (
                  <p className="text-xs text-red-500">{errors[file.key]}</p>
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
            Delete
          </button>
        </div>
      </form>
    </Layout>
  );
}
