import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import TowerBroadcastCard from '../components/alerts/TowerBroadcastCard';
import SmsDispatchLog from '../components/alerts/SmsDispatchLog';
import { EMERGENCY_RECIPIENTS } from '../data/emergencyRecipients';
import { useAlert } from '../context/AlertContext';
import { useLanguage } from '../context/LanguageContext';
import ENV from '../config/env';

const NE_ALERT_TARGETS = [
  { label: 'Unakoti (Tripura) - Node 85', state: 'Tripura', district: 'Unakoti', lat: 23.7548, lng: 92.4273, kioskId: 'KIO-TR-085' },
  { label: 'Aizawl (Mizoram)', state: 'Mizoram', district: 'Aizawl', lat: 23.3644, lng: 93.3005, kioskId: 'KIO-MZ-040' },
  { label: 'North Sikkim (Sikkim)', state: 'Sikkim', district: 'North Sikkim', lat: 27.6328, lng: 88.9482, kioskId: 'KIO-SK-093' },
  { label: 'Sonitpur (Assam)', state: 'Assam', district: 'Sonitpur', lat: 26.1637, lng: 92.3619, kioskId: 'KIO-AS-001' },
  { label: 'Shillong (Meghalaya)', state: 'Meghalaya', district: 'East Khasi Hills', lat: 25.5788, lng: 91.8933, kioskId: 'KIO-ML-015' },
  { label: 'Kohima (Nagaland)', state: 'Nagaland', district: 'Kohima', lat: 25.6751, lng: 94.1086, kioskId: 'KIO-NL-025' },
];

