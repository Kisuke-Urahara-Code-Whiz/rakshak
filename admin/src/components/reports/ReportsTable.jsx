import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function ReportsTable({ reports, downloadingId, onDownload }) {
  const { t } = useLanguage();

  if (!reports || reports.length === 0) {
    return (
      <div className="bg-white shadow-md border border-[#cbd5e1] flex-1 min-h-0 w-full overflow-hidden flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-md flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-3xl">
            📋
          </div>
          <h3 className="text-sm font-black uppercase tracking-wider text-[#1a1a1a] mb-2">
            {t('reports_empty_title')}
          </h3>
          <p className="text-xs text-[#666666] leading-relaxed">
            {t('reports_empty_desc')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md border border-[#cbd5e1] flex-1 min-h-0 w-full overflow-hidden flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#f8fafc] border-b border-[#cbd5e1] z-10 shadow-sm">
            <tr className="text-[10px] font-black uppercase tracking-widest text-[#475569]">
              <th className="p-3.5">{t('reports_col_ref')}</th>
              <th className="p-3.5">{t('reports_col_region')}</th>
              <th className="p-3.5">{t('reports_col_type')}</th>
              <th className="p-3.5">{t('reports_col_time')}</th>
              <th className="p-3.5">{t('reports_col_status')}</th>
              <th className="p-3.5 text-center">{t('reports_col_action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0] text-xs font-bold text-[#333333]">
            {reports.map((rep) => {
              const isAudio = rep.uploadType === 'audio';
              const locationStr = rep.location?.district || rep.location?.state || 'North Sikkim';
              const coordinatesStr = rep.location?.coordinates
                ? `${rep.location.coordinates.lat.toFixed(4)}° N, ${rep.location.coordinates.lng.toFixed(4)}° E`
                : 'GPS Logged';

              const activity =
                rep.groundQuestionnaire?.activityStatus ||
                'Civilian Mobile Field Incident';

              return (
                <tr key={rep.id} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="p-3.5">
                    <div className="font-black text-[#0f172a] uppercase">{activity}</div>
                    <div className="text-[10px] font-mono text-[#d93850] font-bold mt-0.5">
                      REF: {rep.id} • {rep.phoneNumber}
                    </div>
                  </td>

                  <td className="p-3.5">
                    <div className="text-[#0f172a] font-black">{locationStr}</div>
                    <div className="text-[10px] font-mono text-slate-500">{coordinatesStr}</div>
                  </td>

                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase ${
                        isAudio ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                      }`}
                    >
                      {isAudio ? '🎙️ Audio Memo' : '📷 Field Photo'}
                    </span>
                  </td>

                  <td className="p-3.5 font-mono text-[#64748b]">
                    {rep.timestamp ? new Date(rep.timestamp).toLocaleString() : 'Just now'}
                  </td>

                  <td className="p-3.5">
                    <span className="inline-block px-2.5 py-0.5 text-[10px] uppercase font-black tracking-widest bg-red-100 text-red-800">
                      {rep.severity || 'High'} Triage
                    </span>
                  </td>

                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => onDownload(rep)}
                      disabled={downloadingId === rep.id}
                      className="inline-flex items-center gap-1.5 bg-[#333333] hover:bg-[#111111] text-white px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                    >
                      <span>{downloadingId === rep.id ? 'Generating...' : t('reports_export_btn')}</span>
                      <span className="text-xs">↓</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
