import { i18n } from '@/services/i18n';
import { useAppStore } from '@/stores/useAppStore';
import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
  phoneNumber: string | null;
  onExit: () => void;
}

export function Header({ phoneNumber, onExit }: HeaderProps) {
  const router = useRouter();
  const language = useAppStore((state) => state.language);
  i18n.setLanguage(language);

  return (
    <View className="bg-[#002b53] px-5 py-3.5 flex-row items-center justify-between border-b-2 border-amber-500 shadow-md">
      <View className="flex-row items-center gap-3">
        <Image
          source={require('../../assets/images/logo-nobg.png')}
          style={{ width: 38, height: 38 }}
          resizeMode="contain"
        />
        <View>
          <Text className="text-white font-bold text-base tracking-wider">
            {i18n.t('app_title')}
          </Text>
          <Text className="text-slate-300 text-[11px]">{i18n.t('app_subtitle')}</Text>
        </View>
      </View>
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={() => router.push('/settings' as any)}
          className="bg-[#001f3d] px-2.5 py-1 rounded border border-blue-400/30 active:opacity-80"
        >
          <Text className="text-blue-200 text-[11px] font-mono">+91 {phoneNumber} ⚙</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onExit} className="bg-red-700 px-2.5 py-1 rounded active:opacity-80">
          <Text className="text-white text-[11px] font-bold">{i18n.t('btn_exit')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}