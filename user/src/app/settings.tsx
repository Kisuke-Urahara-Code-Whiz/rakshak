import { useAppStore } from '@/stores/useAppStore';
import { API_BASE_URL } from '@/configs/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { StatusBar, Text, TouchableOpacity, View, ScrollView } from 'react-native';
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
    logout,
  } = useAppStore();

  const isCitizen = userRole === 'Citizen';

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
        <TouchableOpacity onPress={() => router.back()} className="bg-[#333333] px-3 py-1.5 border border-white/20 active:bg-black">
          <Text className="text-white font-bold text-xs uppercase tracking-wider">← Back</Text>
        </TouchableOpacity>
        <Text className="text-white font-black text-base uppercase tracking-widest">
          Node Settings
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView className="flex-1 p-4" contentContainerStyle={{ justifyContent: 'space-between', flexGrow: 1 }}>
        <View>
          {/* User Telemetry Profile */}
          <View className="bg-white p-4 border border-[#e0e0e0] border-t-4 border-[#d93850] mb-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Operational Identity
              </Text>
              <View className="bg-[#1a1a1a] px-2 py-0.5">
                <Text className="text-[9px] font-black uppercase tracking-wider text-[#f6d274]">
                  {userRole}
                </Text>
              </View>
            </View>

            <Text className="text-lg font-black font-mono text-[#1a1a1a]">
              {isCitizen ? `+91 ${phoneNumber || '9832041182'}` : `${userName || employeeId}`}
            </Text>

            <Text className="text-xs text-[#666666] mt-1 font-bold">
              {department || (isCitizen ? 'Citizen Triage Node (RAKSHAK SDRF)' : 'NER Geotechnical Cell')}
            </Text>
          </View>

          {/* Telemetry Network & Service Endpoints */}
          <View className="bg-white p-4 border border-[#e0e0e0] mb-4 shadow-sm">
            <Text className="text-xs font-black text-[#1a1a1a] uppercase tracking-wider mb-2">
              Telemetry Server Configuration
            </Text>
            <View className="bg-[#f8f9fa] p-3 border border-[#e2e8f0] mb-2">
              <Text className="text-[10px] text-slate-500 font-bold uppercase">Gateway API Base</Text>
              <Text className="text-xs font-mono font-bold text-slate-800 mt-0.5" numberOfLines={1}>
                {API_BASE_URL}
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-2 border-b border-[#f1f5f9]">
              <Text className="text-xs font-bold text-slate-600">Active Regional Dialect</Text>
              <View className="bg-[#1a1a1a] px-2 py-0.5">
                <Text className="text-[10px] font-mono font-bold text-[#f6d274] uppercase">
                  {language.toUpperCase()} (Switch on Home)
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-xs font-bold text-slate-600">System Pipeline Status</Text>
              <Text className="text-xs font-bold text-emerald-600">● Operational</Text>
            </View>
          </View>

          {/* Regional Dialect Info Note */}
          <View className="bg-blue-50 border border-blue-200 p-3 mb-4">
            <Text className="text-xs font-black text-blue-900 uppercase mb-1">
              Regional Language Switcher
            </Text>
            <Text className="text-[11px] text-blue-800">
              Language selection is managed directly on the Home screen regional strip to immediately sync dialect preferences with the centralized backend triage service.
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="w-full bg-[#333333] py-4 items-center justify-center shadow-md active:bg-[#1a1a1a] mb-6"
        >
          <Text className="text-white text-xs font-black uppercase tracking-widest">
            Logout / Exit Node
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}