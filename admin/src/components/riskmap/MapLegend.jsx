import React from 'react';

// Bottom-left collapsible legend box from RiskMap.jsx. Markup/behavior
// copied verbatim.
export default function MapLegend({ activeParamMeta, showKiosks, isLegendExpanded, onToggleExpand }) {
  return (
    <div className="absolute bottom-6 left-6 z-20 bg-white shadow-xl border-t-4 border-[#333333] max-w-[210px] w-full border border-[#e5e7eb]">
      <div
        className="px-3 py-2 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between cursor-pointer select-none"
        onClick={onToggleExpand}
      >
        <h4 className="text-[10px] font-black uppercase tracking-wider text-[#333333] truncate">
          {activeParamMeta.label}
        </h4>
        <span className="text-xs text-[#64748b] font-mono">
          {isLegendExpanded ? '−' : '+'}
        </span>
      </div>

      {isLegendExpanded && (
        <div className="p-3 flex flex-col gap-1.5 max-h-40 overflow-y-auto">
          {Object.entries(activeParamMeta.palette).map(([label, hex]) => (
            <div key={label} className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 flex-shrink-0" style={{ backgroundColor: hex }}></span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#666666]">{label}</span>
            </div>
          ))}
          {showKiosks && (
            <div className="flex items-center gap-2.5 pt-1.5 border-t border-[#f1f5f9]">
              <span className="w-2.5 h-2.5 flex-shrink-0 rounded-full bg-[#d93850]"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#333333]">Kiosk Node</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
