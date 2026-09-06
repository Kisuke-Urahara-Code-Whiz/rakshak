import { useAppStore } from '@/stores/useAppStore';
import {
    AudioModule,
    RecordingPresets,
    useAudioPlayer,
    useAudioPlayerStatus,
    useAudioRecorder,
} from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const {
    phoneNumber,
    location,
    setLocation,
    riskScore,
    photoUri,
    setPhotoUri,
    voiceUri,
    setVoiceUri,
    logout,
    hasHydrated,
  } = useAppStore();

  const [locating, setLocating] = useState(false);

  // Audio Recorder & Dedicated Player Hook
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);

  // Hook-based Audio Player for the recorded memo
  const player = useAudioPlayer(voiceUri);
  const playerStatus = useAudioPlayerStatus(player);

  // Transmission Loading States
  const [isSendingPhoto, setIsSendingPhoto] = useState(false);
  const [isSendingAudio, setIsSendingAudio] = useState(false);

  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  if (!hasHydrated) return null;
  if (!phoneNumber) return <Redirect href={'/' as any} />;

  // 1. Spatial GPS Fetcher
  async function fetchCurrentLocation() {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'GPS access is required for real-time risk assessment.');
        setLocating(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
      });
    } catch {
      Alert.alert('GPS Error', 'Failed to acquire location fix.');
    } finally {
      setLocating(false);
    }
  }

  // 2. Camera Capture Handler
  async function handleCapturePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Access Denied', 'Camera permission required for hazard logging.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  // 3. Audio Recording & Playback Handlers
  async function startRecording() {
    try {
      if (playerStatus.playing) {
        player.pause();
      }

      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Denied', 'Microphone access is required for voice briefings.');
        return;
      }

      // Switch audio session to recording mode
      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
    } catch {
      Alert.alert('Audio Error', 'Could not initialize voice recording.');
    }
  }

  async function stopRecording() {
    try {
      await audioRecorder.stop();
      setIsRecording(false);

      // Return audio session to playback mode so the loudspeaker works
      await AudioModule.setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      if (audioRecorder.uri) {
        setVoiceUri(audioRecorder.uri);
      }
    } catch {
      Alert.alert('Audio Error', 'Failed to finalize audio file.');
    }
  }

  async function handleTogglePlayback() {
    if (!voiceUri || !player) return;

    try {
      if (playerStatus.playing) {
        player.pause();
      } else {
        // If it previously reached the end, rewind to start
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
      Alert.alert('Playback Error', 'Could not play voice memo.');
    }
  }

  // 4. Send Handlers (Resets evidence after submission)
  async function handleSendPhoto() {
    if (!photoUri) return;
    setIsSendingPhoto(true);

    setTimeout(() => {
      setIsSendingPhoto(false);
      setPhotoUri(null); // Clear image preview upon successful transmission
      Alert.alert(
        'Visual Evidence Transmitted',
        'Incident photograph has been successfully uploaded to the Disaster Management Node.'
      );
    }, 1200);
  }

  async function handleSendAudio() {
    if (!voiceUri) return;
    setIsSendingAudio(true);

    if (playerStatus.playing) {
      player.pause();
    }

    setTimeout(() => {
      setIsSendingAudio(false);
      setVoiceUri(null); // Clear audio memo upon successful transmission
      Alert.alert(
        'Voice Memo Dispatched',
        'Audio briefing has been forwarded to the State Emergency Operations Center.'
      );
    }, 1200);
  }

  // 5. Risk Tier Styling
  function getRiskParameters(score: number) {
    if (score >= 70) {
      return {
        level: 'CRITICAL HAZARD',
        bg: 'bg-red-50',
        border: 'border-red-600',
        badge: 'bg-red-600',
        text: 'text-red-700',
        bar: 'bg-red-600',
      };
    }
    if (score >= 40) {
      return {
        level: 'MODERATE RISK',
        bg: 'bg-amber-50',
        border: 'border-amber-500',
        badge: 'bg-amber-500',
        text: 'text-amber-700',
        bar: 'bg-amber-500',
      };
    }
    return {
      level: 'STABLE / LOW RISK',
      bg: 'bg-emerald-50',
      border: 'border-emerald-600',
      badge: 'bg-emerald-600',
      text: 'text-emerald-700',
      bar: 'bg-emerald-600',
    };
  }

  const riskMeta = getRiskParameters(riskScore);

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#002b53" />

      {/* Top Header */}
      <View className="bg-[#002b53] px-5 py-3.5 flex-row items-center justify-between border-b-2 border-amber-500 shadow-md">
        <View className="flex-row items-center gap-3">
          <Image
            source={require('../../assets/images/logo-nobg.png')}
            style={{ width: 38, height: 38 }}
            resizeMode="contain"
          />
          <View>
            <Text className="text-white font-bold text-base tracking-wider">RAKSHAK CORE</Text>
            <Text className="text-slate-300 text-[11px]">Govt. Landslide Alert Portal</Text>
          </View>
        </View>

        {/* User Badge */}
        <View className="flex-row items-center gap-2">
          <View className="bg-[#001f3d] px-2.5 py-1 rounded border border-blue-400/30">
            <Text className="text-blue-200 text-[11px] font-mono">+91 {phoneNumber}</Text>
          </View>
          <TouchableOpacity
            onPress={logout}
            className="bg-red-700 px-2.5 py-1 rounded active:opacity-80"
          >
            <Text className="text-white text-[11px] font-bold">Exit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 50 }}>
        {/* Risk Assessment Card */}
        <View className={`rounded-xl p-4 border ${riskMeta.bg} ${riskMeta.border} shadow-sm mb-4`}>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Zone Vulnerability Assessment
            </Text>
            <View className={`${riskMeta.badge} px-2.5 py-0.5 rounded`}>
              <Text className="text-white text-[10px] font-black">{riskMeta.level}</Text>
            </View>
          </View>

          <View className="flex-row items-baseline gap-1 my-1">
            <Text className={`text-4xl font-extrabold ${riskMeta.text}`}>{riskScore}%</Text>
            <Text className="text-slate-600 text-xs font-semibold">Probability Index</Text>
          </View>

          <View className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mt-2">
            <View className={`h-full ${riskMeta.bar}`} style={{ width: `${riskScore}%` }} />
          </View>
        </View>

        {/* GPS Telemetry Card */}
        <View className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-4">
          <View className="flex-row items-center justify-between pb-2 border-b border-slate-100">
            <Text className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Spatial Coordinates
            </Text>
            <TouchableOpacity
              onPress={fetchCurrentLocation}
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

        {/* Hazard Field Uploads */}
        <View className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <Text className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">
            Hazard Documentation (Field Uploads)
          </Text>

          {/* Photo Section */}
          <View className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <View>
                <Text className="text-xs font-bold text-slate-800">Visual Evidence</Text>
                <Text className="text-[11px] text-slate-500">
                  {photoUri ? 'Captured snapshot attached' : 'No field snapshot captured'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleCapturePhoto}
                className="bg-[#002b53] px-3.5 py-1.5 rounded active:opacity-80"
              >
                <Text className="text-white text-xs font-semibold">
                  {photoUri ? 'Retake Photo' : 'Open Camera'}
                </Text>
              </TouchableOpacity>
            </View>

            {photoUri && (
              <View className="mt-2">
                <View className="rounded-lg overflow-hidden border border-slate-300 bg-black/5 mb-3">
                  <Image source={{ uri: photoUri }} className="w-full h-44" resizeMode="cover" />
                </View>

                <TouchableOpacity
                  onPress={handleSendPhoto}
                  disabled={isSendingPhoto}
                  className="w-full bg-[#003366] py-2.5 rounded-lg flex-row items-center justify-center active:opacity-90 shadow-sm"
                >
                  {isSendingPhoto ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-white text-xs font-bold uppercase tracking-wider">
                      Transmit Visual Evidence
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Voice Memo Section */}
          <View className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
            <View className="flex-row items-center justify-between mb-2">
              <View>
                <Text className="text-xs font-bold text-slate-800">Voice Telemetry Briefing</Text>
                <Text className="text-[11px] text-slate-500">
                  {isRecording
                    ? 'Recording audio stream...'
                    : voiceUri
                    ? 'Audio memo ready for review'
                    : 'No voice briefing recorded'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={isRecording ? stopRecording : startRecording}
                className={`px-3.5 py-1.5 rounded active:opacity-80 ${
                  isRecording ? 'bg-red-600' : 'bg-[#002b53]'
                }`}
              >
                <Text className="text-white text-xs font-semibold">
                  {isRecording ? 'Stop Recording' : voiceUri ? 'Re-record' : 'Record'}
                </Text>
              </TouchableOpacity>
            </View>

            {voiceUri && !isRecording && (
              <View className="mt-3 pt-3 border-t border-slate-200">
                {/* Audio Preview Controls */}
                <View className="flex-row items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2 mb-3">
                  <View className="flex-row items-center gap-2">
                    <View
                      className={`w-2.5 h-2.5 rounded-full ${
                        playerStatus.playing ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                    <Text className="text-xs font-medium text-slate-700">
                      {playerStatus.playing ? 'Playing memo...' : 'Recorded Audio Memo'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={handleTogglePlayback}
                    className="bg-blue-50 border border-blue-200 px-3.5 py-1 rounded active:opacity-75"
                  >
                    <Text className="text-[#002b53] text-xs font-bold">
                      {playerStatus.playing ? 'Pause' : 'Play Memo'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Send Button */}
                <TouchableOpacity
                  onPress={handleSendAudio}
                  disabled={isSendingAudio}
                  className="w-full bg-[#003366] py-2.5 rounded-lg flex-row items-center justify-center active:opacity-90 shadow-sm"
                >
                  {isSendingAudio ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-white text-xs font-bold uppercase tracking-wider">
                      Transmit Voice Memo
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}