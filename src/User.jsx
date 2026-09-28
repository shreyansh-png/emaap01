import React, { useState } from "react";
import { useData } from "./DataContext";
import {
  LayoutDashboard,
  Gauge,
  PlusCircle,
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Search,
  X,
  Printer,
  QrCode,
  ShieldCheck,
  Building,
  Calendar,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

export default function UserDashboard({ onLogout }) {
  const {
    currentUser,
    instruments,
    applications,
    certificates,
    addInstrument,
    applyVerification,
  } = useData();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState("overview");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [selectedInstForApply, setSelectedInstForApply] = useState(null);

  // Form states for Add Instrument
  const [newInstForm, setNewInstForm] = useState({
    type: "Electronic Weighing Machine",
    model: "MDL-550",
    serialNumber: "",
    manufacturer: "Avery India Ltd",
    capacity: "100 kg",
    accuracy: "Class III",
    location: currentUser?.address || "Main Shop, Jaipur",
  });

  // Form state for Apply Verification
  const [applyForm, setApplyForm] = useState({
    instrumentId: "",
    type: "initial",
    verificationLocation: "on-site",
  });

  const [notification, setNotification] = useState("");

  const triggerToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 4000);
  };

  // Filter items owned by this current user
  const userInstruments = instruments.filter(
    (i) => i.ownerId === currentUser?.id || i.ownerName === currentUser?.name
  );
  const userApplications = applications.filter(
    (a) => a.ownerId === currentUser?.id || a.ownerName === currentUser?.name
  );
  const userCertificates = certificates.filter(
    (c) => c.ownerId === currentUser?.id || c.ownerName === currentUser?.name
  );

  // Stats calculation
  const totalInstruments = userInstruments.length;
  const verifiedCount = userInstruments.filter((i) => i.status === "verified").length;
  const pendingApps = userApplications.filter(
    (a) => a.status === "submitted" || a.status === "assigned" || a.status === "scheduled"
  ).length;
  const certificatesCount = userCertificates.length;

  // Handle adding an instrument
  const handleAddInstrumentSubmit = (e) => {
    e.preventDefault();
    if (!newInstForm.serialNumber) {
      newInstForm.serialNumber = `SER-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    const created = addInstrument(newInstForm);
    setShowAddModal(false);
    triggerToast(`Instrument ${created.type} (${created.serialNumber}) added successfully!`);
    // Optionally open apply modal immediately
    setSelectedInstForApply(created.id);
  };

  // Handle applying for verification
  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!applyForm.instrumentId) {
      alert("Please select an instrument to verify.");
      return;
    }
    try {
      const app = applyVerification(applyForm);
      setShowApplyModal(false);
      triggerToast(`Application ${app.id} submitted for verification! It is now pending assignment.`);
      setActiveTab("applications");
    } catch (err) {
      alert(err.message);
    }
  };

  const openApplyForSpecific = (instId) => {
    setApplyForm((prev) => ({ ...prev, instrumentId: instId }));
    setShowApplyModal(true);
  };

  return (
    <div className="min-h-screen bg-[#e9eef2] font-sans text-[#12263b] flex flex-col">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-12 right-6 z-50 bg-[#053b5c] text-white px-5 py-3 rounded-lg shadow-xl border-l-4 border-[#eb5405] flex items-center gap-3 animate-bounce">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-[13px] font-medium">{notification}</span>
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

        {/* RIGHT: Actions & Profile */}
        <div className="flex items-center justify-end gap-4 flex-1">
          <button
            onClick={() => setShowAddModal(true)}
            className="hidden md:flex items-center gap-1.5 bg-[#eb5405] hover:bg-[#d44700] text-white text-[12px] font-semibold px-4 py-1.5 rounded transition"
          >
            <PlusCircle size={15} />
            <span>Add Instrument</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-2.5 hover:bg-white/10 p-1.5 rounded transition text-left cursor-pointer border border-transparent hover:border-white/20"
            title="Click to logout"
          >
            <div className="w-[36px] h-[36px] rounded-full bg-white/20 flex items-center justify-center font-bold text-[13px] border border-white/30 text-white">
              {currentUser?.avatar || "TR"}
            </div>
            <div className="hidden sm:block">
              <p className="text-[13px] font-semibold leading-tight text-white flex items-center gap-1">
                {currentUser?.name}
                <ChevronDown size={14} className="text-white/70" />
              </p>
              <p className="text-[10px] text-[#c7deed] truncate max-w-[140px]">
                {currentUser?.organization || "Trader"}
              </p>
            </div>
          </button>
        </div>
      </header>

      {/* ================= MAIN CONTAINER ================= */}
      <div className="flex flex-1">
        {/* ================= SIDEBAR ================= */}
        <aside className="w-[210px] bg-white border-r border-[#dce4e9] text-[#182b3d] flex flex-col flex-shrink-0 p-3 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#6b8296] px-3 py-2">
            Main Menu
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
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("instruments")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-[13px] font-medium transition ${
                activeTab === "instruments"
                  ? "bg-[#f0f6fa] text-[#084a78] font-semibold border-l-4 border-[#eb5405]"
                  : "text-[#334e68] hover:bg-[#f8fafc]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Gauge size={16} />
                <span>My Instruments</span>
              </div>
              <span className="bg-[#e4eff7] text-[#084a78] text-[10px] px-1.5 py-0.5 rounded font-bold">
                {totalInstruments}
              </span>
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
                <Clock size={16} />
                <span>Applications</span>
              </div>
              {pendingApps > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                  {pendingApps}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("certificates")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-[13px] font-medium transition ${
                activeTab === "certificates"
                  ? "bg-[#f0f6fa] text-[#084a78] font-semibold border-l-4 border-[#eb5405]"
                  : "text-[#334e68] hover:bg-[#f8fafc]"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileCheck2 size={16} />
                <span>Certificates</span>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                {certificatesCount}
              </span>
            </button>
          </nav>

          <div className="mt-auto p-3 bg-[#f8fafc] rounded-lg border border-[#e4eff7] text-[11px] text-[#4b6b85]">
            <p className="font-semibold text-[#063653] mb-1">Support Desk</p>
            <p>Toll Free: 1800-11-4000</p>
            <p className="text-[10px] mt-1 text-[#6b8296]">Hours: 9:30 AM - 6:00 PM</p>
          </div>
        </aside>

        {/* ================= CONTENT AREA ================= */}
        <main className="flex-1 p-5 overflow-y-auto max-w-7xl">
          {/* Top Bar for tab title + quick action */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-[22px] font-bold text-[#063653]">
                {activeTab === "overview" && "Dashboard Overview"}
                {activeTab === "instruments" && "Registered Instruments"}
                {activeTab === "applications" && "Verification Applications & Status"}
                {activeTab === "certificates" && "Official Verification Certificates"}
              </h2>
              <p className="text-[12px] text-[#55697d]">
                Organization: <span className="font-semibold text-[#182b3d]">{currentUser?.organization}</span> • Address: {currentUser?.address}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#053b5c] hover:bg-[#084a73] text-white text-[12px] font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 shadow transition"
              >
                <PlusCircle size={14} />
                <span>Add Instrument</span>
              </button>
              <button
                onClick={() => {
                  setApplyForm({ instrumentId: userInstruments[0]?.id || "", type: "initial", verificationLocation: "on-site" });
                  setShowApplyModal(true);
                }}
                className="bg-[#eb5405] hover:bg-[#d44700] text-white text-[12px] font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 shadow transition"
              >
                <FileCheck2 size={14} />
                <span>Apply Verification</span>
              </button>
            </div>
          </div>

          {/* ================= TAB 1: OVERVIEW ================= */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#cbe0ee] rounded-lg p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#52728f]">
                        Total Instruments
                      </p>
                      <h3 className="text-[26px] font-bold text-[#063653] mt-1">{totalInstruments}</h3>
                      <p className="text-[10px] text-emerald-600 mt-1 font-medium">Registered in e-माप</p>
                    </div>
                    <div className="w-11 h-11 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-[#053b5c]">
                      <Gauge size={22} />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#cbe0ee] rounded-lg p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#52728f]">
                        Verified & Active
                      </p>
                      <h3 className="text-[26px] font-bold text-emerald-700 mt-1">{verifiedCount}</h3>
                      <p className="text-[10px] text-[#52728f] mt-1">Stampted with legal seal</p>
                    </div>
                    <div className="w-11 h-11 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                      <CheckCircle2 size={22} />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#cbe0ee] rounded-lg p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#52728f]">
                        In Verification
                      </p>
                      <h3 className="text-[26px] font-bold text-amber-600 mt-1">{pendingApps}</h3>
                      <p className="text-[10px] text-amber-700 mt-1">Submitted or scheduled</p>
                    </div>
                    <div className="w-11 h-11 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                      <Clock size={22} />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#cbe0ee] rounded-lg p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#52728f]">
                        Valid Certificates
                      </p>
                      <h3 className="text-[26px] font-bold text-[#063653] mt-1">{certificatesCount}</h3>
                      <p className="text-[10px] text-[#053b5c] mt-1">With verifiable QR seal</p>
                    </div>
                    <div className="w-11 h-11 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                      <FileCheck2 size={22} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Verification Banner */}
              <div className="bg-gradient-to-r from-[#063653] to-[#0a527c] text-white p-4 rounded-lg shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-[15px]">Need to verify a commercial scale or pump?</h4>
                  <p className="text-[12px] text-[#c9e2f4] mt-0.5">
                    Under the Legal Metrology Act 2009, all trade weights & measures must carry valid verification stamps.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-white text-[#063653] text-[12px] font-bold px-3 py-1.5 rounded hover:bg-gray-100 transition shadow-xs"
                  >
                    + Add New Machine
                  </button>
                  <button
                    onClick={() => {
                      setApplyForm({ instrumentId: userInstruments[0]?.id || "", type: "initial", verificationLocation: "on-site" });
                      setShowApplyModal(true);
                    }}
                    className="bg-[#eb5405] text-white text-[12px] font-bold px-3 py-1.5 rounded hover:bg-[#d44700] transition shadow-xs"
                  >
                    Apply for Verification
                  </button>
                </div>
              </div>

              {/* Two columns: Recent Applications & Instrument List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Recent Applications */}
                <div className="bg-white border border-[#d2e0eb] rounded-lg p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-3 border-b pb-2">
                    <h4 className="font-bold text-[14px] text-[#063653] flex items-center gap-2">
                      <Clock size={16} /> Recent Applications
                    </h4>
                    <button
                      onClick={() => setActiveTab("applications")}
                      className="text-[11px] text-[#eb5405] font-semibold hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  {userApplications.length === 0 ? (
                    <p className="text-gray-500 text-xs py-4 text-center">No applications submitted yet.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {userApplications.slice(0, 4).map((app) => (
                        <div
                          key={app.id}
                          className="p-2.5 rounded border border-gray-100 bg-[#f9fbfd] flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[12px] text-[#084a78]">{app.id}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase bg-gray-100">
                                {app.type}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#2c4054] font-medium mt-0.5">{app.instrumentName}</p>
                            <p className="text-[10px] text-[#6b8296]">
                              Applied: {app.appliedDate} • Location: {app.verificationLocation}
                            </p>
                          </div>

                          <div className="text-right">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                app.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : app.status === "scheduled"
                                  ? "bg-indigo-100 text-indigo-800"
                                  : app.status === "assigned"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {app.status.toUpperCase()}
                            </span>
                            {app.assignedLmoName && (
                              <p className="text-[9px] text-[#55718a] mt-1">LMO: {app.assignedLmoName}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Instruments preview */}
                <div className="bg-white border border-[#d2e0eb] rounded-lg p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-3 border-b pb-2">
                    <h4 className="font-bold text-[14px] text-[#063653] flex items-center gap-2">
                      <Gauge size={16} /> Registered Instruments
                    </h4>
                    <button
                      onClick={() => setActiveTab("instruments")}
                      className="text-[11px] text-[#eb5405] font-semibold hover:underline"
                    >
                      Manage All
                    </button>
                  </div>

                  {userInstruments.length === 0 ? (
                    <p className="text-gray-500 text-xs py-4 text-center">No instruments registered yet.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {userInstruments.slice(0, 4).map((inst) => (
                        <div
                          key={inst.id}
                          className="p-2.5 rounded border border-gray-100 bg-[#f9fbfd] flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-[12px] text-[#182b3d] block">{inst.type}</span>
                            <span className="text-[10px] text-[#6b8296] block">
                              Serial: {inst.serialNumber} • Cap: {inst.capacity}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                inst.status === "verified"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {inst.status === "verified" ? "VERIFIED" : "UNVERIFIED"}
                            </span>
                            {inst.status !== "verified" && (
                              <button
                                onClick={() => openApplyForSpecific(inst.id)}
                                className="text-[10px] bg-[#eb5405] text-white px-2 py-1 rounded font-semibold hover:bg-[#d44700]"
                              >
                                Apply
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: MY INSTRUMENTS ================= */}
          {activeTab === "instruments" && (
            <div className="bg-white border border-[#d2e0eb] rounded-lg p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <p className="text-[13px] text-[#4b6074]">
                  Listing all weighing and measuring equipment registered to{" "}
                  <strong>{currentUser?.organization}</strong>.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#eb5405] hover:bg-[#d44700] text-white text-[12px] font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 shadow"
                >
                  <PlusCircle size={14} /> Add New Instrument
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px] border-collapse">
                  <thead>
                    <tr className="bg-[#f0f5f9] text-[#063653] border-b border-[#cce0ee] text-[11px] uppercase tracking-wider">
                      <th className="p-3 font-bold">Instrument Type</th>
                      <th className="p-3 font-bold">Model & Serial No</th>
                      <th className="p-3 font-bold">Manufacturer</th>
                      <th className="p-3 font-bold">Capacity / Accuracy</th>
                      <th className="p-3 font-bold">Status</th>
                      <th className="p-3 font-bold">Validity</th>
                      <th className="p-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {userInstruments.map((inst) => (
                      <tr key={inst.id} className="hover:bg-[#f8fbfd] transition">
                        <td className="p-3 font-semibold text-[#182b3d]">{inst.type}</td>
                        <td className="p-3">
                          <span className="font-mono text-[11px] block">{inst.serialNumber}</span>
                          <span className="text-[10px] text-gray-500">{inst.model}</span>
                        </td>
                        <td className="p-3 text-gray-600">{inst.manufacturer}</td>
                        <td className="p-3 text-gray-700">
                          {inst.capacity} • {inst.accuracy}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              inst.status === "verified"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : inst.status === "rejected"
                                ? "bg-red-100 text-red-800 border border-red-300"
                                : "bg-amber-100 text-amber-800 border border-amber-300"
                            }`}
                          >
                            {inst.status}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600 text-[11px]">
                          {inst.validityEndDate ? (
                            <span className="text-emerald-700 font-medium">Valid till {inst.validityEndDate}</span>
                          ) : (
                            <span className="text-amber-700 font-medium">Pending Verification</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {inst.status === "verified" ? (
                            <button
                              onClick={() => {
                                const cert = userCertificates.find((c) => c.instrumentId === inst.id);
                                if (cert) setSelectedCertificate(cert);
                                else triggerToast("Certificate will be listed in Certificates tab.");
                              }}
                              className="text-[11px] bg-[#0c527d] text-white px-2.5 py-1 rounded font-semibold hover:bg-[#083b5c]"
                            >
                              View Cert
                            </button>
                          ) : (
                            <button
                              onClick={() => openApplyForSpecific(inst.id)}
                              className="text-[11px] bg-[#eb5405] text-white px-2.5 py-1 rounded font-semibold hover:bg-[#d44700]"
                            >
                              Apply Verification
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 3: APPLICATIONS ================= */}
          {activeTab === "applications" && (
            <div className="bg-white border border-[#d2e0eb] rounded-lg p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <p className="text-[13px] text-[#4b6074]">
                  Track legal verification applications submitted to the District Metrology Office.
                </p>
                <button
                  onClick={() => {
                    setApplyForm({ instrumentId: userInstruments[0]?.id || "", type: "initial", verificationLocation: "on-site" });
                    setShowApplyModal(true);
                  }}
                  className="bg-[#eb5405] hover:bg-[#d44700] text-white text-[12px] font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 shadow"
                >
                  <PlusCircle size={14} /> New Application
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px] border-collapse">
                  <thead>
                    <tr className="bg-[#f0f5f9] text-[#063653] border-b border-[#cce0ee] text-[11px] uppercase tracking-wider">
                      <th className="p-3 font-bold">App ID</th>
                      <th className="p-3 font-bold">Instrument</th>
                      <th className="p-3 font-bold">Type & Location</th>
                      <th className="p-3 font-bold">Applied Date</th>
                      <th className="p-3 font-bold">Assigned Officer</th>
                      <th className="p-3 font-bold">Schedule</th>
                      <th className="p-3 font-bold">Status / Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {userApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-[#f8fbfd] transition">
                        <td className="p-3 font-bold text-[#084a78]">{app.id}</td>
                        <td className="p-3 font-medium text-[#182b3d]">{app.instrumentName}</td>
                        <td className="p-3">
                          <span className="capitalize">{app.type}</span> •{" "}
                          <span className="text-gray-500 capitalize">{app.verificationLocation}</span>
                        </td>
                        <td className="p-3 text-gray-600">{app.appliedDate}</td>
                        <td className="p-3">
                          {app.assignedLmoName ? (
                            <span className="font-semibold text-emerald-800">{app.assignedLmoName}</span>
                          ) : (
                            <span className="text-gray-400 italic">Pending assignment</span>
                          )}
                        </td>
                        <td className="p-3 text-gray-600">
                          {app.scheduledDate ? (
                            <span className="text-indigo-700 font-medium">
                              {app.scheduledDate} {app.scheduledTime && `(${app.scheduledTime})`}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="p-3">
                          {app.status === "completed" ? (
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                              PASSED • CERT ISSUED
                            </span>
                          ) : app.status === "scheduled" ? (
                            <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                              SCHEDULED
                            </span>
                          ) : app.status === "assigned" ? (
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                              OFFICER ASSIGNED
                            </span>
                          ) : (
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                              SUBMITTED
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 4: CERTIFICATES ================= */}
          {activeTab === "certificates" && (
            <div className="bg-white border border-[#d2e0eb] rounded-lg p-5 shadow-xs">
              <p className="text-[13px] text-[#4b6074] mb-4">
                Official Legal Metrology Verification Certificates issued under Rule 11 of Legal Metrology (General) Rules.
              </p>

              {userCertificates.length === 0 ? (
                <div className="text-center py-10 border border-dashed rounded-lg text-gray-500">
                  <FileCheck2 size={36} className="mx-auto text-gray-400 mb-2" />
                  <p className="font-semibold">No certificates issued yet.</p>
                  <p className="text-xs">Once an inspector verifies your equipment, your official certificates will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userCertificates.map((cert) => (
                    <div
                      key={cert.certificateNumber}
                      className="border border-[#c5d8e7] rounded-lg p-4 bg-[#f9fcff] shadow-xs hover:shadow-md transition relative flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between border-b pb-2 mb-2">
                          <span className="text-[10px] font-bold bg-[#063653] text-white px-2 py-0.5 rounded">
                            GOI LEGAL SEAL
                          </span>
                          <span className="text-emerald-700 font-bold text-[11px] uppercase">
                            ✓ {cert.status}
                          </span>
                        </div>
                        <h5 className="font-bold text-[13px] text-[#063653]">{cert.certificateNumber}</h5>
                        <p className="text-[12px] font-semibold text-gray-800 mt-1">{cert.instrumentName}</p>
                        <p className="text-[11px] text-gray-600">Serial: {cert.serialNumber}</p>
                        <p className="text-[11px] text-gray-600">Inspecting LMO: {cert.lmoName}</p>
                        <p className="text-[10px] text-emerald-800 font-medium mt-2 bg-emerald-50 p-1.5 rounded border border-emerald-200">
                          Valid: {cert.validityFrom} to {cert.validityTo}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedCertificate(cert)}
                        className="mt-4 w-full bg-[#053b5c] hover:bg-[#094c75] text-white py-1.5 rounded text-[12px] font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <Printer size={13} /> View & Print Certificate
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ================= MODAL: ADD INSTRUMENT ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#053b5c] text-white px-5 py-4 flex items-center justify-between border-b-2 border-[#eb5405]">
              <div className="flex items-center gap-2">
                <PlusCircle size={18} className="text-[#eb5405]" />
                <h3 className="font-bold text-[15px]">Register New Instrument</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddInstrumentSubmit} className="p-5 space-y-3.5 text-[12px]">
              <div>
                <label className="block font-semibold text-[#182b3d] mb-1">Instrument Type</label>
                <select
                  value={newInstForm.type}
                  onChange={(e) => setNewInstForm({ ...newInstForm, type: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-[12px] focus:outline-none focus:border-[#084a78]"
                >
                  <option value="Electronic Weighing Machine">Electronic Weighing Machine</option>
                  <option value="Platform Scale">Platform Scale</option>
                  <option value="Counter Scale">Counter Scale</option>
                  <option value="Spring Balance">Spring Balance</option>
                  <option value="Fuel Dispensing Pump">Fuel Dispensing Pump</option>
                  <option value="Water Meter">Water Meter</option>
                  <option value="Measuring Tape">Measuring Tape</option>
                  <option value="Capacity Measure">Capacity Measure</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#182b3d] mb-1">Model Number</label>
                  <input
                    type="text"
                    required
                    value={newInstForm.model}
                    onChange={(e) => setNewInstForm({ ...newInstForm, model: e.target.value })}
                    placeholder="e.g. MDL-650"
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-[12px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#182b3d] mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={newInstForm.serialNumber}
                    onChange={(e) => setNewInstForm({ ...newInstForm, serialNumber: e.target.value })}
                    placeholder="Auto-generated if blank"
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-[12px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#182b3d] mb-1">Manufacturer</label>
                  <select
                    value={newInstForm.manufacturer}
                    onChange={(e) => setNewInstForm({ ...newInstForm, manufacturer: e.target.value })}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-[12px]"
                  >
                    <option value="Avery India Ltd">Avery India Ltd</option>
                    <option value="Essae Digitronics">Essae Digitronics</option>
                    <option value="Contech Instruments">Contech Instruments</option>
                    <option value="HDPE Metering Co">HDPE Metering Co</option>
                    <option value="Precision Scales Pvt Ltd">Precision Scales Pvt Ltd</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#182b3d] mb-1">Max Capacity</label>
                  <input
                    type="text"
                    required
                    value={newInstForm.capacity}
                    onChange={(e) => setNewInstForm({ ...newInstForm, capacity: e.target.value })}
                    placeholder="e.g. 100 kg, 500 kg"
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-[12px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#182b3d] mb-1">Location of Use</label>
                <input
                  type="text"
                  required
                  value={newInstForm.location}
                  onChange={(e) => setNewInstForm({ ...newInstForm, location: e.target.value })}
                  placeholder="Premises address"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-[12px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-[12px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#eb5405] hover:bg-[#d44700] text-white px-4 py-1.5 rounded font-semibold text-[12px] shadow-sm"
                >
                  Save Instrument
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: APPLY FOR VERIFICATION ================= */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#053b5c] text-white px-5 py-4 flex items-center justify-between border-b-2 border-[#eb5405]">
              <div className="flex items-center gap-2">
                <FileCheck2 size={18} className="text-[#eb5405]" />
                <h3 className="font-bold text-[15px]">Apply for Verification</h3>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-5 space-y-3.5 text-[12px]">
              <div>
                <label className="block font-semibold text-[#182b3d] mb-1">
                  Select Instrument for Verification
                </label>
                <select
                  required
                  value={applyForm.instrumentId}
                  onChange={(e) => setApplyForm({ ...applyForm, instrumentId: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-[12px] focus:outline-none focus:border-[#084a78]"
                >
                  <option value="">-- Choose from your instruments --</option>
                  {userInstruments.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.type} ({inst.serialNumber} - {inst.capacity}) [{inst.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#182b3d] mb-1">Verification Category</label>
                <select
                  value={applyForm.type}
                  onChange={(e) => setApplyForm({ ...applyForm, type: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-[12px]"
                >
                  <option value="initial">Initial Verification (New Instrument)</option>
                  <option value="re-verification">Periodic Re-verification (Annual)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#182b3d] mb-1">Preferred Location</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <label
                    className={`border rounded p-2.5 flex items-center gap-2 cursor-pointer transition ${
                      applyForm.verificationLocation === "on-site"
                        ? "border-[#053b5c] bg-sky-50 font-semibold"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="verLoc"
                      value="on-site"
                      checked={applyForm.verificationLocation === "on-site"}
                      onChange={(e) => setApplyForm({ ...applyForm, verificationLocation: e.target.value })}
                    />
                    <span>On-Site (Trader Premises)</span>
                  </label>
                  <label
                    className={`border rounded p-2.5 flex items-center gap-2 cursor-pointer transition ${
                      applyForm.verificationLocation === "lab"
                        ? "border-[#053b5c] bg-sky-50 font-semibold"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="verLoc"
                      value="lab"
                      checked={applyForm.verificationLocation === "lab"}
                      onChange={(e) => setApplyForm({ ...applyForm, verificationLocation: e.target.value })}
                    />
                    <span>District Testing Lab</span>
                  </label>
                </div>
              </div>

              <div className="bg-[#f0f6fa] p-3 rounded border border-[#cbe0ee] text-[11px] text-[#4b6b85]">
                <p>
                  <strong>Note:</strong> Once submitted, your application will be routed to the District Legal Metrology Admin for officer assignment.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-[12px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#eb5405] hover:bg-[#d44700] text-white px-4 py-1.5 rounded font-semibold text-[12px] shadow-sm"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: OFFICIAL CERTIFICATE VIEW ================= */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-gray-200 overflow-hidden animate-in fade-in duration-200">
            {/* Certificate Header Bar */}
            <div className="bg-[#053b5c] text-white px-5 py-3 flex items-center justify-between border-b-2 border-[#eb5405]">
              <span className="font-bold text-[13px] tracking-wide">
                GOVERNMENT OF INDIA • LEGAL METROLOGY CERTIFICATE
              </span>
              <button
                onClick={() => setSelectedCertificate(null)}
                className="text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Certificate Printable Body */}
            <div className="p-6 bg-[#fffdf9] border-8 border-double border-[#d2c29d] m-4 relative text-[#12263b]">
              <div className="text-center pb-3 border-b-2 border-amber-900/30">
                <div className="text-[11px] font-bold tracking-widest text-[#053b5c] uppercase">
                  Government of India • भारत सरकार
                </div>
                <div className="text-[10px] text-gray-600 font-medium">
                  Department of Consumer Affairs • Legal Metrology Division
                </div>
                <h3 className="text-[17px] font-extrabold text-[#053b5c] mt-1 uppercase tracking-wide">
                  Certificate of Verification
                </h3>
                <p className="text-[10px] text-gray-500 italic">
                  [Issued under Rule 11 of Legal Metrology (General) Rules]
                </p>
              </div>

              <div className="my-4 grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-gray-500 block text-[10px]">Certificate Number:</span>
                  <span className="font-bold font-mono text-[#eb5405] text-[12px]">
                    {selectedCertificate.certificateNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 block text-[10px]">Legal Verification Seal:</span>
                  <span className="font-bold font-mono text-emerald-800">
                    {selectedCertificate.sealNumber || "SEAL-GOI-OK"}
                  </span>
                </div>

                <div className="col-span-2 bg-amber-50/50 p-2.5 rounded border border-amber-200/60">
                  <p className="font-semibold text-[#053b5c]">
                    Issued To: {selectedCertificate.ownerName}
                  </p>
                  <p className="text-gray-600">{selectedCertificate.ownerOrg}</p>
                  <p className="text-gray-500 text-[10px]">{selectedCertificate.address}</p>
                </div>

                <div>
                  <span className="text-gray-500 block text-[10px]">Instrument Description:</span>
                  <span className="font-semibold">{selectedCertificate.instrumentName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">Serial / Model:</span>
                  <span className="font-mono">{selectedCertificate.serialNumber} ({selectedCertificate.model})</span>
                </div>

                <div>
                  <span className="text-gray-500 block text-[10px]">Date of Verification:</span>
                  <span className="font-semibold">{selectedCertificate.verificationDate}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">Valid Until:</span>
                  <span className="font-bold text-emerald-700">{selectedCertificate.validityTo}</span>
                </div>
              </div>

              {/* QR Code and Officer Signature */}
              <div className="pt-3 border-t border-dashed border-gray-300 flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-14 h-14 bg-gray-100 border border-gray-300 flex flex-col items-center justify-center p-1">
                    <QrCode size={36} className="text-[#053b5c]" />
                    <span className="text-[7px] text-gray-500 font-mono mt-0.5">e-माप QR</span>
                  </div>
                  <div className="text-[9px] text-gray-500 max-w-[140px]">
                    Scan QR code using the National Consumer App to verify authenticity.
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-serif italic text-[13px] text-[#053b5c] font-bold">
                    {selectedCertificate.lmoName}
                  </div>
                  <div className="text-[9px] text-gray-600 font-medium">
                    {selectedCertificate.lmoDesignation || "Legal Metrology Officer"}
                  </div>
                  <div className="text-[8px] text-emerald-700 font-semibold uppercase mt-0.5">
                    Digitally Sealed & Authorized
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 flex items-center justify-between border-t">
              <span className="text-[11px] text-gray-500">
                Official document recognized across India
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-[#053b5c] text-white px-3 py-1.5 rounded text-[12px] font-semibold flex items-center gap-1.5 hover:bg-[#084a73]"
                >
                  <Printer size={14} /> Print Certificate
                </button>
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-[12px] font-semibold hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}