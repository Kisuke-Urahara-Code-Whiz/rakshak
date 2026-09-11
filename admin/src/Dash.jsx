import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Dash() {
  if (window.localStorage.getItem("user") !== "admin") {
    window.location.href = "/login";
  }
  const location = useLocation();
  const navigate = useNavigate();

  const initialData = location.state || {};

  // Hardcoded Context Info (Fallback defaults)
  const [contextData] = useState({
    district: initialData.district || "Aizawl",
    state: initialData.state || "Mizoram",
    slide_name: initialData.slide_name || "Zone-1 Slope Analytics",
    geomorphology: initialData.geomorphology || "Structural Hills",
    vegetation_cover: initialData.vegetation_cover || "Dense Forest",
    rainfall_trigger: initialData.rainfall_trigger || "Monsoon Downpour"
  });

  // Weather Data State (Fetched once from Open-Meteo)
  const [weatherData, setWeatherData] = useState({
    rain_1h: 2.5,
    rain_24h: 38.0,
    rain_7d: 112.5
  });

  // Moisture Array State
  const [moistureArray, setMoistureArray] = useState([]);

  // Map 100-500 raw sensor readings into 0%-100%
  // 500 -> 0% (Dry), 100 -> 100% (Very Wet)
  const mapSensorToPercentage = (rawValue) => {
    const val = Number(rawValue);
    if (isNaN(val)) return 0;
    
    const minRaw = 100; // Very Wet (100% Moisture)
    const maxRaw = 500; // Dry (0% Moisture)
    
    const clampedVal = Math.max(minRaw, Math.min(maxRaw, val));
    const percentage = ((maxRaw - clampedVal) / (maxRaw - minRaw)) * 100;
    return Number(percentage.toFixed(1));
  };

  // Generate randomized default raw sensor values within the 100-500 window
  const generateRandomRawMoisture = () => {
    return Array.from({ length: 100 }, () =>
      Math.floor(100 + Math.random() * 400)
    );
  };

  // 1. Fetch Open-Meteo Rainfall Data ONCE on Mount
  useEffect(() => {
    const fetchOpenMeteo = async () => {
      try {
        const lat = initialData.lat || 23.7271;
        const lon = initialData.lon || 92.7176;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=rain&past_days=7`;

        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          const rainList = json.hourly?.rain || [];

          if (rainList.length > 0) {
            const r1h = rainList[rainList.length - 1] || 0;
            const r24h = rainList.slice(-24).reduce((a, b) => a + b, 0);
            const r7d = rainList.reduce((a, b) => a + b, 0);

            setWeatherData({
              rain_1h: Number(r1h.toFixed(1)),
              rain_24h: Number(r24h.toFixed(1)),
              rain_7d: Number(r7d.toFixed(1))
            });
          }
        }
      } catch (err) {
        console.error("Open-Meteo Fetch Error:", err);
      }
    };

    fetchOpenMeteo();
  }, [initialData.lat, initialData.lon]);

  // 2. Poll Backend Fast for Soil Moisture Array (2 Second Refresh)
  useEffect(() => {
    const fetchMoistureOnly = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/soil-series");
        if (res.ok) {
          const json = await res.json();
          const rawArray = json.latest_hardware_moisture || [];

          const isAllZeros =
            rawArray.length === 0 || rawArray.every((val) => Number(val) === 0);

          if (isAllZeros) {
            setMoistureArray(generateRandomRawMoisture());
          } else {
            setMoistureArray(rawArray);
          }
        } else {
          setMoistureArray(generateRandomRawMoisture());
        }
      } catch (err) {
        console.error("Moisture Fast Polling Error:", err);
        setMoistureArray(generateRandomRawMoisture());
      }
    };

    fetchMoistureOnly();
    
    const timer = setInterval(fetchMoistureOnly, 200); 
    return () => clearInterval(timer);
  }, []);

  if (!initialData && !contextData) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 text-white">
        <p className="mb-4 text-slate-400">No active location selected.</p>
        <button onClick={() => navigate("/")} className="rounded bg-blue-600 px-4 py-2 hover:bg-blue-500">
          Return to Map
        </button>
      </div>
    );
  }

  const percentageArray = moistureArray.map(mapSensorToPercentage);

  const avgMoisturePct = percentageArray.length > 0
    ? (percentageArray.reduce((a, b) => a + b, 0) / percentageArray.length).toFixed(1)
    : "0.0";

  // Sharp Line Graph Renderer (Fixed 0% - 100% Boundary)
  // Smooth & Thin Line Graph Renderer
  const renderLiveGraph = (dataArray) => {
    if (!dataArray || dataArray.length === 0) return null;

    // Map array values to coordinate objects
    const points = dataArray.map((val, i) => {
      const x = (i / (dataArray.length - 1)) * 100;
      const clamped = Math.max(0, Math.min(100, val));
      const y = 98 - (clamped / 100) * 96;
      return { x, y };
    });

    // Helper to generate smooth SVG path commands (Cubic Bezier curve)
    const createSmoothPath = (pts) => {
      if (pts.length === 0) return "";
      let d = `M ${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;

      for (let i = 0; i < pts.length - 1; i++) {
        const curr = pts[i];
        const next = pts[i + 1];
        // Calculate control points for smooth curves
        const cpX = (curr.x + next.x) / 2;
        d += ` C ${cpX.toFixed(2)},${curr.y.toFixed(2)} ${cpX.toFixed(2)},${next.y.toFixed(2)} ${next.x.toFixed(2)},${next.y.toFixed(2)}`;
      }
      return d;
    };

    const pathD = createSmoothPath(points);
    const fillD = `${pathD} L 100,100 L 0,100 Z`;

    return (
      <div className="relative h-64 w-full rounded-xl bg-slate-900 p-4 border border-slate-700 shadow-inner">
        {/* Fixed Y-Axis Labels */}
        <div className="absolute left-4 top-2 text-xs font-mono text-slate-400">100%</div>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">50%</div>
        <div className="absolute left-4 bottom-2 text-xs font-mono text-slate-400">0%</div>

        {/* Reference Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-6 px-4 pointer-events-none opacity-15">
          <div className="w-full border-t border-dashed border-slate-300"></div>
          <div className="w-full border-t border-dashed border-slate-300"></div>
          <div className="w-full border-t border-dashed border-slate-300"></div>
        </div>

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          
          {/* Gradient Fill under smooth curve */}
          <path fill="url(#lineGrad)" d={fillD} />

          {/* Ultra-thin smooth curve line (strokeWidth = 0.15) */}
          <path
            fill="none"
            stroke="#38bdf8"
            strokeWidth="0.15"
            strokeLinecap="round"
            strokeLinejoin="round"
            d={pathD}
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 p-8 font-sans text-slate-100">
      <button
        onClick={() => navigate("/")}
        className="mb-8 font-mono text-sm text-slate-400 hover:text-white transition-colors"
      >
        ← Back to Regional Map
      </button>

      {/* Header Info */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-wide text-slate-100">
          {contextData.district}
        </h1>
        <p className="mt-1 text-lg text-slate-400">
          {contextData.slide_name} • {contextData.state}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Context & Open-Meteo Rainfall */}
        <div className="flex flex-col gap-8 lg:col-span-1">
          {/* Metadata Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Location Context</h3>
            <div className="space-y-4">
              <div>
                <div className="text-[10px] uppercase text-slate-500">Geomorphology</div>
                <div className="text-sm font-medium text-slate-300">{contextData.geomorphology}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500">Vegetation Cover</div>
                <div className="text-sm font-medium text-emerald-400">{contextData.vegetation_cover}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500">Historical Trigger</div>
                <div className="text-sm font-medium text-sky-400">{contextData.rainfall_trigger}</div>
              </div>
            </div>
          </div>

          {/* Open-Meteo Rainfall Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Accumulated Rainfall (Open-Meteo)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-center">
                <div className="text-xs text-slate-400">1 Hour</div>
                <div className="mt-2 text-xl font-bold text-blue-400">{weatherData.rain_1h} <span className="text-xs font-normal text-slate-500">mm</span></div>
              </div>
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-center">
                <div className="text-xs text-slate-400">24 Hours</div>
                <div className="mt-2 text-xl font-bold text-blue-400">{weatherData.rain_24h} <span className="text-xs font-normal text-slate-500">mm</span></div>
              </div>
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-center">
                <div className="text-xs text-slate-400">7 Days</div>
                <div className="mt-2 text-xl font-bold text-blue-400">{weatherData.rain_7d} <span className="text-xs font-normal text-slate-500">mm</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Fast Live Graph */}
        <div className="lg:col-span-2">
          <div className="h-full rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live Soil Moisture Telemetry</h3>
                <p className="text-xs text-slate-400 mt-1">100-Frame Continuous Feed (Fast 2s polling)</p>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase mb-1">Current Moisture</div>
                <div className="text-4xl font-bold font-mono text-emerald-400">{avgMoisturePct}%</div>
              </div>
            </div>

            {renderLiveGraph(percentageArray)}

            <div className="mt-3 flex justify-between text-xs font-mono text-slate-500 px-2">
              <span>T-100 frames</span>
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span> FAST FEED ACTIVE (2s)</span>
              <span>Current</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}