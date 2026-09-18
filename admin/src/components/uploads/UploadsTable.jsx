import React, { useState, useRef, useEffect } from 'react';

export default function UploadsTable({
  uploads,
  userRole = 'Citizen',
  onViewMedia,
  onInspectPayload,
  onEscalateAlert,
}) {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white shadow-md border border-[#cbd5e1] flex-1 min-h-0 overflow-hidden flex flex-col" ref={dropdownRef}>
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#f8fafc] border-b border-[#cbd5e1] z-10 shadow-sm">
            <tr className="text-[10px] font-black uppercase tracking-widest text-[#475569]">
              <th className="p-3.5">Reporter Phone Number</th>
              <th className="p-3.5">Upload Type & Format</th>
              <th className="p-3.5">Locality & Coordinates</th>
              <th className="p-3.5">Ground Triage Risk</th>
              <th className="p-3.5">Logged Timestamp</th>
              <th className="p-3.5 text-center">Action / View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0] text-xs font-bold text-[#333333]">
            {uploads.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
                  No incident media submissions found. Click "Submit Incident Report" to add one.
                </td>
              </tr>
            ) : (
              uploads.map((item) => {
                const isPhoto = item.uploadType === 'photo';
                const isAudio = item.uploadType === 'audio';
                const isDropdownOpen = openDropdownId === item.id;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[#f8fafc] transition-colors border-b border-[#e2e8f0]"
                  >
                    {/* Phone Number Column */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-xs">
                          📞
                        </span>
                        <div>
                          <div className="font-mono font-black text-slate-900 text-sm tracking-wide">
                            {item.phoneNumber}
                          </div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                            ID: {item.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Upload Type Column */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${
                            isAudio
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-blue-100 text-blue-900 border border-blue-300'
                          }`}
                        >
                          <span>{isAudio ? '🎙️ AUDIO (M4A)' : '📷 PHOTO (JPEG)'}</span>
                        </span>
                        <div className="text-[11px] text-slate-600 font-bold">
                          <div>{item.fileName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {item.fileSize} {isAudio && item.duration ? `• ${item.duration}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Locality & Coordinates */}
                    <td className="p-3.5">
                      <div className="font-black text-slate-900">{item.location?.locality}</div>
                      <div className="text-[11px] text-slate-600">
                        {item.location?.district}, {item.location?.state}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        {item.location?.coordinates?.lat?.toFixed(4)}° N, {item.location?.coordinates?.lng?.toFixed(4)}° E
                      </div>
                    </td>

                    {/* Ground Triage Risk & Questionnaire Result */}
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          item.severity === 'High'
                            ? 'bg-red-600 text-white'
                            : item.severity === 'Medium'
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {item.severity} Risk
                      </span>
                      <div className="text-[10px] font-bold text-slate-600 mt-1 max-w-[220px] truncate" title={item.groundQuestionnaire?.activityStatus}>
                        {item.groundQuestionnaire?.activityStatus || 'Ground verified'}
                      </div>
                    </td>

                    {/* Logged Timestamp */}
                    <td className="p-3.5">
                      <div className="text-slate-900 font-bold">{item.relativeTime}</div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Action / View or Listen Dropdown */}
                    <td className="p-3.5 text-center relative">
                      <div className="inline-block text-left">
                        <button
                          type="button"
                          onClick={() => setOpenDropdownId(isDropdownOpen ? null : item.id)}
                          className="bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-800 px-3 py-1.5 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all focus:border-[#d93850]"
                        >
                          <span>{isAudio ? '🎧 Listen' : '👁️ View'}</span>
                          <span className="text-[10px]">▼</span>
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                          <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-[#cbd5e1] shadow-xl z-30 divide-y divide-slate-100 text-left">
                            {/* Primary Action: View or Listen */}
                            <button
                              onClick={() => {
                                setOpenDropdownId(null);
                                onViewMedia(item);
                              }}
                              className="w-full px-3 py-2.5 text-xs font-bold text-slate-800 hover:bg-red-50 hover:text-[#d93850] flex items-center gap-2 transition-colors"
                            >
                              <span>{isAudio ? '🎙️ Listen to Audio (.m4a)' : '📷 View High-Res Photo (.jpeg)'}</span>
                            </button>

                            {/* View Questionnaire */}
                            <button
                              onClick={() => {
                                setOpenDropdownId(null);
                                onViewMedia(item);
                              }}
                              className="w-full px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                            >
                              <span>📋 View Ground Questionnaire</span>
                            </button>

                            {/* Role Rule: Official actions for Admins and Employees */}
                            {userRole !== 'Citizen' && (
                              <>
                                {/* Inspect Payload */}
                                <button
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    onInspectPayload(item.payload || item);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                                >
                                  <span>🔍 Inspect JSON Payload</span>
                                </button>

                                {/* Escalate to Live Kiosk Alert */}
                                <button
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    onEscalateAlert(item);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                >
                                  <span>🚨 Escalate to Live Alert</span>
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
