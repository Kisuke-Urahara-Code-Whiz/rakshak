import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRegionAnalytics } from '../mapUtils';
import TimeWindowToggle from '../components/common/TimeWindowToggle';
import AlertToggleButton from '../components/stations/AlertToggleButton';
import StationsTable from '../components/stations/StationsTable';
import { useAlert } from '../context/AlertContext';

export default function StationsPage() {
  const navigate = useNavigate();
  const userRole = window.localStorage.getItem('userRole') || 'Citizen';

  // Role Guard for Citizen
  if (userRole === 'Citizen') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#f4f6f8]">
        <div className="max-w-md bg-white p-8 border-t-8 border-[#d93850] shadow-xl">
          <span className="text-4xl block mb-3">🔒</span>
          <h2 className="text-base font-black uppercase tracking-wider text-[#333333]">
            Access Restricted: Telemetry Station Infrastructure
          </h2>
          <p className="text-xs text-[#666666] mt-2 leading-relaxed">
            Direct physical station node diagnostics, sensor calibrations, and kiosk health telemetry are reserved for certified MDoNER engineers and Zonal/District Disaster Administrators.
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

  const [searchQuery, setSearchQuery] = useState('');

  // 1h vs 24h Window Toggle
  const [timeWindow, setTimeWindow] = useState('24h');

  // Real-time Alert & Kiosks from AlertContext
  const { activeAlert, dynamicKiosks, triggerSimulatedAlert, dismissAlert } = useAlert();

  const handleSimulateAlert = () => {
    triggerSimulatedAlert();
  };

  const handleClearAlert = () => {
    dismissAlert();
  };

  // Synchronize risk level with Map data and active alert
  const stationsWithSyncRisk = dynamicKiosks.map((stn) => {
    const analytics = getRegionAnalytics(stn.district || stn.state);
    const synchronizedRisk = analytics?.scores?.landslide || analytics?.overallRisk || stn.riskLevel || 'Low';
    const isAlerted = activeAlert && activeAlert.id === stn.id;

    return {
      ...stn,
      syncedRisk: isAlerted ? 'High' : synchronizedRisk,
      isAlerted
    };
  });

  // Filter based only on text query
  const filteredStations = stationsWithSyncRisk.filter((stn) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      stn.name.toLowerCase().includes(query) ||
      stn.id.toLowerCase().includes(query) ||
      stn.district.toLowerCase().includes(query) ||
      stn.state.toLowerCase().includes(query) ||
      stn.adm5.toLowerCase().includes(query) ||
      stn.type.toLowerCase().includes(query)
    );
  });

  // Pin the alerted station to the very top (Row 1)
  const sortedStations = [...filteredStations].sort((a, b) => {
    if (a.isAlerted) return -1;
    if (b.isAlerted) return 1;
    return 0;
  });

  const handleGoToMap = (stn) => {
    navigate(`/app/risk-map?lat=${stn.lat}&lng=${stn.lng}&kioskId=${encodeURIComponent(stn.id)}`);
  };

  return (
    <div className="flex flex-col h-full min-h-0 w-full bg-[#f4f6f8] overflow-hidden p-6 select-none">
      {/* Top Header & Bar */}
      <div className="w-full mb-4 shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-2">
          <div>
            <h1 className="text-lg font-black uppercase tracking-wider text-[#1a1a1a]">
              Monitoring Stations & Telemetry Kiosks
            </h1>
            <p className="text-[11px] font-bold text-[#64748b] uppercase mt-0.5">
              Live telemetry nodes across operational zones • Real-time Geo-hazard alerts
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Simulate Alert Button in Stations Header */}
            <AlertToggleButton
              activeAlert={activeAlert}
              onSimulate={handleSimulateAlert}
              onClear={handleClearAlert}
            />

            {/* 1h vs 24h Telemetry Toggle */}
            <TimeWindowToggle value={timeWindow} onChange={setTimeWindow} variant="stations" />

            {/* Search Input */}
            <input
              type="text"
              placeholder="SEARCH STATION BY NAME, DISTRICT OR ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-2 border-[#cccccc] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider focus:border-[#d93850] focus:outline-none w-72"
            />
          </div>
        </div>
      </div>

      {/* Stations Table Container */}
      <StationsTable stations={sortedStations} timeWindow={timeWindow} onGoToMap={handleGoToMap} />
    </div>
  );
}
