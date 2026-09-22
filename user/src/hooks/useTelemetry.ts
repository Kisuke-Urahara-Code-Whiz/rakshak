import { i18n } from '@/services/i18n';
import { getFormattedDateTime, sendHeartbeat } from '@/services/telemetryApi';
import { SupportedLanguage, useAppStore } from '@/stores/useAppStore';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export function useTelemetry() {
  const { phoneNumber, employeeId, location, setLocation, language, setLanguage } = useAppStore();
  const [locating, setLocating] = useState(false);
  const activeIdentifier = phoneNumber || employeeId || null;

  // Keep i18n updated with current persisted language
  i18n.setLanguage(language);

  async function fetchFreshCoordinates(): Promise<{ latitude: number; longitude: number }> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        // Check for quick cached position first (fast & reliable on emulators and weak GPS signals)
        let loc = await Location.getLastKnownPositionAsync();
        if (!loc) {
          loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
        }
        if (loc) {
          const coords = {
            latitude: Number(loc.coords.latitude.toFixed(6)),
            longitude: Number(loc.coords.longitude.toFixed(6)),
          };
          setLocation({ ...coords, accuracy: loc.coords.accuracy });
          return coords;
        }
      }
    } catch (err) {
      // Use console.log to avoid triggering Expo LogBox yellow popup
      console.log('GPS unavailable or permission skipped, using fallback coordinates:', err);
    }

    const fallback = location
      ? { latitude: location.latitude, longitude: location.longitude }
      : { latitude: 27.6328, longitude: 88.9482 };
    return fallback;
  }

  async function triggerHeartbeat() {
    if (!activeIdentifier) return;
    const coords = await fetchFreshCoordinates();
    if (!coords) return;
    try {
      const { lastUpdatedAt } = getFormattedDateTime();
      const res = await sendHeartbeat(activeIdentifier, coords.latitude, coords.longitude, lastUpdatedAt);
      
      // Keep local language synced if backend returns an updated preference
      if (res.data && typeof res.data === 'string') {
        const remoteLang = res.data.trim() as SupportedLanguage;
        if (remoteLang && remoteLang !== language) {
          setLanguage(remoteLang);
          i18n.setLanguage(remoteLang);
        }
      }
    } catch (e) {
      console.warn('Periodic telemetry ping failed:', e);
    }
  }

  useEffect(() => {
    if (!location) fetchFreshCoordinates();
    const timer = setInterval(triggerHeartbeat, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, [activeIdentifier]);

  const handleManualGpsRefresh = async () => {
    if (!activeIdentifier) {
      Alert.alert('Error', 'No authenticated identifier found.');
      return;
    }

    if (!location) {
      Alert.alert('No Fix', 'No cached coordinates available to transmit.');
      return;
    }

    setLocating(true);
    try {
      const { lastUpdatedAt } = getFormattedDateTime();
      const res = await sendHeartbeat(
        activeIdentifier,
        location.latitude,
        location.longitude,
        lastUpdatedAt
      );

      if (res.status < 200 || res.status >= 300) {
        throw new Error(`Server returned status: ${res.status}`);
      }

      // Sync language preference if returned
      if (res.data && typeof res.data === 'string') {
        const remoteLang = res.data.trim() as SupportedLanguage;
        if (remoteLang && remoteLang !== language) {
          setLanguage(remoteLang);
          i18n.setLanguage(remoteLang);
        }
      }
    } catch (e: any) {
      Alert.alert('Transmission Failed', e.message || 'Unable to reach the server.');
    } finally {
      setLocating(false);
    }
  };

  return { locating, fetchFreshCoordinates, handleManualGpsRefresh };
}