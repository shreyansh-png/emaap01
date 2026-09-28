import React from "react";
import { useData } from "./DataContext";
import { RefreshCw, ArrowRightLeft, Shield, UserCheck, HardHat, Check } from "lucide-react";

export default function DemoBar({ currentView, onNavigate }) {
  const { currentUser, switchUserByRole, resetToDefaults, users } = useData();

  const handleRoleSwitch = (role) => {
    switchUserByRole(role);
    if (onNavigate) {
      onNavigate(role);
    }
  };

  return (
    <div className="bg-[#04243a] text-white border-b border-[#0a4a73] px-3 py-1.5 flex flex-wrap items-center justify-between text-xs gap-2 select-none shadow-md z-50">
      <div className="flex items-center gap-2">
        <span className="bg-[#eb5405] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
          Prototype Mode
        </span>
        <span className="text-[#a5c3d8] hidden sm:inline">Active User:</span>
        <span className="font-semibold text-white flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          {currentUser?.name || "Demo User"}
          <span className="text-[#a5c3d8] font-normal">
            ({currentUser?.role?.toUpperCase()} • {currentUser?.district || currentUser?.state})
          </span>
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[#a5c3d8] text-[11px] mr-1 hidden md:inline">Quick Switch:</span>

        {/* User Switch */}
        <button
          onClick={() => handleRoleSwitch("user")}
          className={`px-2.5 py-1 rounded flex items-center gap-1.5 font-medium transition ${
            currentView === "user"
              ? "bg-[#0c527d] text-white ring-1 ring-white/30"
              : "bg-[#093554] text-[#bcd4e6] hover:bg-[#0c527d]"
          }`}
          title="Switch to Citizen/Trader view"
        >
          <UserCheck size={13} className="text-sky-300" />
          <span>Trader (User)</span>
        </button>

        {/* LMO Switch */}
        <button
          onClick={() => handleRoleSwitch("lmo")}
          className={`px-2.5 py-1 rounded flex items-center gap-1.5 font-medium transition ${
            currentView === "lmo"
              ? "bg-[#159447] text-white ring-1 ring-white/30"
              : "bg-[#0a4220] text-[#a5e8be] hover:bg-[#159447]"
          }`}
          title="Switch to Legal Metrology Officer view"
        >
          <HardHat size={13} className="text-emerald-300" />
          <span>Officer (LMO)</span>
        </button>

        {/* Admin Switch */}
        <button
          onClick={() => handleRoleSwitch("admin")}
          className={`px-2.5 py-1 rounded flex items-center gap-1.5 font-medium transition ${
            currentView === "admin"
              ? "bg-[#eb5405] text-white ring-1 ring-white/30"
              : "bg-[#542105] text-[#ffd0b5] hover:bg-[#eb5405]"
          }`}
          title="Switch to Admin view"
        >
          <Shield size={13} className="text-amber-300" />
          <span>Admin</span>
        </button>

        {/* Reset Data Button */}
        <button
          onClick={() => {
            if (window.confirm("Reset all test applications and instruments to original seed data?")) {
              resetToDefaults();
            }
          }}
          className="ml-2 px-2 py-1 bg-[#1a384f] hover:bg-[#254f6f] text-[#c4dcf0] rounded flex items-center gap-1 transition"
          title="Reset dataset back to seed"
        >
          <RefreshCw size={11} />
          <span className="hidden sm:inline">Reset Data</span>
        </button>
      </div>
    </div>
  );
}
