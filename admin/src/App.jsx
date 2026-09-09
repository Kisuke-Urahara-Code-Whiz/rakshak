import { useEffect, useState } from "react";
import Map, { Layer, Source } from "react-map-gl/maplibre";
import * as turf from "@turf/turf";

import "maplibre-gl/dist/maplibre-gl.css";

/*
|--------------------------------------------------------------------------
| NORTHEAST STATES
|--------------------------------------------------------------------------
*/

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

const GEOJSON_BASE =
  "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@main/geojson/states";

/*
|--------------------------------------------------------------------------
| LOAD & PROCESS GEOMETRY
|--------------------------------------------------------------------------
*/

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
          properties: {
            ...(feature.properties || {}),
            state: state.name,
          },
        })),
      };
    })
  );

  // 1. Combine all individual states into one FeatureCollection
  const combinedStates = {
    type: "FeatureCollection",
    features: results.flatMap((geojson) => geojson.features),
  };

  // 2. Create the Inverse Mask using Turf.js (hides heatmap spillover)
  const inverseMask = turf.mask(combinedStates);

  // 3. Melt all states into a single Outer Boundary (removes interstate lines)
  let unifiedBoundary = combinedStates.features[0];
  for (let i = 1; i < combinedStates.features.length; i++) {
    try {
      unifiedBoundary = turf.union(unifiedBoundary, combinedStates.features[i]);
    } catch (e) {
      console.warn("Turf union topology skip:", e);
    }
  }
  const outerBoundary = turf.featureCollection([unifiedBoundary]);

  return { boundaries: combinedStates, mask: inverseMask, outer: outerBoundary };
}

/*
|--------------------------------------------------------------------------
| SYNTHETIC RISK DATA (INITIAL STATE)
|--------------------------------------------------------------------------
*/

const INITIAL_RISK_POINTS = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", geometry: { type: "Point", coordinates: [91.7362, 26.1445] }, properties: { value: 92 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [91.9, 26.3] }, properties: { value: 78 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [92.78, 26.75] }, properties: { value: 55 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [90.62, 26.65] }, properties: { value: 30 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [93.62, 27.08] }, properties: { value: 82 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [94.05, 27.55] }, properties: { value: 95 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [95.32, 28.06] }, properties: { value: 70 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [96.13, 27.95] }, properties: { value: 45 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [94.108, 25.675] }, properties: { value: 88 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [94.5, 26.1] }, properties: { value: 72 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [93.9368, 24.817] }, properties: { value: 94 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [94.2, 24.6] }, properties: { value: 70 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [92.7176, 23.727] }, properties: { value: 83 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [92.9, 23.4] }, properties: { value: 52 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [91.2868, 23.8315] }, properties: { value: 35 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [91.5, 24.1] }, properties: { value: 58 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [91.893, 25.578] }, properties: { value: 65 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [91.3, 25.4] }, properties: { value: 30 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [88.612, 27.331] }, properties: { value: 45 } },
  ],
};

/*
|--------------------------------------------------------------------------
| INVERSE DISTANCE WEIGHTING (IDW)
|--------------------------------------------------------------------------
*/

function calculateRiskAtPoint(lng, lat, featureCollection) {
  let numerator = 0;
  let denominator = 0;

  for (const feature of featureCollection.features) {
    const [ptLng, ptLat] = feature.geometry.coordinates;
    const value = feature.properties.value;
    
    const distance = turf.distance([lng, lat], [ptLng, ptLat], { units: "kilometers" });

    if (distance === 0) return value;

    const weight = 1 / Math.pow(distance, 2);
    
    numerator += value * weight;
    denominator += weight;
  }

  if (denominator === 0) return 0;
  return Math.min(Math.max(Math.round(numerator / denominator), 0), 100);
}

/*
|--------------------------------------------------------------------------
| MAP LAYERS
|--------------------------------------------------------------------------
*/

