import { useEffect, useState, useMemo } from "react";
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

  const combinedStates = {
    type: "FeatureCollection",
    features: results.flatMap((geojson) => geojson.features),
  };

  const inverseMask = turf.mask(combinedStates);

  let unifiedBoundary = combinedStates.features[0];
  for (let i = 1; i < combinedStates.features.length; i++) {
    try {
      unifiedBoundary = turf.union(unifiedBoundary, combinedStates.features[i]);
    } catch (e) {
      console.warn("Topology skip:", e);
    }
  }
  const outerBoundary = turf.featureCollection([unifiedBoundary]);

  return { boundaries: combinedStates, mask: inverseMask, outer: outerBoundary };
}

// Calibrated Heatmap (prevents yellow over-saturation)
const heatmapLayer = {
  id: "risk-heatmap",
  type: "heatmap",
  maxzoom: 14,
  paint: {
    "heatmap-weight": ["interpolate", ["linear"], ["get", "value"], 0, 0.1, 50, 0.4, 100, 0.9],
    "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 4, 0.5, 9, 1.2],
    "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 4, 8, 9, 25, 14, 45],
    "heatmap-opacity": 0.8,
    "heatmap-color": [
      "interpolate", ["linear"], ["heatmap-density"],
      0.0, "rgba(0,0,0,0)",
      0.15, "#10b981",
      0.35, "#3b82f6",
      0.60, "#f59e0b",
      0.85, "#ef4444",
      1.00, "#991b1b"
    ],
  },
};

const maskLayer = {
  id: "inverse-mask-fill",
  type: "fill",
  paint: { "fill-color": "#030712", "fill-opacity": 0.95 },
};

const outerBoundaryLayer = {
  id: "northeast-outer-boundary",
  type: "line",
  paint: { "line-color": "#38bdf8", "line-width": 1.5, "line-opacity": 0.8 },
};

const stateBorderLayer = {
  id: "northeast-state-borders",
  type: "line",
  paint: { "line-color": "#94a3b8", "line-width": 0.8, "line-opacity": 0.35 },
};

