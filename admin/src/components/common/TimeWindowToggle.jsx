import React from 'react';

// Two visual variants exist in the original code:
// - 'stations': the toggle used in the Stations page header (red active pill)
// - 'kiosk': the toggle used in the RiskMap kiosk flyout card (white active pill)
// Classes are copied verbatim per-variant so appearance is unchanged.
export default function TimeWindowToggle({ value, onChange, variant = 'stations' }) {
  if (variant === 'kiosk') {
    return (
      <div className="flex bg-[#f1f5f9] p-0.5 mt-3 border border-[#e2e8f0]">
        <button
          onClick={() => onChange('1h')}
          className={`flex-1 py-1 text-[10px] font-black uppercase tracking-wider transition-colors ${value === '1h' ? 'bg-white text-[#d93850] shadow-sm' : 'text-[#64748b]'}`}
        >
          1h Window
        </button>
        <button
          onClick={() => onChange('24h')}
          className={`flex-1 py-1 text-[10px] font-black uppercase tracking-wider transition-colors ${value === '24h' ? 'bg-white text-[#d93850] shadow-sm' : 'text-[#64748b]'}`}
        >
          24h Window
        </button>
      </div>
    );
  }

  return (
    <div className="flex bg-[#e2e8f0] p-0.5 border border-[#cbd5e1]">
      <button
        onClick={() => onChange('1h')}
        className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-wider transition-colors ${
          value === '1h' ? 'bg-[#d93850] text-white shadow-sm' : 'text-[#475569] hover:text-[#0f172a]'
        }`}
      >
        1h Window
      </button>
      <button
        onClick={() => onChange('24h')}
        className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-wider transition-colors ${
          value === '24h' ? 'bg-[#d93850] text-white shadow-sm' : 'text-[#475569] hover:text-[#0f172a]'
        }`}
      >
        24h Window
      </button>
    </div>
  );
}
