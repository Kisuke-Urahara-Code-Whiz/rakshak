import React from 'react';

export default function QuestionnaireViewModal({ upload, onClose, onViewMedia }) {
  if (!upload) return null;

  // Robustly extract questionnaire data from any format
  const extractQuestionnaire = () => {
    if (upload.groundQuestionnaire && typeof upload.groundQuestionnaire === 'object') {
      return upload.groundQuestionnaire;
    }
    if (typeof upload.questionnaire === 'string') {
      try {
        return JSON.parse(upload.questionnaire);
      } catch {}
    } else if (upload.questionnaire && typeof upload.questionnaire === 'object') {
      return upload.questionnaire;
    }
    if (upload.payload?.questionnaire) {
      if (typeof upload.payload.questionnaire === 'string') {
        try {
          return JSON.parse(upload.payload.questionnaire);
        } catch {}
      }
      return upload.payload.questionnaire;
    }
    return {};
  };

  const q = extractQuestionnaire();
  const isAudio = upload.uploadType === 'audio';

  const indicators = Array.isArray(q.warningIndicators)
    ? q.warningIndicators
    : typeof q.warningIndicators === 'string'
    ? [q.warningIndicators]
    : [];

  const infrastructure = Array.isArray(q.infrastructureThreatened)
    ? q.infrastructureThreatened
    : typeof q.infrastructureThreatened === 'string'
    ? [q.infrastructureThreatened]
    : [];

  const isUrgent =
    q.immediateEvacuationNeeded ||
    q.urgencyLevel?.toLowerCase().includes('critical') ||
    upload.severity === 'Critical' ||
    upload.severity === 'High';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-3xl bg-white border border-[#cbd5e1] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden rounded-sm animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between bg-[#0f172a] text-white px-5 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded bg-red-600/20 border border-red-500 flex items-center justify-center text-sm">
              📋
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-100">
                  5-Point Ground Triage Questionnaire
                </h3>
                {(upload.isLiveSubmission || upload.id?.startsWith('UPL-MB-')) && (
                  <span className="px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[9px] font-black uppercase rounded">
                    ⚡ LIVE APP TELEMETRY
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Report ID: {upload.id} • Attached to {isAudio ? 'Acoustic Memo' : 'Field Photo'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-black text-sm px-2.5 py-1.5 rounded transition-colors hover:bg-slate-800"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Reporter & Location Quick Strip */}
        <div className="bg-[#f8fafc] border-b border-[#e2e8f0] px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Reporter:</span>
            <span className="font-mono font-black text-slate-900 bg-white border border-slate-300 px-2 py-0.5 rounded">
              📞 {upload.phoneNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Location:</span>
            <span className="font-bold text-slate-800">
              {upload.location?.locality ? `${upload.location.locality}, ` : ''}
              {upload.location?.district}, {upload.location?.state}
            </span>
            {upload.location?.coordinates && (
              <span className="font-mono text-[10px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                {upload.location.coordinates.lat?.toFixed(4)}°N, {upload.location.coordinates.lng?.toFixed(4)}°E
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Time:</span>
            <span className="font-bold text-slate-700">
              {upload.relativeTime}
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#ffffff]">
          {/* Evacuation Alert Banner */}
          <div
            className={`p-3.5 border-l-4 rounded-r flex items-start gap-3 shadow-sm ${
              isUrgent
                ? 'bg-red-50 border-red-600 text-red-900'
                : 'bg-emerald-50 border-emerald-600 text-emerald-900'
            }`}
          >
            <span className="text-xl shrink-0 mt-0.5">{isUrgent ? '🚨' : '🛡️'}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-black uppercase text-xs tracking-wider">
                  {isUrgent ? 'CRITICAL EVACUATION PRIORITY' : 'ROUTINE SLOPE SURVEILLANCE'}
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded ${
                    isUrgent ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {q.urgencyLevel || (isUrgent ? 'Critical' : 'Routine')}
                </span>
              </div>
              <p className="text-xs font-medium mt-1">
                {q.immediateEvacuationNeeded
                  ? 'Reporter assessed immediate evacuation is required for downstream residents & motorists.'
                  : 'No immediate civilian evacuation mandated; precautionary hillside monitoring advised.'}
              </p>
            </div>
          </div>

          {/* 5 Ground Questionnaire Questions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Question 1: Activity Status */}
            <div className="border border-slate-200 rounded p-4 bg-[#fbfcfd] hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-wider mb-1">
                <span>⛰️ Question 1</span>
                <span>• Observed Landslide Activity</span>
              </div>
              <div className="mt-2 text-slate-900 font-black text-sm">
                {q.activityStatus || 'Dispatched via Rakshak Mobile App'}
              </div>
            </div>

            {/* Question 2: Weather Condition */}
            <div className="border border-slate-200 rounded p-4 bg-[#fbfcfd] hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-wider mb-1">
                <span>🌧️ Question 2</span>
                <span>• Rainfall & Weather Conditions</span>
              </div>
              <div className="mt-2 text-slate-900 font-black text-sm">
                {q.weatherCondition || 'Precipitation / Slopeline Runoff'}
              </div>
            </div>
          </div>

          {/* Question 3: Threatened Infrastructure */}
          <div className="border border-slate-200 rounded p-4 bg-[#fbfcfd] hover:border-slate-300 transition-colors">
            <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-wider mb-2">
              <span>⚡ Question 3</span>
              <span>• Threatened Infrastructure & Public Assets</span>
            </div>
            {infrastructure.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {infrastructure.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold rounded shadow-sm"
                  >
                    <span>⚡</span>
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs font-bold text-slate-400 mt-1 italic">
                Local Access Corridor / Roadway
              </p>
            )}
          </div>

          {/* Question 4: Warning Indicators */}
          <div className="border border-slate-200 rounded p-4 bg-[#fbfcfd] hover:border-slate-300 transition-colors">
            <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-wider mb-2">
              <span>⚠️ Question 4</span>
              <span>• Observed Geotechnical Warning Indicators</span>
            </div>
            {indicators.length > 0 ? (
              <ul className="space-y-2 mt-1">
                {indicators.map((indicator, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs font-bold text-slate-800 bg-red-50/60 border border-red-200/80 px-3 py-2 rounded"
                  >
                    <span className="text-red-500 font-black">⚠️</span>
                    <span>{indicator}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs font-bold text-slate-400 mt-1 italic">
                Mobile Field Camera/Acoustic Evidence logged
              </p>
            )}
          </div>

          {/* Question 5: Additional Field Notes */}
          <div className="border border-slate-200 rounded p-4 bg-[#fbfcfd]">
            <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-wider mb-1">
              <span>📝 Additional Field Notes & Context</span>
            </div>
            <p className="text-xs font-medium text-slate-700 mt-2 bg-slate-50 border border-slate-200 p-3 rounded italic leading-relaxed">
              "{q.additionalNotes || 'Automated telemetry upload from civilian ground reporter.'}"
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#f1f5f9] px-6 py-3.5 border-t border-[#cbd5e1] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            {onViewMedia && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewMedia(upload);
                }}
                className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 px-3.5 py-1.5 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span>{isAudio ? '🎙️ Listen to Audio (.m4a)' : '📷 View Photo (.jpeg)'}</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 font-black text-xs uppercase tracking-wider transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
