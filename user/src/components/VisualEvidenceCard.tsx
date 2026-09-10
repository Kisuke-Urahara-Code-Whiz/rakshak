import { i18n } from '@/services/i18n';
import { getFileExtension } from '@/services/telemetryApi';
import { useAppStore } from '@/stores/useAppStore';
import * as ImagePicker from 'expo-image-picker';
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from 'react-native';

interface VisualEvidenceCardProps {
  photoUri: string | null;
  onSetPhotoUri: (uri: string | null) => void;
  onSendPhoto: () => void;
  isSending: boolean;
}

export function VisualEvidenceCard({
  photoUri,
  onSetPhotoUri,
  onSendPhoto,
  isSending,
}: VisualEvidenceCardProps) {
  const language = useAppStore((state) => state.language);
  i18n.setLanguage(language);

  const handleCapture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        i18n.t('alert_camera_title'),
        i18n.t('alert_camera_msg')
      );
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
          <Text className="text-xs font-bold text-slate-800">
            {i18n.t('visual_card_title')}
          </Text>
          <Text className="text-[11px] text-slate-500">
            {photoUri
              ? `${i18n.t('visual_status_attached')} [${ext}]`
              : i18n.t('visual_status_empty')}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleCapture}
          className="bg-[#002b53] px-3.5 py-1.5 rounded active:opacity-80"
        >
          <Text className="text-white text-xs font-semibold">
            {photoUri ? i18n.t('btn_retake_media') : i18n.t('btn_open_camera')}
          </Text>
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
                {i18n.t('btn_transmit_visual')} ({ext})
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}