import React from 'react';
import { Link } from 'react-router-dom';

// Left column of the Alerts page: the pulsing tower icon + active alert
// kiosk details.
export default function TowerBroadcastCard({ activeAlert }) {
  const alertLat = activeAlert.lat ?? activeAlert.coordinates?.lat ?? 23.3644;
  const alertLng = activeAlert.lng ?? activeAlert.coordinates?.lng ?? 93.3005;
  const alertId = activeAlert.id || 'KIO-MZ-040';

  return (
    <div className="lg:col-span-5 bg-white border border-[#cbd5e1] shadow-md flex flex-col overflow-hidden">
      <style>{`
        @keyframes pulseTowerWave {
          0% {
            transform: scale(0.6);
            opacity: 1;
          }
          50% {
            transform: scale(1.6);
            opacity: 0.6;
          }
          100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }
        .tower-wave {
          position: absolute;
          border-radius: 50%;
          border: 3px solid #d93850;
          pointer-events: none;
        }
        .tower-wave-1 {
          width: 80px;
          height: 80px;
          animation: pulseTowerWave 2.2s cubic-bezier(0.15, 0.6, 0.35, 1) infinite;
        }
        .tower-wave-2 {
          width: 80px;
          height: 80px;
          animation: pulseTowerWave 2.2s cubic-bezier(0.15, 0.6, 0.35, 1) infinite;
          animation-delay: 0.75s;
        }
        .tower-wave-3 {
          width: 80px;
          height: 80px;
          animation: pulseTowerWave 2.2s cubic-bezier(0.15, 0.6, 0.35, 1) infinite;
          animation-delay: 1.5s;
        }
      `}</style>

      <div className="p-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#d93850] bg-red-50 border border-red-200 px-2 py-0.5">
          BROADCASTING TOWER NODE
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-black text-red-600 uppercase">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
          LIVE SHOWERING ALERT
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
        {/* Tower Emitting Waves Visualization */}
        <div className="relative w-48 h-48 flex items-center justify-center my-4">
          <div className="tower-wave tower-wave-1"></div>
          <div className="tower-wave tower-wave-2"></div>
          <div className="tower-wave tower-wave-3"></div>

          <div className="relative z-10 w-20 h-20 rounded-full bg-[#d93850] text-white flex flex-col items-center justify-center shadow-xl border-4 border-white">
            <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        {/* Tower Details */}
        <div className="mt-2 w-full max-w-sm">
          <div className="text-xs font-mono font-bold text-[#64748b] tracking-wider">{alertId}</div>
          <h2 className="text-lg font-black uppercase text-[#0f172a] mt-0.5">{activeAlert.name}</h2>
          <p className="text-xs font-bold text-[#d93850] uppercase mt-0.5">{activeAlert.adm5 || `${activeAlert.district}, ${activeAlert.state}`}</p>

          <div className="grid grid-cols-2 gap-2 mt-4 text-left">
            <div className="bg-[#f8fafc] p-2.5 border border-[#e2e8f0]">
              <div className="text-[9px] font-black uppercase text-[#64748b]">District / State</div>
              <div className="text-xs font-black text-[#0f172a] mt-0.5">{activeAlert.district}, {activeAlert.state}</div>
            </div>

            <div className="bg-[#f8fafc] p-2.5 border border-[#e2e8f0]">
              <div className="text-[9px] font-black uppercase text-[#64748b]">Coordinates</div>
              <div className="text-xs font-mono font-bold text-[#0f172a] mt-0.5">{alertLat}° N, {alertLng}° E</div>
            </div>

            <div className="bg-[#f8fafc] p-2.5 border border-[#e2e8f0]">
              <div className="text-[9px] font-black uppercase text-[#64748b]">Sensor Node Type</div>
              <div className="text-xs font-black text-[#0f172a] mt-0.5 truncate">{activeAlert.type || 'Landslide Telemetry Node'}</div>
            </div>

            <div className="bg-[#f8fafc] p-2.5 border border-[#e2e8f0]">
              <div className="text-[9px] font-black uppercase text-[#64748b]">Active Telemetry</div>
              <div className="text-xs font-black text-emerald-600 mt-0.5">{activeAlert.sensorsActive || 6} Channels Live</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-col gap-2">
            <Link
              to={`/app/risk-map?lat=${alertLat}&lng=${alertLng}&kioskId=${alertId}`}
              className="w-full bg-[#d93850] hover:bg-[#b8273d] text-white py-2.5 px-4 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow transition-all active:scale-95"
            >
              <span>🗺️</span>
              <span>Zoom to Alert Kiosk on Risk Map</span>
            </Link>

            <Link
              to="/app/analytics"
              onClick={() => {
                localStorage.setItem('latitude', String(alertLat));
                localStorage.setItem('longitude', String(alertLng));
                localStorage.setItem('towerName', activeAlert.name || 'Unakoti ADM5-Node 85');
                localStorage.setItem('towerId', alertId);
              }}
              className="w-full bg-[#0284c7] hover:bg-[#0369a1] text-white py-2.5 px-4 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow transition-all active:scale-95"
            >
              <span>📊</span>
              <span>Go to Analytics ({activeAlert.name || 'Unakoti Node 85'})</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
