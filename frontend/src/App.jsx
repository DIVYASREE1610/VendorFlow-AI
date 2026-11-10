import { useEffect, useState } from "react";
import NewVendor from "./pages/NewVendor";
import {
  getApplications,
  getApplicationById,
  updateApplicationDecision,
} from "./services/api";

import {
  LayoutDashboard,
  Building2,
  FileCheck2,
  Activity,
  Settings,
  Search,
  Bell,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  XCircle,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  ArrowLeft,
  FileText,
  Landmark,
  CalendarDays,
} from "lucide-react";

// ---------------- SIDEBAR ----------------

function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Applications", icon: Building2 },
    { name: "Verification", icon: FileCheck2 },
    { name: "Activity Logs", icon: Activity },
  ];

  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-[268px] flex-col border-r border-white/10 bg-[#0b0c11] p-5">
      <div className="mb-12 flex items-center gap-3 px-2 pt-3">
        <div className="rounded-xl bg-violet-600 p-3">
          <ShieldCheck size={25} />
        </div>

        <div>
          <h1 className="text-xl font-bold text-white">
            VendorFlow.
          </h1>
          <p className="text-[10px] tracking-[4px] text-violet-300">
            INTELLIGENCE PLATFORM
          </p>
        </div>
      </div>

      <p className="mb-4 px-3 text-xs tracking-[3px] text-slate-500">
        WORKSPACE
      </p>

      <div className="mb-8 rounded-xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-violet-500/20 p-2 text-violet-300">
            <Building2 size={20} />
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              Procurement
            </p>
            <p className="text-xs text-slate-500">
              Admin workspace
            </p>
          </div>
        </div>
      </div>

      <p className="mb-4 px-3 text-xs tracking-[3px] text-slate-500">
        MAIN MENU
      </p>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.name;

          return (
            <button
              key={item.name}
              onClick={() => setActivePage(item.name)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                active
                  ? "border border-violet-500/20 bg-violet-500/10 text-violet-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={19} />
              {item.name}
            </button>
          );
        })}
      </nav>

      <div className="mt-8 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
        <div className="mb-2 flex items-center gap-2 text-violet-300">
          <Activity size={17} />
          <span className="text-sm font-semibold">
            AI Assistant
          </span>
        </div>

        <p className="text-xs leading-6 text-slate-400">
          Your vendor verification engine is ready to process applications.
        </p>

        <p className="mt-3 text-xs text-emerald-400">
          ● System operational
        </p>
      </div>

      <div className="mt-auto border-t border-white/10 pt-6">
        <button
          onClick={() => setActivePage("Settings")}
          className="flex items-center gap-3 px-3 text-sm text-slate-400 hover:text-white"
        >
          <Settings size={18} />
          Settings
        </button>

        <div className="mt-8 flex items-center gap-3">
          <div className="rounded-full bg-violet-600 p-3 text-xs font-bold">
            AD
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              Admin User
            </p>
            <p className="text-xs text-slate-500">
              Procurement team
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ---------------- STAT CARD ----------------

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#12131b] p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>

        <div className={`rounded-xl bg-white/5 p-3 ${color}`}>
          <Icon size={21} />
        </div>
      </div>

      <h2 className="mt-6 text-4xl font-bold text-white">
        {value}
      </h2>

      <p className="mt-3 text-xs text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}

// ---------------- DECISION BADGE ----------------

