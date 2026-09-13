import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUploads } from "./UploadsContext";

export default function Uploads() {
  const { uploads } = useUploads();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all"); // 'all' | 'image' | 'audio'

  const filteredAssets = uploads.filter((item) => {
    if (filter === "all") return true;
    return item.type === filter;
  });

  return (
    <div className="min-h-screen w-full bg-slate-100 font-sans text-slate-800 flex flex-col">
      {/* Official Top Bar */}
      <header className="bg-[#002b53] px-6 py-3 flex items-center justify-between border-b-2 border-amber-500 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white p-0 shadow border border-white/20">
            <img
              src="/logo-nobg.png"
              alt="RAKSHAK Logo"
              className="h-full w-full object-contain scale-[1.7]"
            />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-wider leading-none">RAKSHAK</h1>
            <p className="text-slate-300 text-[11px] mt-1">Govt. Landslide Alert Portal // Hazard Incident Repository</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dash")}
            className="rounded bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#002b53] border border-blue-200 hover:bg-blue-100 active:opacity-80 transition-all"
          >
            ← Back to Telemetry Dashboard
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
        {/* Title Bar & Filter Tabs */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                Real-Time Feeds
              </span>
              <span className="text-xs font-semibold text-slate-500">Ref: PROTOCOL-SDRF/SEC-9</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide text-slate-900 mt-1">
              Field Hazard Documentation
            </h2>
            <p className="text-xs text-slate-500">
              Live ingest of citizen visual evidence and spatial voice telemetry memos.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                filter === "all" ? "bg-[#002b53] text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              All Assets ({uploads.length})
            </button>
            <button
              onClick={() => setFilter("image")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                filter === "image" ? "bg-[#002b53] text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Images ({uploads.filter((u) => u.type === "image").length})
            </button>
            <button
              onClick={() => setFilter("audio")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                filter === "audio" ? "bg-[#002b53] text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Voice Memos ({uploads.filter((u) => u.type === "audio").length})
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredAssets.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm my-8">
            <div className="h-10 w-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold mb-3">
              📡
            </div>
            <p className="text-sm font-bold text-slate-700">No field evidence received yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Live incoming data from SSE (/sse/image and /sse/audio) will appear automatically.
            </p>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          asset.type === "image" ? "bg-sky-500" : "bg-emerald-500"
                        }`}
                      />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        {asset.type === "image" ? "Visual Snapshot" : "Audio Memo"}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {asset.fileType}
                    </span>
                  </div>

                  {/* Media Preview Box */}
                  <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-900/5 mb-3">
                    {asset.type === "image" ? (
                      <img
                        src={`data:${asset.fileType};base64,${asset.base64}`}
                        alt="Hazard Documentation Snapshot"
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="p-4 flex flex-col justify-center items-center h-48 bg-slate-50">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg mb-3 shadow-inner">
                          🎙
                        </div>
                        <audio
                          controls
                          className="w-full mt-2"
                          src={`data:${asset.fileType};base64,${asset.base64}`}
                        >
                          Your browser does not support audio playback.
                        </audio>
                      </div>
                    )}
                  </div>

                  {/* Spatial Coordinates Box */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <span className="text-[9px] font-bold uppercase text-slate-500">Latitude</span>
                      <p className="text-xs font-bold font-mono text-slate-900 mt-0.5">{asset.lat}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <span className="text-[9px] font-bold uppercase text-slate-500">Longitude</span>
                      <p className="text-xs font-bold font-mono text-slate-900 mt-0.5">{asset.lon}</p>
                    </div>
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Node: +91 {asset.number}</span>
                  <span>{asset.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Government Security Footer */}
        <div className="mt-12 text-center border-t border-slate-200 pt-6">
          <p className="text-[11px] text-slate-400 font-medium">
            Protected under Government Disaster Management Protocol // All sensor streams encrypted
          </p>
        </div>
      </main>
    </div>
  );
}