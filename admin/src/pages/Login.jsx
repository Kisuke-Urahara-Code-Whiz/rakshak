import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ENV from "../config/env";

export default function Login() {
  const [role, setRole] = useState("MDoNER Employee");
  const [employeeUid, setEmployeeUid] = useState("EMP-NER-001");
  const [citizenPhone, setCitizenPhone] = useState("9832041182");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roles = ["Citizen", "MDoNER Employee", "Zonal Admin", "District Admin"];
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const identifier = role === "Citizen" ? citizenPhone.trim() : employeeUid.trim();

    try {
      const response = await fetch(`${ENV.API_BASE_URL}/sql/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          identifier: identifier || (role === "Citizen" ? "9832041182" : "EMP-NER-001"),
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.localStorage.setItem("userRole", data.role || role);
        window.localStorage.setItem("userSession", JSON.stringify(data));
        navigate("/app/risk-map");
        return;
      }
    } catch (err) {
      console.warn("Backend login connection offline or error, executing local auth verification:", err);
    }

    // Fallback client-side auth for demo & offline mode
    setTimeout(() => {
      if (role === "Citizen" || password === "admin") {
        const demoSession = {
          status: "SUCCESS",
          token: "DEMO-SESSION-TOKEN",
          role,
          identifier: identifier || (role === "Citizen" ? "9832041182" : "EMP-NER-001"),
          name: role === "Citizen" ? "Civilian Observer (+91 " + (identifier || "9832041182") + ")" : "Officer " + (identifier || "EMP-NER-001"),
          department: role === "Citizen" ? "Citizen Triage Network" : "NER Disaster Risk Division",
          district: "North Sikkim",
          state: "Sikkim",
          lang: "en",
        };
        window.localStorage.setItem("userRole", role);
        window.localStorage.setItem("userSession", JSON.stringify(demoSession));
        navigate("/app/risk-map");
      } else {
        setError("Invalid credentials. Use 'admin' for demo or seed backend.");
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="flex min-h-screen w-full relative bg-[#1a1a1a]">
      {/* Background with Govt aesthetic vibe */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=2070)' }}
      ></div>
      
      <div className="relative z-10 flex w-full flex-col items-center justify-center p-4">
        
        <div className="mb-8 flex flex-col items-center text-center">
          <Link to="/" className="flex h-20 w-20 items-center justify-center bg-white shadow-xl mb-4 p-2">
            <img src="/logo-nobg.png" alt="RAKSHAK Logo" className="h-full w-full object-contain" />
          </Link>
          <h1 className="text-4xl font-black uppercase tracking-widest text-white drop-shadow-md">
            RAKSHAK
          </h1>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[#f6d274] max-w-sm text-center">
            A NER Govt. Initiative • Landslide Detection & Risk Management System
          </p>
        </div>

        <div className="w-full max-w-md bg-white p-8 shadow-2xl border-t-8 border-[#d93850]">
          <div className="mb-6 border-b border-[#e0e0e0] pb-4 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#333333]">
              Portal Authentication
            </h2>
            <span className="text-[10px] font-mono font-bold bg-[#f4f6f8] text-[#d93850] px-2 py-0.5 border border-[#e0e0e0]">
              JAVA BACKEND READY
            </span>
          </div>

          {/* Role Selector */}
          <div className="mb-6 grid grid-cols-2 gap-2">
            {roles.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => { 
                  setRole(r); 
                  setError(""); 
                  if (r === "MDoNER Employee") setEmployeeUid("EMP-NER-001");
                  else if (r === "ZONAL Admin") setEmployeeUid("ZONAL-SK-01");
                  else if (r === "District Admin") setEmployeeUid("DIST-SK-NORTH");
                }}
                className={`py-2 px-1 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                  role === r ? 'bg-[#d93850] text-white border-[#d93850]' : 'bg-white text-[#666666] border-[#cccccc] hover:bg-[#f4f6f8]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 bg-[#fde8e8] p-3 text-xs font-bold text-[#d93850] border-l-4 border-[#d93850]">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {role === "Citizen" ? (
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#666666]">
                  Citizen 10-Digit Mobile Number
                </label>
                <div className="flex items-center">
                  <span className="bg-[#e0e0e0] border-2 border-r-0 border-[#e0e0e0] px-3 py-3 text-xs font-bold text-[#333333]">
                    +91
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="9832041182"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full border-2 border-[#e0e0e0] bg-[#f4f6f8] px-4 py-3 text-sm text-[#333333] focus:border-[#d93850] focus:bg-white focus:outline-none transition-colors font-mono"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#666666]">
                  {role} Official ID
                </label>
                <input
                  type="text"
                  required
                  placeholder={role === "MDoNER Employee" ? "EMP-NER-001" : role === "Zonal Admin" ? "ZONAL-SK-01" : "DIST-SK-NORTH"}
                  value={employeeUid}
                  onChange={(e) => setEmployeeUid(e.target.value)}
                  className="w-full border-2 border-[#e0e0e0] bg-[#f4f6f8] px-4 py-3 text-sm text-[#333333] focus:border-[#d93850] focus:bg-white focus:outline-none transition-colors font-mono"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#666666]">
                {role === "Citizen" ? "Access PIN / Verification Code" : "Authorization Password"}
              </label>
              <input
                type="password"
                required={role !== "Citizen"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-[#e0e0e0] bg-[#f4f6f8] px-4 py-3 text-sm text-[#333333] focus:border-[#d93850] focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#333333] py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? "Authenticating via Java Gateway..." : `Login as ${role}`}
            </button>
          </form>
          
          <div className="mt-5 text-center bg-[#f8fafc] p-2.5 border border-[#e2e8f0]">
             <p className="text-[10px] font-bold text-[#666666] uppercase tracking-wider">
               Demo Password: <span className="text-[#d93850] font-mono">admin</span> • Pre-seeded Accounts: <span className="font-mono text-slate-900">EMP-NER-001, ZONAL-SK-01</span>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}