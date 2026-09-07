import { LocationCoordinates } from '@/stores/useAppStore';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface CoordinatesCardProps {
  location: LocationCoordinates | null;
  locating: boolean;
  onRefresh: () => void;
}

export function CoordinatesCard({ location, locating, onRefresh }: CoordinatesCardProps) {
  return (
    <View className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-4">
      <View className="flex-row items-center justify-between pb-2 border-b border-slate-100">
        <Text className="text-xs font-bold text-slate-800 uppercase tracking-wide">Spatial Coordinates</Text>
        <TouchableOpacity
          onPress={onRefresh}
          disabled={locating}
          className="bg-blue-50 px-2.5 py-1 rounded border border-blue-200 active:opacity-70"
        >
          <Text className="text-[#002b53] text-[11px] font-bold">
            {locating ? 'Acquiring...' : 'Refresh GPS'}
          </Text>
        </TouchableOpacity>
      </View>

      {locating ? (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color="#002b53" />
          <Text className="text-xs text-slate-500 mt-2">Locking GPS satellites...</Text>
        </View>
      ) : (
        <View className="flex-row justify-between pt-3">
          <View className="flex-1 bg-slate-50 p-2.5 rounded border border-slate-200 mr-2">
            <Text className="text-[10px] text-slate-500 font-bold uppercase">Latitude</Text>
            <Text className="text-sm font-bold text-slate-900 font-mono mt-0.5">
              {location ? location.latitude.toFixed(6) : '--.------'}
            </Text>
          </View>
          <View className="flex-1 bg-slate-50 p-2.5 rounded border border-slate-200">
            <Text className="text-[10px] text-slate-500 font-bold uppercase">Longitude</Text>
            <Text className="text-sm font-bold text-slate-900 font-mono mt-0.5">
              {location ? location.longitude.toFixed(6) : '--.------'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}