import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const UploadsContext = createContext(null);

// Local Spring Boot backend base URL
const BASE_URL = "http://localhost:5001/media/sse";

export function UploadsProvider({ children }) {
  const [uploads, setUploads] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. JPEG Image SSE Receiver
    const imgSource = new EventSource(`${BASE_URL}/image`);
    
    imgSource.addEventListener("image-event", (e) => {
      try {
        const data = JSON.parse(e.data);
        const newAsset = {
          id: `IMG-${Date.now()}`,
          type: "image",
          fileType: data.fileType || "image/jpeg",
          base64: data.fileData,
          lat: data.lat ?? data.latitude ?? "--.------",
          lon: data.lon ?? data.longitude ?? "--.------",
          number: data.number || "ANONYMOUS-NODE",
          timestamp: data.time ? `${data.date || ""} ${data.time}`.trim() : new Date().toLocaleTimeString(),
        };

        setUploads((prev) => [newAsset, ...prev]);

        const path = window.location.pathname;
        if (path !== "/uploads" && path !== "/login" && path !== "/") {
          setActiveAlert({
            title: "CRITICAL VISUAL EVIDENCE TRANSMITTED",
            message: `New field imagery received from node [${newAsset.number}] at Lat: ${newAsset.lat}, Lon: ${newAsset.lon}`,
            id: newAsset.id,
          });
        }
      } catch (err) {
        console.error("Failed to parse image-event:", err);
      }
    });

    imgSource.onerror = (err) => {
      console.warn("Image SSE connection error or reconnecting:", err);
    };

    // 2. M4A Audio SSE Receiver
    const audioSource = new EventSource(`${BASE_URL}/audio`);
    
    audioSource.addEventListener("audio-event", (e) => {
      try {
        const data = JSON.parse(e.data);
        const newAsset = {
          id: `AUD-${Date.now()}`,
          type: "audio",
          fileType: data.fileType || "audio/m4a",
          base64: data.fileData,
          lat: data.lat ?? data.latitude ?? "--.------",
          lon: data.lon ?? data.longitude ?? "--.------",
          number: data.number || "ANONYMOUS-NODE",
          timestamp: data.time ? `${data.date || ""} ${data.time}`.trim() : new Date().toLocaleTimeString(),
        };

        setUploads((prev) => [newAsset, ...prev]);

        const path = window.location.pathname;
        if (path !== "/uploads" && path !== "/login" && path !== "/") {
          setActiveAlert({
            title: "VOICE TELEMETRY BRIEFING TRANSMITTED",
            message: `New audio dispatch received from node [${newAsset.number}] at Lat: ${newAsset.lat}, Lon: ${newAsset.lon}`,
            id: newAsset.id,
          });
        }
      } catch (err) {
        console.error("Failed to parse audio-event:", err);
      }
    });

    audioSource.onerror = (err) => {
      console.warn("Audio SSE connection error or reconnecting:", err);
    };

    return () => {
      imgSource.close();
      audioSource.close();
    };
  }, []);

  // Dismiss notification banner automatically when entering uploads or auth screens
  useEffect(() => {
    if (location.pathname === "/uploads" || location.pathname === "/login" || location.pathname === "/") {
      setActiveAlert(null);
    }
  }, [location.pathname]);

  return (
    <UploadsContext.Provider value={{ uploads }}>
      {children}

      {/* Floating Tactical Notification Banner */}
      {activeAlert && location.pathname !== "/uploads" && location.pathname !== "/login" && location.pathname !== "/" && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-bounce-short">
          <div className="rounded-xl border border-red-500 bg-red-50/95 p-4 shadow-2xl backdrop-blur-md">
            <div className="flex items-start justify-between gap-3 border-b border-red-200 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-ping" />
                <span className="text-xs font-black tracking-wide text-red-900 uppercase">
                  {activeAlert.title}
                </span>
              </div>
              <button
                onClick={() => setActiveAlert(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-mono font-bold"
              >
                ✕
              </button>
            </div>

            <p className="mt-2 text-xs font-medium text-slate-800 leading-relaxed">
              {activeAlert.message}
            </p>

            <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-red-100">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Ref: SDRF/INCIDENT-STREAM</span>
              <button
                onClick={() => {
                  setActiveAlert(null);
                  navigate("/uploads");
                }}
                className="rounded-lg bg-[#002b53] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow hover:bg-[#00386b] active:opacity-90 transition-all"
              >
                View Incident File →
              </button>
            </div>
          </div>
        </div>
      )}
    </UploadsContext.Provider>
  );
}

export const useUploads = () => useContext(UploadsContext);