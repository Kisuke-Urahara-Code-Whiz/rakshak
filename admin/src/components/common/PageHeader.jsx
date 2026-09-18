import React from 'react';

// Reused by pages that share the exact title/subtitle + right-side action
// header layout (Alerts, Reports). Markup is copied verbatim from those
// pages, just parameterized by props — no visual/behavioral change.
export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="w-full mb-4 shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div>
        <h1 className="text-lg font-black uppercase tracking-wider text-[#1a1a1a]">
          {title}
        </h1>
        <p className="text-[11px] font-bold text-[#64748b] uppercase mt-0.5">
          {subtitle}
        </p>
      </div>

      {children}
    </div>
  );
}
