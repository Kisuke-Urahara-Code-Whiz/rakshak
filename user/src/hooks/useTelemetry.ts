import { useAppStore } from '@/stores/useAppStore';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { getFormattedDateTime, sendHeartbeat } from '../services/telemetryApi';

export function useTelemetry() {
  const { phoneNumber, location, setLocation } = useAppStore();
  const [locating, setLocating] = useState(false);

  async function fetchFreshCoordinates(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'GPS access is required for real-time risk assessment.');
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
      Alert.alert('GPS Error', 'Failed to acquire fresh spatial fix.');
      return null;
    }
  }

  async function triggerHeartbeat() {
    if (!phoneNumber) return;
    const coords = await fetchFreshCoordinates();
    if (!coords) return;
    try {
      const { lastUpdatedAt } = getFormattedDateTime();
      await sendHeartbeat(phoneNumber, coords.latitude, coords.longitude, lastUpdatedAt);
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
    setLocating(true);
    await fetchFreshCoordinates();
    setLocating(false);
  };

  return { locating, fetchFreshCoordinates, handleManualGpsRefresh };
}