import React from 'react';
import TimeWindowToggle from '../common/TimeWindowToggle';

// Selected-kiosk flyout card from RiskMap.jsx. Markup/behavior copied
// verbatim; the 1h/24h toggle now reuses the shared TimeWindowToggle
// ('kiosk' variant) which renders identical classes.
export default function KioskFlyoutCard({ selectedKiosk, activeAlert, timeWindow, onTimeWindowChange, onClose }) {
  return (
    <div className={`absolute ${activeAlert ? 'top-26' : 'top-18'} right-5 z-30 bg-white border-l-4 border-[#d93850] shadow-2xl p-4 w-80 max-h-[85vh] overflow-y-auto transition-all duration-300`}>
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest bg-[#d93850] text-white px-2 py-0.5">
            TELEMETRY KIOSK
          </span>
          <h3 className="text-xs font-black uppercase text-[#1a1a1a] mt-1.5">{selectedKiosk.name}</h3>
          <p className="text-[10px] font-bold text-[#666666] uppercase">{selectedKiosk.id}</p>
        </div>
        <button
          onClick={onClose}
          className="text-[#999999] hover:text-[#111111] font-bold text-sm px-1"
        >
          ✕
        </button>
      </div>

      <TimeWindowToggle value={timeWindow} onChange={onTimeWindowChange} variant="kiosk" />

      <div className="mt-3 space-y-1.5 text-xs border-t border-[#f0f0f0] pt-2">
        <div className="flex justify-between">
          <span className="text-[#888888] font-bold uppercase text-[10px]">District:</span>
          <span className="font-black text-[#333333] text-[11px]">{selectedKiosk.district}, {selectedKiosk.state}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#888888] font-bold uppercase text-[10px]">Sub-Division:</span>
          <span className="font-bold text-[#444444] text-right truncate max-w-[150px] text-[11px]">{selectedKiosk.adm5}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#888888] font-bold uppercase text-[10px]">Coordinates:</span>
          <span className="font-mono text-[#555555] text-[10px]">{selectedKiosk.lat}° N, {selectedKiosk.lng}° E</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#888888] font-bold uppercase text-[10px]">Active Channels:</span>
          <span className="font-black text-[#10b981] text-[11px]">{selectedKiosk.sensorsActive} Sensors</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#888888] font-bold uppercase text-[10px]">
            {timeWindow === '1h' ? '1h Realtime:' : '24h Aggregation:'}
          </span>
          <span className="font-bold text-[#333333] text-[11px]">
            {timeWindow === '1h' ? `Ping: ${selectedKiosk.lastPing}` : '1,440 pings • 0 drops'}
          </span>
        </div>
      </div>
    </div>
  );
}
