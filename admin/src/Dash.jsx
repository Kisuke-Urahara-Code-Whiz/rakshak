import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Dash() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // The data passed from the MapView click
  const initialData = location.state;
  const [featureData, setFeatureData] = useState(initialData);

  // Poll the backend specifically to keep this dashboard's charts live
  // Poll the backend specifically to keep this dashboard's charts live
  useEffect(() => {
    if (!initialData) return;

    const fetchLiveData = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/live-data");
        if (res.ok) {
          const json = await res.json();
          // Find this specific location's updated data using its OBJECTID
          const updatedFeature = json.features.find(
            (f) => f.properties.OBJECTID === initialData.OBJECTID
          );
          if (updatedFeature) {
            setFeatureData(updatedFeature.properties);
          }
        }
      } catch (err) {
        console.error("Dashboard polling error:", err);
      }
    };

    // 1. EXECUTE IMMEDIATELY ON LOAD
    fetchLiveData(); 

    // 2. THEN START THE 1-MINUTE LOOP
    const timer = setInterval(fetchLiveData, 60000); 
    return () => clearInterval(timer);
  }, [initialData]);
  
  // If a user navigates directly to /dash without clicking the map, handle the error gracefully
  if (!featureData) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 text-white">
        <p className="mb-4 text-slate-400">No active location selected.</p>
        <button onClick={() => navigate("/")} className="rounded bg-blue-600 px-4 py-2 hover:bg-blue-500">
          Return to Map
        </button>
      </div>
    );
  }

  // Graph Generator
  const renderLiveGraph = (dataArray) => {
    if (!dataArray || dataArray.length === 0) return null;
    const min = Math.min(...dataArray) - 5;
    const max = Math.max(...dataArray) + 5;
    const range = max - min;
    
    const points = dataArray.map((val, i) => {
      const x = (i / (dataArray.length - 1)) * 100;
      const y = 100 - ((val - min) / range) * 100;
      return `${x},${y}`;
    }).join(" ");

    return (
      <div className="relative h-64 w-full rounded-xl bg-slate-900 p-4 border border-slate-700 shadow-inner">
        <div className="absolute left-4 top-4 text-xs font-mono text-slate-500">{Math.round(max)}%</div>
        <div className="absolute left-4 bottom-4 text-xs font-mono text-slate-500">{Math.round(min)}%</div>
        
        <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none opacity-20">
          <div className="w-full border-t border-dashed border-slate-400"></div>
          <div className="w-full border-t border-dashed border-slate-400"></div>
          <div className="w-full border-t border-dashed border-slate-400"></div>
        </div>

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full pt-4">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <polygon fill="url(#lineGrad)" points={`0,100 ${points} 100,100`} />
          <polyline fill="none" stroke="#38bdf8" strokeWidth="1" strokeLinejoin="round" points={points} />
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 p-8 font-sans text-slate-100">
      {/* Top Navigation */}
      <button 
        onClick={() => navigate("/")}
        className="mb-8 font-mono text-sm text-slate-400 hover:text-white transition-colors"
      >
        ← Back to Regional Map
      </button>

      {/* Header Info */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-wide text-slate-100">
          {featureData.district || "Regional Data"}
        </h1>
        <p className="mt-1 text-lg text-slate-400">
          {featureData.slide_name?.trim() ? featureData.slide_name : "General Zone Analytics"} • {featureData.state}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Context & Rainfall */}
        <div className="flex flex-col gap-8 lg:col-span-1">
          {/* Metadata Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Location Context</h3>
            <div className="space-y-4">
              <div>
                <div className="text-[10px] uppercase text-slate-500">Geomorphology</div>
                <div className="text-sm font-medium text-slate-300">{featureData.geomorphology || "Unknown"}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500">Vegetation Cover</div>
                <div className="text-sm font-medium text-emerald-400">{featureData.vegetation_cover || "Unknown"}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500">Historical Trigger</div>
                <div className="text-sm font-medium text-sky-400">{featureData.rainfall_trigger || "Unknown"}</div>
              </div>
            </div>
          </div>

          {/* Rainfall Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Accumulated Rainfall</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-center">
                <div className="text-xs text-slate-400">1 Hour</div>
                <div className="mt-2 text-xl font-bold text-blue-400">{featureData.rain_1h} <span className="text-xs font-normal text-slate-500">mm</span></div>
              </div>
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-center">
                <div className="text-xs text-slate-400">24 Hours</div>
                <div className="mt-2 text-xl font-bold text-blue-400">{featureData.rain_24h} <span className="text-xs font-normal text-slate-500">mm</span></div>
              </div>
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-center">
                <div className="text-xs text-slate-400">7 Days</div>
                <div className="mt-2 text-xl font-bold text-blue-400">{featureData.rain_7d} <span className="text-xs font-normal text-slate-500">mm</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Large Graph */}
        <div className="lg:col-span-2">
          <div className="h-full rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live Soil Moisture Telemetry</h3>
                <p className="text-xs text-slate-400 mt-1">100-Frame Continuous Feed (1 min resolution)</p>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase mb-1">Current Average</div>
                <div className="text-4xl font-bold font-mono text-emerald-400">{featureData.avg_moisture}%</div>
              </div>
            </div>
            
            {renderLiveGraph(featureData.live_moisture)}
            
            <div className="mt-3 flex justify-between text-xs font-mono text-slate-500 px-2">
              <span>T-100 mins</span>
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span> LIVE FEED ACTIVE</span>
              <span>Current</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}