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
      0.0, "rgba(0,0,0,0)", 0.15, "#10b981", 0.35, "#3b82f6", 
      0.60, "#f59e0b", 0.85, "#ef4444", 1.00, "#991b1b"
    ],
  },
};

export default function MapView() {
  const navigate = useNavigate();
  const [geoData, setGeoData] = useState({ boundaries: null, mask: null, outer: null });
  const [riskData, setRiskData] = useState({ type: "FeatureCollection", features: [] });

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
    
    // If a valid point is clicked, navigate to /dash and pass the data
    if (target) {
      navigate('/dash', { state: target.properties });
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950">
      <Map
        initialViewState={{ longitude: 88.62, latitude: 27.52, zoom: 8.5 }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        onClick={handleMapClick}
        interactiveLayerIds={["northeast-invisible-fill", "inverse-mask-fill"]}
      >
        <Source id="risk-data" type="geojson" data={riskData}>
          <Layer {...heatmapLayer} />
        </Source>
        {geoData.mask && (
          <Source id="mask-source" type="geojson" data={geoData.mask}>
            <Layer id="inverse-mask-fill" type="fill" paint={{ "fill-color": "#030712", "fill-opacity": 0.95 }} />
          </Source>
        )}
        {geoData.boundaries && (
          <Source id="northeast-states-hidden" type="geojson" data={geoData.boundaries}>
            <Layer id="northeast-invisible-fill" type="fill" paint={{ "fill-opacity": 0 }} />
            <Layer id="northeast-state-borders" type="line" paint={{ "line-color": "#94a3b8", "line-width": 0.8, "line-opacity": 0.35 }} />
          </Source>
        )}
      </Map>

      <div className="absolute left-5 top-5 rounded-2xl border border-white/40 bg-slate-950/80 px-5 py-4 text-white shadow-xl backdrop-blur-md z-10 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
          <div>
            <h1 className="text-lg font-bold">Live Risk Monitoring</h1>
            <p className="text-xs text-slate-300">Click a hotspot to view dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}