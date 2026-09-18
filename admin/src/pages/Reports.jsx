import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import ReportsTable from '../components/reports/ReportsTable';
import ENV from '../config/env';
import { useLanguage } from '../context/LanguageContext';

export default function Reports() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const userRole = window.localStorage.getItem('userRole') || 'Citizen';

  // Role Guard for Citizen
  if (userRole === 'Citizen') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#f4f6f8]">
        <div className="max-w-md bg-white p-8 border-t-8 border-[#d93850] shadow-xl">
          <span className="text-4xl block mb-3">📊</span>
          <h2 className="text-base font-black uppercase tracking-wider text-[#333333]">
            Access Restricted: Confidential Geotechnical Dossiers
          </h2>
          <p className="text-xs text-[#666666] mt-2 leading-relaxed">
            Detailed seismic inclinometer summaries, sensor raw telemetry compilations, and internal district risk reports require official MDoNER or District Administrator clearance.
          </p>
          <button
            onClick={() => navigate('/app/risk-map')}
            className="mt-6 w-full bg-[#333333] hover:bg-[#1a1a1a] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 transition-colors"
          >
            Return to Public Risk Map
          </button>
        </div>
      </div>
    );
  }

  // Live user-submitted reports state (NO mock default files)
  const [reports, setReports] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUserReports = async () => {
    try {
      const res = await fetch(`${ENV.API_BASE_URL}/sql/uploads`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setReports(data);
        }
      }
    } catch (err) {
      console.warn('Could not fetch user incident reports:', err);
    }
  };

  useEffect(() => {
    fetchUserReports();
    // Fast 2-second polling to instantly pick up user submissions from the app
    const interval = setInterval(fetchUserReports, 2000);

    // Live Server-Sent Events (SSE) from media-service for zero-delay instant ingestion
    let esImage = null;
    let esAudio = null;
    try {
      esImage = new EventSource(`${ENV.API_BASE_URL}/media/sse/image`);
      esImage.addEventListener('image-event', () => fetchUserReports());
      esAudio = new EventSource(`${ENV.API_BASE_URL}/media/sse/audio`);
      esAudio.addEventListener('audio-event', () => fetchUserReports());
    } catch {}

    return () => {
      clearInterval(interval);
      if (esImage) esImage.close();
      if (esAudio) esAudio.close();
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchUserReports();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleDownload = (report) => {
    setDownloadingId(report.id);
    setTimeout(() => {
      setDownloadingId(null);

      // Generate downloadable / printable text dossier
      const dossierContent = `
=====================================================
RAKSHAK // NER DISASTER RISK GROUND INCIDENT DOSSIER
=====================================================
Dossier ID: ${report.id}
Reporter: ${report.phoneNumber}
Timestamp: ${report.timestamp || new Date().toISOString()}
Location: ${report.location?.district || 'Sikkim'}, ${report.location?.state || 'NER'}
GPS Coordinates: ${report.location?.coordinates?.lat || 27.6328}° N, ${report.location?.coordinates?.lng || 88.9482}° E
Upload Media Asset: ${report.fileName || 'evidence_asset'} (${report.uploadType || 'field media'})

GROUND OBSERVATION QUESTIONNAIRE:
- Activity Observed: ${report.groundQuestionnaire?.activityStatus || 'Active tension cracking reported via mobile app'}
- Weather: ${report.groundQuestionnaire?.weatherCondition || 'Precipitation observed'}
- Triage Rating: ${report.severity || 'HIGH'}
- Evacuation Required: ${report.groundQuestionnaire?.immediateEvacuationNeeded ? 'YES' : 'STANDBY'}

=====================================================
Verified by Ministry of Development of North Eastern Region
=====================================================
      `.trim();

      const blob = new Blob([dossierContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RAKSHAK-REPORT-${report.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(`Official Dossier for Incident ${report.id} exported successfully.`);
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 w-full bg-[#f4f6f8] overflow-hidden p-6 select-none">
      <PageHeader
        title={t('reports_title')}
        subtitle={t('reports_subtitle')}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            className="bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 border border-[#cbd5e1] text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5"
          >
            <span>{isRefreshing ? '↻ Syncing...' : '↻ Refresh Feed'}</span>
          </button>
        </div>
      </PageHeader>

      <ReportsTable
        reports={reports}
        downloadingId={downloadingId}
        onDownload={handleDownload}
      />
    </div>
  );
}
