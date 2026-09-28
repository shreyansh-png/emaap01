import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useData } from "./DataContext";
import { User, ShieldCheck, Briefcase, CheckCircle2, ArrowRight } from "lucide-react";

const AshokaChakraAnimated = () => {
  const [activeSpoke, setActiveSpoke] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setActiveSpoke((prev) => (prev + 1) % 24);
    }, 250);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  const spokes = Array.from({ length: 24 });

  return (
    <svg
      viewBox="0 0 200 200"
      className="w-44 h-44 opacity-80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="100"
        cy="100"
        r="88"
        fill="none"
        stroke="#dfe6eb"
        strokeWidth="8"
      />
      <circle cx="100" cy="100" r="4" fill="#dfe6eb" />
      {spokes.map((_, index) => {
        // -90 degrees offset so animation starts at top (12 o'clock)
        const angle = (index * 15) - 90;
        const radians = (angle * Math.PI) / 180;
        const x2 = 100 + 82 * Math.cos(radians);
        const y2 = 100 + 82 * Math.sin(radians);
        
        const isActive = index === activeSpoke && !prefersReducedMotion;
        
        return (
          <line
            key={index}
            x1="100"
            y1="100"
            x2={x2}
            y2={y2}
            stroke={isActive ? "#063b5c" : "#dfe6eb"}
            strokeWidth={isActive ? "4" : "2"}
            style={{ transition: "stroke 250ms ease-in-out, stroke-width 250ms ease-in-out" }}
          />
        );
      })}
    </svg>
  );
};

const EmappLogo = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center leading-none">
        <span className="text-[48px] font-bold text-[#f45112]">e</span>
        <span className="text-[42px] font-bold text-[#073b5c] tracking-tight ml-1">
          माप
        </span>
      </div>
      <div className="flex w-[135px] h-[4px] mt-1">
        <div className="w-1/3 bg-[#f45112]" />
        <div className="w-1/3 bg-white" />
        <div className="w-1/3 bg-[#138a3d]" />
      </div>
    </div>
  );
};

