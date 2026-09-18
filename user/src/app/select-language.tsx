import { i18n } from '@/services/i18n';
import { updateCitizenLanguage } from '@/services/telemetryApi';
import { SupportedLanguage, useAppStore } from '@/stores/useAppStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SelectLanguageScreen() {
  const router = useRouter();
  const { phoneNumber, employeeId, language, setLanguage, setIsLanguageConfigured } = useAppStore();
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(language);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableLanguages = i18n.getAvailableLanguages();

  const handleSaveLanguage = async () => {
    setIsSubmitting(true);
    const activeNumber = phoneNumber || '9832041182';

    try {
      // userType: "NEW" triggers initial confirmation SMS on backend
      await updateCitizenLanguage(activeNumber, selectedLang, 'NEW');
    } catch (e: any) {
      console.warn('Backend language sync offline, proceeding with local setting:', e.message);
    } finally {
      setLanguage(selectedLang);
      setIsLanguageConfigured(true);
      i18n.setLanguage(selectedLang);
      setIsSubmitting(false);
      router.replace('/home' as any);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f4f6f8]">
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Top Banner */}
      <View className="bg-[#1a1a1a] p-5 border-b-2 border-[#d93850]">
        <Text className="text-xl font-black uppercase tracking-widest text-white">
          Interface Language
        </Text>
        <Text className="text-xs font-bold uppercase tracking-wider text-[#f6d274] mt-1">
          Select Regional Dialect for Emergency Broadcasts
        </Text>
      </View>

      <View className="p-5 flex-1 justify-between">
        <View>
          <Text className="text-xs font-bold uppercase text-[#666666] tracking-wider mb-4">
            Available North-Eastern Regional Languages
          </Text>

          <FlatList
            data={availableLanguages}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => {
              const isSelected = selectedLang === item.code;
              return (
                <TouchableOpacity
                  onPress={() => setSelectedLang(item.code as SupportedLanguage)}
                  className={`p-3.5 border mb-2.5 flex-row items-center justify-between ${
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
                </TouchableOpacity>
              );
            }}
          />
        </View>

        <TouchableOpacity
          onPress={handleSaveLanguage}
          disabled={isSubmitting}
          className="w-full bg-[#333333] py-4 items-center justify-center active:bg-[#1a1a1a]"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white text-xs font-black uppercase tracking-widest">
              Confirm & Continue to Dashboard
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}