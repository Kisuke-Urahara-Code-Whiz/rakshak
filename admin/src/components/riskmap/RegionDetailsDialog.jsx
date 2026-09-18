import React from 'react';
import { HAZARD_COLORS, PARAMETER_TYPES, LEVEL_LABELS } from '../../constants';

// Draggable region-details dialog panel from RiskMap.jsx. Markup/behavior
// (including the pointer-drag handlers passed in as props) copied verbatim.
export default function RegionDetailsDialog({
  dialogFeature,
  da,
  activeKioskCount,
  dialogOffset,
  onClose,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}) {
  return (
    <div
      className="absolute z-20 flex flex-col bg-white shadow-2xl border-t-4 border-[#d93850] select-none"
      style={{
        bottom: '24px',
        right: '24px',
        transform: `translate(${dialogOffset.x}px, ${dialogOffset.y}px)`,
        cursor: 'move',
        width: '700px',
        maxWidth: '85vw'
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="px-4 py-2.5 border-b border-[#e0e0e0] flex justify-between items-center bg-[#f4f6f8]">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-black uppercase text-[#333333] leading-tight">{dialogFeature.name}</h3>
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#999999] bg-white px-2 py-0.5 border border-[#e0e0e0]">{LEVEL_LABELS[dialogFeature.level]}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="text-[#999999] hover:text-[#333333] font-bold px-1.5 text-base"
        >
          ×
        </button>
      </div>

      <div className="p-3 grid grid-cols-6 gap-2 bg-white text-center">
        <div className="bg-[#f8fafc] p-2 flex flex-col justify-between border border-[#e2e8f0]">
          <div className="text-[9px] font-black uppercase tracking-wider text-[#64748b]">Overall Risk</div>
          <div className="text-xs font-black uppercase mt-1" style={{ color: HAZARD_COLORS[da.overallRisk] }}>{da.overallRisk}</div>
        </div>

        <div className="bg-[#f8fafc] p-2 flex flex-col justify-between border border-[#e2e8f0]">
          <div className="text-[9px] font-black uppercase tracking-wider text-[#64748b]">Rainfall</div>
          <div className="text-xs font-black text-[#333333] mt-1">{da.rainfall}</div>
        </div>

        <div className="bg-[#f8fafc] p-2 flex flex-col justify-between border border-[#e2e8f0]">
          <div className="text-[9px] font-black uppercase tracking-wider text-[#64748b]">Active Kiosks</div>
          <div className="text-xs font-black text-[#333333] mt-1">{activeKioskCount} Nodes</div>
        </div>

        {PARAMETER_TYPES.filter(p => p.group === 'hazard').map(h => (
          <div key={h.id} className="bg-[#f8fafc] p-2 flex flex-col justify-between border border-[#e2e8f0]">
            <div className="text-[9px] font-black uppercase tracking-wider text-[#64748b] truncate">{h.label}</div>
            <div className="text-xs font-black uppercase mt-1" style={{ color: HAZARD_COLORS[da.scores[h.id]] }}>
              {da.scores[h.id]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
