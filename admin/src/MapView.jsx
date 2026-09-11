import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Map, { Layer, Source } from "react-map-gl/maplibre";
import * as turf from "@turf/turf";
import "maplibre-gl/dist/maplibre-gl.css";

const NORTHEAST_STATES = [
  { name: "Arunachal Pradesh", file: "arunachal-pradesh.geojson" },
  { name: "Assam", file: "assam.geojson" },
  { name: "Manipur", file: "manipur.geojson" },
  { name: "Meghalaya", file: "meghalaya.geojson" },
  { name: "Mizoram", file: "mizoram.geojson" },
  { name: "Nagaland", file: "nagaland.geojson" },
  { name: "Sikkim", file: "sikkim.geojson" },
  { name: "Tripura", file: "tripura.geojson" },
];

const GEOJSON_BASE = "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@main/geojson/states";

async function loadAndProcessGeometry() {
  const results = await Promise.all(
    NORTHEAST_STATES.map(async (state) => {
      const response = await fetch(`${GEOJSON_BASE}/${state.file}`);
      if (!response.ok) throw new Error(`Failed to load ${state.name}`);
      const geojson = await response.json();
      return {
        ...geojson,
        features: geojson.features.map((feature) => ({
          ...feature,
          properties: { ...(feature.properties || {}), state: state.name },
        })),
      };
    })
  );

  const combinedStates = { type: "FeatureCollection", features: results.flatMap((geojson) => geojson.features) };
  const inverseMask = turf.mask(combinedStates);
  
  let unifiedBoundary = combinedStates.features[0];
  for (let i = 1; i < combinedStates.features.length; i++) {
    try { unifiedBoundary = turf.union(unifiedBoundary, combinedStates.features[i]); } 
    catch (e) { console.warn("Topology skip:", e); }
  }
  
  return { boundaries: combinedStates, mask: inverseMask, outer: turf.featureCollection([unifiedBoundary]) };
}

// Smoothly blended heatmap gradient (Soft Teal -> Emerald -> Yellow -> Deep Orange)
const heatmapLayer = {
  id: "risk-heatmap",
  type: "heatmap",
  maxzoom: 14,
  paint: {
    "heatmap-weight": ["interpolate", ["linear"], ["get", "value"], 0, 0.1, 50, 0.4, 100, 0.9],
    "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 3.5, 0.6, 6.8, 1.2],
    "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 3.5, 12, 6.8, 28],
    "heatmap-opacity": 0.75,
    "heatmap-color": [
      "interpolate", ["linear"], ["heatmap-density"],
      0.00, "rgba(0,0,0,0)",
      0.15, "rgba(20, 184, 166, 0.4)",  // Soft Teal
      0.40, "rgba(34, 197, 94, 0.65)",  // Soft Emerald Green
      0.65, "rgba(234, 179, 8, 0.8)",   // Muted Amber/Yellow
      0.85, "rgba(249, 115, 22, 0.9)",  // Orange
      1.00, "rgba(194, 65, 12, 0.95)"   // Dark Orange
    ],
  },
};

export default function MapView() {
  const navigate = useNavigate();
  const [geoData, setGeoData] = useState({ boundaries: null, mask: null, outer: null });
  const [riskData, setRiskData] = useState({ type: "FeatureCollection", features: [] });
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    loadAndProcessGeometry().then(setGeoData).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/live-data");
        if (res.ok) setRiskData(await res.json());
      } catch (err) { console.error("Polling error:", err); }
    };
    fetchLiveData();
    const timer = setInterval(fetchLiveData, 60000); 
    return () => clearInterval(timer);
  }, []);

  const handleMapClick = (e) => {
    const { lng, lat } = e.lngLat;
    if (!riskData.features.length) return;

    const clickPt = turf.point([lng, lat]);
    let target = null;
    let minKm = Infinity;

    for (const feature of riskData.features) {
      const d = turf.distance(clickPt, feature.geometry, { units: "kilometers" });
      if (d < minKm && d < 35) {
        minKm = d;
        target = feature;
      }
    }
    
    if (target) {
      navigate('/dash', { state: target.properties });
    }
  };

  const mapStyle = isDarkMode
    ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
    : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

  return (
    <div className={`relative h-screen w-screen overflow-hidden ${isDarkMode ? "bg-slate-950" : "bg-slate-100"}`}>
      <Map
        initialViewState={{ longitude: 92.20, latitude: 23.65, zoom: 6.8 }}
        minZoom={8.5}
        maxZoom={9.2}
        mapStyle={mapStyle}
        onClick={handleMapClick}
        interactiveLayerIds={["northeast-base-fill", "inverse-mask-fill"]}
      >
        {/* Base layer providing natural background fill for non-risk areas */}
        {geoData.boundaries && (
          <Source id="northeast-states-base" type="geojson" data={geoData.boundaries}>
            <Layer 
              id="northeast-base-fill" 
              type="fill" 
              paint={{ 
                "fill-color": isDarkMode ? "#1e293b" : "#cbd5e1", 
                "fill-opacity": isDarkMode ? 0.35 : 0.45 
              }} 
            />
            <Layer 
              id="northeast-state-borders" 
              type="line" 
              paint={{ 
                "line-color": isDarkMode ? "#64748b" : "#475569", 
                "line-width": 0.8, 
                "line-opacity": 0.5 
              }} 
            />
          </Source>
        )}

        {/* Heatmap Layer */}
        <Source id="risk-data" type="geojson" data={riskData}>
          <Layer {...heatmapLayer} />
        </Source>

        {/* Outer dark/light mask outside Northeast states */}
        {geoData.mask && (
          <Source id="mask-source" type="geojson" data={geoData.mask}>
            <Layer 
              id="inverse-mask-fill" 
              type="fill" 
              paint={{ 
                "fill-color": isDarkMode ? "#030712" : "#f1f5f9", 
                "fill-opacity": 0.95 
              }} 
            />
          </Source>
        )}
      </Map>

      {/* Control Panel: Live Status & Mode Switcher */}
      <div className="absolute left-5 top-5 z-10 flex items-center gap-3">
        <div className={`rounded-2xl border px-5 py-4 shadow-xl backdrop-blur-md transition-colors ${
          isDarkMode 
            ? "border-slate-800 bg-slate-950/80 text-white" 
            : "border-slate-300 bg-white/80 text-slate-900"
        }`}>
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 animate-pulse rounded-full bg-orange-500" />
            <div>
              <h1 className="text-lg font-bold">Live Risk Monitoring</h1>
              <p className={`text-xs ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                Click a hotspot to view dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Light/Dark Toggle Button */}
        <button
          onClick={() => setIsDarkMode((prev) => !prev)}
          className={`flex items-center justify-center rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all ${
            isDarkMode 
              ? "border-slate-800 bg-slate-950/80 text-yellow-400 hover:bg-slate-900" 
              : "border-slate-300 bg-white/80 text-slate-700 hover:bg-slate-50"
          }`}
          title="Toggle Light/Dark Theme"
        >
          {isDarkMode ? (
            /* Sun Icon for Light Mode switch */
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            /* Moon Icon for Dark Mode switch */
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}