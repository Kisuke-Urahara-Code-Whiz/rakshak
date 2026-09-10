import { getFileExtension } from '@/services/telemetryApi';
import * as ImagePicker from 'expo-image-picker';
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from 'react-native';

interface VisualEvidenceCardProps {
  photoUri: string | null;
  onSetPhotoUri: (uri: string | null) => void;
  onSendPhoto: () => void;
  isSending: boolean;
}

export function VisualEvidenceCard({ photoUri, onSetPhotoUri, onSendPhoto, isSending }: VisualEvidenceCardProps) {
  const handleCapture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Access Denied', 'Camera permission required for hazard logging.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      onSetPhotoUri(result.assets[0].uri);
    }
  };

  const ext = getFileExtension(photoUri, 'PNG');

  return (
    <View className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <View>
          <Text className="text-xs font-bold text-slate-800">Visual Evidence</Text>
          <Text className="text-[11px] text-slate-500">
            {photoUri ? `Asset attached [${ext}]` : 'No field snapshot captured'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleCapture} className="bg-[#002b53] px-3.5 py-1.5 rounded active:opacity-80">
          <Text className="text-white text-xs font-semibold">{photoUri ? 'Retake Media' : 'Open Camera'}</Text>
        </TouchableOpacity>
      </View>

      {photoUri && (
        <View className="mt-2">
          <View className="rounded-lg overflow-hidden border border-slate-300 bg-black/5 mb-3">
            <Image source={{ uri: photoUri }} className="w-full h-44" resizeMode="cover" />
          </View>
          <TouchableOpacity
            onPress={onSendPhoto}
            disabled={isSending}
            className="w-full bg-[#003366] py-2.5 rounded-lg flex-row items-center justify-center active:opacity-90 shadow-sm"
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white text-xs font-bold uppercase tracking-wider">
                Transmit Visual Evidence ({ext})
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}