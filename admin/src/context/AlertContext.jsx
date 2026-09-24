import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import kioskData from '../data/kioskData.json';
import { setHazardOverride, clearHazardOverrides } from '../mapUtils';
import audioAlertService from '../services/audioAlertService';
import useWebSocket from '../hooks/useWebSocket';
import { ENV } from '../config/env';
import { DEFAULT_SAMPLE_KIOSK_ALERT } from '../constants';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  // Active Alert State
  const [activeAlert, setActiveAlert] = useState(() => {
    try {
      const stored = localStorage.getItem('active_alert_kiosk');
      if (stored) {
        const parsed = JSON.parse(stored);
        const lat = Number(parsed.lat ?? parsed.coordinates?.lat ?? parsed.latitude ?? 27.6328);
        const lng = Number(parsed.lng ?? parsed.coordinates?.lng ?? parsed.coordinates?.lon ?? parsed.longitude ?? 88.9482);
        return { ...parsed, lat, lng, coordinates: { lat, lng } };
      }
      return null;
    } catch {
      return null;
    }
  });

  // Sound mute state
  const [isMuted, setIsMuted] = useState(() => audioAlertService.isMuted());

  // Alert history log
  const [alertHistory, setAlertHistory] = useState([]);

  // Kiosks list merged with incoming live alerted kiosks
  const [dynamicKiosks, setDynamicKiosks] = useState(() => {
    const list = [...kioskData];
    // If active alert exists and not in base data, include it
    try {
      const stored = localStorage.getItem('active_alert_kiosk');
      if (stored) {
        const parsed = JSON.parse(stored);
        const lat = Number(parsed.lat ?? parsed.coordinates?.lat ?? parsed.latitude ?? 27.6328);
        const lng = Number(parsed.lng ?? parsed.coordinates?.lng ?? parsed.coordinates?.lon ?? parsed.longitude ?? 88.9482);
        const normalized = { ...parsed, lat, lng, coordinates: { lat, lng } };
        const exists = list.some((k) => k.id === normalized.id);
        if (!exists) {
          list.unshift(normalized);
        }
      }
    } catch {}
    return list;
  });

  // Synchronize dynamic hazard overrides on mount if active alert was persisted
  useEffect(() => {
    if (activeAlert?.hazardUpdate) {
      setHazardOverride(
        activeAlert.hazardUpdate.regionName,
        activeAlert.hazardUpdate.parameter,
        activeAlert.hazardUpdate.displayLevel
      );
    } else if (activeAlert?.district || activeAlert?.state) {
      setHazardOverride(activeAlert.district || activeAlert.state, 'landslide', 'High');
    }
  }, [activeAlert]);

  // Handler for receiving a KIOSK_ALERT_EVENT payload or UPLOAD_EVENT
  const handleAlertEvent = useCallback((eventData) => {
    if (!eventData) return;

    // Handle real-time upload notification from media-service
    if (eventData.type === 'UPLOAD_EVENT') {
      console.log('[AlertContext] Inbound real-time UPLOAD_EVENT received:', eventData);
      window.dispatchEvent(new CustomEvent('rakshakNewUpload', { detail: eventData.upload }));
      return;
    }

    // Validate if it's a KIOSK_ALERT_EVENT
    const isAlertEvent = eventData.type === 'KIOSK_ALERT_EVENT' || Boolean(eventData.kiosk);
    if (!isAlertEvent) return;

    const kiosk = eventData.kiosk || eventData;
    const hazardUpdate = eventData.hazardUpdate || {
      parameter: 'landslide',
      regionName: kiosk.district || kiosk.state || 'North Sikkim',
      displayLevel: 'High',
    };
    const message = eventData.message || 'RAPID SHEAR STRAIN & PORE-PRESSURE SATURATION DETECTED';
    const timestamp = eventData.timestamp || new Date().toISOString();

    const rawLat = kiosk.lat ?? kiosk.coordinates?.lat ?? kiosk.latitude ?? eventData.latitude;
    const rawLng = kiosk.lng ?? kiosk.coordinates?.lng ?? kiosk.coordinates?.lon ?? kiosk.longitude ?? eventData.longitude;
    const lat = Number(rawLat) || 27.6328;
    const lng = Number(rawLng) || 88.9482;

    const alertObject = {
      ...kiosk,
      id: kiosk.id || `ALERT-${Date.now()}`,
      lat,
      lng,
      coordinates: { lat, lng },
      hazardUpdate,
      message,
      timestamp,
      type: kiosk.type || 'Official Tactical Field Command',
      status: 'Warning',
      riskLevel: 'High',
    };

    // 1. Play Emergency Acoustic Beep via Web Audio API
    audioAlertService.playAlertBeep({ pulses: 3 });

    // 2. Register dynamic hazard override in mapUtils
    setHazardOverride(hazardUpdate.regionName, hazardUpdate.parameter, hazardUpdate.displayLevel);

    // 3. Update dynamic kiosk registry
    setDynamicKiosks((prev) => {
      const idx = prev.findIndex((k) => k.id === alertObject.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...alertObject };
        return copy;
      }
      return [alertObject, ...prev];
    });

    // 4. Update active alert and store in localStorage
    setActiveAlert(alertObject);
    try {
      localStorage.setItem('active_alert_kiosk', JSON.stringify(alertObject));
    } catch {}

    // 5. Add to history
    setAlertHistory((prev) => [
      {
        id: `${alertObject.id}-${Date.now()}`,
        timestamp,
        kiosk: alertObject,
        hazardUpdate,
        message,
      },
      ...prev.slice(0, 49),
    ]);

    // 6. Dispatch DOM events for backward compatibility
    window.dispatchEvent(new CustomEvent('kioskAlertChanged', { detail: alertObject }));
    window.dispatchEvent(new CustomEvent('rakshakNewAlertSound', { detail: alertObject }));
  }, []);

  // Live Python Telemetry & Risk State (Direct from Port 8000)
  const [liveRiskPercentage, setLiveRiskPercentage] = useState(15);
  const [soilMoisture, setSoilMoisture] = useState(420);
  const [vibration, setVibration] = useState(0.02);
  const [telemetryTimestamp, setTelemetryTimestamp] = useState(null);
  const lastAlertTimeRef = useRef(0);

  const pythonWsBase = (ENV.PYTHON_WS_URL || 'ws://localhost:8000').replace(/\/+$/, '');
  const pythonAlertWsUrl = `${pythonWsBase}/ws/front/front_alerts`;

  // Clear / Dismiss active alert
  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
    clearHazardOverrides();
    try {
      localStorage.removeItem('active_alert_kiosk');
    } catch {}
    audioAlertService.stopAlert();
    window.dispatchEvent(new Event('kioskAlertChanged'));
  }, []);

  // Autonomous critical alert trigger directly from Python telemetry stream
  const triggerCriticalRiskAlert = useCallback(
    (score, data = {}) => {
      const now = Date.now();
      if (activeAlert && now - lastAlertTimeRef.current < 25000) {
        return;
      }
      lastAlertTimeRef.current = now;

      console.warn(`[AlertContext] 🚨 CRITICAL RISK THRESHOLD CROSSED (${score}%): Triggering Alert & Siren!`);

      const alertTimestamp = data.timestamp
        ? `${new Date().toLocaleDateString()} ${data.timestamp}`
        : new Date().toISOString();

      const criticalPayload = {
        type: 'KIOSK_ALERT_EVENT',
        id: `ALERT-UNAKOTI-${Date.now()}`,
        timestamp: alertTimestamp,
        message: `CRITICAL TACTICAL ALERT: Severe landslide risk (${score}%) detected by IoT sensor telemetry for Unakoti, Tripura (Node 85). Immediate evacuation protocol active.`,
        source: 'Direct Python WebSocket (Port 8000)',
        isAutonomous: true,
        kiosk: {
          id: 'KIO-TR-085',
          name: 'Unakoti ADM5-Node 85',
          district: 'Unakoti',
          state: 'Tripura',
          lat: 23.7548,
          lng: 92.4273,
          coordinates: { lat: 23.7548, lng: 92.4273 },
          status: 'Critical Alert',
          riskLevel: 'Critical',
          riskScore: score,
          type: 'Autonomous IoT Field Station',
          sensorsActive: 6,
        },
        hazardUpdate: {
          parameter: 'landslide',
          regionName: 'Unakoti',
          displayLevel: 'High',
        },
      };

      // Trigger local siren and active alert state immediately
      handleAlertEvent(criticalPayload);
    },
    [activeAlert, handleAlertEvent]
  );

  // WebSocket Connection Hook (Directly connects to Python Port 8000 socket server)
  const {
    status: wsConnectionStatus,
    isConnected: isWsConnected,
    sendMessage: sendWsMessage,
    reconnect: reconnectWs,
  } = useWebSocket({
    url: pythonAlertWsUrl,
    fallbackUrl: `${pythonWsBase}/ws/front/web_alert_listener`,
    enabled: true,
    autoReconnect: true,
    reconnectInterval: ENV.WS_RECONNECT_INTERVAL,
    onOpen: () => {
      try {
        sendWsMessage(
          JSON.stringify({
            type: 'INIT_QUERY',
            client_id: 'front_alerts',
            device_id: 'RAKSHAK_FRONTEND_01',
            status: 'READY',
          })
        );
      } catch {}
    },
    onMessage: (data) => {
      if (!data) return;

      if (data.type === 'PING') {
        try {
          sendWsMessage(JSON.stringify({ type: 'PONG', status: 'ALIVE' }));
        } catch {}
        return;
      }

      // Handle real-time upload notification from media-service
      if (data.type === 'UPLOAD_EVENT') {
        window.dispatchEvent(new CustomEvent('rakshakNewUpload', { detail: data.upload }));
        return;
      }

      // Handle direct telemetry updates from Python socket (just like Analytics.jsx)
      if (data.type === 'TELEMETRY_UPDATE' || data.type === 'INIT_DATA') {
        const rawSoil = data.soil_moisture !== undefined ? parseFloat(data.soil_moisture) : null;
        const rawVib = data.vibration !== undefined ? parseFloat(data.vibration) : null;
        const rawRisk = data.risk_percentage !== undefined 
          ? parseFloat(data.risk_percentage) 
          : (data.risk !== undefined ? parseFloat(data.risk) : null);

        if (rawSoil !== null && !isNaN(rawSoil)) setSoilMoisture(Math.round(rawSoil));
        if (rawVib !== null && !isNaN(rawVib)) setVibration(parseFloat(rawVib.toFixed(2)));
        if (data.timestamp) setTelemetryTimestamp(data.timestamp);

        if (rawRisk !== null && !isNaN(rawRisk)) {
          const score = Math.max(0, Math.min(100, Math.round(rawRisk)));
          setLiveRiskPercentage(score);

          // WHEN THE THRESHOLD OF RISK IS CROSSED (>= 85%), ALERT IS TRIGGERED!
          if (score >= 85) {
            triggerCriticalRiskAlert(score, data);
          } else if (score < 85 && (rawSoil === null || rawSoil >= 200)) {
            // When risk drops below 85% and soil stabilizes, clear autonomous alert
            if (activeAlert && (activeAlert.isAutonomous || activeAlert.id?.startsWith('ALERT-UNAKOTI'))) {
              dismissAlert();
            }
          }
        }
        return;
      }

      // Standard KIOSK_ALERT_EVENT payload fallback
      if (data.type === 'KIOSK_ALERT_EVENT' || Boolean(data.kiosk)) {
        handleAlertEvent(data);
      }
    },
    onError: () => {
      // Backend WebSocket may be offline
    },
    onClose: () => {
      console.log('[AlertContext] Python WebSocket closed.');
    },
  });

  // Trigger alert simulation (e.g. for testing the exact user scenario)
  const triggerSimulatedAlert = useCallback(
    (customData = null) => {
      const payload = customData || DEFAULT_SAMPLE_KIOSK_ALERT;
      handleAlertEvent(payload);
    },
    [handleAlertEvent]
  );

  // Mute / Unmute audio
  const toggleMute = useCallback(() => {
    const newState = audioAlertService.toggleMute();
    setIsMuted(newState);
  }, []);

  const value = useMemo(
    () => ({
      activeAlert,
      alertHistory,
      dynamicKiosks,
      wsStatus: isWsConnected ? 'CONNECTED' : 'DISCONNECTED',
      isWsConnected,
      isMuted,
      triggerSimulatedAlert,
      dismissAlert,
      toggleMute,
      sendWsMessage,
      reconnectWs,
      wsUrl: pythonAlertWsUrl,
      // Direct Python socket telemetry values (same as Analytics)
      liveRiskPercentage,
      soilMoisture,
      vibration,
      telemetryTimestamp,
    }),
    [
      activeAlert,
      alertHistory,
      dynamicKiosks,
      isWsConnected,
      isMuted,
      triggerSimulatedAlert,
      dismissAlert,
      toggleMute,
      sendWsMessage,
      reconnectWs,
      pythonAlertWsUrl,
      liveRiskPercentage,
      soilMoisture,
      vibration,
      telemetryTimestamp,
    ]
  );

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return ctx;
}

export default AlertContext;
