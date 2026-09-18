import { i18n } from '@/services/i18n';
import { LocationCoordinates, useAppStore } from '@/stores/useAppStore';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface CoordinatesCardProps {
  location: LocationCoordinates | null;
  locating: boolean;
  onRefresh: () => void;
}

export function CoordinatesCard({ location, locating, onRefresh }: CoordinatesCardProps) {
  const language = useAppStore((state) => state.language);
  i18n.setLanguage(language);

  return (
    <View className="bg-white p-4 border border-[#e0e0e0] border-t-4 border-[#1a1a1a] shadow-sm mb-4">
      <View className="flex-row items-center justify-between pb-2.5 border-b border-[#e0e0e0]">
        <View>
          <Text className="text-xs font-black text-[#1a1a1a] uppercase tracking-wider">
            {i18n.t('coords_card_title')}
          </Text>
          <Text className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
            Real-Time Node Geolocation
          </Text>
        </View>
        <TouchableOpacity
          onPress={onRefresh}
          disabled={locating}
          className="bg-[#333333] px-3 py-1.5 active:bg-[#1a1a1a]"
        >
          <Text className="text-white text-[10px] font-black uppercase tracking-wider">
            {locating ? i18n.t('btn_transmitting') : i18n.t('btn_refresh_gps')}
          </Text>
        </TouchableOpacity>
      </View>

      {locating ? (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color="#d93850" />
          <Text className="text-xs text-[#d93850] font-bold mt-2 uppercase tracking-wider">
            {i18n.t('txt_syncing_coords')}
          </Text>
        </View>
      ) : (
        <View className="flex-row justify-between pt-3">
          <View className="flex-1 bg-[#f4f6f8] p-3 border border-[#cccccc] mr-2">
            <Text className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {i18n.t('label_latitude')}
            </Text>
            <Text className="text-base font-black text-[#1a1a1a] font-mono mt-0.5">
              {location ? location.latitude.toFixed(6) : '27.632800'}° N
            </Text>
          </View>
          <View className="flex-1 bg-[#f4f6f8] p-3 border border-[#cccccc]">
            <Text className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {i18n.t('label_longitude')}
            </Text>
            <Text className="text-base font-black text-[#1a1a1a] font-mono mt-0.5">
              {location ? location.longitude.toFixed(6) : '88.948200'}° E
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}