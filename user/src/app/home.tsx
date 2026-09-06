import { useAppStore } from '@/stores/useAppStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AudioModule,
  RecordingPresets,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
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

const API_HOST = 'https://7706-152-58-181-7.ngrok-free.app';

function getFormattedDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const date = `${year}-${month}-${day}`;

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const time = `${hours}:${minutes}:${seconds}`;

  const lastUpdatedAt = `${date} ${time}`;

  return { date, time, lastUpdatedAt };
}

function getFileExtension(uri: string | null, defaultExt: string): string {
  if (!uri) return defaultExt.toUpperCase();
  const parts = uri.split('.');
  if (parts.length > 1) {
    const ext = parts.pop()?.split('?')[0]?.split('#')[0];
    if (ext && ext.length <= 5) {
      return ext.toUpperCase();
    }
  }
  return defaultExt.toUpperCase();
}

function getMimeType(extension: string): string {
  switch (extension.toUpperCase()) {
    case 'PNG':
      return 'image/png';
    case 'JPG':
    case 'JPEG':
      return 'image/jpeg';
    case 'MP4':
      return 'video/mp4';
    case 'M4A':
      return 'audio/m4a';
    case 'AAC':
      return 'audio/aac';
    case 'MP3':
      return 'audio/mpeg';
    case 'WAV':
      return 'audio/wav';
    default:
      return 'application/octet-stream';
  }
}

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

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);

  const player = useAudioPlayer(voiceUri);
  const playerStatus = useAudioPlayerStatus(player);

  const [isSendingPhoto, setIsSendingPhoto] = useState(false);
  const [isSendingAudio, setIsSendingAudio] = useState(false);

  async function fetchFreshCoordinates(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'GPS access is required for real-time risk assessment.');
        return null;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: Number(loc.coords.latitude.toFixed(6)),
        longitude: Number(loc.coords.longitude.toFixed(6)),
      };

      setLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: loc.coords.accuracy,
      });

      return coords;
    } catch {
      Alert.alert('GPS Error', 'Failed to acquire fresh spatial fix.');
      return null;
    }
  }

  async function sendHeartbeatTelemetry() {
    if (!phoneNumber) return;
    const coords = await fetchFreshCoordinates();
    if (!coords) return;

    try {
      const { lastUpdatedAt } = getFormattedDateTime();
      const payload = {
        number: Number(phoneNumber),
        lat: coords.latitude,
        lon: coords.longitude,
        lastUpdatedAt: lastUpdatedAt,
      };

      await fetch(`${API_HOST}/sql/enter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn('Periodic telemetry ping failed:', e);
    }
  }

  useEffect(() => {
    if (!location) {
      fetchFreshCoordinates();
    }

    const intervalTimer = setInterval(() => {
      sendHeartbeatTelemetry();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalTimer);
  }, [phoneNumber]);

  if (!hasHydrated) return null;
  if (!phoneNumber) return <Redirect href={'/' as any} />;

  async function handleExit() {
    try {
      logout();
      await AsyncStorage.clear();
    } catch (e) {
      console.warn('Error purging local storage cache:', e);
    }
  }

  async function handleManualGpsRefresh() {
    setLocating(true);
    await fetchFreshCoordinates();
    setLocating(false);
  }

  async function handleCapturePhoto() {
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
      setPhotoUri(result.assets[0].uri);
    }
  }

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

  async function handleSendPhoto() {
    if (!photoUri) return;
    setIsSendingPhoto(true);

    try {
      const coords = await fetchFreshCoordinates();
      if (!coords) {
        setIsSendingPhoto(false);
        return;
      }

      const { date, time } = getFormattedDateTime();
      const detectedExt = getFileExtension(photoUri, 'PNG');
      const mimeType = getMimeType(detectedExt);

      const response = await FileSystem.uploadAsync(
        `${API_HOST}/media/upload`,
        photoUri,
        {
          fieldName: 'file',
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          mimeType: mimeType,
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
          parameters: {
            number: String(phoneNumber),
            fileType: detectedExt,
            date: date,
            lat: String(coords.latitude),
            lon: String(coords.longitude),
            time: time,
          },
        }
      );

      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      setPhotoUri(null);
      Alert.alert(
        'Evidence Transmitted',
        `Incident file [${detectedExt}] uploaded successfully to /media/upload.`
      );
    } catch (err: any) {
      Alert.alert('Transmission Failed', err.message || 'Network error encountered during upload.');
    } finally {
      setIsSendingPhoto(false);
    }
  }

  async function handleSendAudio() {
    if (!voiceUri) return;
    setIsSendingAudio(true);

    if (playerStatus.playing) {
      player.pause();
    }

    try {
      const coords = await fetchFreshCoordinates();
      if (!coords) {
        setIsSendingAudio(false);
        return;
      }

      const { date, time } = getFormattedDateTime();
      const detectedExt = getFileExtension(voiceUri, 'M4A');
      const mimeType = getMimeType(detectedExt);

      const response = await FileSystem.uploadAsync(
        `${API_HOST}/media/upload`,
        voiceUri,
        {
          fieldName: 'file',
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          mimeType: mimeType,
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
          parameters: {
            number: String(phoneNumber),
            fileType: detectedExt,
            date: date,
            lat: String(coords.latitude),
            lon: String(coords.longitude),
            time: time,
          },
        }
      );

      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      setVoiceUri(null);
      Alert.alert(
        'Voice Memo Dispatched',
        `Audio telemetry [${detectedExt}] uploaded successfully to /media/upload.`
      );
    } catch (err: any) {
      Alert.alert('Transmission Failed', err.message || 'Network error encountered during upload.');
    } finally {
      setIsSendingAudio(false);
    }
  }

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
            onPress={handleExit}
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
              onPress={handleManualGpsRefresh}
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

          {/* Visual Evidence Section */}
          <View className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <View>
                <Text className="text-xs font-bold text-slate-800">Visual Evidence</Text>
                <Text className="text-[11px] text-slate-500">
                  {photoUri ? `Asset attached [${getFileExtension(photoUri, 'PNG')}]` : 'No field snapshot captured'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleCapturePhoto}
                className="bg-[#002b53] px-3.5 py-1.5 rounded active:opacity-80"
              >
                <Text className="text-white text-xs font-semibold">
                  {photoUri ? 'Retake Media' : 'Open Camera'}
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
                      Transmit Visual Evidence ({getFileExtension(photoUri, 'PNG')})
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
                    ? `Audio ready [${getFileExtension(voiceUri, 'M4A')}]`
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
                <View className="flex-row items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2 mb-3">
                  <View className="flex-row items-center gap-2">
                    <View
                      className={`w-2.5 h-2.5 rounded-full ${
                        playerStatus.playing ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                    <Text className="text-xs font-medium text-slate-700">
                      {playerStatus.playing ? 'Playing memo...' : `Recorded Memo (${getFileExtension(voiceUri, 'M4A')})`}
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

                <TouchableOpacity
                  onPress={handleSendAudio}
                  disabled={isSendingAudio}
                  className="w-full bg-[#003366] py-2.5 rounded-lg flex-row items-center justify-center active:opacity-90 shadow-sm"
                >
                  {isSendingAudio ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-white text-xs font-bold uppercase tracking-wider">
                      Transmit Voice Memo ({getFileExtension(voiceUri, 'M4A')})
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