export default function Alerts() {
  const {
    activeAlert,
    dismissAlert,
    triggerSimulatedAlert,
    wsUrl,
    wsStatus,
    isWsConnected,
    liveRiskPercentage,
    soilMoisture,
    vibration,
  } = useAlert();
  const { t } = useLanguage();

  // Role info & session
  const userRole = window.localStorage.getItem('userRole') || 'MDoNER Employee';
  const sessionRaw = window.localStorage.getItem('userSession');
  const session = sessionRaw ? JSON.parse(sessionRaw) : null;
  const isZonal = userRole === 'Zonal Admin';
  const isDistrict = userRole === 'District Admin';
  const isMdoner = userRole === 'MDoNER Employee';

  // Determine officer assigned zone/district
  const assignedState = session?.state || 'Sikkim';
  const assignedDistrict = session?.district || 'North Sikkim';

  // Zone-specific target filtering
  const officerTargets = isMdoner
    ? NE_ALERT_TARGETS
    : isDistrict
    ? NE_ALERT_TARGETS.filter((t) => t.district.toLowerCase() === assignedDistrict.toLowerCase() || t.state.toLowerCase() === assignedState.toLowerCase())
    : NE_ALERT_TARGETS.filter((t) => t.state.toLowerCase() === assignedState.toLowerCase());

  const validTargets = officerTargets.length > 0 ? officerTargets : NE_ALERT_TARGETS;

  const [selectedTarget, setSelectedTarget] = useState(validTargets[0]);
  const [isDispatching, setIsDispatching] = useState(false);

  // Active Alert Zone Matching: Zonal Admin & District Officer only get alerts for their specific zone,
  // EXCEPT autonomous IoT critical alerts which are broadcast to all command centers!
  const alertMatchesOfficerZone = () => {
    if (!activeAlert) return false;
    if (isMdoner) return true; // MDoNER can see and triage all alerts
    if (activeAlert.isAutonomous || activeAlert.type?.includes('Autonomous') || activeAlert.type?.includes('IoT')) {
      return true; // Autonomous critical IoT breaches are regional emergencies visible to all
    }

    const alertDistrict = (activeAlert.district || activeAlert.kiosk?.district || '').toLowerCase();
    const alertState = (activeAlert.state || activeAlert.kiosk?.state || '').toLowerCase();

    if (isDistrict) {
      return alertDistrict.includes(assignedDistrict.toLowerCase()) || alertState.includes(assignedState.toLowerCase());
    }
    if (isZonal) {
      return alertState.includes(assignedState.toLowerCase());
    }
    return false;
  };

  const displayedAlert = alertMatchesOfficerZone() ? activeAlert : null;

  const totalSmsCount = 1420;

  const handleDispatchStateAlert = (target = selectedTarget) => {
    setIsDispatching(true);
    triggerSimulatedAlert({
      type: 'KIOSK_ALERT_EVENT',
      timestamp: new Date().toISOString(),
      message: `CRITICAL TACTICAL ALERT: Siren engaged for ${target.district}, ${target.state}. Evacuation protocol active.`,
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
        riskScore: 92,
        type: 'Official Tactical Field Command',
      },
      hazardUpdate: {
        parameter: 'landslide',
        regionName: target.district,
        displayLevel: 'High',
      },
    });
    setIsDispatching(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 w-full bg-[#f4f6f8] overflow-y-auto p-4 sm:p-6 select-none">
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
              {validTargets.map((t) => (
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

          <Link
            to="/app/analytics"
            onClick={() => {
              const targetLat = displayedAlert?.lat || selectedTarget.lat;
              const targetLng = displayedAlert?.lng || selectedTarget.lng;
              const name = displayedAlert?.name || selectedTarget.label;
              localStorage.setItem('latitude', String(targetLat));
              localStorage.setItem('longitude', String(targetLng));
              localStorage.setItem('towerName', name);
            }}
            className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-3.5 py-1.5 font-black text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>📊</span>
            <span>Go to Analytics</span>
          </Link>

          {displayedAlert && (
            <button
              onClick={dismissAlert}
              className="bg-[#333333] hover:bg-[#1a1a1a] text-white px-3 py-1.5 font-black text-xs uppercase tracking-wider transition-colors"
            >
              {t('alerts_dismiss_btn')}
            </button>
          )}
        </div>
      </PageHeader>

      {/* Display alert ONLY when an active WebSocket payload for the officer's zone is received */}
      {displayedAlert ? (
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 overflow-hidden">
          <TowerBroadcastCard activeAlert={displayedAlert} />
          <SmsDispatchLog recipients={EMERGENCY_RECIPIENTS} totalSmsCount={totalSmsCount} />
        </div>
      ) : (
        <div className="flex-1 min-h-0 bg-white border border-[#cbd5e1] shadow-sm flex flex-col overflow-y-auto p-4 sm:p-6">
          <div className="max-w-lg w-full mx-auto my-auto flex flex-col items-center text-center">
            {/* Live Socket Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-mono font-bold uppercase mb-3 shadow-2xs">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isWsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span>{isWsConnected ? 'PYTHON TELEMETRY SOCKET CONNECTED (PORT 8000)' : 'CONNECTING TO PYTHON SOCKET...'}</span>
            </div>

            {/* Prominent Current Risk Display (Direct from Python Socket Server) */}
            <div className="w-full bg-[#f8fafc] border border-slate-200 p-4 sm:p-5 mb-3.5 flex flex-col items-center shadow-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                CURRENT GEOTECHNICAL GROUND RISK
              </span>
              <div className="flex items-baseline gap-2.5 my-2">
                <span className={`text-5xl font-black font-mono tracking-tight ${
                  liveRiskPercentage !== null && liveRiskPercentage >= 75
                    ? 'text-[#d93850]'
                    : liveRiskPercentage !== null && liveRiskPercentage >= 50
                    ? 'text-amber-500'
                    : 'text-emerald-600'
                }`}>
                  {liveRiskPercentage !== null ? `${liveRiskPercentage}%` : '15%'}
                </span>
                <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded font-mono border ${
                  liveRiskPercentage !== null && liveRiskPercentage >= 75
                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                    : liveRiskPercentage !== null && liveRiskPercentage >= 50
                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                }`}>
                  {liveRiskPercentage !== null && liveRiskPercentage >= 75
                    ? 'CRITICAL HAZARD'
                    : liveRiskPercentage !== null && liveRiskPercentage >= 50
                    ? 'ELEVATED CAUTION'
                    : 'NOMINAL STABILITY'}
                </span>
              </div>

              {/* Progress Bar towards 75% threshold */}
              <div className="w-full h-2 bg-slate-200 overflow-hidden rounded-full mb-2.5">
                <div
                  className={`h-full transition-all duration-300 ${
                    liveRiskPercentage !== null && liveRiskPercentage >= 75
                      ? 'bg-rose-600'
                      : liveRiskPercentage !== null && liveRiskPercentage >= 50
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${liveRiskPercentage !== null ? liveRiskPercentage : 15}%` }}
                />
              </div>

              {/* Live Sensor Readings */}
              <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-200 w-full text-center text-xs font-mono font-bold text-slate-600">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Soil Moisture:</span>
                  <span className="text-slate-800 font-black">{soilMoisture !== null ? `${soilMoisture} ADC` : '420 ADC'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Vibration:</span>
                  <span className="text-slate-800 font-black">{vibration !== null ? `${vibration} g` : '0.02 g'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Trigger Threshold:</span>
                  <span className="text-rose-600 font-black">≥ 75% Risk</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#666666] leading-relaxed w-full mb-3.5 px-2">
              Receiving live risk percentage directly from the Python socket server. When risk crosses the critical threshold (≥ 75%), emergency acoustic sirens and automated incident dispatches trigger immediately.
            </p>

            {/* Network & Endpoint Details with proper wrapping */}
            <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] w-full text-left font-mono text-[11px] text-slate-600 space-y-1.5 mb-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1.5 border-b border-slate-200">
                <span className="font-bold text-slate-400 shrink-0 uppercase">ENDPOINT:</span>
                <span className="text-slate-800 font-bold break-all text-[10.5px] sm:text-right" title={wsUrl}>
                  {wsUrl}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-0.5">
                <span className="font-bold text-slate-400 shrink-0 uppercase">SUBSCRIBED STREAM:</span>
                <span className="text-emerald-600 font-bold text-[10.5px] sm:text-right">
                  TELEMETRY_UPDATE (PORT 8000)
                </span>
              </div>
            </div>

            {/* Go to Analytics Section */}
            <div className="w-full p-3.5 bg-slate-50 border border-slate-200 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div>
                <div className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                  <span>📊</span>
                  <span>Sensor Telemetry & Heatmap</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  View Unakoti ADM5-Node 85 soil moisture, vibration & GIS radar
                </div>
              </div>
              <Link
                to="/app/analytics"
                onClick={() => {
                  localStorage.setItem('latitude', '23.7548');
                  localStorage.setItem('longitude', '92.4273');
                  localStorage.setItem('towerName', 'Unakoti ADM5-Node 85');
                }}
                className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-3.5 py-1.5 font-bold text-xs uppercase tracking-wider transition-colors shrink-0 flex items-center justify-center gap-1 shadow-sm"
              >
                <span>Go to Analytics</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
