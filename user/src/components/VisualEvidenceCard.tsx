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
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          i18n.t('alert_camera_title') || 'Camera Permission',
          i18n.t('alert_camera_msg') || 'Camera permission is required to capture field photos.'
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
    } catch (e: any) {
      console.warn('Camera launch error, opening gallery fallback:', e);
      handlePickImage();
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        onSetPhotoUri(result.assets[0].uri);
      }
    } catch (e: any) {
      Alert.alert('File Picker Error', e.message || 'Unable to access photo library.');
    }
  };

  const ext = getFileExtension(photoUri, 'PNG');

  return (
    <View className="bg-[#f4f6f8] border border-[#cbd5e1] p-3 mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-1 mr-2">
          <Text className="text-xs font-black text-[#1a1a1a] uppercase tracking-wider">
            📷 {i18n.t('visual_card_title')}
          </Text>
          <Text className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
            {photoUri
              ? `${i18n.t('visual_status_attached')} [${ext}]`
              : i18n.t('visual_status_empty')}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <TouchableOpacity
            onPress={handleCapture}
            className="bg-[#333333] px-2.5 py-1.5 active:bg-[#1a1a1a]"
          >
            <Text className="text-white text-[10px] font-black uppercase tracking-wider">
              {photoUri ? i18n.t('btn_retake_media') : i18n.t('btn_open_camera')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePickImage}
            className="bg-[#d93850] px-2.5 py-1.5 active:bg-[#b8273d]"
          >
            <Text className="text-white text-[10px] font-black uppercase tracking-wider">
              Choose File
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {photoUri && (
        <View className="mt-2">
          <View className="border border-[#cbd5e1] bg-black/5 mb-3 overflow-hidden">
            <Image source={{ uri: photoUri }} className="w-full h-44" resizeMode="cover" />
          </View>
          <TouchableOpacity
            onPress={onSendPhoto}
            disabled={isSending}
            className="w-full bg-[#d93850] py-3 flex-row items-center justify-center active:bg-[#b8273d] shadow-sm"
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white text-xs font-black uppercase tracking-widest">
                Transmit Image To Java Backend ({ext})
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}