export default function Login({ onSelectPortal }) {
  const { signIn } = useAuth();
  const { users, setCurrentUser, demoAccounts } = useData();

  const [activeTab, setActiveTab] = useState("user");
  const [email, setEmail] = useState("rajesh@example.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
    if (tab === "user") {
      setEmail("rajesh@example.com");
    } else if (tab === "lmo") {
      setEmail("deepak.lmo@legalmetrology.gov.in");
    } else if (tab === "admin") {
      setEmail("admin@legalmetrology.gov.in");
    }
  };

  const handleQuickLogin = (demoEmail, role) => {
    setError("");
    const matchedUser = users.find((u) => u.email.toLowerCase() === demoEmail.toLowerCase());
    if (matchedUser) {
      setCurrentUser(matchedUser);
      onSelectPortal(role);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Find matching user in prototype dataset
      const matched = users.find((u) => u.email.trim().toLowerCase() === email.trim().toLowerCase());

      if (!matched) {
        throw new Error(
          `No account found for "${email}". Please choose from the demo accounts below or use rajesh@example.com.`
        );
      }

      // Role check: If tab doesn't match account role
      if (matched.role !== activeTab) {
        throw new Error(
          `Access Denied: You selected "${activeTab.toUpperCase()}" portal, but this email is registered as "${matched.role.toUpperCase()}".`
        );
      }

      // Update current user
      setCurrentUser(matched);

      // Call auth signin for compatibility
      if (signIn) {
        await signIn(email, password, activeTab).catch(() => {});
      }

      onSelectPortal(matched.role);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8fa] flex flex-col font-sans">
      {/* ================= HEADER ================= */}
      <header className="px-4 md:px-10 pt-5">
        <div className="bg-[#063653] h-[72px] relative flex items-center justify-between px-4 md:px-11 shadow-sm">
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#f45112]" />

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-white/80 flex items-center justify-center bg-white/10">
              <span className="text-[12px] font-bold text-white">GOI</span>
            </div>
            <div className="text-white leading-tight">
              <div className="font-bold text-[15px]">Government of India</div>
              <div className="text-[11px] font-medium text-[#cbe1f0]">भारत सरकार • Legal Metrology Division</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-white text-[13px] font-medium">
            <span className="text-[#a8cbdf]">Digital India Initiative</span>
            <span className="opacity-40">|</span>
            <span>English / हिन्दी</span>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTAINER ================= */}
      <main className="flex-1 px-4 md:px-10 py-8 flex justify-center items-center">
        <section className="relative w-full max-w-[880px] bg-white border border-[#dce4e9] rounded-xl shadow-md flex flex-col items-center justify-center overflow-hidden py-8 px-6 md:px-12">
          {/* Ashoka Chakra Background Watermark */}
          <div className="absolute right-[-2rem] top-[-2rem] md:right-8 md:top-8 pointer-events-none">
            <AshokaChakraAnimated />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center w-full max-w-lg">
            <EmappLogo />
            <h1 className="mt-2 text-[20px] md:text-[22px] font-bold text-[#182b3d]">
              e-माप Legal Metrology Portal
            </h1>
            <p className="text-[13px] text-[#63778b] mt-1">
              National Verification, Inspection & Certification System
            </p>

            {/* Portal Tab Buttons */}
            <div className="grid grid-cols-3 gap-3 w-full mt-6">
              {/* User Tab */}
              <button
                type="button"
                onClick={() => handleTabChange("user")}
                className={`py-2.5 px-3 rounded-lg border text-center transition flex flex-col items-center justify-center ${
                  activeTab === "user"
                    ? "bg-[#084a78] text-white border-[#084a78] shadow-md ring-2 ring-[#084a78]/30"
                    : "bg-[#f8fafc] text-[#334e68] border-gray-200 hover:bg-[#edf2f7]"
                }`}
              >
                <User size={18} className="mb-1" />
                <span className="text-[13px] font-bold">Trader / Citizen</span>
                <span className="text-[10px] opacity-80">Instrument Owner</span>
              </button>

              {/* LMO Tab */}
              <button
                type="button"
                onClick={() => handleTabChange("lmo")}
                className={`py-2.5 px-3 rounded-lg border text-center transition flex flex-col items-center justify-center ${
                  activeTab === "lmo"
                    ? "bg-[#159447] text-white border-[#159447] shadow-md ring-2 ring-[#159447]/30"
                    : "bg-[#f8fafc] text-[#334e68] border-gray-200 hover:bg-[#edf2f7]"
                }`}
              >
                <Briefcase size={18} className="mb-1" />
                <span className="text-[13px] font-bold">Officer (LMO)</span>
                <span className="text-[10px] opacity-80">Legal Inspector</span>
              </button>

              {/* Admin Tab */}
              <button
                type="button"
                onClick={() => handleTabChange("admin")}
                className={`py-2.5 px-3 rounded-lg border text-center transition flex flex-col items-center justify-center ${
                  activeTab === "admin"
                    ? "bg-[#f45112] text-white border-[#f45112] shadow-md ring-2 ring-[#f45112]/30"
                    : "bg-[#f8fafc] text-[#334e68] border-gray-200 hover:bg-[#edf2f7]"
                }`}
              >
                <ShieldCheck size={18} className="mb-1" />
                <span className="text-[13px] font-bold">Department Admin</span>
                <span className="text-[10px] opacity-80">State Controller</span>
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleFormSubmit} className="mt-4 w-full bg-white p-4 rounded-lg border border-gray-200 shadow-xs text-left">
              {error && (
                <div className="mb-3 text-[12px] text-red-700 bg-red-50 p-2.5 rounded border border-red-200 leading-snug">
                  <strong>Login Error: </strong> {error}
                </div>
              )}

              <div className="mb-3">
                <label className="block text-[#182b3d] text-[12px] font-semibold mb-1">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#084a78] focus:ring-1 focus:ring-[#084a78]"
                  placeholder="Enter registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-[#182b3d] text-[12px] font-semibold mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#084a78] focus:ring-1 focus:ring-[#084a78]"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#f45112] hover:bg-[#d94208] text-white font-semibold rounded py-2 text-[13px] transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {loading ? "Authenticating..." : `Sign In to ${activeTab.toUpperCase()} Portal`}
              </button>
            </form>

            <div className="mt-4 text-[11px] text-[#63778b] flex items-center gap-2">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>Compliant with The Legal Metrology Act, 2009 & Enforcement Rules</span>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="px-4 md:px-10 pb-0">
        <div className="h-[48px] bg-[#063653] flex items-center justify-center text-white text-[11px]">
          <span>e-माप Verification Platform</span>
          <span className="mx-2 opacity-50">•</span>
          <span>Department of Consumer Affairs, Government of India</span>
        </div>
      </footer>
    </div>
  );
}