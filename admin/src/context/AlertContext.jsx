import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
      return stored ? JSON.parse(stored) : null;
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
        const exists = list.some((k) => k.id === parsed.id);
        if (!exists) {
          list.unshift(parsed);
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

    const alertObject = {
      ...kiosk,
      hazardUpdate,
      message,
      timestamp,
      type: kiosk.type || 'Geotechnical Landslide Node',
      status: 'Warning',
      riskLevel: 'High',
    };

    // 1. Play Emergency Acoustic Beep via Web Audio API
    audioAlertService.playAlertBeep({ pulses: 3 });

    // 2. Register dynamic hazard override in mapUtils
    setHazardOverride(hazardUpdate.regionName, hazardUpdate.parameter, hazardUpdate.displayLevel);

    // 3. Update dynamic kiosk registry
    setDynamicKiosks((prev) => {
      const idx = prev.findIndex((k) => k.id === kiosk.id);
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
        id: `${kiosk.id}-${Date.now()}`,
        timestamp,
        kiosk,
        hazardUpdate,
        message,
      },
      ...prev.slice(0, 49),
    ]);

    // 6. Dispatch DOM events for backward compatibility
    window.dispatchEvent(new CustomEvent('kioskAlertChanged', { detail: alertObject }));
    window.dispatchEvent(new CustomEvent('rakshakNewAlertSound', { detail: alertObject }));
  }, []);

  // WebSocket Connection Hook
  const {
    status: wsConnectionStatus,
    isConnected: isWsConnected,
    sendMessage: sendWsMessage,
    reconnect: reconnectWs,
  } = useWebSocket({
    url: ENV.WS_ALERT_URL,
    enabled: true,
    autoReconnect: true,
    reconnectInterval: ENV.WS_RECONNECT_INTERVAL,
    onOpen: () => {
      console.log(`[AlertContext] Connected to live WebSocket: ${ENV.WS_ALERT_URL}`);
    },
    onMessage: (data) => {
      console.log('[AlertContext] Inbound WebSocket message:', data);
      handleAlertEvent(data);
    },
    onError: () => {
      // Backend WebSocket may be offline; application remains in standby simulation mode
    },
    onClose: () => {
      console.log('[AlertContext] WebSocket closed.');
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
      wsStatus: wsConnectionStatus,
      isWsConnected,
      isMuted,
      triggerSimulatedAlert,
      dismissAlert,
      toggleMute,
      sendWsMessage,
      reconnectWs,
      wsUrl: ENV.WS_ALERT_URL,
    }),
    [
      activeAlert,
      alertHistory,
      dynamicKiosks,
      wsConnectionStatus,
      isWsConnected,
      isMuted,
      triggerSimulatedAlert,
      dismissAlert,
      toggleMute,
      sendWsMessage,
      reconnectWs,
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
