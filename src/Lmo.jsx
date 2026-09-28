import React, { useState } from "react";
import { useData } from "./DataContext";
import {
  LayoutDashboard,
  ClipboardList,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Search,
  X,
  FileCheck2,
  Filter,
  Check,
  Building,
  MapPin,
  CalendarDays,
  FileText,
  ChevronDown,
} from "lucide-react";

export default function OfficerDashboard({ onLogout }) {
  const {
    currentUser,
    applications,
    instruments,
    certificates,
    scheduleInspection,
    completeVerification,
  } = useData();

  const [activeTab, setActiveTab] = useState("queue"); // queue | diary | history
  const [filterMode, setFilterMode] = useState("my"); // 'my' = my assigned, 'all' = all LMO applications

  // Modals state
  const [scheduleModalApp, setScheduleModalApp] = useState(null);
  const [verifyModalApp, setVerifyModalApp] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Schedule form state
  const [scheduleDate, setScheduleDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [scheduleTime, setScheduleTime] = useState("11:00 AM");

  // Verification Form state
  const [verificationForm, setVerificationForm] = useState({
    result: "pass",
    readings: "Standard weight: 50kg, Measured: 50.01kg",
    errorFound: "+0.01kg",
    toleranceWithin: true,
    remarks: "Within maximum permissible error (MPE). Tamper-evident lead seal affixed.",
    sealNumber: `SEAL-${currentUser?.state?.slice(0, 3)?.toUpperCase() || "GOI"}-${Math.floor(1000 + Math.random() * 9000)}`,
  });

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Filter applications for this LMO
  const myApplications = applications.filter((app) => {
    if (filterMode === "my") {
      return (
        app.assignedLmoId === currentUser?.id ||
        app.assignedLmoName === currentUser?.name ||
        (!app.assignedLmoId && app.district === currentUser?.district)
      );
    }
    return true; // Show all assigned
  });

  // Metric counts
  const totalAssigned = myApplications.length;
  const pendingScheduling = myApplications.filter((a) => a.status === "assigned").length;
  const scheduledInspections = myApplications.filter((a) => a.status === "scheduled").length;
  const completedInspections = myApplications.filter((a) => a.status === "completed").length;

  // Handle schedule submit
  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!scheduleModalApp) return;

    scheduleInspection(scheduleModalApp.id, scheduleDate, scheduleTime);
    setScheduleModalApp(null);
    triggerToast(`Inspection for ${scheduleModalApp.id} scheduled on ${scheduleDate} at ${scheduleTime}!`);
  };

  // Handle verification submit
  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (!verifyModalApp) return;

    completeVerification(verifyModalApp.id, verificationForm);
    const wasPass = verificationForm.result === "pass";
    setVerifyModalApp(null);
    triggerToast(
      wasPass
        ? `✓ Verification PASSED! Certificate generated and seal ${verificationForm.sealNumber} recorded.`
        : `✗ Verification FAILED. Rejection recorded for ${verifyModalApp.id}.`
    );
  };

  const openVerifyModal = (app) => {
    setVerifyModalApp(app);
    // Pre-fill sensible default readings based on instrument
    const isWeighing = app.instrumentName?.toLowerCase().includes("scale") || app.instrumentName?.toLowerCase().includes("weigh");
    const isPump = app.instrumentName?.toLowerCase().includes("pump") || app.instrumentName?.toLowerCase().includes("fuel");

    setVerificationForm({
      result: "pass",
      readings: isPump
        ? "Standard 5L test measure delivered: 5005 ml (Error: +5 ml)"
        : isWeighing
        ? "Standard test weights applied (100kg): Measured 100.02kg"
        : "Standard measure comparison completed",
      errorFound: isPump ? "+5 ml" : "+0.02 kg",
      toleranceWithin: true,
      remarks: "Equipment complies with Legal Metrology (General) Rules 2011 specifications.",
      sealNumber: `SEAL-${currentUser?.state?.slice(0, 3)?.toUpperCase() || "GOI"}-${Math.floor(1000 + Math.random() * 9000)}`,
    });
  };

  return (
    <div className="min-h-screen bg-[#e9eef2] font-sans text-[#12263b] flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-12 right-6 z-50 bg-[#053b5c] text-white px-5 py-3 rounded-lg shadow-xl border-l-4 border-[#159447] flex items-center gap-3 animate-bounce">
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
          <button
            onClick={onLogout}
            className="flex items-center gap-2.5 hover:bg-white/10 p-1.5 rounded transition text-left cursor-pointer border border-transparent hover:border-white/20"
            title="Click to logout"
          >
            <div className="w-[36px] h-[36px] rounded-full bg-white/20 flex items-center justify-center font-bold text-[13px] border border-white/30 text-white">
              {currentUser?.avatar || "LM"}
            </div>
            <div className="hidden sm:block">
              <p className="text-[13px] font-semibold leading-tight text-white flex items-center gap-1">
                {currentUser?.name}
                <ChevronDown size={14} className="text-white/70" />
              </p>
              <p className="text-[10px] text-[#c7deed] truncate max-w-[140px]">
                {currentUser?.designation || "LMO"}
              </p>
            </div>
          </button>
        </div>
      </header>

      {/* ================= BODY ================= */}
      <div className="flex flex-1">
        {/* ================= SIDEBAR ================= */}
        <aside className="w-[210px] bg-white border-r border-[#dce4e9] text-[#182b3d] flex flex-col flex-shrink-0 p-3 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#6b8296] px-3 py-2">
            Field Menu
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("queue")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-[13px] font-medium transition ${
                activeTab === "queue"
                  ? "bg-[#f0f6fa] text-[#084a78] font-semibold border-l-4 border-[#159447]"
                  : "text-[#334e68] hover:bg-[#f8fafc]"
              }`}
            >
              <div className="flex items-center gap-3">
                <ClipboardList size={16} />
                <span>Verification Queue</span>
              </div>
              {pendingScheduling + scheduledInspections > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                  {pendingScheduling + scheduledInspections}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("diary")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-[13px] font-medium transition ${
                activeTab === "diary"
                  ? "bg-[#f0f6fa] text-[#084a78] font-semibold border-l-4 border-[#159447]"
                  : "text-[#334e68] hover:bg-[#f8fafc]"
              }`}
            >
              <div className="flex items-center gap-3">
                <CalendarDays size={16} />
                <span>Inspection Diary</span>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-mono">
                {scheduledInspections}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-[13px] font-medium transition ${
                activeTab === "history"
                  ? "bg-[#f0f6fa] text-[#084a78] font-semibold border-l-4 border-[#159447]"
                  : "text-[#334e68] hover:bg-[#f8fafc]"
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} />
                <span>Completed Audits</span>
              </div>
              <span className="bg-[#e4eff7] text-[#084a78] text-[10px] px-1.5 py-0.5 rounded font-mono">
                {completedInspections}
              </span>
            </button>
          </nav>

          <div className="mt-auto p-3 bg-[#f8fafc] rounded-lg border border-[#e4eff7] text-[11px] text-[#4b6b85]">
            <p className="font-semibold text-[#063653] mb-1">Testing Kit Ready</p>
            <p className="text-[10px] text-[#6b8296]">Calibrated Test Weights: F1 Class Certified</p>
            <p className="text-[10px] text-[#6b8296] mt-0.5">Tamper Seals Issued: 25</p>
          </div>
        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <main className="flex-1 p-5 overflow-y-auto max-w-7xl">
          {/* Header row with stats */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-[22px] font-bold text-[#063653]">
                {activeTab === "queue" && "Inspection Dispatch & Action Queue"}
                {activeTab === "diary" && "Scheduled Inspection Calendar & Visits"}
                {activeTab === "history" && "Verification Stamping & Completed Records"}
              </h2>
              <p className="text-[12px] text-[#55697d]">
                Officer: <span className="font-semibold text-[#182b3d]">{currentUser?.name}</span> • Jurisdiction: {currentUser?.district}, {currentUser?.state}
              </p>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-2 bg-white border border-[#cbe0ee] p-1 rounded-lg text-[12px]">
              <button
                onClick={() => setFilterMode("my")}
                className={`px-3 py-1 rounded font-semibold transition ${
                  filterMode === "my" ? "bg-[#053b5c] text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                My Assigned ({myApplications.length})
              </button>
              <button
                onClick={() => setFilterMode("all")}
                className={`px-3 py-1 rounded font-semibold transition ${
                  filterMode === "all" ? "bg-[#053b5c] text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                All Applications ({applications.length})
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-5">
            <div className="bg-white border border-[#cbe0ee] rounded-lg p-3.5 shadow-xs">
              <span className="text-[11px] font-semibold uppercase text-gray-500 block">Total Workload</span>
              <span className="text-[24px] font-bold text-[#063653] block mt-0.5">{totalAssigned}</span>
              <span className="text-[10px] text-gray-400">Applications in queue</span>
            </div>

            <div className="bg-white border border-[#cbe0ee] rounded-lg p-3.5 shadow-xs">
              <span className="text-[11px] font-semibold uppercase text-amber-700 block">Needs Scheduling</span>
              <span className="text-[24px] font-bold text-amber-600 block mt-0.5">{pendingScheduling}</span>
              <span className="text-[10px] text-amber-700">Awaiting inspection date</span>
            </div>

            <div className="bg-white border border-[#cbe0ee] rounded-lg p-3.5 shadow-xs">
              <span className="text-[11px] font-semibold uppercase text-indigo-700 block">Scheduled Visits</span>
              <span className="text-[24px] font-bold text-indigo-700 block mt-0.5">{scheduledInspections}</span>
              <span className="text-[10px] text-indigo-600">Ready for verification</span>
            </div>

            <div className="bg-white border border-[#cbe0ee] rounded-lg p-3.5 shadow-xs">
              <span className="text-[11px] font-semibold uppercase text-emerald-700 block">Stamped & Verified</span>
              <span className="text-[24px] font-bold text-emerald-700 block mt-0.5">{completedInspections}</span>
              <span className="text-[10px] text-emerald-600">Certificates issued</span>
            </div>
          </div>

          {/* ================= TAB 1: QUEUE ================= */}
          {activeTab === "queue" && (
            <div className="bg-white border border-[#d2e0eb] rounded-lg p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b pb-2">
                <p className="text-[13px] text-gray-600">
                  Select an application to <strong>Schedule an Inspection Date</strong> or <strong>Conduct Physical Verification</strong>.
                </p>
                <span className="text-[11px] font-bold text-[#053b5c]">
                  {myApplications.length} Total in Queue
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px] border-collapse">
                  <thead>
                    <tr className="bg-[#f0f5f9] text-[#063653] border-b border-[#cce0ee] text-[11px] uppercase tracking-wider">
                      <th className="p-3 font-bold">App ID</th>
                      <th className="p-3 font-bold">Trader / Business</th>
                      <th className="p-3 font-bold">Instrument Description</th>
                      <th className="p-3 font-bold">Location & District</th>
                      <th className="p-3 font-bold">Scheduled Time</th>
                      <th className="p-3 font-bold">Current Status</th>
                      <th className="p-3 font-bold text-right">Field Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {myApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-[#f8fbfd] transition">
                        <td className="p-3 font-bold font-mono text-[#084a78]">{app.id}</td>
                        <td className="p-3">
                          <span className="font-semibold text-gray-900 block">{app.ownerName}</span>
                          <span className="text-[10px] text-gray-500">{app.ownerOrg}</span>
                        </td>
                        <td className="p-3 font-medium text-gray-800">{app.instrumentName}</td>
                        <td className="p-3">
                          <span className="font-semibold block">{app.district}</span>
                          <span className="text-[10px] text-gray-500 capitalize">{app.verificationLocation} inspection</span>
                        </td>
                        <td className="p-3 text-[11px]">
                          {app.scheduledDate ? (
                            <span className="font-semibold text-indigo-700">
                              {app.scheduledDate} {app.scheduledTime && `• ${app.scheduledTime}`}
                            </span>
                          ) : (
                            <span className="text-amber-700 italic">Not scheduled yet</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              app.status === "completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : app.status === "scheduled"
                                ? "bg-indigo-100 text-indigo-800"
                                : app.status === "assigned"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Schedule Button */}
                            {app.status !== "completed" && (
                              <button
                                onClick={() => setScheduleModalApp(app)}
                                className="bg-[#053b5c] hover:bg-[#094c75] text-white px-2.5 py-1 rounded text-[11px] font-semibold transition"
                                title="Set inspection date and time"
                              >
                                {app.scheduledDate ? "Reschedule" : "Schedule"}
                              </button>
                            )}

                            {/* Conduct Verification Button */}
                            {app.status !== "completed" ? (
                              <button
                                onClick={() => openVerifyModal(app)}
                                className="bg-[#159447] hover:bg-[#117a3a] text-white px-3 py-1 rounded text-[11px] font-bold shadow-xs transition flex items-center gap-1"
                                title="Enter verification test readings and issue seal"
                              >
                                <Check size={12} /> Verify
                              </button>
                            ) : (
                              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                ✓ Certified
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 2: DIARY / CALENDAR ================= */}
          {activeTab === "diary" && (
            <div className="bg-white border border-[#d2e0eb] rounded-lg p-5 shadow-xs space-y-4">
              <h4 className="font-bold text-[15px] text-[#063653] flex items-center gap-2">
                <CalendarDays size={18} /> Field Inspection Diary & Planned Visits
              </h4>

              <div className="space-y-3">
                {myApplications.filter((a) => a.scheduledDate).length === 0 ? (
                  <p className="text-gray-500 text-xs py-8 text-center">
                    No inspections scheduled yet. Use the "Schedule" button in the queue tab.
                  </p>
                ) : (
                  myApplications
                    .filter((a) => a.scheduledDate)
                    .map((app) => (
                      <div
                        key={app.id}
                        className="p-4 rounded-lg border border-[#cbe0ee] bg-[#f9fcff] flex flex-wrap items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-indigo-50 border border-indigo-200 rounded-lg flex flex-col items-center justify-center text-indigo-700">
                            <span className="text-[9px] uppercase font-bold">DATE</span>
                            <span className="text-[13px] font-bold leading-none">
                              {app.scheduledDate.split("-")[2] || "DAY"}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[13px] text-[#053b5c]">{app.id}</span>
                              <span className="text-[11px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-semibold">
                                {app.scheduledTime || "11:00 AM"}
                              </span>
                            </div>
                            <p className="text-[12px] font-semibold text-gray-800 mt-0.5">{app.instrumentName}</p>
                            <p className="text-[11px] text-gray-500">
                              Trader: {app.ownerName} ({app.ownerOrg}) • Location: {app.district} ({app.verificationLocation})
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {app.status !== "completed" ? (
                            <button
                              onClick={() => openVerifyModal(app)}
                              className="bg-[#159447] hover:bg-[#117a3a] text-white px-3 py-1.5 rounded text-[11px] font-bold shadow-xs transition"
                            >
                              Conduct Verification Now
                            </button>
                          ) : (
                            <span className="text-emerald-700 font-bold text-[11px]">Completed & Stamped</span>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 3: HISTORY ================= */}
          {activeTab === "history" && (
            <div className="bg-white border border-[#d2e0eb] rounded-lg p-5 shadow-xs">
              <h4 className="font-bold text-[15px] text-[#063653] mb-3 flex items-center gap-2">
                <CheckCircle2 size={18} /> Verified Equipment & Certificate Issuance Records
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="bg-[#f0f5f9] text-[#063653] font-bold border-b">
                      <th className="p-3">App ID</th>
                      <th className="p-3">Certificate Number</th>
                      <th className="p-3">Trader</th>
                      <th className="p-3">Instrument</th>
                      <th className="p-3">Seal Number</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {applications
                      .filter((a) => a.status === "completed")
                      .map((app) => (
                        <tr key={app.id} className="hover:bg-gray-50">
                          <td className="p-3 font-mono font-bold text-[#084a78]">{app.id}</td>
                          <td className="p-3 font-mono text-emerald-800 font-semibold">
                            {app.certificateNumber || "LM-2025-XXXX"}
                          </td>
                          <td className="p-3 font-medium">{app.ownerName}</td>
                          <td className="p-3">{app.instrumentName}</td>
                          <td className="p-3 font-mono text-[11px]">
                            {app.observations?.sealNumber || "SEAL-OK"}
                          </td>
                          <td className="p-3 text-gray-500">{app.verificationDate || app.appliedDate}</td>
                          <td className="p-3">
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                              PASS
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= MODAL: SCHEDULE INSPECTION ================= */}
      {scheduleModalApp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#053b5c] text-white px-5 py-4 flex items-center justify-between border-b-2 border-[#159447]">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-[#159447]" />
                <h3 className="font-bold text-[15px]">Schedule Field Inspection</h3>
              </div>
              <button
                onClick={() => setScheduleModalApp(null)}
                className="text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-5 space-y-3.5 text-[12px]">
              <div className="bg-[#f0f6fa] p-3 rounded border border-[#cce0ee]">
                <p className="font-bold text-[#053b5c]">{scheduleModalApp.id}</p>
                <p className="text-[11px] text-gray-700 mt-0.5">
                  <strong>Trader:</strong> {scheduleModalApp.ownerName} ({scheduleModalApp.ownerOrg})
                </p>
                <p className="text-[11px] text-gray-700">
                  <strong>Instrument:</strong> {scheduleModalApp.instrumentName}
                </p>
                <p className="text-[11px] text-gray-700">
                  <strong>Location:</strong> {scheduleModalApp.district} ({scheduleModalApp.verificationLocation})
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#182b3d] mb-1">
                  Proposed Inspection Date
                </label>
                <input
                  type="date"
                  required
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-[12px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#182b3d] mb-1">
                  Inspection Time Slot
                </label>
                <select
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-[12px]"
                >
                  <option value="10:00 AM">10:00 AM (Morning Slot)</option>
                  <option value="11:30 AM">11:30 AM (Late Morning)</option>
                  <option value="02:00 PM">02:00 PM (Afternoon Slot)</option>
                  <option value="04:00 PM">04:00 PM (Evening Slot)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setScheduleModalApp(null)}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-[12px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#159447] hover:bg-[#117a3a] text-white px-4 py-1.5 rounded font-semibold text-[12px] shadow-sm"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONDUCT VERIFICATION & STAMP ================= */}
      {verifyModalApp && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#053b5c] text-white px-5 py-4 flex items-center justify-between border-b-2 border-[#159447]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400" />
                <h3 className="font-bold text-[15px]">Legal Metrology Verification & Stamping</h3>
              </div>
              <button
                onClick={() => setVerifyModalApp(null)}
                className="text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="p-5 space-y-3.5 text-[12px]">
              <div className="bg-[#f0f6fa] p-3 rounded border border-[#cce0ee] flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#053b5c]">{verifyModalApp.id}</p>
                  <p className="text-[11px] text-gray-700">{verifyModalApp.instrumentName}</p>
                  <p className="text-[10px] text-gray-500">Trader: {verifyModalApp.ownerName}</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Ready for Test
                </span>
              </div>

              {/* Physical Readings */}
              <div>
                <label className="block font-semibold text-[#182b3d] mb-1">
                  Test Readings / Standard Weights Applied
                </label>
                <input
                  type="text"
                  required
                  value={verificationForm.readings}
                  onChange={(e) =>
                    setVerificationForm({ ...verificationForm, readings: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-[12px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#182b3d] mb-1">
                    Observed Error
                  </label>
                  <input
                    type="text"
                    required
                    value={verificationForm.errorFound}
                    onChange={(e) =>
                      setVerificationForm({ ...verificationForm, errorFound: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-[12px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#182b3d] mb-1">
                    Lead Seal / Tamper Seal No.
                  </label>
                  <input
                    type="text"
                    required
                    value={verificationForm.sealNumber}
                    onChange={(e) =>
                      setVerificationForm({ ...verificationForm, sealNumber: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-[12px] font-mono"
                  />
                </div>
              </div>

              {/* Tolerance checkbox */}
              <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded border border-gray-200">
                <input
                  type="checkbox"
                  id="tol"
                  checked={verificationForm.toleranceWithin}
                  onChange={(e) =>
                    setVerificationForm({ ...verificationForm, toleranceWithin: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="tol" className="font-semibold text-gray-700 cursor-pointer">
                  Within Maximum Permissible Error (MPE) as per Schedule IX
                </label>
              </div>

              {/* Outcome Selection */}
              <div>
                <label className="block font-semibold text-[#182b3d] mb-1">Inspection Outcome</label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`border rounded p-2.5 flex items-center gap-2 cursor-pointer transition ${
                      verificationForm.result === "pass"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="res"
                      value="pass"
                      checked={verificationForm.result === "pass"}
                      onChange={(e) =>
                        setVerificationForm({ ...verificationForm, result: e.target.value })
                      }
                    />
                    <span>PASS (Issue Certificate)</span>
                  </label>

                  <label
                    className={`border rounded p-2.5 flex items-center gap-2 cursor-pointer transition ${
                      verificationForm.result === "fail"
                        ? "border-red-600 bg-red-50 text-red-900 font-bold"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="res"
                      value="fail"
                      checked={verificationForm.result === "fail"}
                      onChange={(e) =>
                        setVerificationForm({ ...verificationForm, result: e.target.value })
                      }
                    />
                    <span>FAIL (Reject & Notice)</span>
                  </label>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block font-semibold text-[#182b3d] mb-1">
                  Inspector Remarks
                </label>
                <textarea
                  rows={2}
                  value={verificationForm.remarks}
                  onChange={(e) =>
                    setVerificationForm({ ...verificationForm, remarks: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-[12px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setVerifyModalApp(null)}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-[12px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#159447] hover:bg-[#117a3a] text-white px-5 py-1.5 rounded font-bold text-[12px] shadow-sm flex items-center gap-1.5"
                >
                  <ShieldCheck size={15} /> Confirm Verification & Stamp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}