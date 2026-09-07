import { AuthSubmitButton } from '@/components/AuthSubmitButton';
import { LoginBranding } from '@/components/LoginBranding';
import { PhoneInputField } from '@/components/PhoneInputField';
import { getFormattedDateTime, sendHeartbeat } from '@/services/telemetryApi';
import { useAppStore } from '@/stores/useAppStore';
import * as Location from 'expo-location';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const [phoneInput, setPhoneInput] = useState('');
  const [loading, setLoading] = useState(false);

  const { phoneNumber, setPhoneNumber, setLocation, hasHydrated } = useAppStore();

  if (!hasHydrated) return null;
  if (phoneNumber) return <Redirect href={'/home' as any} />;

  const handleEnter = async () => {
    const cleanNumber = phoneInput.trim();

    if (cleanNumber.length !== 10 || !/^\d{10}$/.test(cleanNumber)) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Required',
          'GPS access is mandatory to register spatial telemetry with RAKSHAK.'
        );
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const lat = Number(loc.coords.latitude.toFixed(6));
      const lon = Number(loc.coords.longitude.toFixed(6));

      setLocation({
        latitude: lat,
        longitude: lon,
        accuracy: loc.coords.accuracy,
      });

      const { lastUpdatedAt } = getFormattedDateTime();
      const response = await sendHeartbeat(cleanNumber, lat, lon, lastUpdatedAt);

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      setPhoneNumber(cleanNumber);
      router.replace('/home' as any);
    } catch (error: any) {
      Alert.alert(
        'Registration Error',
        error.message || 'Could not connect to the authentication service.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-between"
      >
        <View className="px-6 pt-10 items-center">
          <LoginBranding />
          <PhoneInputField
            value={phoneInput}
            onChangeValue={setPhoneInput}
            disabled={loading}
          />
          <AuthSubmitButton onPress={handleEnter} loading={loading} />
        </View>

        <View className="items-center pb-6">
          <Text className="text-[11px] text-slate-400">
            Protected under Government Disaster Management Protocol
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}