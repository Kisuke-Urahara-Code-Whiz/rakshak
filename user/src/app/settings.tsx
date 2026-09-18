import { i18n } from '@/services/i18n';
import { updateCitizenLanguage } from '@/services/telemetryApi';
import { SupportedLanguage, useAppStore } from '@/stores/useAppStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const {
    phoneNumber,
    employeeId,
    userRole,
    userName,
    department,
    language,
    setLanguage,
    logout,
  } = useAppStore();

  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(language);
  const [isUpdating, setIsUpdating] = useState(false);

  const availableLanguages = i18n.getAvailableLanguages();
  const isCitizen = userRole === 'Citizen';

  const handleUpdateLanguage = async (newCode: SupportedLanguage) => {
    if (newCode === language) return;

    setSelectedLang(newCode);
    setIsUpdating(true);

    try {
      const activeNumber = phoneNumber || '9832041182';
      const res = await updateCitizenLanguage(activeNumber, newCode, 'OLD');
      if (res.status < 200 || res.status >= 300) {
        throw new Error(`Server returned status: ${res.status}`);
      }

      setLanguage(newCode);
      i18n.setLanguage(newCode);
      Alert.alert('Language Updated', `Active language switched to ${newCode.toUpperCase()}.`);
    } catch (e: any) {
      setSelectedLang(language);
      // Still set local language preference if backend is offline
      setLanguage(newCode);
      i18n.setLanguage(newCode);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      logout();
      await AsyncStorage.clear();
      router.replace('/' as any);
    } catch (e) {
      console.warn('Error clearing storage on logout:', e);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f4f6f8]">
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Header matching Admin Navbar */}
      <View className="px-5 py-4 border-b-2 border-[#d93850] bg-[#1a1a1a] flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="bg-[#333333] px-3 py-1 border border-white/20">
          <Text className="text-white font-bold text-xs uppercase tracking-wider">← Back</Text>
        </TouchableOpacity>
        <Text className="text-white font-black text-base uppercase tracking-widest">
          Node Settings
        </Text>
        <View style={{ width: 50 }} />
      </View>

      <View className="p-4 flex-1 justify-between">
        <View>
          {/* User Telemetry Profile */}
          <View className="bg-white p-4 border border-[#e0e0e0] border-t-4 border-[#d93850] mb-5 shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Active Operational Identity
              </Text>
              <View className="bg-[#1a1a1a] px-2 py-0.5">
                <Text className="text-[9px] font-black uppercase tracking-wider text-[#f6d274]">
                  {userRole}
                </Text>
              </View>
            </View>

            <Text className="text-lg font-black font-mono text-[#1a1a1a]">
              {isCitizen ? `+91 ${phoneNumber}` : `${userName || employeeId}`}
            </Text>

            <Text className="text-xs text-[#666666] mt-1 font-bold">
              {department || (isCitizen ? 'Citizen Triage Node (RAKSHAK SDRF)' : 'NER Geotechnical Cell')}
            </Text>
          </View>

          {/* Language Selection Header */}
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs font-black text-[#1a1a1a] uppercase tracking-wider">
              Interface Advisory Language
            </Text>
            {isUpdating && <ActivityIndicator size="small" color="#d93850" />}
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
                  className={`p-3.5 border mb-2 flex-row items-center justify-between ${
                    isSelected
                      ? 'bg-red-50 border-[#d93850]'
                      : 'bg-white border-[#e0e0e0]'
                  }`}
                  activeOpacity={0.8}
                >
                  <View>
                    <Text
                      className={`text-sm font-black ${
                        isSelected ? 'text-[#d93850]' : 'text-[#1a1a1a]'
                      }`}
                    >
                      {item.nativeName}
                    </Text>
                    <Text
                      className={`text-[11px] font-bold uppercase tracking-wider mt-0.5 ${
                        isSelected ? 'text-[#d93850]' : 'text-slate-500'
                      }`}
                    >
                      {item.name}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <View
                      className={`px-2 py-0.5 border ${
                        isSelected ? 'border-[#d93850] bg-white' : 'border-[#e0e0e0] bg-[#f4f6f8]'
                      }`}
                    >
                      <Text
                        className={`font-mono text-[10px] uppercase font-bold ${
                          isSelected ? 'text-[#d93850]' : 'text-slate-500'
                        }`}
                      >
                        {item.code.toUpperCase()}
                      </Text>
                    </View>
                    {isSelected && <View className="w-2.5 h-2.5 rounded-full bg-[#d93850]" />}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="w-full bg-[#333333] py-4 items-center justify-center shadow-md active:bg-[#1a1a1a]"
        >
          <Text className="text-white text-xs font-black uppercase tracking-widest">
            Logout / Exit Node
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}