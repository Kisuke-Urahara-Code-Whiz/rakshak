import { i18n } from '@/services/i18n';
import { useAppStore } from '@/stores/useAppStore';
import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
  phoneNumber?: string | null;
  onExit?: () => void;
}

export function Header({ phoneNumber, onExit }: HeaderProps) {
  const router = useRouter();
  const { language, userRole, userName, employeeId } = useAppStore();
  i18n.setLanguage(language);

  const isCitizen = userRole === 'Citizen';

  return (
    <View className="bg-[#1a1a1a] px-4 py-3 flex-row items-center justify-between border-b-2 border-[#d93850] shadow-lg">
      <View className="flex-row items-center gap-2.5">
        <View className="h-9 w-9 bg-white p-1 items-center justify-center shadow">
          <Image
            source={require('../../assets/images/logo-nobg.png')}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        </View>
        <View>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-white font-black text-base uppercase tracking-widest text-[#d93850]">
              RAKSHAK
            </Text>
            {/* Active Role Pill matching Admin */}
            <View
              className={`px-1.5 py-0.5 border ${
                isCitizen
                  ? 'bg-white/10 border-white/20'
                  : 'bg-[#d93850]/20 border-[#d93850]'
              }`}
            >
              <Text className="text-[9px] font-black uppercase tracking-wider text-[#f6d274]">
                {userRole}
              </Text>
            </View>
          </View>
          <Text className="text-slate-300 text-[10px] uppercase font-bold tracking-wider">
            {isCitizen
              ? `Node: +91 ${phoneNumber || 'Citizen'}`
              : `${userName || employeeId || 'Field Officer'}`}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row items-center gap-2">
        <View className="bg-[#d93850]/20 border border-[#d93850] px-2 py-1.5 flex-row items-center gap-1">
          <Text className="text-[10px]">🌐</Text>
          <Text className="text-[#f6d274] text-[10px] font-black uppercase tracking-wider font-mono">
            {language.toUpperCase()}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/settings' as any)}
          className="bg-[#333333] px-2.5 py-1.5 border border-white/20 active:bg-black"
        >
          <Text className="text-white text-[11px] font-bold uppercase tracking-wider">
            ⚙ Settings
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}