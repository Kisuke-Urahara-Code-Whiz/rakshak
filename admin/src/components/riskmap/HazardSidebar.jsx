import React from 'react';
import { PARAMETER_TYPES, LEVEL_LABELS } from '../../constants';

// Left side panel from RiskMap.jsx: search box + autocomplete dropdown,
// kiosk visibility toggle, and hazard/environment parameter selectors.
// Markup/behavior copied verbatim.
export default function HazardSidebar({
  searchQuery,
  onSearchChange,
  searchResults,
  onSearchSelect,
  showKiosks,
  onToggleKiosks,
  activeParam,
  onSelectParam,
}) {
  return (
    <div className="w-80 bg-white border-r border-[#cccccc] shadow-lg flex flex-col z-20 h-full overflow-hidden">
      <div className="p-5 border-b border-[#e0e0e0] bg-[#f4f6f8]">
        <h2 className="text-lg font-black uppercase tracking-wider text-[#333333] mb-0.5">Hazard Level</h2>
        <div className="text-[11px] font-bold text-[#666666] uppercase">Select category to view map</div>

        <div className="mt-3 relative">
          <input
            type="text"
            placeholder="SEARCH VILLAGE / WARD / AREA..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full border-2 border-[#e0e0e0] bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider focus:border-[#d93850] focus:outline-none transition-colors"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-[#cccccc] mt-1 shadow-xl max-h-48 overflow-y-auto z-40">
              {searchResults.map((res, i) => (
                <div key={i} onClick={() => onSearchSelect(res)} className="px-3 py-2 text-xs font-bold uppercase hover:bg-[#f4f6f8] cursor-pointer border-b border-[#e0e0e0] flex justify-between">
                  <span className="truncate mr-2">{res.name}</span>
                  <span className="text-[#999999] shrink-0">{LEVEL_LABELS[res.level]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div className="bg-[#f8fafc] border-2 border-[#e2e8f0] p-3 flex items-center justify-between rounded-none shadow-sm">
          <label htmlFor="kiosk-toggle" className="text-xs font-black uppercase tracking-wider text-[#1e293b] cursor-pointer">
            Show Kiosks On Map
          </label>
          <input
            id="kiosk-toggle"
            type="checkbox"
            checked={showKiosks}
            onChange={(e) => onToggleKiosks(e.target.checked)}
            className="w-4 h-4 text-[#d93850] rounded border-gray-300 focus:ring-[#d93850] cursor-pointer"
          />
        </div>

        <div>
          <h3 className="text-[10px] font-black text-[#999999] uppercase tracking-widest mb-2.5">Natural Hazards</h3>
          {PARAMETER_TYPES.filter(p => p.group === 'hazard').map(param => (
            <button
              key={param.id}
              onClick={() => onSelectParam(param.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 mb-1.5 border-l-4 font-bold text-xs uppercase tracking-wider transition-colors ${
                activeParam === param.id ? 'bg-[#f4f6f8] border-[#d93850] text-[#333333]' : 'bg-white border-transparent text-[#666666] hover:bg-[#f4f6f8]'
              }`}
            >
              {param.label}
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: param.palette['High'] }}></span>
            </button>
          ))}
        </div>

        <div>
          <h3 className="text-[10px] font-black text-[#999999] uppercase tracking-widest mb-2.5">Terrain & Environment</h3>
          {PARAMETER_TYPES.filter(p => p.group === 'env').map(param => (
            <button
              key={param.id}
              onClick={() => onSelectParam(param.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 mb-1.5 border-l-4 font-bold text-xs uppercase tracking-wider transition-colors ${
                activeParam === param.id ? 'bg-[#f4f6f8] border-[#4caf50] text-[#333333]' : 'bg-white border-transparent text-[#666666] hover:bg-[#f4f6f8]'
              }`}
            >
              {param.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