export default function App() {
  const [geoData, setGeoData] = useState({ boundaries: null, mask: null, outer: null });
  const [loading, setLoading] = useState(true);
  const [riskData, setRiskData] = useState({ type: "FeatureCollection", features: [] });
  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    let active = true;
    loadAndProcessGeometry()
      .then((data) => active && setGeoData(data))
      .catch(console.error)
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/live-data");
        if (res.ok) {
          const json = await res.json();
          setRiskData(json);
          // Maintain active point reference
          setSelectedFeature((curr) => {
            if (!curr) return null;
            const match = json.features.find((f) => f.properties.OBJECTID === curr.OBJECTID);
            return match ? match.properties : curr;
          });
        }
      } catch (err) {
        console.error("Data polling error:", err);
      }
    };

    fetchLiveData();
    const timer = setInterval(fetchLiveData, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleMapClick = (e) => {
    const { lng, lat } = e.lngLat;
    if (!riskData.features.length) return;

    const clickPt = turf.point([lng, lat]);
    let target = null;
    let minKm = Infinity;

    riskPtLoop: for (const feature of riskData.features) {
      const d = turf.distance(clickPt, feature.geometry, { units: "kilometers" });
      if (d < minKm && d < 12) {
        minKm = d;
        target = feature;
      }
    }
    setSelectedFeature(target ? target.properties : null);
  };

  // Aggregated regional statistics
  const regionalMetrics = useMemo(() => {
    if (!riskData.features.length) return null;
    const stats = { material: {}, hydro: {}, activeCount: 0, totalArea: 0 };
    riskData.features.forEach((f) => {
      const p = f.properties;
      const mat = p.MATERIAL_TYPE || "Debris";
      const hyd = p.HYDROLOGICAL_CONDITION || "Wet";
      stats.material[mat] = (stats.material[mat] || 0) + 1;
      stats.hydro[hyd] = (stats.hydro[hyd] || 0) + 1;
      if (p.ACTIVITY === "Active") stats.activeCount += 1;
      stats.totalArea += p.LS_AREA || 0;
    });
    return stats;
  }, [riskData]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      <Map
        initialViewState={{ longitude: 88.62, latitude: 27.52, zoom: 9 }}
        // Dark vector style eliminates the yellow background
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        onClick={handleMapClick}
        interactiveLayerIds={["northeast-invisible-fill", "inverse-mask-fill"]}
      >
        <Source id="risk-data" type="geojson" data={riskData}>
          <Layer {...heatmapLayer} />
        </Source>

        {geoData.mask && (
          <Source id="mask-source" type="geojson" data={geoData.mask}>
            <Layer {...maskLayer} />
          </Source>
        )}

        {geoData.outer && (
          <Source id="northeast-outer" type="geojson" data={geoData.outer}>
            <Layer {...outerBoundaryLayer} />
          </Source>
        )}

        {geoData.boundaries && (
          <Source id="northeast-states-hidden" type="geojson" data={geoData.boundaries}>
            <Layer id="northeast-invisible-fill" type="fill" paint={{ "fill-opacity": 0 }} />
            <Layer {...stateBorderLayer} />
          </Source>
        )}
      </Map>

      {/* REGIONAL OVERVIEW PANEL (Top Right) */}
      {regionalMetrics && (
        <div className="absolute right-5 top-5 z-10 w-80 rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-2xl backdrop-blur">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Regional Telemetry & Breakdown
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 border-y border-slate-800 py-2">
            <div>
              <div className="text-[10px] text-slate-500">Active Incidents</div>
              <div className="text-lg font-bold font-mono text-red-400">{regionalMetrics.activeCount}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">Cumulative LS Area</div>
              <div className="text-lg font-bold font-mono text-slate-200">
                {(regionalMetrics.totalArea / 1000).toFixed(1)}k m²
              </div>
            </div>
          </div>

          {/* Geological Material Proportion Bar */}
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[10px] text-slate-400">
              <span>Lithology Distribution</span>
              <span>{riskData.features.length} Points</span>
            </div>
            <div className="flex h-2 w-full overflow-hidden rounded bg-slate-800">
              {Object.entries(regionalMetrics.material).map(([mat, count], i) => {
                const pct = (count / riskData.features.length) * 100;
                const colors = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];
                return <div key={mat} style={{ width: `${pct}%` }} className={colors[i % colors.length]} title={`${mat}: ${count}`} />;
              })}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-3 text-[10px] text-slate-400">
              {Object.entries(regionalMetrics.material).map(([mat, count], i) => {
                const dotColors = ["text-blue-500", "text-emerald-500", "text-amber-500", "text-rose-500"];
                return (
                  <span key={mat} className="flex items-center gap-1">
                    <span className={dotColors[i % dotColors.length]}>■</span> {mat} ({count})
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TARGET LOCATION DASHBOARD (Bottom Left) */}
      {selectedFeature && (
        <div className="absolute bottom-6 left-5 z-10 w-96 rounded-2xl border border-slate-700 bg-slate-950/95 p-5 shadow-2xl backdrop-blur">
          <div className="flex items-start justify-between">
            <div>
              <span className="rounded bg-red-950/80 px-2 py-0.5 text-[10px] font-mono text-red-300 border border-red-800">
                {selectedFeature.ACTIVITY || "Active"}
              </span>
              <h2 className="mt-1 text-sm font-semibold text-slate-100">
                {selectedFeature.slide_name?.trim() ? selectedFeature.slide_name : "Regional Zone Analysis"}
              </h2>
              <div className="text-xs text-slate-400">{selectedFeature.district} • {selectedFeature.state}</div>
            </div>
            <button
              onClick={() => setSelectedFeature(null)}
              className="text-slate-400 hover:text-white text-xs font-mono"
            >
              [CLOSE]
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-800 pt-3 text-center">
            <div className="rounded-lg bg-slate-900/60 p-2 border border-slate-800/80">
              <div className="text-[10px] uppercase text-slate-500">Trigger</div>
              <div className="mt-0.5 text-xs font-semibold text-sky-400 truncate">{selectedFeature.rainfall_trigger || "Rainfall"}</div>
            </div>
            <div className="rounded-lg bg-slate-900/60 p-2 border border-slate-800/80">
              <div className="text-[10px] uppercase text-slate-500">Hydrology</div>
              <div className="mt-0.5 text-xs font-semibold text-indigo-400 truncate">{selectedFeature.HYDROLOGICAL_CONDITION || "Wet"}</div>
            </div>
            <div className="rounded-lg bg-slate-900/60 p-2 border border-slate-800/80">
              <div className="text-[10px] uppercase text-slate-500">Vegetation</div>
              <div className="mt-0.5 text-xs font-semibold text-emerald-400 truncate">{selectedFeature.vegetation_cover || "Sparse"}</div>
            </div>
          </div>

          {/* 100-Valued Soil Moisture Sparkline Chart */}
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <div className="flex items-end justify-between mb-1.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">100-Frame Moisture Profile</span>
              <span className="text-xl font-bold font-mono text-cyan-400">{selectedFeature.avg_moisture}%</span>
            </div>

            <div className="relative h-16 w-full rounded bg-slate-950 p-1 border border-slate-800">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {selectedFeature.live_moisture?.length > 0 && (
                  <>
                    <polygon
                      fill="url(#chartGrad)"
                      points={`0,100 ${selectedFeature.live_moisture
                        .map((v, i) => `${(i / 99) * 100},${100 - v}`)
                        .join(" ")} 100,100`}
                    />
                    <polyline
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="1.8"
                      points={selectedFeature.live_moisture
                        .map((v, i) => `${(i / 99) * 100},${100 - v}`)
                        .join(" ")}
                    />
                  </>
                )}
              </svg>
            </div>
            <div className="mt-1 flex justify-between text-[9px] font-mono text-slate-500">
              <span>FRAME 0</span>
              <span>100-DATA SAMPLES (LIVE)</span>
              <span>FRAME 100</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}