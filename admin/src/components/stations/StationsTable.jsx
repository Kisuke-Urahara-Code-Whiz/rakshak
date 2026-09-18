import React from 'react';
import { HAZARD_COLORS } from '../../constants';

// Stations table extracted verbatim from Stations.jsx, including the
// alert-pulse keyframes and the two row variants (alerted vs normal).
export default function StationsTable({ stations, timeWindow, onGoToMap }) {
  return (
    <div className="bg-white shadow-md border border-[#cbd5e1] flex-1 min-h-0 overflow-hidden flex flex-col">
      {/* Dynamic Keyframes for alerting badge */}
      <style>{`
        @keyframes pulseAlertRed {
          0%, 100% {
            background-color: #dc2626;
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
          }
          50% {
            background-color: #b91c1c;
            transform: scale(1.03);
            box-shadow: 0 0 16px 4px rgba(220, 38, 38, 0.5);
          }
        }
        .alert-pulse-badge {
          animation: pulseAlertRed 1.2s infinite ease-in-out;
        }
      `}</style>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#f8fafc] border-b border-[#cbd5e1] z-10 shadow-sm">
            <tr className="text-[10px] font-black uppercase tracking-widest text-[#475569]">
              <th className="p-3.5">Station ID & Locality</th>
              <th className="p-3.5">State & District</th>
              <th className="p-3.5">Sensor Array</th>
              <th className="p-3.5">Coordinates</th>
              <th className="p-3.5">Map Synced Risk</th>
              <th className="p-3.5">
                {timeWindow === '1h' ? '1h Telemetry Ping' : '24h Transmission'}
              </th>
              <th className="p-3.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0] text-xs font-bold text-[#333333]">
            {stations.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
                  No matching kiosks found for the current search.
                </td>
              </tr>
            ) : (
              stations.map((stn) => {
                const riskColor = HAZARD_COLORS[stn.syncedRisk] || '#999999';

                if (stn.isAlerted) {
                  return (
                    <tr
                      key={stn.id}
                      className="bg-red-50/90 border-y-2 border-red-500 shadow-sm hover:bg-red-100/90 transition-colors"
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="alert-pulse-badge text-white text-[10px] font-black uppercase px-2 py-0.5 tracking-widest rounded-none shadow">
                            🚨 ALERT ALERT ALERT
                          </span>
                        </div>
                        <div className="font-black text-red-950 text-sm mt-1">{stn.name}</div>
                        <div className="text-[10px] font-bold text-red-800 tracking-wider mt-0.5">
                          {stn.id} • {stn.adm5}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-red-950 font-black">{stn.district}</div>
                        <div className="text-[11px] text-red-700">{stn.state}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-red-950 font-bold">{stn.type}</div>
                        <div className="text-[10px] text-red-700 font-black mt-0.5">
                          ⚠️ RAPID DISPLACEMENT • {stn.sensorsActive} Active Sensors
                        </div>
                      </td>
                      <td className="p-3.5 text-[11px] font-mono text-red-800 whitespace-nowrap">
                        {stn.lat.toFixed(4)}° N, {stn.lng.toFixed(4)}° E
                      </td>
                      <td className="p-3.5">
                        <span className="inline-block px-2.5 py-0.5 text-[10px] uppercase font-black tracking-widest text-white bg-red-600 animate-pulse">
                          CRITICAL RISK
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                          <span className="text-red-900 font-black uppercase text-[11px]">
                            ACTIVE TRIGGER DETECTED
                          </span>
                        </div>
                        <div className="text-[10px] font-bold text-red-700 mt-0.5">
                          Realtime: Instant Heartbeat Spike
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => onGoToMap(stn)}
                          className="inline-flex items-center gap-1.5 bg-[#d93850] hover:bg-[#be2d42] text-white px-3.5 py-2 text-[11px] font-black uppercase tracking-wider shadow-lg transition-transform active:scale-95 border border-white"
                        >
                          <span>Locate on Map</span>
                          <span className="text-xs">→</span>
                        </button>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={stn.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="p-3.5">
                      <div className="font-black text-[#0f172a]">{stn.name}</div>
                      <div className="text-[10px] font-bold text-[#64748b] tracking-wider mt-0.5">{stn.id} • {stn.adm5}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-[#0f172a] font-black">{stn.district}</div>
                      <div className="text-[11px] text-[#64748b]">{stn.state}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-[#334155]">{stn.type}</div>
                      <div className="text-[10px] text-[#16a34a] font-bold mt-0.5">{stn.sensorsActive} Active Channels</div>
                    </td>
                    <td className="p-3.5 text-[11px] font-mono text-[#64748b] whitespace-nowrap">
                      {stn.lat.toFixed(4)}° N, {stn.lng.toFixed(4)}° E
                    </td>
                    <td className="p-3.5">
                      <span
                        className="inline-block px-2.5 py-0.5 text-[10px] uppercase font-black tracking-widest text-white"
                        style={{ backgroundColor: riskColor }}
                      >
                        {stn.syncedRisk}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          stn.status === 'Operational' ? 'bg-[#16a34a]' : 'bg-[#eab308]'
                        }`}></span>
                        <span className="text-[#0f172a] font-black uppercase text-[11px]">
                          {stn.status}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-[#64748b] mt-0.5">
                        {timeWindow === '1h'
                          ? `Last ping: ${stn.lastPing}`
                          : '24h: 1,440 pings • 100% active'
                        }
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => onGoToMap(stn)}
                        className="inline-flex items-center gap-1.5 bg-[#d93850] hover:bg-[#be2d42] text-white px-3 py-1.5 text-[11px] font-black uppercase tracking-wider shadow-sm transition-transform active:scale-95"
                      >
                        <span>Go to Map</span>
                        <span className="text-xs">→</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
