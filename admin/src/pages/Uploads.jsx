import React, { useState, useEffect } from 'react';
import PageHeader from '../components/common/PageHeader';
import UploadsTable from '../components/uploads/UploadsTable';
import MediaPreviewModal from '../components/uploads/MediaPreviewModal';
import PayloadInspectorModal from '../components/uploads/PayloadInspectorModal';
import NewUploadModal from '../components/uploads/NewUploadModal';
import { SAMPLE_UPLOADS } from '../data/sampleUploads';
import { useLanguage } from '../context/LanguageContext';
import ENV from '../config/env';

export default function Uploads() {
  const { t } = useLanguage();
  const [uploads, setUploads] = useState(SAMPLE_UPLOADS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'photo' | 'audio'

  // Modals
  const [previewItem, setPreviewItem] = useState(null);
  const [inspectPayload, setInspectPayload] = useState(null);
  const [isNewUploadOpen, setIsNewUploadOpen] = useState(false);

  // Role info & session
  const userRole = window.localStorage.getItem('userRole') || 'Citizen';
  const isCitizen = userRole === 'Citizen';
  let citizenNumber = null;
  try {
    const session = JSON.parse(window.localStorage.getItem('userSession') || '{}');
    citizenNumber = session.identifier || window.localStorage.getItem('phoneNumber');
  } catch {}
  const cleanCitizenPhone = citizenNumber ? citizenNumber.replace(/\D/g, '').slice(-10) : null;

  // Fetch real uploads from Java backend on mount & real-time live sync
  useEffect(() => {
    const fetchBackendUploads = async () => {
      try {
        const queryUrl = isCitizen && cleanCitizenPhone
          ? `${ENV.API_BASE_URL}/sql/uploads?number=${cleanCitizenPhone}`
          : `${ENV.API_BASE_URL}/sql/uploads`;

        const res = await fetch(queryUrl);
        if (res.ok) {
          const backendData = await res.json();
          if (Array.isArray(backendData)) {
            setUploads((prev) => {
              // For citizen, strictly filter by citizen phone
              const filtered = isCitizen && cleanCitizenPhone
                ? backendData.filter(b => b.phoneNumber?.replace(/\D/g, '').endsWith(cleanCitizenPhone))
                : backendData;

              const existingIds = new Set(prev.map((item) => item.id));
              const newItems = filtered.filter((b) => !existingIds.has(b.id));
              return [...newItems, ...prev];
            });
          }
        }
      } catch (err) {
        console.warn('Backend uploads fetch unavailable or error:', err);
      }
    };

    fetchBackendUploads();
    // Fast 2-second polling interval for real-time field visibility
    const interval = setInterval(fetchBackendUploads, 2000);

    // Live Server-Sent Events (SSE) from media-service for zero-delay instant ingestion
    let esImage = null;
    let esAudio = null;
    try {
      esImage = new EventSource(`${ENV.API_BASE_URL}/media/sse/image`);
      esImage.addEventListener('image-event', () => fetchBackendUploads());
      esAudio = new EventSource(`${ENV.API_BASE_URL}/media/sse/audio`);
      esAudio.addEventListener('audio-event', () => fetchBackendUploads());
    } catch {}

    return () => {
      clearInterval(interval);
      if (esImage) esImage.close();
      if (esAudio) esAudio.close();
    };
  }, [isCitizen, cleanCitizenPhone]);

  const handleAddUpload = (newUpload) => {
    setUploads((prev) => [newUpload, ...prev]);
  };

  const handleEscalateAlert = async (item) => {
    if (isCitizen) {
      alert('Unauthorized: Only official administrators and SDRF responders may escalate incidents to system-wide alerts.');
      return;
    }

    try {
      // Escalate this upload directly to Java room-service to broadcast over live WebSocket
      await fetch(`${ENV.API_BASE_URL}/room/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: userRole,
          district: item.location?.district || 'North Sikkim',
          state: item.location?.state || 'Sikkim',
          latitude: item.location?.coordinates?.lat || 27.6328,
          longitude: item.location?.coordinates?.lng || 88.9482,
          message: `CIVILIAN & FIELD REPORT ESCALATED: Incident ${item.id} (${item.uploadType}) verified by authority. Urgent evacuation recommended.`,
          riskScore: 90,
        }),
      });
      alert(`Incident ${item.id} escalated to system-wide Critical Alert & Broadcast!`);
    } catch (err) {
      console.error('Failed to escalate alert to room-service:', err);
      alert('Network error connecting to alert broadcast service.');
    }
  };

  // Filtered uploads
  const filteredUploads = uploads.filter((item) => {
    if (filterType !== 'all' && item.uploadType !== filterType) {
      return false;
    }
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.phoneNumber.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      item.fileName.toLowerCase().includes(q) ||
      item.location?.district?.toLowerCase().includes(q) ||
      item.location?.state?.toLowerCase().includes(q) ||
      item.location?.locality?.toLowerCase().includes(q) ||
      item.groundQuestionnaire?.activityStatus?.toLowerCase().includes(q)
    );
  });

  const photoCount = uploads.filter((u) => u.uploadType === 'photo').length;
  const audioCount = uploads.filter((u) => u.uploadType === 'audio').length;
  const highRiskCount = uploads.filter((u) => u.severity === 'High').length;

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 w-full bg-[#f4f6f8] overflow-hidden p-6 select-none">
      <PageHeader
        title={t('uploads_title')}
        subtitle={t('uploads_subtitle')}
      >
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{t('uploads_live_sync')}</span>
          </div>

          <button
            onClick={() => setIsNewUploadOpen(true)}
            className="bg-[#d93850] hover:bg-[#b8273d] text-white px-4 py-2 shadow-md font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-transform active:scale-95 shrink-0 border border-white"
          >
            <span className="text-sm">＋</span>
            <span>{t('uploads_submit_btn')}</span>
          </button>
        </div>
      </PageHeader>

      {/* Filter & Quick Metric Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 shrink-0">
        {/* Metric Pills */}
        <div className="flex items-center gap-3">
          <div className="bg-white border border-[#cbd5e1] px-3 py-1.5 shadow-sm text-xs font-bold">
            <span className="text-slate-400 uppercase text-[10px] block font-black">{t('uploads_total')}</span>
            <span className="text-slate-900 font-mono font-black text-sm">{uploads.length} Records</span>
          </div>

          <div className="bg-white border border-[#cbd5e1] px-3 py-1.5 shadow-sm text-xs font-bold">
            <span className="text-blue-500 uppercase text-[10px] block font-black">📷 {t('uploads_photos')}</span>
            <span className="text-slate-900 font-mono font-black text-sm">{photoCount} Uploads</span>
          </div>

          <div className="bg-white border border-[#cbd5e1] px-3 py-1.5 shadow-sm text-xs font-bold">
            <span className="text-amber-500 uppercase text-[10px] block font-black">🎙️ {t('uploads_audio')}</span>
            <span className="text-slate-900 font-mono font-black text-sm">{audioCount} Recordings</span>
          </div>

          <div className="bg-white border border-[#cbd5e1] px-3 py-1.5 shadow-sm text-xs font-bold">
            <span className="text-red-500 uppercase text-[10px] block font-black">⚠️ {t('uploads_high_risk')}</span>
            <span className="text-red-600 font-mono font-black text-sm">{highRiskCount} Escalated</span>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex items-center gap-2">
          {/* Format Filter Buttons */}
          <div className="flex border border-slate-300 bg-white p-0.5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-xs font-black uppercase transition-colors ${
                filterType === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-black'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('photo')}
              className={`px-3 py-1 text-xs font-black uppercase transition-colors ${
                filterType === 'photo' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-black'
              }`}
            >
              Photos
            </button>
            <button
              onClick={() => setFilterType('audio')}
              className={`px-3 py-1 text-xs font-black uppercase transition-colors ${
                filterType === 'audio' ? 'bg-amber-500 text-slate-950' : 'text-slate-600 hover:text-black'
              }`}
            >
              Audio
            </button>
          </div>

          {/* Search Input */}
          <input
            type="text"
            placeholder="SEARCH BY PHONE, DISTRICT OR FILENAME..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-2 border-[#cccccc] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider focus:border-[#d93850] focus:outline-none w-72"
          />
        </div>
      </div>

      {/* Uploads Table */}
      <UploadsTable
        uploads={filteredUploads}
        userRole={userRole}
        onViewMedia={(item) => setPreviewItem(item)}
        onInspectPayload={(payload) => setInspectPayload(payload)}
        onEscalateAlert={handleEscalateAlert}
      />

      {/* Media Preview Modal (JPEG Photo Lightbox / M4A Audio Player) */}
      {previewItem && (
        <MediaPreviewModal
          upload={previewItem}
          onClose={() => setPreviewItem(null)}
        />
      )}

      {/* JSON Payload Inspector Modal */}
      {inspectPayload && (
        <PayloadInspectorModal
          payload={inspectPayload}
          onClose={() => setInspectPayload(null)}
        />
      )}

      {/* New Incident Submission & Questionnaire Modal */}
      {isNewUploadOpen && (
        <NewUploadModal
          onAddUpload={handleAddUpload}
          onClose={() => setIsNewUploadOpen(false)}
        />
      )}
    </div>
  );
}
