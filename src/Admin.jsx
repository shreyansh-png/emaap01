import React, { useState } from "react";
import { useData } from "./DataContext";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  Building,
  Filter,
  BarChart3,
  Search,
  RefreshCw,
  X,
  Shield,
  FileSpreadsheet,
  ChevronDown,
} from "lucide-react";

export default function AdminDashboard({ onLogout }) {
  const {
    currentUser,
    users,
    instruments,
    applications,
    certificates,
    activities,
    assignLmo,
    resetToDefaults,
  } = useData();

  const [activeTab, setActiveTab] = useState("overview"); // overview | applications | users | activity
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Assign modal state
  const [assignModalApp, setAssignModalApp] = useState(null);
  const [selectedLmoId, setSelectedLmoId] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Filter lists
  const lmoOfficers = users.filter((u) => u.role === "lmo");
  const traderUsers = users.filter((u) => u.role === "user");

  // Filtered applications
  const filteredApplications = applications.filter((app) => {
    const matchesDistrict = selectedDistrict === "all" || app.district === selectedDistrict;
    const matchesStatus = selectedStatus === "all" || app.status === selectedStatus;
    const matchesSearch =
      !searchQuery ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.instrumentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDistrict && matchesStatus && matchesSearch;
  });

  // Calculate metrics
  const totalApps = applications.length;
  const submittedCount = applications.filter((a) => a.status === "submitted").length;
  const assignedCount = applications.filter((a) => a.status === "assigned").length;
  const scheduledCount = applications.filter((a) => a.status === "scheduled").length;
  const completedCount = applications.filter((a) => a.status === "completed").length;
  const totalCertificates = certificates.length;

  // Verification rate
  const completionRate = totalApps > 0 ? Math.round((completedCount / totalApps) * 100) : 0;

  // District breakdown counts
  const districtCounts = {
    Jaipur: applications.filter((a) => a.district === "Jaipur").length,
    Lucknow: applications.filter((a) => a.district === "Lucknow").length,
    Mumbai: applications.filter((a) => a.district === "Mumbai").length,
  };

  // Status breakdown array for charts
  const statusBars = [
    { label: "Pending Assignment", count: submittedCount, color: "bg-amber-500", text: "text-amber-700" },
    { label: "Assigned to LMO", count: assignedCount, color: "bg-blue-500", text: "text-blue-700" },
    { label: "Scheduled for Inspection", count: scheduledCount, color: "bg-indigo-500", text: "text-indigo-700" },
    { label: "Completed / Stamped", count: completedCount, color: "bg-emerald-500", text: "text-emerald-700" },
  ];

  const handleOpenAssignModal = (app) => {
    setAssignModalApp(app);
    // Pre-select LMO in the same district if possible
    const sameDistrictLmo = lmoOfficers.find((l) => l.district === app.district) || lmoOfficers[0];
    setSelectedLmoId(sameDistrictLmo ? sameDistrictLmo.id : "");
  };

  const handleConfirmAssignment = (e) => {
    e.preventDefault();
    if (!assignModalApp || !selectedLmoId) return;

    assignLmo(assignModalApp.id, selectedLmoId);
    const assignedLmo = lmoOfficers.find((l) => l.id === selectedLmoId);
    setAssignModalApp(null);
    triggerToast(`Application ${assignModalApp.id} successfully assigned to ${assignedLmo?.name}!`);
  };

  return (
    <div className="min-h-screen bg-[#e9eef2] font-sans text-[#12263b] flex flex-col">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-12 right-6 z-50 bg-[#053b5c] text-white px-5 py-3 rounded-lg shadow-xl border-l-4 border-[#eb5405] flex items-center gap-3 animate-bounce">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-[13px] font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <header className="h-[70px] bg-[#053b5c] border-b-[2px] border-[#eb5405] flex items-center justify-between px-4 md:px-8 text-white shadow-md">
        
        {/* LEFT: Government Logo & Text */}
        <div className="flex items-center gap-3 flex-1">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
            alt="Emblem of India" 
            className="w-8 h-10 object-contain filter invert brightness-0 contrast-200" 
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <span className="hidden sm:block text-[13px] font-bold tracking-wider uppercase leading-tight">
            Government<br/>of India
          </span>
        </div>

        {/* CENTER: e-माप Branding */}
        <div className="flex items-center justify-center flex-1">
          <span className="text-[#eb5405] text-[32px] md:text-[38px] font-bold leading-none">e-</span>
          <span className="text-[26px] md:text-[32px] font-bold ml-0.5 text-white">माप</span>
        </div>

        {/* RIGHT: Profile */}
        <div className="flex items-center justify-end gap-4 flex-1">
          {submittedCount > 0 && (
            <button
              onClick={() => setActiveTab("applications")}
              className="hidden md:flex items-center gap-1.5 bg-[#eb5405] hover:bg-[#d44700] text-white text-[12px] font-semibold px-4 py-1.5 rounded transition"
            >
              <ClipboardList size={15} />
              <span>Assign Apps ({submittedCount})</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="flex items-center gap-2.5 hover:bg-white/10 p-1.5 rounded transition text-left cursor-pointer border border-transparent hover:border-white/20"
            title="Click to logout"
          >
            <div className="w-[36px] h-[36px] rounded-full bg-white/20 flex items-center justify-center font-bold text-[13px] border border-white/30 text-white">
              AD
            </div>
            <div className="hidden sm:block">
              <p className="text-[13px] font-semibold leading-tight text-white flex items-center gap-1">
                Anjali Desai
                <ChevronDown size={14} className="text-white/70" />
              </p>
              <p className="text-[10px] text-[#c7deed] truncate max-w-[140px]">
                State Controller
              </p>
            </div>
          </button>
        </div>
      </header>

      {/* ================= BODY ================= */}
      <div className="flex flex-1">
        {/* ================= SIDEBAR ================= */}
        <aside className="w-[220px] bg-white border-r border-[#dce4e9] text-[#182b3d] flex flex-col flex-shrink-0 p-3 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#6b8296] px-3 py-2">
            Admin Navigation
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition ${
                activeTab === "overview"
                  ? "bg-[#f0f6fa] text-[#084a78] font-semibold border-l-4 border-[#eb5405]"
                  : "text-[#334e68] hover:bg-[#f8fafc]"
              }`}
            >
              <LayoutDashboard size={16} />
              <span>State Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("applications")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-[13px] font-medium transition ${
                activeTab === "applications"
                  ? "bg-[#f0f6fa] text-[#084a78] font-semibold border-l-4 border-[#eb5405]"
                  : "text-[#334e68] hover:bg-[#f8fafc]"
              }`}
            >
              <div className="flex items-center gap-3">
                <ClipboardList size={16} />
                <span>Verification Queue</span>
              </div>
              {submittedCount > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                  {submittedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-[13px] font-medium transition ${
                activeTab === "users"
                  ? "bg-[#f0f6fa] text-[#084a78] font-semibold border-l-4 border-[#eb5405]"
                  : "text-[#334e68] hover:bg-[#f8fafc]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Users size={16} />
                <span>Officers & Traders</span>
              </div>
              <span className="bg-[#e4eff7] text-[#084a78] text-[10px] px-1.5 py-0.5 rounded font-mono">
                {users.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("activity")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition ${
                activeTab === "activity"
                  ? "bg-[#f0f6fa] text-[#084a78] font-semibold border-l-4 border-[#eb5405]"
                  : "text-[#334e68] hover:bg-[#f8fafc]"
              }`}
            >
              <Clock size={16} />
              <span>Audit Log</span>
            </button>
          </nav>

          <div className="mt-auto p-3 bg-[#f8fafc] rounded-lg border border-[#e4eff7] text-[11px] text-[#4b6b85]">
            <p className="font-semibold text-[#063653] mb-1">State Metrology Control</p>
            <p>Active LMOs: {lmoOfficers.length}</p>
            <p>Monitored Districts: 4</p>
          </div>
        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <main className="flex-1 p-5 overflow-y-auto max-w-7xl">
          {/* Header row */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-[22px] font-bold text-[#063653]">
                {activeTab === "overview" && "Executive State Dashboard & Analytics"}
                {activeTab === "applications" && "Verification Applications & LMO Dispatch"}
                {activeTab === "users" && "Legal Metrology Officers & Registered Traders Directory"}
                {activeTab === "activity" && "Platform System Audit & Activity Log"}
              </h2>
              <p className="text-[12px] text-[#55697d]">
                Controlling Authority: Department of Legal Metrology, Rajasthan & Inter-State Coordination
              </p>
            </div>

            {/* Quick Action */}
            {activeTab !== "applications" && (
              <button
                onClick={() => setActiveTab("applications")}
                className="bg-[#eb5405] hover:bg-[#d44700] text-white text-[12px] font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 shadow"
              >
                <ClipboardList size={14} /> Assign Pending ({submittedCount})
              </button>
            )}
          </div>

          {/* ================= TAB 1: OVERVIEW & ANALYTICS ================= */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#cbe0ee] rounded-lg p-4 shadow-xs">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#52728f]">
                    Total Applications
                  </p>
                  <div className="flex items-baseline justify-between mt-1">
                    <h3 className="text-[28px] font-bold text-[#063653]">{totalApps}</h3>
                    <span className="text-[11px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">
                      All Districts
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">Total verification requests received</p>
                </div>

                <div className="bg-white border border-[#cbe0ee] rounded-lg p-4 shadow-xs">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#52728f]">
                    Pending LMO Assignment
                  </p>
                  <div className="flex items-baseline justify-between mt-1">
                    <h3 className="text-[28px] font-bold text-amber-600">{submittedCount}</h3>
                    {submittedCount > 0 ? (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded animate-pulse">
                        Action Required
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                        Cleared
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">Awaiting officer dispatch</p>
                </div>

                <div className="bg-white border border-[#cbe0ee] rounded-lg p-4 shadow-xs">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#52728f]">
                    Certificates Issued
                  </p>
                  <div className="flex items-baseline justify-between mt-1">
                    <h3 className="text-[28px] font-bold text-emerald-700">{totalCertificates}</h3>
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      {completionRate}% Complete
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">Legally verified with tamper seals</p>
                </div>

                <div className="bg-white border border-[#cbe0ee] rounded-lg p-4 shadow-xs">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#52728f]">
                    Active Field Officers (LMO)
                  </p>
                  <div className="flex items-baseline justify-between mt-1">
                    <h3 className="text-[28px] font-bold text-[#084a78]">{lmoOfficers.length}</h3>
                    <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                      All Deployed
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">Covering 4 regional zones</p>
                </div>
              </div>

              {/* Functional Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* 1. Workflow Pipeline Status Breakdown */}
                <div className="bg-white border border-[#d2e0eb] rounded-lg p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4 border-b pb-2">
                    <div>
                      <h4 className="font-bold text-[14px] text-[#063653] flex items-center gap-2">
                        <BarChart3 size={16} /> Application Pipeline Status
                      </h4>
                      <p className="text-[11px] text-gray-500">Live breakdown of all verification applications</p>
                    </div>
                    <span className="text-[11px] font-bold text-[#063653]">{totalApps} Total</span>
                  </div>

                  <div className="space-y-4">
                    {statusBars.map((bar) => {
                      const pct = totalApps > 0 ? Math.round((bar.count / totalApps) * 100) : 0;
                      return (
                        <div key={bar.label}>
                          <div className="flex justify-between text-[12px] font-semibold mb-1">
                            <span className="text-[#182b3d]">{bar.label}</span>
                            <span className={bar.text}>
                              {bar.count} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
                            <div
                              className={`${bar.color} h-full rounded-full transition-all duration-500`}
                              style={{ width: `${Math.max(pct, 4)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 p-3 bg-[#f5f8fa] rounded border border-gray-200 flex items-center justify-between text-[11px]">
                    <span className="text-gray-600">Verification Resolution Rate:</span>
                    <span className="font-bold text-emerald-700 text-[12px]">{completionRate}% Cleared</span>
                  </div>
                </div>

                {/* 2. District Distribution & Workload */}
                <div className="bg-white border border-[#d2e0eb] rounded-lg p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4 border-b pb-2">
                    <div>
                      <h4 className="font-bold text-[14px] text-[#063653] flex items-center gap-2">
                        <Building size={16} /> Regional Workload & District Breakdown
                      </h4>
                      <p className="text-[11px] text-gray-500">Applications distributed by city and state</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(districtCounts).map(([district, count]) => {
                      const share = totalApps > 0 ? Math.round((count / totalApps) * 100) : 0;
                      return (
                        <div
                          key={district}
                          className="p-3 bg-[#f9fcfe] border border-[#d8e6f1] rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-[13px] text-[#084a78] block">{district}</span>
                            <span className="text-[11px] text-gray-500">
                              Assigned Officer:{" "}
                              {lmoOfficers.find((l) => l.district === district)?.name || "Officer Assigned"}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-[15px] text-[#063653] block">{count}</span>
                            <span className="text-[10px] text-gray-500">{share}% of total</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 p-3 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
                    <span>Pending Dispatch: {submittedCount} items awaiting action</span>
                    <button
                      onClick={() => setActiveTab("applications")}
                      className="text-[11px] font-bold text-[#eb5405] hover:underline"
                    >
                      Assign Now →
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Table: Pending Applications Needing Attention */}
              {submittedCount > 0 && (
                <div className="bg-white border-2 border-amber-300 rounded-lg p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                      <h4 className="font-bold text-[14px] text-amber-900">
                        Immediate Action: {submittedCount} Applications Awaiting LMO Assignment
                      </h4>
                    </div>
                    <span className="text-[11px] text-gray-500">Select an officer to dispatch inspection</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[12px]">
                      <thead>
                        <tr className="bg-amber-50 text-amber-900 font-bold border-b border-amber-200">
                          <th className="p-2.5">App ID</th>
                          <th className="p-2.5">Owner / Trader</th>
                          <th className="p-2.5">Instrument</th>
                          <th className="p-2.5">District</th>
                          <th className="p-2.5">Applied Date</th>
                          <th className="p-2.5 text-right">Dispatch Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {applications
                          .filter((a) => a.status === "submitted")
                          .map((app) => (
                            <tr key={app.id} className="hover:bg-amber-50/50">
                              <td className="p-2.5 font-bold font-mono text-[#084a78]">{app.id}</td>
                              <td className="p-2.5 font-medium">{app.ownerName} ({app.ownerOrg})</td>
                              <td className="p-2.5 text-gray-700">{app.instrumentName}</td>
                              <td className="p-2.5">
                                <span className="bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                  {app.district}
                                </span>
                              </td>
                              <td className="p-2.5 text-gray-600">{app.appliedDate}</td>
                              <td className="p-2.5 text-right">
                                <button
                                  onClick={() => handleOpenAssignModal(app)}
                                  className="bg-[#eb5405] hover:bg-[#d44700] text-white px-3 py-1 rounded text-[11px] font-bold shadow-xs transition"
                                >
                                  Assign LMO
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: VERIFICATION QUEUE & ASSIGNMENT ================= */}
          {activeTab === "applications" && (
            <div className="bg-white border border-[#d2e0eb] rounded-lg p-5 shadow-xs space-y-4">
              {/* Filters bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f5f8fa] p-3 rounded-lg border border-gray-200 text-[12px]">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Search */}
                  <div className="relative min-w-[200px]">
                    <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search ID, owner, scale..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded pl-8 pr-2.5 py-1 text-[12px] focus:outline-none focus:border-[#084a78]"
                    />
                  </div>

                  {/* Status filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-gray-600">Status:</span>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="bg-white border border-gray-300 rounded px-2 py-1 text-[12px]"
                    >
                      <option value="all">All Statuses ({applications.length})</option>
                      <option value="submitted">Pending Assignment ({submittedCount})</option>
                      <option value="assigned">Assigned to LMO ({assignedCount})</option>
                      <option value="scheduled">Scheduled ({scheduledCount})</option>
                      <option value="completed">Completed ({completedCount})</option>
                    </select>
                  </div>

                  {/* District filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-gray-600">District:</span>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="bg-white border border-gray-300 rounded px-2 py-1 text-[12px]"
                    >
                      <option value="all">All Districts</option>
                      <option value="Jaipur">Jaipur</option>
                      <option value="Lucknow">Lucknow</option>
                      <option value="Mumbai">Mumbai</option>
                    </select>
                  </div>
                </div>

                <div className="text-[11px] text-gray-500">
                  Showing <strong>{filteredApplications.length}</strong> applications
                </div>
              </div>

              {/* Main table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px] border-collapse">
                  <thead>
                    <tr className="bg-[#f0f5f9] text-[#063653] border-b border-[#cce0ee] text-[11px] uppercase tracking-wider">
                      <th className="p-3 font-bold">App ID</th>
                      <th className="p-3 font-bold">Trader / Business</th>
                      <th className="p-3 font-bold">Instrument</th>
                      <th className="p-3 font-bold">District & Mode</th>
                      <th className="p-3 font-bold">Status</th>
                      <th className="p-3 font-bold">Assigned LMO</th>
                      <th className="p-3 font-bold">Inspection Date</th>
                      <th className="p-3 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-gray-500">
                          No applications match the current filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-[#f8fbfd] transition">
                          <td className="p-3 font-bold font-mono text-[#084a78]">{app.id}</td>
                          <td className="p-3">
                            <span className="font-semibold text-gray-900 block">{app.ownerName}</span>
                            <span className="text-[10px] text-gray-500">{app.ownerOrg}</span>
                          </td>
                          <td className="p-3 font-medium text-gray-800">{app.instrumentName}</td>
                          <td className="p-3">
                            <span className="font-semibold block">{app.district}</span>
                            <span className="text-[10px] text-gray-500 uppercase">{app.verificationLocation}</span>
                          </td>
                          <td className="p-3">
                            {app.status === "completed" ? (
                              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                ✓ COMPLETED
                              </span>
                            ) : app.status === "scheduled" ? (
                              <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                SCHEDULED
                              </span>
                            ) : app.status === "assigned" ? (
                              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                ASSIGNED
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase animate-pulse">
                                SUBMITTED
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            {app.assignedLmoName ? (
                              <span className="font-semibold text-emerald-800">{app.assignedLmoName}</span>
                            ) : (
                              <span className="text-amber-600 font-semibold italic text-[11px]">Unassigned</span>
                            )}
                          </td>
                          <td className="p-3 text-gray-600 text-[11px]">
                            {app.scheduledDate ? (
                              <span>
                                {app.scheduledDate} {app.scheduledTime && `(${app.scheduledTime})`}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {app.status === "submitted" ? (
                              <button
                                onClick={() => handleOpenAssignModal(app)}
                                className="bg-[#eb5405] hover:bg-[#d44700] text-white px-2.5 py-1 rounded text-[11px] font-bold shadow-xs transition"
                              >
                                Assign LMO
                              </button>
                            ) : app.status === "assigned" ? (
                              <button
                                onClick={() => handleOpenAssignModal(app)}
                                className="bg-[#053b5c] hover:bg-[#084a73] text-white px-2 py-1 rounded text-[10px] font-semibold transition"
                              >
                                Reassign
                              </button>
                            ) : (
                              <span className="text-[10px] text-gray-400 font-semibold">In Progress</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 3: OFFICERS & TRADERS ================= */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {/* LMO Officers */}
              <div className="bg-white border border-[#d2e0eb] rounded-lg p-5 shadow-xs">
                <h4 className="font-bold text-[15px] text-[#063653] mb-3 flex items-center gap-2">
                  <UserCheck size={18} /> Legal Metrology Officers (LMO / Inspectors)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {lmoOfficers.map((lmo) => {
                    const assignedToThisLmo = applications.filter((a) => a.assignedLmoId === lmo.id);
                    return (
                      <div
                        key={lmo.id}
                        className="p-4 rounded-lg border border-[#cce0ee] bg-[#f9fbfd] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-[#159447] text-white font-bold flex items-center justify-center text-[13px]">
                              {lmo.avatar || "LM"}
                            </div>
                            <div>
                              <h5 className="font-bold text-[13px] text-[#182b3d]">{lmo.name}</h5>
                              <p className="text-[11px] text-gray-500">{lmo.designation}</p>
                            </div>
                          </div>
                          <p className="text-[11px] text-[#053b5c] font-medium">
                            District: {lmo.district}, {lmo.state}
                          </p>
                          <p className="text-[10px] text-gray-500">{lmo.email}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-[11px]">
                          <span className="text-gray-600">Active Workload:</span>
                          <span className="font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                            {assignedToThisLmo.length} Inspections
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Registered Traders */}
              <div className="bg-white border border-[#d2e0eb] rounded-lg p-5 shadow-xs">
                <h4 className="font-bold text-[15px] text-[#063653] mb-3 flex items-center gap-2">
                  <Building size={18} /> Commercial Establishments & Traders
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[12px]">
                    <thead>
                      <tr className="bg-[#f0f5f9] text-[#063653] font-bold border-b">
                        <th className="p-3">Trader Name</th>
                        <th className="p-3">Organization / Business</th>
                        <th className="p-3">Location</th>
                        <th className="p-3">Registered Instruments</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {traderUsers.map((trader) => {
                        const count = instruments.filter((i) => i.ownerId === trader.id).length;
                        return (
                          <tr key={trader.id} className="hover:bg-gray-50">
                            <td className="p-3 font-semibold text-gray-900">{trader.name}</td>
                            <td className="p-3 text-gray-700">{trader.organization}</td>
                            <td className="p-3 text-gray-600">
                              {trader.district}, {trader.state}
                            </td>
                            <td className="p-3 font-bold text-[#053b5c]">{count} Equipment</td>
                            <td className="p-3">
                              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                                ACTIVE
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: AUDIT LOG ================= */}
          {activeTab === "activity" && (
            <div className="bg-white border border-[#d2e0eb] rounded-lg p-5 shadow-xs">
              <h4 className="font-bold text-[15px] text-[#063653] mb-3 flex items-center gap-2">
                <Clock size={18} /> System Audit Trail & Real-Time Event Stream
              </h4>
              <p className="text-[12px] text-gray-500 mb-4">
                Chronological log of applications, inspections, certificates, and officer dispatches.
              </p>

              <div className="space-y-3">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-lg border border-gray-100 bg-[#f9fcff] flex items-center justify-between text-[12px]"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          act.role === "admin"
                            ? "bg-[#eb5405] text-white"
                            : act.role === "lmo"
                            ? "bg-[#159447] text-white"
                            : "bg-[#084a78] text-white"
                        }`}
                      >
                        {act.role}
                      </span>
                      <span className="font-medium text-[#182b3d]">{act.text}</span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= MODAL: ASSIGN LMO ================= */}
      {assignModalApp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#053b5c] text-white px-5 py-4 flex items-center justify-between border-b-2 border-[#eb5405]">
              <div className="flex items-center gap-2">
                <UserCheck size={18} className="text-[#eb5405]" />
                <h3 className="font-bold text-[15px]">Assign Legal Metrology Officer</h3>
              </div>
              <button
                onClick={() => setAssignModalApp(null)}
                className="text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment} className="p-5 space-y-3.5 text-[12px]">
              <div className="bg-[#f0f6fa] p-3 rounded border border-[#cce0ee]">
                <p className="font-bold text-[#053b5c]">{assignModalApp.id}</p>
                <p className="text-[11px] text-gray-700 mt-0.5">
                  <strong>Instrument:</strong> {assignModalApp.instrumentName}
                </p>
                <p className="text-[11px] text-gray-700">
                  <strong>Trader:</strong> {assignModalApp.ownerName} ({assignModalApp.ownerOrg})
                </p>
                <p className="text-[11px] text-gray-700">
                  <strong>Location:</strong> {assignModalApp.district}, {assignModalApp.state} ({assignModalApp.verificationLocation})
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#182b3d] mb-1">
                  Select Inspecting Officer (LMO)
                </label>
                <select
                  required
                  value={selectedLmoId}
                  onChange={(e) => setSelectedLmoId(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-2 text-[12px] focus:outline-none focus:border-[#084a78]"
                >
                  <option value="">-- Choose an Officer --</option>
                  {lmoOfficers.map((lmo) => (
                    <option key={lmo.id} value={lmo.id}>
                      {lmo.name} — {lmo.designation} ({lmo.district})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  Recommended: Select the officer assigned to {assignModalApp.district} jurisdiction.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setAssignModalApp(null)}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-[12px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#eb5405] hover:bg-[#d44700] text-white px-4 py-1.5 rounded font-semibold text-[12px] shadow-sm"
                >
                  Confirm & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}