function DecisionBadge({ decision }) {
  const styles = {
    APPROVED: "bg-emerald-500/10 text-emerald-400",
    PENDING: "bg-amber-500/10 text-amber-400",
    REJECTED: "bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-2 text-xs font-semibold ${
        styles[decision] || "bg-slate-500/10 text-slate-400"
      }`}
    >
      {decision || "UNKNOWN"}
    </span>
  );
}

// ---------------- DASHBOARD ----------------

function Dashboard({
  applications,
  loading,
  error,
  refresh,
  setActivePage,
  openApplication,
}) {
  const total = applications.length;

  const approved = applications.filter(
    (app) => app.decision === "APPROVED"
  ).length;

  const pending = applications.filter(
    (app) => app.decision === "PENDING"
  ).length;

  const rejected = applications.filter(
    (app) => app.decision === "REJECTED"
  ).length;

  const approvalRate = total
    ? ((approved / total) * 100).toFixed(1)
    : "0.0";

  return (
    <main className="ml-[268px] min-h-screen bg-[#090a0f] text-white">
      <header className="sticky top-0 z-10 flex h-[82px] items-center justify-between border-b border-white/10 bg-[#090a0f]/95 px-10">
        <p className="text-sm text-slate-400">
          Workspace / <span className="text-white">Overview</span>
        </p>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <Search size={17} className="text-slate-500" />
            <span className="text-sm text-slate-500">
              VendorFlow Dashboard
            </span>
          </div>

          <Bell size={20} className="text-slate-400" />

          <div className="h-9 w-9 rounded-full border border-violet-500/40 bg-violet-500/20" />
        </div>
      </header>

      <div className="space-y-10 p-10">
        <section className="relative overflow-hidden rounded-[28px] border border-violet-500/20 bg-gradient-to-br from-[#211635] to-[#11121b] p-9">
          <div className="relative z-10 max-w-2xl">
            <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-xs font-semibold tracking-widest text-violet-300">
              ✨ INTELLIGENT PROCUREMENT
            </span>

            <h1 className="mt-8 text-4xl font-bold leading-tight">
              Vendor intelligence,
              <br />
              <span className="text-violet-300">
                without the manual work.
              </span>
            </h1>

            <p className="mt-5 max-w-xl leading-7 text-slate-400">
              Automate vendor onboarding, verify documents, and make
              smarter procurement decisions from one workspace.
            </p>

            <button
              onClick={() => setActivePage("New Vendor")}
              className="mt-7 flex items-center gap-3 rounded-xl bg-violet-600 px-6 py-4 text-sm font-semibold transition hover:bg-violet-500"
            >
              <Plus size={19} />
              New vendor application
              <ArrowUpRight size={18} />
            </button>
          </div>

          <div className="absolute right-10 top-1/2 hidden w-72 -translate-y-1/2 rounded-2xl border border-white/10 bg-black/20 p-6 lg:block">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Automation engine</span>
              <span className="text-emerald-400">● Live</span>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="rounded-xl bg-violet-500/20 p-3 text-violet-300">
                <Activity size={25} />
              </div>

              <div>
                <h3 className="text-xl font-bold">AI powered</h3>
                <p className="text-xs text-slate-500">
                  Rule-based verification engine
                </p>
              </div>
            </div>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-full rounded-full bg-violet-500" />
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Connected to live application database
            </p>
          </div>
        </section>

        <section>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">
                Operations overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Live statistics from your vendor database
              </p>
            </div>

            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh data
            </button>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              <AlertCircle size={19} />
              {error}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total applications"
              value={loading ? "..." : total.toLocaleString("en-IN")}
              subtitle="All submitted applications"
              icon={Building2}
              color="text-violet-300"
            />

            <StatCard
              title="Approved vendors"
              value={loading ? "..." : approved.toLocaleString("en-IN")}
              subtitle={`${approvalRate}% approval rate`}
              icon={CheckCircle2}
              color="text-emerald-400"
            />

            <StatCard
              title="Pending review"
              value={loading ? "..." : pending.toLocaleString("en-IN")}
              subtitle="Awaiting additional information"
              icon={Clock3}
              color="text-amber-400"
            />

            <StatCard
              title="Rejected applications"
              value={loading ? "..." : rejected.toLocaleString("en-IN")}
              subtitle="Failed verification checks"
              icon={XCircle}
              color="text-red-400"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#12131b] p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Recent applications
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest vendor submissions
              </p>
            </div>

            <button
              onClick={() => setActivePage("Applications")}
              className="flex items-center gap-2 text-sm text-violet-300 hover:text-violet-200"
            >
              View all
              <ChevronRight size={17} />
            </button>
          </div>

          {applications.length === 0 && !loading ? (
            <p className="py-10 text-center text-slate-500">
              No vendor applications have been submitted yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 text-slate-500">
                  <tr>
                    <th className="py-4">Application ID</th>
                    <th>Company</th>
                    <th>Decision</th>
                    <th>Submitted</th>
                  </tr>
                </thead>

                <tbody>
                  {applications.slice(0, 5).map((app) => (
                    <tr
                      key={app.application_id}
                      className="border-b border-white/5"
                    >
                      <td className="py-5">
                        <button
                          onClick={() => openApplication(app.application_id)}
                          className="font-medium text-violet-300 hover:text-violet-200"
                        >
                          {app.application_id}
                        </button>
                      </td>

                      <td className="text-slate-200">
                        {app.company_name?.trim()}
                      </td>

                      <td>
                        <DecisionBadge decision={app.decision} />
                      </td>

                      <td className="text-slate-400">
                        {new Date(app.submitted_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="text-center text-xs text-slate-600">
          VendorFlow AI · Live database connection · SQLite
        </p>
      </div>
    </main>
  );
}

// ---------------- APPLICATIONS PAGE ----------------

function ApplicationsPage({
  applications,
  loading,
  error,
  refresh,
  openApplication,
}) {
  return (
    <main className="ml-[268px] min-h-screen bg-[#090a0f] p-10 text-white">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Vendor Applications
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Complete history of submitted vendor applications.
          </p>
        </div>

        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm hover:bg-white/10"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-[#12131b] p-5">
          <p className="text-sm text-slate-400">Total applications</p>
          <p className="mt-3 text-3xl font-bold">
            {applications.length}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#12131b] p-5">
          <p className="text-sm text-slate-400">Approved</p>
          <p className="mt-3 text-3xl font-bold text-emerald-400">
            {applications.filter((a) => a.decision === "APPROVED").length}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#12131b] p-5">
          <p className="text-sm text-slate-400">
            Pending / Rejected
          </p>
          <p className="mt-3 text-3xl font-bold text-amber-400">
            {applications.filter((a) => a.decision !== "APPROVED").length}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#12131b] p-6">
        {loading ? (
          <p className="py-10 text-center text-slate-400">
            Loading applications...
          </p>
        ) : applications.length === 0 ? (
          <p className="py-10 text-center text-slate-400">
            No applications found.
          </p>
        ) : (
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="border-b border-white/10 text-slate-500">
              <tr>
                <th className="pb-5">Application ID</th>
                <th className="pb-5">Company Name</th>
                <th className="pb-5">Decision</th>
                <th className="pb-5">Submitted At</th>
              </tr>
            </thead>

            <tbody>
              {applications.map((app) => (
                <tr
                  key={app.application_id}
                  className="border-b border-white/5"
                >
                  <td className="py-5">
                    <button
                      onClick={() => openApplication(app.application_id)}
                      className="font-medium text-violet-300 hover:text-violet-200"
                    >
                      {app.application_id}
                    </button>
                  </td>

                  <td className="text-slate-200">
                    {app.company_name?.trim()}
                  </td>

                  <td>
                    <DecisionBadge decision={app.decision} />
                  </td>

                  <td className="text-slate-400">
                    {new Date(app.submitted_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

// ---------------- APPLICATION DETAILS PAGE ----------------

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-2 border-b border-white/5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="break-all text-sm font-medium text-slate-200">
        {value || "Not provided"}
      </span>
    </div>
  );
}

function ApplicationDetailsPage({ applicationId, onBack }) {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDetails() {
      try {
        setLoading(true);
        setError("");

        const data = await getApplicationById(applicationId);
        setApplication(data);
      } catch (err) {
        console.error("Application details error:", err);
        setError(
          "Unable to load application details. Please check the backend."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [applicationId]);

  if (loading) {
    return (
      <main className="ml-[268px] min-h-screen bg-[#090a0f] p-10 text-white">
        <p className="py-20 text-center text-slate-400">
          Loading application details...
        </p>
      </main>
    );
  }

  if (error || !application) {
    return (
      <main className="ml-[268px] min-h-screen bg-[#090a0f] p-10 text-white">
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-violet-300"
        >
          <ArrowLeft size={18} />
          Back to applications
        </button>

        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
          {error || "Application not found."}
        </div>
      </main>
    );
  }

  const vendor = application.vendor_data || {};
  const checks = application.checks || [];
  const followUps = application.follow_up || [];

  return (
    <main className="ml-[268px] min-h-screen bg-[#090a0f] p-10 text-white">
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-sm text-violet-300 transition hover:text-violet-200"
      >
        <ArrowLeft size={18} />
        Back to applications
      </button>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="mb-2 text-xs tracking-widest text-violet-300">
            VENDOR APPLICATION
          </p>

          <h1 className="text-3xl font-bold">
            {application.company_name?.trim() || "Vendor Details"}
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Application ID: {application.application_id}
          </p>
        </div>

        <DecisionBadge decision={application.decision} />
      </div>

      {/* Decision summary */}

      <section className="mb-6 rounded-2xl border border-white/10 bg-[#12131b] p-6">
        <div className="mb-4 flex items-center gap-3">
          <ShieldCheck className="text-violet-300" size={22} />
          <h2 className="text-lg font-semibold">
            Verification decision
          </h2>
        </div>

        <p className="text-sm leading-7 text-slate-300">
          {application.reason || "No decision explanation available."}
        </p>

        <div className="mt-5 flex items-center gap-3 text-xs text-slate-500">
          <CalendarDays size={16} />
          Submitted:{" "}
          {application.submitted_at
            ? new Date(application.submitted_at).toLocaleString()
            : "Not available"}
        </div>
      </section>

      {/* Company details */}

      <section className="mb-6 rounded-2xl border border-white/10 bg-[#12131b] p-6">
        <div className="mb-4 flex items-center gap-3">
          <Building2 className="text-violet-300" size={22} />
          <h2 className="text-lg font-semibold">
            Company information
          </h2>
        </div>

        <DetailRow
          label="Company legal name"
          value={vendor.company_name}
        />

        <DetailRow label="PAN" value={vendor.pan} />

        <DetailRow label="GSTIN" value={vendor.gstin} />
      </section>

      {/* Bank details */}

      <section className="mb-6 rounded-2xl border border-white/10 bg-[#12131b] p-6">
        <div className="mb-4 flex items-center gap-3">
          <Landmark className="text-violet-300" size={22} />
          <h2 className="text-lg font-semibold">
            Banking information
          </h2>
        </div>

        <DetailRow
          label="Bank account number"
          value={vendor.bank_account_number}
        />

        <DetailRow
          label="Account holder"
          value={vendor.bank_account_holder}
        />

        <DetailRow label="IFSC code" value={vendor.ifsc} />

        <p className="mt-4 text-xs leading-5 text-slate-500">
          Bank account ownership has not been independently verified.
        </p>
      </section>

      {/* Verification checks */}

      <section className="mb-6 rounded-2xl border border-white/10 bg-[#12131b] p-6">
        <div className="mb-6 flex items-center gap-3">
          <FileCheck2 className="text-violet-300" size={22} />
          <h2 className="text-lg font-semibold">
            Verification checks
          </h2>
        </div>

        {checks.length === 0 ? (
          <p className="text-sm text-slate-400">
            No verification checks available.
          </p>
        ) : (
          <div className="space-y-4">
            {checks.map((check, index) => {
              const passed =
                check.passed === true ||
                check.status === "PASSED" ||
                check.status === "PASS";

              return (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4"
                >
                  {passed ? (
                    <CheckCircle2
                      className="mt-0.5 shrink-0 text-emerald-400"
                      size={19}
                    />
                  ) : (
                    <AlertCircle
                      className="mt-0.5 shrink-0 text-amber-400"
                      size={19}
                    />
                  )}

                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {check.name ||
                        check.check ||
                        check.title ||
                        `Verification check ${index + 1}`}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      {check.message ||
                        check.reason ||
                        check.details ||
                        check.status ||
                        (passed ? "Check passed" : "Check requires review")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Follow-up requirements */}

      <section className="mb-6 rounded-2xl border border-white/10 bg-[#12131b] p-6">
        <div className="mb-5 flex items-center gap-3">
          <FileText className="text-violet-300" size={22} />
          <h2 className="text-lg font-semibold">
            Follow-up requirements
          </h2>
        </div>

        {followUps.length === 0 ? (
          <p className="text-sm text-emerald-400">
            No additional information requested.
          </p>
        ) : (
          <div className="space-y-3">
            {followUps.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-300"
              >
                {typeof item === "string"
                  ? item
                  : item.message || item.reason || JSON.stringify(item)}
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-center text-xs text-slate-600">
        VendorFlow AI · Application verification record
      </p>
    </main>
  );
}

// ---------------- VERIFICATION CENTER ----------------

function VerificationPage({
  applications,
  loading,
  error,
  refresh,
  openApplication,
}) {
  const [filter, setFilter] = useState("PENDING");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [actionError, setActionError] = useState("");

  async function makeDecision(applicationId, decision) {
    const reviewerComment = window.prompt(
      `Enter the reviewer's reason for ${decision.toLowerCase()}:`
    );

    if (reviewerComment === null) return;

    if (reviewerComment.trim().length < 5) {
      setActionError("Please enter a reviewer comment of at least 5 characters.");
      return;
    }

    try {
      setProcessingId(applicationId);
      setActionError("");
      await updateApplicationDecision(
        applicationId,
        decision,
        reviewerComment.trim()
      );
      await refresh();
    } catch (err) {
      setActionError(err.message || "Unable to update the application.");
    } finally {
      setProcessingId(null);
    }
  }

  const pendingCount = applications.filter(
    (app) => app.decision === "PENDING"
  ).length;

  const approvedCount = applications.filter(
    (app) => app.decision === "APPROVED"
  ).length;

  const rejectedCount = applications.filter(
    (app) => app.decision === "REJECTED"
  ).length;

  const filteredApplications = applications.filter((app) => {
    const matchesFilter =
      filter === "ALL" || app.decision === filter;

    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !search ||
      app.application_id?.toLowerCase().includes(search) ||
      app.company_name?.toLowerCase().includes(search);

    return matchesFilter && matchesSearch;
  });

  return (
    <main className="ml-[268px] min-h-screen bg-[#090a0f] p-10 text-white">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[3px] text-violet-300">
            PROCUREMENT WORKSPACE
          </p>
          <h1 className="text-3xl font-bold">Verification Center</h1>
          <p className="mt-2 text-sm text-slate-400">
            Review vendor applications that need procurement attention.
          </p>
        </div>

        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh applications
        </button>
      </div>

      {(error || actionError) && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle size={18} />
          {actionError || error}
        </div>
      )}

      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-amber-500/20 bg-[#12131b] p-5">
          <div className="flex items-center gap-3 text-amber-400">
            <Clock3 size={19} />
            <p className="text-sm">Pending manual review</p>
          </div>
          <p className="mt-4 text-3xl font-bold text-white">{pendingCount}</p>
          <p className="mt-1 text-xs text-slate-500">Require additional review or information</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-[#12131b] p-5">
          <div className="flex items-center gap-3 text-emerald-400">
            <CheckCircle2 size={19} />
            <p className="text-sm">Approved</p>
          </div>
          <p className="mt-4 text-3xl font-bold text-white">{approvedCount}</p>
          <p className="mt-1 text-xs text-slate-500">Passed implemented verification checks</p>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-[#12131b] p-5">
          <div className="flex items-center gap-3 text-red-400">
            <XCircle size={19} />
            <p className="text-sm">Rejected</p>
          </div>
          <p className="mt-4 text-3xl font-bold text-white">{rejectedCount}</p>
          <p className="mt-1 text-xs text-slate-500">Failed a blocking verification rule</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#12131b]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-6">
          <div>
            <h2 className="text-lg font-semibold">Application review queue</h2>
            <p className="mt-1 text-xs text-slate-500">
              Select an application to inspect its checks and follow-up requirements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <Search size={16} className="text-slate-500" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search vendor or ID"
                className="w-44 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
              />
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-xl border border-white/10 bg-[#1a1b25] px-3 py-2 text-sm text-slate-200 outline-none"
            >
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ALL">All applications</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-slate-400">
            Loading verification queue...
          </p>
        ) : filteredApplications.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <FileCheck2 className="mx-auto mb-3 text-slate-600" size={30} />
            <p className="text-sm font-medium text-slate-300">
              No applications match this view.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Try another status filter or search term.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs text-slate-500">
                <tr>
                  <th className="px-6 py-4">Application</th>
                  <th className="px-4 py-4">Vendor</th>
                  <th className="px-4 py-4">Decision</th>
                  <th className="px-4 py-4">Review notes</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => {
                  const followUps = Array.isArray(app.follow_up)
                    ? app.follow_up
                    : [];

                  const reviewChecks = Array.isArray(app.checks)
                    ? app.checks.filter(
                        (check) =>
                          check.status === "REVIEW" ||
                          check.status === "FAILED"
                      )
                    : [];

                  const manualDecisionCheck = Array.isArray(app.checks)
                    ? app.checks.find(
                        (check) => check.check === "Manual procurement decision"
                      )
                    : null;

                  // Once a reviewer has made a decision, show that decision
                  // and the reviewer comment instead of stale automated warnings.
                  const note =
                    app.decision === "APPROVED" || app.decision === "REJECTED"
                      ? manualDecisionCheck?.details ||
                        app.reason ||
                        "Manual decision recorded by procurement."
                      : followUps[0] ||
                        reviewChecks[0]?.details ||
                        app.reason ||
                        "No additional review note.";

                  return (
                    <tr
                      key={app.application_id}
                      className="border-b border-white/5 transition hover:bg-white/[0.03]"
                    >
                      <td className="px-6 py-5">
                        <p className="font-medium text-violet-300">
                          {app.application_id}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {app.submitted_at
                            ? new Date(app.submitted_at).toLocaleString()
                            : "Date unavailable"}
                        </p>
                      </td>
                      <td className="px-4 py-5 text-slate-200">
                        {app.company_name?.trim() || "Unknown vendor"}
                      </td>
                      <td className="px-4 py-5">
                        <DecisionBadge decision={app.decision} />
                      </td>
                      <td className="max-w-[360px] px-4 py-5 text-xs leading-5 text-slate-400">
                        {typeof note === "string" ? note : JSON.stringify(note)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            onClick={() => openApplication(app.application_id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/20"
                          >
                            Review <ChevronRight size={14} />
                          </button>

                          {app.decision === "PENDING" && (
                            <>
                              <button
                                onClick={() => makeDecision(app.application_id, "APPROVED")}
                                disabled={processingId === app.application_id}
                                className="rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/25 disabled:opacity-50"
                              >
                                {processingId === app.application_id ? "Saving..." : "Approve"}
                              </button>
                              <button
                                onClick={() => makeDecision(app.application_id, "REJECTED")}
                                disabled={processingId === app.application_id}
                                className="rounded-lg bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/25 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-6 text-center text-xs text-slate-600">
        VendorFlow AI · Verification queue · Human review remains required for flagged cases
      </p>
    </main>
  );
}

// ---------------- ACTIVITY LOGS ----------------

function ActivityLogsPage({ applications, loading, error, refresh }) {
  const sortedApplications = [...applications].sort(
    (a, b) => new Date(b.submitted_at) - new Date(a.submitted_at)
  );

  return (
    <main className="ml-[268px] min-h-screen bg-[#090a0f] px-8 py-8 text-white">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[3px] text-violet-300">
            PROCUREMENT WORKSPACE
          </p>
          <h1 className="text-3xl font-bold">Activity Logs</h1>
          <p className="mt-2 text-sm text-slate-400">
            Review the recorded history of vendor applications.
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 hover:bg-white/10"
        >
          <RefreshCw size={16} /> Refresh applications
        </button>
      </div>

      <div className="mb-6 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 text-sm leading-6 text-slate-300">
        This view is built from saved application records. It shows submission time,
        current decision, and the recorded reason. A separate event-by-event audit
        trail (such as individual file uploads and every status change) is not yet
        implemented.
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-white/10 bg-[#11121a] p-8 text-center text-slate-400">
          Loading application activity...
        </div>
      ) : sortedApplications.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#11121a] p-8 text-center text-slate-400">
          No application activity is available yet.
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#11121a]">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="font-semibold">Application history</h2>
            <p className="mt-1 text-xs text-slate-500">
              {sortedApplications.length} recorded applications
            </p>
          </div>
          <div className="divide-y divide-white/5">
            {sortedApplications.map((application) => {
              const status = (application.decision || "PENDING").toUpperCase();
              const badgeClass = status === "APPROVED"
                ? "bg-emerald-500/10 text-emerald-400"
                : status === "REJECTED"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-amber-500/10 text-amber-400";

              return (
                <div key={application.application_id} className="flex flex-col gap-3 px-6 py-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-lg bg-violet-500/10 p-2 text-violet-300">
                      <Activity size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {application.company_name || "Unknown vendor"}
                      </p>
                      <p className="mt-1 text-xs text-violet-300">
                        {application.application_id}
                      </p>
                      <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                        <CalendarDays size={13} />
                        {application.submitted_at
                          ? new Date(application.submitted_at).toLocaleString()
                          : "Submission time unavailable"}
                      </p>
                      <p className="mt-2 max-w-3xl text-sm text-slate-400">
                        {application.reason || "Application submitted and verification record created."}
                      </p>
                    </div>
                  </div>
                  <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${badgeClass}`}>
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}


// ---------------- SETTINGS PAGE ----------------

function SettingsPage() {
  return (
    <main className="ml-[268px] min-h-screen bg-[#090a0f] px-8 py-8 text-white">
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold tracking-[3px] text-violet-300">
          PROCUREMENT WORKSPACE
        </p>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-sm text-slate-400">
          View your VendorFlow workspace configuration and system information.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-[#11121a] p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-violet-500/15 p-3 text-violet-300">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="font-semibold">Workspace information</h2>
              <p className="text-xs text-slate-500">Application configuration</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
              <span className="text-slate-400">Workspace</span><span>VendorFlow AI</span>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
              <span className="text-slate-400">Workspace type</span><span>Procurement</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Environment</span><span>Development</span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#11121a] p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/15 p-3 text-emerald-300">
              <Activity size={22} />
            </div>
            <div>
              <h2 className="font-semibold">Verification engine</h2>
              <p className="text-xs text-slate-500">Current capabilities</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            {[
              "PAN, GSTIN and IFSC format checks",
              "PDF text extraction and document comparison",
              "Missing-document and name-mismatch review",
              "Manual procurement decisions",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-slate-300">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 lg:col-span-2">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-amber-300" />
            <div>
              <h2 className="font-semibold text-amber-200">Prototype and security notes</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                This is a case-study prototype. Format checks do not confirm registration
                with government systems, uploaded documents are not independently
                authenticated, and bank-account ownership is not verified. Reviewer
                authentication and role-based access control must be added before
                production use.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

// ---------------- MAIN APP ----------------

export default function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [applications, setApplications] = useState([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refreshApplications() {
    try {
      setLoading(true);
      setError("");

      const data = await getApplications();
      setApplications(data.applications || []);
    } catch (err) {
      console.error("Application loading error:", err);
      setError(
        "Unable to load applications. Please check whether the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshApplications();
  }, []);

  function openApplication(applicationId) {
    setSelectedApplicationId(applicationId);
    setActivePage("Application Details");
  }

  if (activePage === "New Vendor") {
    return (
      <NewVendor
        onBack={() => {
          setActivePage("Overview");
          refreshApplications();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-white">
      <Sidebar
        activePage={activePage}
        setActivePage={(page) => {
          setSelectedApplicationId(null);
          setActivePage(page);
        }}
      />

      {activePage === "Overview" && (
        <Dashboard
          applications={applications}
          loading={loading}
          error={error}
          refresh={refreshApplications}
          setActivePage={setActivePage}
          openApplication={openApplication}
        />
      )}

      {activePage === "Applications" && (
        <ApplicationsPage
          applications={applications}
          loading={loading}
          error={error}
          refresh={refreshApplications}
          openApplication={openApplication}
        />
      )}

      {activePage === "Verification" && (
        <VerificationPage
          applications={applications}
          loading={loading}
          error={error}
          refresh={refreshApplications}
          openApplication={openApplication}
        />
      )}

      {activePage === "Application Details" && selectedApplicationId && (
        <ApplicationDetailsPage
          applicationId={selectedApplicationId}
          onBack={() => setActivePage("Applications")}
        />
      )}

      {activePage === "Activity Logs" && (
        <ActivityLogsPage
          applications={applications}
          loading={loading}
          error={error}
          refresh={refreshApplications}
        />
      )}

      {activePage === "Settings" && <SettingsPage />}
    </div>
  );
}