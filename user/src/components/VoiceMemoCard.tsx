import { getFileExtension } from '@/services/telemetryApi';
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

export function VoiceMemoCard({ voiceUri, onSetVoiceUri, onSendAudio, isSending }: VoiceMemoCardProps) {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const player = useAudioPlayer(voiceUri);
  const playerStatus = useAudioPlayerStatus(player);

  const startRecording = async () => {
    try {
      if (playerStatus.playing) player.pause();
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Denied', 'Microphone access is required for voice briefings.');
        return;
      }
      await AudioModule.setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
    } catch {
      Alert.alert('Audio Error', 'Could not initialize voice recording.');
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      setIsRecording(false);
      await AudioModule.setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      if (audioRecorder.uri) onSetVoiceUri(audioRecorder.uri);
    } catch {
      Alert.alert('Audio Error', 'Failed to finalize audio file.');
    }
  };

  const handleTogglePlayback = () => {
    if (!voiceUri || !player) return;
    try {
      if (playerStatus.playing) {
        player.pause();
      } else {
        if (playerStatus.currentTime && playerStatus.duration && playerStatus.currentTime >= playerStatus.duration) {
          player.seekTo(0);
        }
        player.play();
      }
    } catch {
      Alert.alert('Playback Error', 'Could not play voice memo.');
    }
  };

  const ext = getFileExtension(voiceUri, 'M4A');

  return (
    <View className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
      <View className="flex-row items-center justify-between mb-2">
        <View>
          <Text className="text-xs font-bold text-slate-800">Voice Telemetry Briefing</Text>
          <Text className="text-[11px] text-slate-500">
            {isRecording ? 'Recording audio stream...' : voiceUri ? `Audio ready [${ext}]` : 'No voice briefing recorded'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={isRecording ? stopRecording : startRecording}
          className={`px-3.5 py-1.5 rounded active:opacity-80 ${isRecording ? 'bg-red-600' : 'bg-[#002b53]'}`}
        >
          <Text className="text-white text-xs font-semibold">
            {isRecording ? 'Stop Recording' : voiceUri ? 'Re-record' : 'Record'}
          </Text>
        </TouchableOpacity>
      </View>

      {voiceUri && !isRecording && (
        <View className="mt-3 pt-3 border-t border-slate-200">
          <View className="flex-row items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2 mb-3">
            <View className="flex-row items-center gap-2">
              <View className={`w-2.5 h-2.5 rounded-full ${playerStatus.playing ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <Text className="text-xs font-medium text-slate-700">
                {playerStatus.playing ? 'Playing memo...' : `Recorded Memo (${ext})`}
              </Text>
            </View>
            <TouchableOpacity onPress={handleTogglePlayback} className="bg-blue-50 border border-blue-200 px-3.5 py-1 rounded active:opacity-75">
              <Text className="text-[#002b53] text-xs font-bold">{playerStatus.playing ? 'Pause' : 'Play Memo'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={onSendAudio}
            disabled={isSending}
            className="w-full bg-[#003366] py-2.5 rounded-lg flex-row items-center justify-center active:opacity-90 shadow-sm"
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white text-xs font-bold uppercase tracking-wider">Transmit Voice Memo ({ext})</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}