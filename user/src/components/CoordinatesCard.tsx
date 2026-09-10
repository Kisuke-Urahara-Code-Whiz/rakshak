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
    <View className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-4">
      <View className="flex-row items-center justify-between pb-2 border-b border-slate-100">
        <Text className="text-xs font-bold text-slate-800 uppercase tracking-wide">
          {i18n.t('coords_card_title')}
        </Text>
        <TouchableOpacity
          onPress={onRefresh}
          disabled={locating}
          className="bg-blue-50 px-2.5 py-1 rounded border border-blue-200 active:opacity-70"
        >
          <Text className="text-[#002b53] text-[11px] font-bold">
            {locating ? i18n.t('btn_transmitting') : i18n.t('btn_refresh_gps')}
          </Text>
        </TouchableOpacity>
      </View>

      {locating ? (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color="#002b53" />
          <Text className="text-xs text-slate-500 mt-2">
            {i18n.t('txt_syncing_coords')}
          </Text>
        </View>
      ) : (
        <View className="flex-row justify-between pt-3">
          <View className="flex-1 bg-slate-50 p-2.5 rounded border border-slate-200 mr-2">
            <Text className="text-[10px] text-slate-500 font-bold uppercase">
              {i18n.t('label_latitude')}
            </Text>
            <Text className="text-sm font-bold text-slate-900 font-mono mt-0.5">
              {location ? location.latitude.toFixed(6) : '--.------'}
            </Text>
          </View>
          <View className="flex-1 bg-slate-50 p-2.5 rounded border border-slate-200">
            <Text className="text-[10px] text-slate-500 font-bold uppercase">
              {i18n.t('label_longitude')}
            </Text>
            <Text className="text-sm font-bold text-slate-900 font-mono mt-0.5">
              {location ? location.longitude.toFixed(6) : '--.------'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}