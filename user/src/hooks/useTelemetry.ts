import { i18n } from '@/services/i18n';
import { getFormattedDateTime, sendHeartbeat } from '@/services/telemetryApi';
import { SupportedLanguage, useAppStore } from '@/stores/useAppStore';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export function useTelemetry() {
  const { phoneNumber, location, setLocation, language, setLanguage } = useAppStore();
  const [locating, setLocating] = useState(false);

  // Keep i18n updated with current persisted language
  i18n.setLanguage(language);

  async function fetchFreshCoordinates(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          i18n.t('alert_audio_perm_title') || 'Permission Denied',
          i18n.t('alert_loc_req_msg') || 'GPS access is required for real-time risk assessment.'
        );
        return null;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = {
        latitude: Number(loc.coords.latitude.toFixed(6)),
        longitude: Number(loc.coords.longitude.toFixed(6)),
      };

      setLocation({ ...coords, accuracy: loc.coords.accuracy });
      return coords;
    } catch {
      Alert.alert(
        i18n.t('alert_reg_err_title') || 'GPS Error',
        'Failed to acquire fresh spatial fix.'
      );
      return null;
    }
  }

  async function triggerHeartbeat() {
    if (!phoneNumber) return;
    const coords = await fetchFreshCoordinates();
    if (!coords) return;
    try {
      const { lastUpdatedAt } = getFormattedDateTime();
      const res = await sendHeartbeat(phoneNumber, coords.latitude, coords.longitude, lastUpdatedAt);
      
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
  }, [phoneNumber]);

  const handleManualGpsRefresh = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'No authenticated phone number found.');
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
        phoneNumber,
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