import { useAppStore } from '@/stores/useAppStore';
import * as Location from 'expo-location';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const API_HOST = 'https://7706-152-58-181-7.ngrok-free.app';

function getFormattedLocalDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export default function LoginScreen() {
  const router = useRouter();
  const [phoneInput, setPhoneInput] = useState('');
  const [loading, setLoading] = useState(false);

  const { phoneNumber, setPhoneNumber, setLocation, hasHydrated } = useAppStore();

  if (!hasHydrated) return null;

  if (phoneNumber) {
    return <Redirect href={'/home' as any} />;
  }

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

      const lat = loc.coords.latitude;
      const lon = loc.coords.longitude;

      setLocation({
        latitude: lat,
        longitude: lon,
        accuracy: loc.coords.accuracy,
      });

      // Matches CitizenLocationDto
      const payload = {
        number: Number(cleanNumber),
        lat: Number(lat.toFixed(6)),
        lon: Number(lon.toFixed(6)),
        lastUpdatedAt: getFormattedLocalDateTime(),
      };

      const response = await fetch(`${API_HOST}/sql/enter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(payload),
      });

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
          <Image
            source={require('../../assets/images/logo-nobg.png')}
            style={{ width: width * 0.45, height: width * 0.45 }}
            resizeMode="contain"
            className="mb-8"
          />

          <Text className="text-2xl font-bold text-[#003366] text-center tracking-tight">
            Citizen Authentication
          </Text>
          <Text className="text-xs text-slate-500 text-center mt-1">
            Ministry of Development of North Eastern Region
          </Text>

          <View className="w-full mt-10">
            <Text className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Mobile Number
            </Text>

            <View className="flex-row items-center border border-slate-300 rounded-xl px-4 py-3 bg-slate-50">
              <Text className="text-base font-bold text-slate-700 mr-2">+91</Text>
              <TextInput
                className="flex-1 text-base text-slate-900 font-semibold"
                placeholder="Enter 10-digit number"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                maxLength={10}
                value={phoneInput}
                onChangeText={(text) => setPhoneInput(text.replace(/[^0-9]/g, ''))}
                editable={!loading}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleEnter}
            disabled={loading}
            className="w-full bg-[#003366] py-3.5 rounded-xl mt-6 items-center justify-center active:opacity-90 shadow-md shadow-blue-900/20"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white text-base font-bold tracking-wide">Enter</Text>
            )}
          </TouchableOpacity>
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