const heatmapLayer = {
  id: "risk-heatmap",
  type: "heatmap",
  maxzoom: 12,
  paint: {
    "heatmap-weight": [
      "interpolate", ["linear"], ["get", "value"],
      0, 0.1,
      50, 0.5,
      100, 1.2, 
    ],
    "heatmap-intensity": 1,
    "heatmap-radius": [
      "interpolate", ["exponential", 2], ["zoom"],
      4, 50,
      10, 3200,
    ],
    "heatmap-opacity": 0.85,
    "heatmap-color": [
      "interpolate", ["linear"], ["heatmap-density"],
      0.0, "rgba(0,0,0,0)",
      0.1, "#22c55e",
      0.4, "#eab308",
      0.7, "#f97316",
      0.9, "#ef4444",
      1.0, "#7f1d1d",
    ],
  },
};

const maskLayer = {
  id: "inverse-mask-fill",
  type: "fill",
  paint: {
    "fill-color": "#050f1a", 
    "fill-opacity": 1,
  },
};

const outerBoundaryLayer = {
  id: "northeast-outer-boundary",
  type: "line",
  paint: {
    "line-color": "#ffffff",
    "line-width": ["interpolate", ["linear"], ["zoom"], 4, 1, 10, 2],
    "line-opacity": 0.9,
  },
};

const stateBorderLayer = {
  id: "northeast-state-borders",
  type: "line",
  paint: {
    "line-color": "#ffffff",
    "line-width": 1,
    "line-opacity": 0.5,
  },
};

/*
|--------------------------------------------------------------------------
| APP COMPONENT
|--------------------------------------------------------------------------
*/

