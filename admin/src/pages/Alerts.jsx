import React, { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import TowerBroadcastCard from '../components/alerts/TowerBroadcastCard';
import SmsDispatchLog from '../components/alerts/SmsDispatchLog';
import { EMERGENCY_RECIPIENTS } from '../data/emergencyRecipients';
import { useAlert } from '../context/AlertContext';
import { useLanguage } from '../context/LanguageContext';
import ENV from '../config/env';

const NE_ALERT_TARGETS = [
  { label: 'Aizawl (Mizoram)', state: 'Mizoram', district: 'Aizawl', lat: 23.3644, lng: 93.3005, kioskId: 'KIO-MZ-040' },
  { label: 'North Sikkim (Sikkim)', state: 'Sikkim', district: 'North Sikkim', lat: 27.6328, lng: 88.9482, kioskId: 'KIO-SK-093' },
  { label: 'Sonitpur (Assam)', state: 'Assam', district: 'Sonitpur', lat: 26.1637, lng: 92.3619, kioskId: 'KIO-AS-001' },
  { label: 'Shillong (Meghalaya)', state: 'Meghalaya', district: 'East Khasi Hills', lat: 25.5788, lng: 91.8933, kioskId: 'KIO-ML-015' },
  { label: 'Kohima (Nagaland)', state: 'Nagaland', district: 'Kohima', lat: 25.6751, lng: 94.1086, kioskId: 'KIO-NL-025' },
];

export default function Alerts() {
  const { activeAlert, dismissAlert, triggerSimulatedAlert, wsUrl, wsStatus, isWsConnected } = useAlert();
  const { t } = useLanguage();
  const [selectedTarget, setSelectedTarget] = useState(NE_ALERT_TARGETS[0]);
  const [isDispatching, setIsDispatching] = useState(false);

  const totalSmsCount = 1420;

  const handleDispatchStateAlert = async (target = selectedTarget) => {
    setIsDispatching(true);
    try {
      await fetch(`${ENV.API_BASE_URL}/room/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: 'EMP-NER-001',
          role: 'MDoNER Employee',
          userName: 'Central Command',
          department: 'NER Disaster Risk Cell',
          district: target.district,
          state: target.state,
          latitude: target.lat,
          longitude: target.lng,
          message: `CRITICAL TACTICAL ALERT: Landslide & Ground Displacement Warning for ${target.district}, ${target.state}. Evacuation protocol active.`,
          riskScore: 92,
        }),
      });
    } catch (err) {
      console.warn('Backend alert post offline, triggering local simulated alert:', err);
      triggerSimulatedAlert({
        type: 'KIOSK_ALERT_EVENT',
        timestamp: new Date().toISOString(),
        message: `CRITICAL TACTICAL ALERT: Siren engaged for ${target.district}, ${target.state}.`,
        kiosk: {
          id: target.kioskId,
          name: `${target.district} ADM5-Node (${target.state})`,
          district: target.district,
          state: target.state,
          lat: target.lat,
          lng: target.lng,
          coordinates: { lat: target.lat, lng: target.lng },
          status: 'Warning',
          riskLevel: 'High',
          type: 'Official Tactical Field Command',
        },
        hazardUpdate: {
          parameter: 'landslide',
          regionName: target.district,
          displayLevel: 'High',
        },
      });
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 w-full bg-[#f4f6f8] overflow-hidden p-6 select-none">
      <PageHeader
        title={t('alerts_title')}
        subtitle={t('alerts_subtitle')}
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Target North Eastern State Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 px-2 py-1">
            <span className="text-[10px] font-black uppercase text-slate-500">Target State:</span>
            <select
              value={selectedTarget.kioskId}
              onChange={(e) => {
                const found = NE_ALERT_TARGETS.find((t) => t.kioskId === e.target.value);
                if (found) setSelectedTarget(found);
              }}
              className="text-xs font-bold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              {NE_ALERT_TARGETS.map((t) => (
                <option key={t.kioskId} value={t.kioskId}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleDispatchStateAlert()}
            disabled={isDispatching}
            className="bg-[#d93850] hover:bg-[#b8273d] text-white px-3.5 py-1.5 font-black text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
          >
            <span>🚨</span>
            <span>{isDispatching ? 'Dispatching...' : `Alert ${selectedTarget.state}`}</span>
          </button>

          {activeAlert && (
            <button
              onClick={dismissAlert}
              className="bg-[#333333] hover:bg-[#1a1a1a] text-white px-3 py-1.5 font-black text-xs uppercase tracking-wider transition-colors"
            >
              {t('alerts_dismiss_btn')}
            </button>
          )}
        </div>
      </PageHeader>

      {/* Display alert ONLY when an active WebSocket payload is received */}
      {activeAlert ? (
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden">
          <TowerBroadcastCard activeAlert={activeAlert} />
          <SmsDispatchLog recipients={EMERGENCY_RECIPIENTS} totalSmsCount={totalSmsCount} />
        </div>
      ) : (
        <div className="flex-1 min-h-0 bg-white border border-[#cbd5e1] shadow-sm flex flex-col items-center justify-center p-8 text-center">
          <div className="max-w-xl flex flex-col items-center">
            {/* Status Radar / Standby Icon */}
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-slate-200 animate-ping opacity-30"></div>
              <div className="w-16 h-16 rounded-full bg-[#f4f6f8] border-2 border-slate-300 flex items-center justify-center">
                <span className="text-2xl">📡</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-300 text-slate-700 text-xs font-mono font-bold uppercase mb-3">
              <span className={`w-2 h-2 rounded-full ${isWsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span>{isWsConnected ? 'WEBSOCKET ACTIVE • CHANNEL STANDBY' : 'WEBSOCKET CONNECTING...'}</span>
            </div>

            <h3 className="text-lg font-black uppercase tracking-wider text-[#1a1a1a] mb-2">
              {t('alerts_standby_title')}
            </h3>

            <p className="text-xs text-[#666666] leading-relaxed max-w-md mb-6">
              {t('alerts_standby_desc')}
            </p>

            <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] w-full max-w-md text-left font-mono text-[11px] text-slate-600">
              <div className="flex justify-between pb-1 border-b border-slate-200">
                <span className="font-bold text-slate-400">ENDPOINT:</span>
                <span className="text-slate-800 font-bold">{wsUrl}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-bold text-slate-400">SUBSCRIBED EVENT:</span>
                <span className="text-[#d93850] font-bold">KIOSK_ALERT_EVENT</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
