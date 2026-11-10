
import { useState } from "react";
import {
  Building2,
  FileCheck2,
  Landmark,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  FileText,
} from "lucide-react";
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const initialForm = {
  company_name: "",
  pan: "",
  gstin: "",
  bank_account_number: "",
  bank_account_holder: "",
  ifsc: "",
};

const documentFields = [
  {
    id: "pan_card",
    label: "PAN Card",
    description: "Upload the company's PAN card.",
  },
  {
    id: "gst_certificate",
    label: "GST Certificate",
    description: "Upload the GST registration certificate.",
  },
  {
    id: "cancelled_cheque",
    label: "Cancelled Cheque",
    description: "Upload a cancelled cheque for bank verification.",
  },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function NewVendor({ onBack }) {
  const [form, setForm] = useState(initialForm);
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-[#15151e] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-500";

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFileChange = (documentId, file) => {
    setDocuments((previous) => ({
      ...previous,
      [documentId]: file || null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value.trim());
      });

      Object.entries(documents).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      const response = await fetch(`${API_URL}/submit-vendor`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to submit vendor application."
        );
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090d] p-6 text-white md:p-10">
      <div className="mx-auto max-w-5xl">

        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="mb-8 flex items-center gap-2 rounded-xl border border-white/10 bg-[#15151e] px-4 py-3 text-sm text-violet-300 transition hover:border-violet-500/40 hover:bg-violet-500/10"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        {/* Page Heading */}
        <div className="mb-8">
          <p className="text-sm text-violet-400">
            PROCUREMENT / NEW APPLICATION
          </p>

          <h1 className="mt-3 text-3xl font-semibold">
            Vendor Registration
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Submit company information and supporting documents for automated verification.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Company Information */}
          <section className="rounded-2xl border border-white/10 bg-[#111119] p-6">
            <div className="mb-6 flex items-center gap-3">
              <Building2 className="text-violet-400" />

              <div>
                <h2 className="font-semibold">Company Information</h2>
                <p className="text-xs text-gray-500">
                  Basic legal entity details
                </p>
              </div>
            </div>

            <label className="text-sm text-gray-300">
              Company Legal Name

              <input
                className={inputClass}
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
                placeholder="Enter registered company name"
                required
              />
            </label>
          </section>

          {/* Tax Information */}
          <section className="rounded-2xl border border-white/10 bg-[#111119] p-6">
            <div className="mb-6 flex items-center gap-3">
              <FileCheck2 className="text-violet-400" />

              <div>
                <h2 className="font-semibold">Tax Information</h2>
                <p className="text-xs text-gray-500">
                  PAN and GST registration details
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm text-gray-300">
                PAN Number

                <input
                  className={inputClass}
                  name="pan"
                  value={form.pan}
                  onChange={handleChange}
                  placeholder="ABCDE1234F"
                  required
                />
              </label>

              <label className="text-sm text-gray-300">
                GSTIN

                <input
                  className={inputClass}
                  name="gstin"
                  value={form.gstin}
                  onChange={handleChange}
                  placeholder="27ABCDE1234F1Z5"
                  required
                />
              </label>
            </div>
          </section>

          {/* Banking Information */}
          <section className="rounded-2xl border border-white/10 bg-[#111119] p-6">
            <div className="mb-6 flex items-center gap-3">
              <Landmark className="text-violet-400" />

              <div>
                <h2 className="font-semibold">Banking Information</h2>
                <p className="text-xs text-gray-500">
                  Vendor payment account details
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm text-gray-300">
                Bank Account Number

                <input
                  className={inputClass}
                  name="bank_account_number"
                  value={form.bank_account_number}
                  onChange={handleChange}
                  placeholder="Enter account number"
                  required
                />
              </label>

              <label className="text-sm text-gray-300">
                Account Holder Name

                <input
                  className={inputClass}
                  name="bank_account_holder"
                  value={form.bank_account_holder}
                  onChange={handleChange}
                  placeholder="Enter account holder name"
                  required
                />
              </label>

              <label className="text-sm text-gray-300 md:col-span-2">
                IFSC Code

                <input
                  className={inputClass}
                  name="ifsc"
                  value={form.ifsc}
                  onChange={handleChange}
                  placeholder="HDFC0001234"
                  required
                />
              </label>
            </div>
          </section>

          {/* Actual Document Uploads */}
          <section className="rounded-2xl border border-white/10 bg-[#111119] p-6">
            <div className="mb-6 flex items-center gap-3">
              <Upload className="text-violet-400" />

              <div>
                <h2 className="font-semibold">Compliance Documents</h2>
                <p className="text-xs text-gray-500">
                  Upload the required supporting documents.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {documentFields.map((document) => (
                <div
                  key={document.id}
                  className="rounded-xl border border-white/10 bg-[#15151e] p-5"
                >
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold">
                      {document.label}
                    </h3>

                    <p className="mt-1 text-xs text-gray-400">
                      {document.description}
                    </p>
                  </div>

                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-violet-500/40 bg-violet-500/5 p-5 transition hover:bg-violet-500/10">
                    {documents[document.id] ? (
                      <>
                        <FileText
                          className="mb-2 text-emerald-400"
                          size={26}
                        />

                        <span className="text-sm text-emerald-300">
                          {documents[document.id].name}
                        </span>

                        <span className="mt-1 text-xs text-gray-500">
                          Click to replace file
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload
                          className="mb-2 text-violet-400"
                          size={26}
                        />

                        <span className="text-sm text-gray-300">
                          Click to upload document
                        </span>

                        <span className="mt-1 text-xs text-gray-500">
                          PDF, JPG or PNG · Maximum 5 MB
                        </span>
                      </>
                    )}

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) =>
                        handleFileChange(
                          document.id,
                          e.target.files?.[0] || null
                        )
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
          </section>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-violet-600 py-4 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Uploading and Verifying...
              </>
            ) : (
              <>
                Submit for Verification
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            <AlertCircle size={20} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Verification Result */}
        {result && (
          <section className="mt-8 rounded-2xl border border-white/10 bg-[#111119] p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-violet-400" size={28} />

              <div>
                <h2 className="text-xl font-semibold">
                  Verification Result
                </h2>

                <p className="text-sm text-gray-400">
                  {result.vendor_name}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Application ID: {result.application_id}
                </p>
              </div>
            </div>

            <div className="my-6 flex items-center gap-3">
              <CheckCircle2 className="text-emerald-400" size={25} />

              <span className="text-2xl font-bold">
                {result.verification_result.decision}
              </span>
            </div>

            <p className="text-sm text-gray-300">
              {result.verification_result.reason}
            </p>

            <div className="mt-6 space-y-3">
              {result.verification_result.checks.map((check, index) => (
                <div
                  key={index}
                  className="flex flex-col justify-between gap-2 rounded-xl bg-[#191923] p-4 md:flex-row"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {check.check}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {check.details}
                    </p>
                  </div>

                  <span className="text-xs text-violet-300">
                    {check.status}
                  </span>
                </div>
              ))}
            </div>

            {result.uploaded_documents?.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 font-semibold">
                  Uploaded Documents
                </h3>

                {result.uploaded_documents.map((document) => (
                  <p
                    key={document.document_type}
                    className="mb-2 text-sm text-emerald-300"
                  >
                    ✓ {document.display_name}: {document.original_filename}
                  </p>
                ))}
              </div>
            )}

            {result.verification_result.follow_up.length > 0 && (
              <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <h3 className="mb-3 font-semibold text-amber-400">
                  Required Follow-up
                </h3>

                {result.verification_result.follow_up.map((item, index) => (
                  <p key={index} className="mb-2 text-sm text-gray-300">
                    • {item}
                  </p>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={onBack}
              className="mt-6 rounded-xl border border-white/10 px-5 py-3 text-sm text-violet-300 hover:bg-white/5"
            >
              Back to Dashboard
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
