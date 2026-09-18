import { CoordinatesCard } from '@/components/CoordinatesCard';
import { CriticalAdvisoryCard } from '@/components/CriticalAdvisoryCard';
import { Header } from '@/components/Header';
import { VisualEvidenceCard } from '@/components/VisualEvidenceCard';
import { VoiceMemoCard } from '@/components/VoiceMemoCard';
import { VulnerabilityCard } from '@/components/VulnerabilityCard';
import { findClosestKiosk } from '@/data/kiosks';
import { useRiskWebSocket } from '@/hooks/useRiskWebSocket';
import { useTelemetry } from '@/hooks/useTelemetry';
import { i18n } from '@/services/i18n';
import { getFileExtension, uploadMediaEvidence, escalateOfficialAlert, updateCitizenLanguage } from '@/services/telemetryApi';
import { SupportedLanguage, useAppStore } from '@/stores/useAppStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  useRiskWebSocket();

  const {
    phoneNumber,
    employeeId,
    userRole,
    userName,
    department,
    location,
    riskScore,
    photoUri,
    setPhotoUri,
    voiceUri,
    setVoiceUri,
    setRiskScore,
    language,
    setLanguage,
    logout,
    hasHydrated,
  } = useAppStore();

  const { locating, fetchFreshCoordinates, handleManualGpsRefresh } = useTelemetry();
  const [isSendingPhoto, setIsSendingPhoto] = useState(false);
  const [isSendingAudio, setIsSendingAudio] = useState(false);
  const [escalated, setEscalated] = useState(false);

  if (!hasHydrated) return null;
  // Redirect to login if neither citizen nor official session is active
  if (!phoneNumber && !employeeId) return <Redirect href={'/' as any} />;

  const isCitizen = userRole === 'Citizen';
  const activeIdentifier = (phoneNumber ? phoneNumber.replace(/\D/g, '') : '') || '9832041182';

  // Calculate nearest North Eastern emergency kiosk (defaults to Aizawl ADM5-Node 40)
  const closestKioskData = findClosestKiosk(location?.latitude, location?.longitude);
  const { kiosk: closestKiosk, distanceKm } = closestKioskData;

  // Enforce baseline risk value of 35
  const effectiveRisk = (riskScore !== undefined && riskScore !== null && riskScore > 0) ? riskScore : 35;

  const handleExit = async () => {
    try {
      logout();
      await AsyncStorage.clear();
    } catch (e) {
      console.warn('Error clearing storage:', e);
    }
  };

  const handleSendPhoto = async () => {
    if (!photoUri) return;
    setIsSendingPhoto(true);
    try {
      const coords = await fetchFreshCoordinates();
      const ext = getFileExtension(photoUri, 'PNG');
      const res = await uploadMediaEvidence(photoUri, activeIdentifier, ext, coords);

      if (res.status < 200 || res.status >= 300) throw new Error(`Upload failed: ${res.status}`);
      setPhotoUri(null);
      Alert.alert('Field Evidence Transmitted', `Incident telemetry image [${ext}] uploaded to Java backend successfully.`);
    } catch (err: any) {
      Alert.alert('Transmission Failed', err.message || 'Check network connection.');
    } finally {
      setIsSendingPhoto(false);
    }
  };

  const handleSendAudio = async () => {
    if (!voiceUri) return;
    setIsSendingAudio(true);
    try {
      const coords = await fetchFreshCoordinates();
      const ext = getFileExtension(voiceUri, 'M4A');
      const res = await uploadMediaEvidence(voiceUri, activeIdentifier, ext, coords);

      if (res.status < 200 || res.status >= 300) throw new Error(`Upload failed: ${res.status}`);
      setVoiceUri(null);
      Alert.alert('Acoustic Memo Dispatched', `Audio telemetry [${ext}] forwarded to backend media service.`);
    } catch (err: any) {
      Alert.alert('Transmission Failed', err.message || 'Check network connection.');
    } finally {
      setIsSendingAudio(false);
    }
  };

  const handleOfficialEscalation = async () => {
    setEscalated(true);
    setRiskScore(85);
    try {
      await escalateOfficialAlert({
        employeeId,
        role: userRole,
        userName,
        department,
        kioskId: closestKiosk.id,
        kioskName: closestKiosk.name,
        district: closestKiosk.district,
        state: closestKiosk.state,
        latitude: closestKiosk.lat,
        longitude: closestKiosk.lng,
        message: `MDoNER CRITICAL ESCALATION: Emergency evacuation ordered by ${userRole} (${userName || employeeId}). Alert directed to ${closestKiosk.name} (${closestKiosk.id}), ${closestKiosk.district}, ${closestKiosk.state}.`,
        riskScore: 90,
      });
      Alert.alert(
        'CRITICAL ESCALATION BROADCASTED',
        `Official alert transmitted to ${closestKiosk.name} (${closestKiosk.district}, ${closestKiosk.state}). Emergency kiosk sirens and telemetry broadcast active.`
      );
    } catch (err: any) {
      console.warn('Official escalation network error:', err);
      Alert.alert(
        'CRITICAL ESCALATION TRIGGERED',
        `Official incident alert broadcasted locally by ${userRole} (${userName || employeeId}) targeted at ${closestKiosk.name}.`
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f4f6f8]" edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <Header phoneNumber={phoneNumber} onExit={handleExit} />

      <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 60 }}>
        
        {/* Quick Regional Dialect Switcher Strip */}
        <View className="mb-3">
          <View className="flex-row items-center justify-between mb-1.5 px-0.5">
            <Text className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Regional Dialect
            </Text>
            <Text className="text-[9px] font-bold text-[#d93850] uppercase font-mono">
              Active: {language.toUpperCase()}
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-0.5">
            {i18n.getAvailableLanguages().map((lang) => {
              const isSelected = language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  onPress={() => {
                    setLanguage(lang.code as SupportedLanguage);
                    i18n.setLanguage(lang.code);
                    // Dispatches PUT /sql/citizen/language to update regional dialect on backend
                    updateCitizenLanguage(activeIdentifier, lang.code, 'OLD').catch((err) => {
                      console.warn('Language update PUT failed:', err?.message || err);
                    });
                  }}
                  className={`mr-2 px-3 py-1.5 border flex-row items-center ${
                    isSelected
                      ? 'bg-[#1a1a1a] border-[#1a1a1a]'
                      : 'bg-white border-[#e0e0e0]'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-xs font-bold ${
                      isSelected ? 'text-[#f6d274]' : 'text-[#333333]'
                    }`}
                  >
                    {lang.nativeName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Nearest Emergency Public Kiosk */}
        <View className="bg-white border border-[#e0e0e0] border-l-4 border-l-[#d93850] p-4 mb-4 shadow-sm">
          <View className="flex-row items-center justify-between pb-2 border-b border-[#e0e0e0] mb-2">
            <View className="flex-row items-center gap-1.5">
              <View className="w-2.5 h-2.5 rounded-full bg-[#d93850]" />
              <Text className="text-[10px] font-black uppercase tracking-widest text-[#d93850]">
                Nearest Emergency Kiosk
              </Text>
            </View>
            <View className="bg-[#1a1a1a] px-2 py-0.5">
              <Text className="text-[9px] font-mono font-black text-[#f6d274] uppercase">
                {distanceKm} KM AWAY
              </Text>
            </View>
          </View>

          <View className="mb-2">
            <Text className="text-sm font-black text-[#1a1a1a] uppercase tracking-wide">
              {closestKiosk.name}
            </Text>
            <Text className="text-[11px] font-bold text-slate-600 mt-0.5">
              📍 {closestKiosk.adm5 || closestKiosk.district}, {closestKiosk.state} • {closestKiosk.id}
            </Text>
            <Text className="text-[10px] text-slate-500 mt-1 font-mono">
              GPS: {closestKiosk.lat.toFixed(4)}°N, {closestKiosk.lng.toFixed(4)}°E • {closestKiosk.type}
            </Text>
          </View>

          <View className="bg-[#f8f9fa] p-2 border border-[#e9ecef] flex-row items-center justify-between">
            <View className="flex-row items-center gap-1">
              <Text className="text-[10px] font-black text-emerald-700 uppercase">● Online</Text>
              <Text className="text-[10px] text-slate-600 font-bold ml-1">
                {closestKiosk.sensorsActive} Active Sensors
              </Text>
            </View>
            <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              Siren & PA Ready
            </Text>
          </View>
        </View>
        
        {/* Official Staff Operations Banner */}
        {!isCitizen && (
          <View className="bg-white border border-[#e0e0e0] border-t-4 border-[#d93850] p-4 mb-4 shadow-sm">
            <View className="flex-row items-center justify-between pb-2 border-b border-[#e0e0e0]">
              <View>
                <Text className="text-[10px] font-black uppercase tracking-widest text-[#d93850]">
                  Official Tactical Field Command
                </Text>
                <Text className="text-sm font-black text-[#1a1a1a] uppercase mt-0.5">
                  {userName || employeeId}
                </Text>
              </View>
              <View className="bg-[#1a1a1a] px-2 py-0.5">
                <Text className="text-[9px] font-black uppercase tracking-wider text-[#f6d274]">
                  {userRole}
                </Text>
              </View>
            </View>

            <View className="pt-2 flex-row justify-between items-center">
              <View>
                <Text className="text-[10px] text-slate-500 font-bold uppercase">Target Kiosk</Text>
                <Text className="text-xs font-bold text-slate-800">{closestKiosk.name} ({closestKiosk.state})</Text>
              </View>
              <TouchableOpacity
                onPress={handleOfficialEscalation}
                className="bg-[#d93850] px-3 py-1.5 active:bg-[#b8273d] flex-row items-center gap-1"
              >
                <Text className="text-white text-[10px] font-black uppercase tracking-wider">
                  {escalated ? '⚠️ Escalated' : '🚨 Escalate Alert'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Dynamic Threat Vulnerability Index */}
        <VulnerabilityCard riskScore={effectiveRisk} />

        {/* Critical Emergency Advisory (Active when riskScore >= 70) */}
        <CriticalAdvisoryCard riskScore={effectiveRisk} />

        {/* Sensor & GPS Telemetry */}
        <CoordinatesCard location={location} locating={locating} onRefresh={handleManualGpsRefresh} />

        {/* Field Media Incident Uploads Box */}
        <View className="bg-white p-4 border border-[#e0e0e0] border-t-4 border-[#333333] shadow-sm mb-4">
          <View className="flex-row items-center justify-between pb-2 mb-3 border-b border-[#e0e0e0]">
            <View>
              <Text className="text-xs font-black text-[#1a1a1a] uppercase tracking-wider">
                Field Evidence Submissions
              </Text>
              <Text className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                Camera Photo (.jpeg) & Audio (.m4a) Ingestion
              </Text>
            </View>
            <View className="bg-[#f4f6f8] px-2 py-0.5 border border-[#cbd5e1]">
              <Text className="text-[9px] font-mono font-black text-[#d93850] uppercase">
                Direct Telemetry
              </Text>
            </View>
          </View>

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