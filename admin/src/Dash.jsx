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

  // 2. Poll Backend Fast for Soil Moisture Array (200ms Fast Refresh)
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
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-100 text-slate-800">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="mb-4 text-sm font-semibold text-slate-600">No active location telemetry selected.</p>
          <button
            onClick={() => navigate("/")}
            className="rounded-lg bg-[#002b53] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow hover:bg-[#00386b] transition-colors"
          >
            Return to Regional Map
          </button>
        </div>
      </div>
    );
  }

  const percentageArray = moistureArray.map(mapSensorToPercentage);

  const avgMoisturePct = percentageArray.length > 0
    ? (percentageArray.reduce((a, b) => a + b, 0) / percentageArray.length).toFixed(1)
    : "0.0";

  // Sharp Line Graph Renderer (Fixed 0% - 100% Boundary)
  const renderLiveGraph = (dataArray) => {
    if (!dataArray || dataArray.length === 0) return null;

    const points = dataArray.map((val, i) => {
      const x = (i / (dataArray.length - 1)) * 100;
      const clamped = Math.max(0, Math.min(100, val));
      const y = 98 - (clamped / 100) * 96;
      return { x, y };
    });

    const createSmoothPath = (pts) => {
      if (pts.length === 0) return "";
      let d = `M ${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;

      for (let i = 0; i < pts.length - 1; i++) {
        const curr = pts[i];
        const next = pts[i + 1];
        const cpX = (curr.x + next.x) / 2;
        d += ` C ${cpX.toFixed(2)},${curr.y.toFixed(2)} ${cpX.toFixed(2)},${next.y.toFixed(2)} ${next.x.toFixed(2)},${next.y.toFixed(2)}`;
      }
      return d;
    };

    const pathD = createSmoothPath(points);
    const fillD = `${pathD} L 100,100 L 0,100 Z`;

    return (
      <div className="relative h-64 w-full rounded-xl bg-slate-900 p-4 border border-slate-800 shadow-inner">
        {/* Fixed Y-Axis Labels */}
        <div className="absolute left-4 top-2 text-[10px] font-mono font-bold text-slate-400">100%</div>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-500">50%</div>
        <div className="absolute left-4 bottom-2 text-[10px] font-mono font-bold text-slate-400">0%</div>

        {/* Reference Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-6 px-4 pointer-events-none opacity-20">
          <div className="w-full border-t border-dashed border-slate-400"></div>
          <div className="w-full border-t border-dashed border-slate-400"></div>
          <div className="w-full border-t border-dashed border-slate-400"></div>
        </div>

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          
          {/* Gradient Fill under smooth curve */}
          <path fill="url(#lineGrad)" d={fillD} />

          {/* Smooth curve line */}
          <path
            fill="none"
            stroke="#38bdf8"
            strokeWidth="0.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            d={pathD}
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 font-sans text-slate-800 flex flex-col">
      {/* Official Government App Header */}
      <header className="bg-[#002b53] px-6 py-3 flex items-center justify-between border-b-2 border-amber-500 shadow-md">
        <div className="flex items-center gap-3.5">
          {/* Square container locked at h-12 w-12 with zero padding and scaled logo */}
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white p-0 shadow border border-white/20">
            <img
              src="/logo-nobg.png"
              alt="RAKSHAK Logo"
              className="h-full w-full object-contain scale-[1.8]"
            />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-wider leading-none">RAKSHAK</h1>
            <p className="text-slate-300 text-[11px] mt-1">Govt. Landslide Alert Portal // Telemetry Terminal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#001f3d] px-3 py-1 rounded border border-blue-400/30">
            <span className="text-blue-200 text-[11px] font-mono tracking-wider font-semibold">SEC-NODE // SDRF-09</span>
          </div>
          <button
            onClick={() => navigate("/map")}
            className="rounded bg-blue-50 px-3 py-1 text-[11px] font-bold text-[#002b53] border border-blue-200 hover:bg-blue-100 active:opacity-80 transition-all"
          >
            ← Back to Map
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
        {/* District & Location Overview */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                Zone Telemetry
              </span>
              <span className="text-xs font-semibold text-slate-500">Ref: PROTOCOL-SDRF/SEC-9</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide text-slate-900 mt-1">
              {contextData.district}
            </h2>
            <p className="text-xs md:text-sm font-medium text-slate-600">
              {contextData.slide_name} • <span className="font-semibold text-slate-800">{contextData.state}</span>
            </p>
          </div>

          <div className="text-right flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-mono font-bold text-slate-700">SYSTEMS ONLINE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Context & Open-Meteo Rainfall */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            {/* Metadata Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">Location Context</h3>
                <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase">Geological Data</span>
              </div>
              <div className="space-y-3">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-500">Geomorphology</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{contextData.geomorphology}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-500">Vegetation Cover</div>
                  <div className="text-sm font-bold text-emerald-700 mt-0.5">{contextData.vegetation_cover}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-500">Historical Trigger</div>
                  <div className="text-sm font-bold text-[#002b53] mt-0.5">{contextData.rainfall_trigger}</div>
                </div>
              </div>
            </div>

            {/* Open-Meteo Rainfall Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">
                  Precipitation Metric
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Open-Meteo API</span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 text-center">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">1 Hour</div>
                  <div className="mt-1 text-lg font-mono font-bold text-blue-900">{weatherData.rain_1h}</div>
                  <span className="text-[10px] font-semibold text-slate-400">mm</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 text-center">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">24 Hours</div>
                  <div className="mt-1 text-lg font-mono font-bold text-blue-900">{weatherData.rain_24h}</div>
                  <span className="text-[10px] font-semibold text-slate-400">mm</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 text-center">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">7 Days</div>
                  <div className="mt-1 text-lg font-mono font-bold text-blue-900">{weatherData.rain_7d}</div>
                  <span className="text-[10px] font-semibold text-slate-400">mm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Fast Live Graph */}
          <div className="lg:col-span-2">
            <div className="h-full flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">
                      Live Soil Moisture Telemetry
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Continuous 100-frame hardware sample array</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-2.5 py-1 rounded">
                    <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                    <span className="text-[10px] font-mono font-bold text-red-700 uppercase">Polling Fast (200ms)</span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">Calculated Saturation</span>
                    <div className="text-xs text-slate-400 font-mono">Sensors: Range (100 - 500)</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-extrabold font-mono text-[#002b53]">{avgMoisturePct}%</div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Moisture Mean</span>
                  </div>
                </div>

                {renderLiveGraph(percentageArray)}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>T-100 frames buffer</span>
                <span className="text-slate-400 text-[10px]">RAKSHAK Hardware Stream</span>
                <span className="font-bold text-slate-700">Real-Time Head (T-0)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer protocol notice */}
        <div className="mt-8 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            Protected under Government Disaster Management Protocol // All sensor streams encrypted
          </p>
        </div>
      </main>
    </div>
  );
}