export default function App() {
  const [geoData, setGeoData] = useState({ boundaries: null, mask: null, outer: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [riskData, setRiskData] = useState(INITIAL_RISK_POINTS); // Added dynamically updated state

  /*
  |--------------------------------------------------------------------------
  | LOAD GEOMETRY
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await loadAndProcessGeometry();
        if (!cancelled) setGeoData(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Unable to load Northeast India boundaries.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | DYNAMIC HEATMAP SIMULATION
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    const interval = setInterval(() => {
      setRiskData((prevData) => {
        const updatedFeatures = prevData.features.map((feature) => {
          // Create a random shift between -15 and +15
          const fluctuation = Math.floor(Math.random() * 31) - 15;
          
          // Apply shift and constrain between 0 and 100
          const newValue = Math.min(Math.max(feature.properties.value + fluctuation, 0), 100);

          return {
            ...feature,
            properties: {
              ...feature.properties,
              value: newValue,
            },
          };
        });

        return { ...prevData, features: updatedFeatures };
      });
    }, 5000); // Trigger every 5 seconds

    return () => clearInterval(interval);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | HANDLE MAP CLICK
  |--------------------------------------------------------------------------
  */
  const handleMapClick = (e) => {
    const { lng, lat } = e.lngLat;
    
    if (!geoData.boundaries) return;

    const clickPoint = turf.point([lng, lat]);
    
    // Find exactly which state was clicked using the full boundaries collection
    const clickedFeature = geoData.boundaries.features.find(feature => 
      turf.booleanPointInPolygon(clickPoint, feature)
    );

    if (!clickedFeature) {
      setClickedLocation(null);
      return;
    }

    const stateName = clickedFeature.properties.state;
    // Compute using the live updated riskData rather than static points
    const estimatedRisk = calculateRiskAtPoint(lng, lat, riskData);

    setClickedLocation({
      lng: lng.toFixed(4),
      lat: lat.toFixed(4),
      risk: estimatedRisk,
      state: stateName
    });
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#050f1a]">
      <Map
        initialViewState={{
          longitude: 93.0,
          latitude: 25.8,
          zoom: 5.1,
        }}
        mapStyle="https://demotiles.maplibre.org/style.json"
        attributionControl
        onClick={handleMapClick}
        interactiveLayerIds={["northeast-invisible-fill", "inverse-mask-fill"]}
      >
        {/* HEATMAP LAYER */}
        <Source id="risk-data" type="geojson" data={riskData}>
          <Layer {...heatmapLayer} />
        </Source>

        {/* INVERSE MASK LAYER */}
        {geoData.mask && (
          <Source id="mask-source" type="geojson" data={geoData.mask}>
            <Layer {...maskLayer} />
          </Source>
        )}

        {/* OUTER BOUNDARY (Unified Perimeter) */}
        {geoData.outer && (
          <Source id="northeast-outer" type="geojson" data={geoData.outer}>
            <Layer {...outerBoundaryLayer} />
          </Source>
        )}

        {/* INVISIBLE STATES & STATE BORDERS */}
        {geoData.boundaries && (
          <Source id="northeast-states-hidden" type="geojson" data={geoData.boundaries}>
            <Layer 
              id="northeast-invisible-fill" 
              type="fill" 
              paint={{ "fill-opacity": 0 }} 
            />
            {/* Newly added layer to draw the internal borders */}
            <Layer {...stateBorderLayer} />
          </Source>
        )}
      </Map>

      {/* =====================================================
          HEADER
          ===================================================== */}
      <div className="absolute left-5 top-5 rounded-2xl border border-white/40 bg-slate-950/80 px-5 py-4 text-white shadow-xl backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
          <div>
            <h1 className="text-lg font-bold">Northeast India</h1>
            <p className="text-xs text-slate-300">Regional Risk Monitoring</p>
          </div>
        </div>
      </div>

      {/* =====================================================
          LOADING / ERROR
          ===================================================== */}
      {loading && (
        <div className="absolute left-1/2 top-5 z-10 -translate-x-1/2 rounded-full bg-slate-950/80 px-4 py-2 text-sm text-white shadow-lg backdrop-blur">
          Loading boundaries...
        </div>
      )}

      {error && (
        <div className="absolute left-1/2 top-5 z-10 -translate-x-1/2 rounded-xl bg-red-950/90 px-4 py-3 text-sm text-red-100 shadow-lg">
          {error}
        </div>
      )}

      {/* =====================================================
          CLICK DASHBOARD
          ===================================================== */}
      {clickedLocation && (
        <div className="absolute bottom-6 left-5 z-10 w-64 rounded-2xl border border-white/40 bg-slate-950/90 p-5 text-white shadow-2xl backdrop-blur-md transition-all">
          <button 
            onClick={() => setClickedLocation(null)}
            className="absolute right-4 top-4 text-slate-400 hover:text-white"
          >
            ✕
          </button>
          
          <h2 className="text-sm font-semibold text-slate-100">
            {clickedLocation.state}
          </h2>
          <p className="mb-4 text-xs text-slate-400">
            Location Analysis
          </p>

          <div className="space-y-4">
            <div>
              <div className="text-xs text-slate-400">Estimated Risk</div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">{clickedLocation.risk}%</span>
                <span 
                  className="mb-2 h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: 
                      clickedLocation.risk >= 70 ? "#ef4444" : 
                      clickedLocation.risk >= 40 ? "#f59e0b" : "#22c55e"
                  }}
                />
              </div>
            </div>
            <hr className="border-slate-800" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Latitude</div>
                <div className="font-mono text-sm text-slate-300">{clickedLocation.lat}°</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Longitude</div>
                <div className="font-mono text-sm text-slate-300">{clickedLocation.lng}°</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          LEGEND
          ===================================================== */}
      <div className="absolute bottom-6 right-5 z-10 w-72 rounded-2xl border border-white/40 bg-slate-950/85 p-5 text-white shadow-xl backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Risk Level</h2>
          <span className="text-xs text-slate-400">0 — 100</span>
        </div>
        <div
          className="h-3 w-full rounded-full"
          style={{ background: "linear-gradient(to right, #22c55e 0%, #84cc16 30%, #eab308 50%, #f59e0b 65%, #f97316 78%, #ef4444 90%, #7f1d1d 100%)" }}
        />
        <div className="mt-2 flex justify-between text-xs">
          <span className="text-green-400">Safe</span>
          <span className="text-yellow-400">Moderate</span>
          <span className="text-red-400">Danger</span>
        </div>
      </div>
    </div>
  );
}