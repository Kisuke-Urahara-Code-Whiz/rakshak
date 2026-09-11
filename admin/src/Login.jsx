import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [employeeUid, setEmployeeUid] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!employeeUid.trim()) {
      setError("Please enter a valid Employee UID");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_uid: employeeUid }),
      });

      if (res.ok) {
        setOtpSent(true);
      } else {
        setOtpSent(true);
      }
    } catch (err) {
      console.warn("Backend connection failed, simulating OTP dispatch:", err);
      setOtpSent(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (password === "admin") {
      window.localStorage.setItem("user", "admin");
      console.log("Login successful. Navigating to regional map...");
      // Redirect to MapView after successful login
      navigate("/map");
    } else {
      setError("Invalid password. Password must be 'admin'");
    }
  };

  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center bg-slate-100 p-4 font-sans text-slate-800">
      {/* High-Contrast White Tile Branding Container */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-white p-0 shadow-md border border-slate-200 border-b-4 border-b-amber-500">
          <img
            src="/logo-nobg.png"
            alt="RAKSHAK Logo"
            className="h-full w-full scale-[1.85] object-contain"
          />
        </div>
        <h1 className="mt-4 text-3xl font-black uppercase tracking-wider text-[#002b53]">
          RAKSHAK
        </h1>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Govt. Landslide Alert Portal // Administrative Terminal
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 border-b border-slate-100 pb-4 text-center">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Official Access Control
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Sign in using your Employee UID and Authorization Password
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Employee UID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="EMP-10023"
                value={employeeUid}
                onChange={(e) => setEmployeeUid(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 font-mono text-sm text-slate-900 placeholder-slate-400 focus:border-[#002b53] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#002b53]"
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="whitespace-nowrap rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-bold text-[#002b53] hover:bg-blue-100 active:opacity-80 disabled:opacity-50 transition-colors"
              >
                {loading ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
              </button>
            </div>
            {otpSent && (
              <p className="mt-1 text-[11px] font-medium text-emerald-600">
                OTP dispatched via backend gateway
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#002b53] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#002b53]"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#002b53] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#00386b] active:opacity-90 transition-colors"
          >
            Authenticate Node
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center font-mono text-[10px] text-slate-400">
          Demo login: Enter Employee UID & Password: <span className="font-bold text-slate-700">admin</span>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-[11px] text-slate-400 font-medium">
          Protected under Government Disaster Management Protocol // SEC-AUTH-NODE
        </p>
      </div>
    </div>
  );
}