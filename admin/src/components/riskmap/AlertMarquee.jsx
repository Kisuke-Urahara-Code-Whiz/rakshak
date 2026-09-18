import React from 'react';

// Top scrolling marquee alert banner from RiskMap.jsx. Markup, the two
// duplicate marquee tracks (for a seamless loop), and the animations used
// only by this banner are copied verbatim.
export default function AlertMarquee({ activeAlert, onDismiss }) {
  return (
    <div className="absolute top-0 left-0 right-0 z-50 bg-[#d93850] text-white shadow-2xl border-b-2 border-white/40 flex items-center px-4 py-2.5 overflow-hidden">
      <style>{`
        @keyframes alertMarqueeContinuous {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .marquee-container-infinite {
          display: flex;
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
          user-select: none;
        }
        .marquee-track-infinite {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          min-width: 100%;
          animation: alertMarqueeContinuous 24s linear infinite;
        }
        .marquee-container-infinite:hover .marquee-track-infinite {
          animation-play-state: paused;
        }
      `}</style>

      <div className="flex items-center gap-2 bg-[#991b1b] px-3 py-1 text-[11px] font-black uppercase tracking-widest shrink-0 shadow-inner mr-4 z-10">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
        </span>
        <span>CRITICAL ALERT</span>
      </div>

      <div className="flex-1 overflow-hidden relative marquee-container-infinite">
        {/* Track 1 */}
        <div className="marquee-track-infinite text-xs font-black uppercase tracking-wider space-x-12 pr-12">
          <span>
            ⚠️ HIGH-PRECISION GEOTECHNICAL ALERT: TRIGGER DETECTED AT NODE {activeAlert.id} ({activeAlert.name})
          </span>
          <span>
            • LOCALITY: {activeAlert.adm5} • REGION: {activeAlert.district}, {activeAlert.state}
          </span>
          <span>
            • COORDINATES: {activeAlert.lat}° N, {activeAlert.lng}° E • ACTIVE CHANNELS: {activeAlert.sensorsActive} SENSORS
          </span>
          <span>
            • ANOMALY: {activeAlert.message || 'RAPID SHEAR STRAIN & PORE-PRESSURE SATURATION DETECTED'} • DISPATCHING TELEMETRIC EARLY WARNING TO EVACUATION UNITS
          </span>
        </div>

        {/* Track 2 (Duplicate for continuous loop with zero pauses) */}
        <div className="marquee-track-infinite text-xs font-black uppercase tracking-wider space-x-12 pr-12" aria-hidden="true">
          <span>
            ⚠️ HIGH-PRECISION GEOTECHNICAL ALERT: TRIGGER DETECTED AT NODE {activeAlert.id} ({activeAlert.name})
          </span>
          <span>
            • LOCALITY: {activeAlert.adm5} • REGION: {activeAlert.district}, {activeAlert.state}
          </span>
          <span>
            • COORDINATES: {activeAlert.lat}° N, {activeAlert.lng}° E • ACTIVE CHANNELS: {activeAlert.sensorsActive} SENSORS
          </span>
          <span>
            • ANOMALY: {activeAlert.message || 'RAPID SHEAR STRAIN & PORE-PRESSURE SATURATION DETECTED'} • DISPATCHING TELEMETRIC EARLY WARNING TO EVACUATION UNITS
          </span>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="ml-4 bg-white/20 hover:bg-white/40 text-white font-black text-xs uppercase px-2.5 py-1 tracking-wider shrink-0 transition-colors z-10"
      >
        DISMISS ✕
      </button>
    </div>
  );
}
