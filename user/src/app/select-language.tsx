import { i18n } from '@/services/i18n';
import { updateCitizenLanguage } from '@/services/telemetryApi';
import { SupportedLanguage, useAppStore } from '@/stores/useAppStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SelectLanguageScreen() {
  const router = useRouter();
  const { phoneNumber, language, setLanguage, setIsLanguageConfigured } = useAppStore();
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(language);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableLanguages = i18n.getAvailableLanguages();

  const handleSaveLanguage = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'No user session found.');
      return;
    }

    setIsSubmitting(true);
    try {
      // userType: "NEW" triggers initial confirmation SMS on backend
      const res = await updateCitizenLanguage(phoneNumber, selectedLang, 'NEW');
      if (res.status < 200 || res.status >= 300) {
        throw new Error(`Server returned status: ${res.status}`);
      }

      setLanguage(selectedLang);
      setIsLanguageConfigured(true);
      i18n.setLanguage(selectedLang);

      router.replace('/home' as any);
    } catch (e: any) {
      Alert.alert('Language Update Failed', e.message || 'Unable to reach the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View className="p-6 flex-1 justify-between">
        <View>
          <Text className="text-2xl font-black text-slate-900 mb-1">Select Language</Text>
          <Text className="text-xs text-slate-500 mb-6">
            Choose your preferred regional language for emergency advisories and telemetry alerts.
          </Text>

          <FlatList
            data={availableLanguages}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => {
              const isSelected = selectedLang === item.code;
              return (
                <TouchableOpacity
                  onPress={() => setSelectedLang(item.code as SupportedLanguage)}
                  className={`p-4 rounded-xl border mb-3 flex-row items-center justify-between ${
                    isSelected ? 'bg-[#002b53] border-[#002b53]' : 'bg-white border-slate-200'
                  }`}
                >
                  <Text className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {item.name}
                  </Text>
                  <Text
                    className={`font-mono text-xs uppercase ${
                      isSelected ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {item.code}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        <TouchableOpacity
          onPress={handleSaveLanguage}
          disabled={isSubmitting}
          className="w-full bg-[#002b53] py-4 rounded-xl items-center justify-center shadow-sm"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white text-sm font-bold uppercase tracking-wider">
              Continue to Dashboard
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}