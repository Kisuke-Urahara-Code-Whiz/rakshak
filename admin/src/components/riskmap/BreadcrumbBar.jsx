import React from 'react';

// Top breadcrumb bar, "Simulate Alert" button, and hovered-feature pill
// overlaid on the map canvas in RiskMap.jsx. Markup/behavior copied verbatim.
export default function BreadcrumbBar({
  activeAlert,
  drillStack,
  parentNode,
  onGoBack,
  onSimulateAlert,
  hoveredFeature,
}) {
  return (
    <>
      <div className={`absolute ${activeAlert ? 'top-14' : 'top-5'} left-5 right-5 z-30 flex items-center justify-between pointer-events-none transition-all duration-300`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white px-3.5 py-2 shadow-md font-bold text-xs uppercase tracking-wider text-[#333333] pointer-events-auto border border-[#e5e7eb] max-w-[60vw] overflow-x-auto whitespace-nowrap">
            {drillStack.map((step, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="mx-2 text-[#cccccc]">/</span>}
                <span className={idx === drillStack.length - 1 ? 'text-[#d93850] font-black' : ''}>{step.name}</span>
              </React.Fragment>
            ))}
            {parentNode && (
              <button onClick={onGoBack} className="ml-3 bg-[#f4f6f8] px-2 py-0.5 hover:bg-[#e0e0e0] text-[#666666] text-[10px] uppercase font-bold border border-[#e0e0e0]">
                ← GO BACK
              </button>
            )}
          </div>
        </div>
      </div>

      {hoveredFeature && (
        <div className="bg-[#333333] text-white px-4 py-2 shadow-xl border-b-2 border-[#d93850] flex items-center gap-3 pointer-events-auto">
          <span className="text-xs font-black uppercase tracking-wider">{hoveredFeature.name}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#f6d274] bg-[#1a1a1a] px-2 py-0.5">
            {hoveredFeature.level} RISK
          </span>
        </div>
      )}
    </>
  );
}
