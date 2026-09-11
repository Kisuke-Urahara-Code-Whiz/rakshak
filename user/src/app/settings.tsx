import { i18n } from '@/services/i18n';
import { updateCitizenLanguage } from '@/services/telemetryApi';
import { SupportedLanguage, useAppStore } from '@/stores/useAppStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { phoneNumber, language, setLanguage } = useAppStore();
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(language);
  const [isUpdating, setIsUpdating] = useState(false);

  const availableLanguages = i18n.getAvailableLanguages();

  const handleUpdateLanguage = async (newCode: SupportedLanguage) => {
    if (!phoneNumber || newCode === language) return;

    setSelectedLang(newCode);
    setIsUpdating(true);

    try {
      // userType: "OLD" silently updates language in database
      const res = await updateCitizenLanguage(phoneNumber, newCode, 'OLD');
      if (res.status < 200 || res.status >= 300) {
        throw new Error(`Server returned status: ${res.status}`);
      }

      setLanguage(newCode);
      i18n.setLanguage(newCode);
      Alert.alert('Language Updated', `Active language switched to ${newCode.toUpperCase()}.`);
    } catch (e: any) {
      setSelectedLang(language); // Revert on failure
      Alert.alert('Error', e.message || 'Could not update language preference.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View className="px-5 py-4 border-b border-slate-200 bg-white flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-900 font-bold text-sm">← Back</Text>
        </TouchableOpacity>
        <Text className="text-slate-900 font-bold text-base">App Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <View className="p-4 flex-1">
        {/* User Telemetry Profile */}
        <View className="bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-sm">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Registered Telemetry Identity
          </Text>
          <Text className="text-lg font-bold font-mono text-slate-900">+91 {phoneNumber}</Text>
          <Text className="text-[11px] text-slate-500 mt-1">
            Status: Active Field Node (RAKSHAK SDRF)
          </Text>
        </View>

        {/* Language Selection */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Select Interface Language
          </Text>
          {isUpdating && <ActivityIndicator size="small" color="#002b53" />}
        </View>

        <FlatList
          data={availableLanguages}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => {
            const isSelected = selectedLang === item.code;
            return (
              <TouchableOpacity
                disabled={isUpdating}
                onPress={() => handleUpdateLanguage(item.code as SupportedLanguage)}
                className={`p-3.5 rounded-lg border mb-2.5 flex-row items-center justify-between ${
                  isSelected ? 'bg-blue-50 border-[#002b53]' : 'bg-white border-slate-200'
                }`}
              >
                <Text
                  className={`font-semibold text-sm ${
                    isSelected ? 'text-[#002b53] font-bold' : 'text-slate-800'
                  }`}
                >
                  {item.name}
                </Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-slate-400 font-mono text-xs uppercase">{item.code}</Text>
                  {isSelected && <View className="w-2 h-2 rounded-full bg-[#002b53]" />}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}