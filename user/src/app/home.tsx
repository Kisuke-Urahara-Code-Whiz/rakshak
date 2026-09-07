import { CoordinatesCard } from '@/components/CoordinatesCard';
import { Header } from '@/components/Header';
import { VisualEvidenceCard } from '@/components/VisualEvidenceCard';
import { VoiceMemoCard } from '@/components/VoiceMemoCard';
import { VulnerabilityCard } from '@/components/VulnerabilityCard';
import { useRiskWebSocket } from '@/hooks/useRiskWebSocket';
import { useTelemetry } from '@/hooks/useTelemetry';
import { getFileExtension, uploadMediaEvidence } from '@/services/telemetryApi';
import { useAppStore } from '@/stores/useAppStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {

  useRiskWebSocket();
  
  const {
    phoneNumber,
    location,
    riskScore,
    photoUri,
    setPhotoUri,
    voiceUri,
    setVoiceUri,
    logout,
    hasHydrated,
  } = useAppStore();

  const { locating, fetchFreshCoordinates, handleManualGpsRefresh } = useTelemetry();
  const [isSendingPhoto, setIsSendingPhoto] = useState(false);
  const [isSendingAudio, setIsSendingAudio] = useState(false);

  if (!hasHydrated) return null;
  if (!phoneNumber) return <Redirect href={'/' as any} />;

  const handleExit = async () => {
    try {
      logout();
      await AsyncStorage.clear();
    } catch (e) {
      console.warn('Error purging local storage cache:', e);
    }
  };

  const handleSendPhoto = async () => {
    if (!photoUri) return;
    setIsSendingPhoto(true);
    try {
      const coords = await fetchFreshCoordinates();
      if (!coords) return;
      const ext = getFileExtension(photoUri, 'PNG');
      const res = await uploadMediaEvidence(photoUri, phoneNumber, ext, coords);

      if (res.status < 200 || res.status >= 300) throw new Error(`Upload failed: ${res.status}`);
      setPhotoUri(null);
      Alert.alert('Evidence Transmitted', `Incident file [${ext}] uploaded successfully.`);
    } catch (err: any) {
      Alert.alert('Transmission Failed', err.message || 'Network error.');
    } finally {
      setIsSendingPhoto(false);
    }
  };

  const handleSendAudio = async () => {
    if (!voiceUri) return;
    setIsSendingAudio(true);
    try {
      const coords = await fetchFreshCoordinates();
      if (!coords) return;
      const ext = getFileExtension(voiceUri, 'M4A');
      const res = await uploadMediaEvidence(voiceUri, phoneNumber, ext, coords);

      if (res.status < 200 || res.status >= 300) throw new Error(`Upload failed: ${res.status}`);
      setVoiceUri(null);
      Alert.alert('Voice Memo Dispatched', `Audio telemetry [${ext}] uploaded successfully.`);
    } catch (err: any) {
      Alert.alert('Transmission Failed', err.message || 'Network error.');
    } finally {
      setIsSendingAudio(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#002b53" />
      <Header phoneNumber={phoneNumber} onExit={handleExit} />

      <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 50 }}>
        <VulnerabilityCard riskScore={riskScore} />
        <CoordinatesCard location={location} locating={locating} onRefresh={handleManualGpsRefresh} />

        <View className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <Text className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">
            Hazard Documentation (Field Uploads)
          </Text>
          <VisualEvidenceCard
            photoUri={photoUri}
            onSetPhotoUri={setPhotoUri}
            onSendPhoto={handleSendPhoto}
            isSending={isSendingPhoto}
          />
          <VoiceMemoCard
            voiceUri={voiceUri}
            onSetVoiceUri={setVoiceUri}
            onSendAudio={handleSendAudio}
            isSending={isSendingAudio}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}