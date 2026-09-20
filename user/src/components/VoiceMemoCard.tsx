import { i18n } from '@/services/i18n';
import { getFileExtension } from '@/services/telemetryApi';
import { useAppStore } from '@/stores/useAppStore';
import {
  AudioModule,
  RecordingPresets,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
} from 'expo-audio';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

interface VoiceMemoCardProps {
  voiceUri: string | null;
  onSetVoiceUri: (uri: string | null) => void;
  onSendAudio: () => void;
  isSending: boolean;
}

export function VoiceMemoCard({
  voiceUri,
  onSetVoiceUri,
  onSendAudio,
  isSending,
}: VoiceMemoCardProps) {
  const language = useAppStore((state) => state.language);
  i18n.setLanguage(language);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const player = useAudioPlayer(voiceUri);
  const playerStatus = useAudioPlayerStatus(player);

  const startRecording = async () => {
    try {
      if (playerStatus.playing) player.pause();
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          i18n.t('alert_audio_perm_title'),
          i18n.t('alert_audio_perm_msg')
        );
        return;
      }
      await AudioModule.setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
    } catch {
      Alert.alert(
        i18n.t('alert_audio_err_title'),
        i18n.t('alert_audio_init_fail')
      );
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      setIsRecording(false);
      await AudioModule.setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      const finalUri = audioRecorder.uri || audioRecorder.getStatus()?.url;
      if (finalUri) {
        onSetVoiceUri(finalUri);
      }
    } catch {
      Alert.alert(
        i18n.t('alert_audio_err_title'),
        i18n.t('alert_audio_final_fail')
      );
    }
  };

  const handleTogglePlayback = () => {
    if (!voiceUri || !player) return;
    try {
      if (playerStatus.playing) {
        player.pause();
      } else {
        if (
          playerStatus.currentTime &&
          playerStatus.duration &&
          playerStatus.currentTime >= playerStatus.duration
        ) {
          player.seekTo(0);
        }
        player.play();
      }
    } catch {
      Alert.alert(
        i18n.t('alert_playback_err_title'),
        i18n.t('alert_playback_err_msg')
      );
    }
  };

  const ext = getFileExtension(voiceUri, 'M4A');

  return (
    <View className="bg-[#f4f6f8] border border-[#cbd5e1] p-3">
      <View className="flex-row items-center justify-between mb-2">
        <View>
          <Text className="text-xs font-black text-[#1a1a1a] uppercase tracking-wider">
            🎙️ {i18n.t('voice_card_title')}
          </Text>
          <Text className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
            {isRecording
              ? i18n.t('voice_status_recording')
              : voiceUri
              ? `${i18n.t('voice_status_ready')} [${ext}]`
              : i18n.t('voice_status_empty')}
          </Text>
        </View>
        <TouchableOpacity
          onPress={isRecording ? stopRecording : startRecording}
          className={`px-3 py-1.5 active:opacity-90 ${
            isRecording ? 'bg-[#d93850]' : 'bg-[#333333]'
          }`}
        >
          <Text className="text-white text-[10px] font-black uppercase tracking-wider">
            {isRecording
              ? i18n.t('btn_recording_stop')
              : voiceUri
              ? i18n.t('btn_rerecord')
              : i18n.t('btn_record')}
          </Text>
        </TouchableOpacity>
      </View>

      {voiceUri && !isRecording && (
        <View className="mt-3 pt-3 border-t border-[#cbd5e1]">
          <View className="flex-row items-center justify-between bg-white border border-[#cbd5e1] px-3 py-2 mb-3">
            <View className="flex-row items-center gap-2">
              <View
                className={`w-2 h-2 rounded-full ${
                  playerStatus.playing ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
              <Text className="text-xs font-bold text-[#333333] uppercase">
                {playerStatus.playing
                  ? i18n.t('voice_playing')
                  : `${i18n.t('voice_recorded_memo')} (${ext})`}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleTogglePlayback}
              className="bg-[#f4f6f8] border border-[#cccccc] px-3 py-1 active:bg-[#e0e0e0]"
            >
              <Text className="text-[#333333] text-[10px] font-black uppercase tracking-wider">
                {playerStatus.playing ? i18n.t('btn_pause_memo') : i18n.t('btn_play_memo')}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={onSendAudio}
            disabled={isSending}
            className="w-full bg-[#d93850] py-3 flex-row items-center justify-center active:bg-[#b8273d] shadow-sm"
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white text-xs font-black uppercase tracking-widest">
                Transmit Audio To Java Backend ({ext})
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}