import React, { useState } from 'react';

export default function PayloadInspectorModal({ payload, title = 'Prepared Backend Dispatch Payload', onClose }) {
  const [copied, setCopied] = useState(false);

  const jsonStr = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-[#0f172a] text-slate-100 border border-slate-700 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden rounded-none">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#1e293b] px-5 py-3 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="font-mono text-xs font-black uppercase text-emerald-400">JSON Payload</span>
            <h3 className="text-xs font-black uppercase tracking-wider text-white ml-2">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="bg-slate-700 hover:bg-slate-600 text-xs font-black uppercase tracking-wider px-3 py-1.5 transition-colors text-white"
            >
              {copied ? '✓ Copied!' : '📋 Copy JSON'}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white font-black text-sm px-2 py-1 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto p-5 font-mono text-xs bg-[#0b1120] text-emerald-300 select-all leading-relaxed">
          <pre className="whitespace-pre-wrap">{jsonStr}</pre>
        </div>

        {/* Footer */}
        <div className="bg-[#1e293b] px-5 py-3 border-t border-slate-700 flex justify-between items-center text-[11px] text-slate-400 shrink-0">
          <span>Target Endpoints: POST /api/uploads • WS Broadcast Topic: incident_triage</span>
          <button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 font-black uppercase tracking-wider text-xs transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
