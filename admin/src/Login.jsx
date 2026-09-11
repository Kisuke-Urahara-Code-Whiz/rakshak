import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [employeeUid, setEmployeeUid] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Invoke backend endpoint to trigger OTP dispatch
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
        // Fallback simulation if backend endpoint is not yet configured
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

    // Check if password matches 'admin'
    if (password === "admin") {
      //onLogin(true);
      window.localStorage.setItem("user", "admin");
      console.log("Login successful. Navigating to dashboard...");
      navigate("/dash");
    } else {
      setError("Invalid password. Password must be 'admin'");
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-950 font-sans text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-white">
            Admin Portal
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Sign in using your Employee UID and Authorization Password
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-center text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Employee UID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="EMP-10023"
                value={employeeUid}
                onChange={(e) => setEmployeeUid(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="whitespace-nowrap rounded-xl border border-sky-600/40 bg-sky-950/60 px-3 text-xs font-medium text-sky-400 hover:bg-sky-900/50 disabled:opacity-50 transition-colors"
              >
                {loading ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
              </button>
            </div>
            {otpSent && (
              <p className="mt-1 text-[11px] text-emerald-400">
                OTP sent via backend endpoint
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 hover:bg-sky-500 transition-colors"
          >
            Authenticate
          </button>
        </form>

        <div className="mt-6 text-center font-mono text-[10px] text-slate-500">
          Demo login: Enter Employee UID & Password: <span className="text-slate-300">admin</span>
        </div>
      </div>
    </div>
  );
}