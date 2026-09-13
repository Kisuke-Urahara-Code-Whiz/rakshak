import { AuthSubmitButton } from '@/components/AuthSubmitButton';
import { LoginBranding } from '@/components/LoginBranding';
import { PhoneInputField } from '@/components/PhoneInputField';
import { i18n } from '@/services/i18n';
import { getFormattedDateTime, sendHeartbeat } from '@/services/telemetryApi';
import { SupportedLanguage, useAppStore } from '@/stores/useAppStore';
import * as Location from 'expo-location';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const [phoneInput, setPhoneInput] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    phoneNumber,
    setPhoneNumber,
    setLocation,
    hasHydrated,
    language,
    setLanguage,
    isLanguageConfigured,
    setIsLanguageConfigured,
  } = useAppStore();

  i18n.setLanguage(language);

  if (!hasHydrated) return null;
  if (phoneNumber && isLanguageConfigured) return <Redirect href={'/home' as any} />;

  const handleEnter = async () => {
  const cleanNumber = phoneInput.trim();

  if (cleanNumber.length !== 10 || !/^\d{10}$/.test(cleanNumber)) {
    Alert.alert(i18n.t('alert_invalid_num_title'), i18n.t('alert_invalid_num_msg'));
    return;
  }

  setLoading(true);

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(i18n.t('alert_loc_req_title'), i18n.t('alert_loc_req_msg'));
      setLoading(false);
      return;
    }

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const lat = Number(loc.coords.latitude.toFixed(6));
    const lon = Number(loc.coords.longitude.toFixed(6));

    setLocation({ latitude: lat, longitude: lon, accuracy: loc.coords.accuracy });

    const { lastUpdatedAt } = getFormattedDateTime();
    const response = await sendHeartbeat(cleanNumber, lat, lon, lastUpdatedAt);

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Server returned status: ${response.status}`);
    }

    // Access Axios payload via response.data
    const remoteLang = String(response.data).trim() as SupportedLanguage;
    setPhoneNumber(cleanNumber);

    // If new user (returns "en" and not yet configured), prompt selection
    if (remoteLang === 'en' && !isLanguageConfigured) {
      router.replace('/select-language' as any);
    } else {
      setLanguage(remoteLang);
      setIsLanguageConfigured(true);
      router.replace('/home' as any);
    }
  } catch (error: any) {
    Alert.alert(i18n.t('alert_reg_err_title'), error.message || i18n.t('alert_reg_err_msg'));
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
          <PhoneInputField value={phoneInput} onChangeValue={setPhoneInput} disabled={loading} />
          <AuthSubmitButton onPress={handleEnter} loading={loading} />
        </View>

        <View className="items-center pb-6">
          <Text className="text-[11px] text-slate-400">
            {i18n.t('disaster_protocol_footer')}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}