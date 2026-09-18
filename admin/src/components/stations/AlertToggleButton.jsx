import React from 'react';

// Simulate/Dismiss alert button pair from the Stations page header.
// Markup/behavior copied verbatim.
export default function AlertToggleButton({ activeAlert, onSimulate, onClear }) {
  if (activeAlert) {
    return (
      <button
        onClick={onClear}
        className="bg-[#333333] hover:bg-[#111111] text-white px-3.5 py-1.5 shadow font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-transform active:scale-95"
      >
        <span>DISMISS ALERT ✕</span>
      </button>
    );
  }

  return null;
}
