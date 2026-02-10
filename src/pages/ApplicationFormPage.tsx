import { Layout } from "../components/Layout";

export default function ApplicationFormPage() {
  return (
    <Layout>
      <h1 className="mb-4 text-3xl font-bold">Application Form</h1>
      <p className="text-gray-600">This page will contain your scholarship application form.</p>

      {/* Placeholder content */}
      <div className="p-6 mt-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <p className="text-gray-500">Form content goes here...</p>
      </div>
    </Layout>
  );
}
