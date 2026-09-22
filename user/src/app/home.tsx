import { CoordinatesCard } from '@/components/CoordinatesCard';
import { CriticalAdvisoryCard } from '@/components/CriticalAdvisoryCard';
import { Header } from '@/components/Header';
import { QuestionnaireData, QuestionnaireModal } from '@/components/QuestionnaireModal';
import { StationsViewCard } from '@/components/StationsViewCard';
import { UserUploadsModal } from '@/components/UserUploadsModal';
import { VisualEvidenceCard } from '@/components/VisualEvidenceCard';
import { VoiceMemoCard } from '@/components/VoiceMemoCard';
import { VulnerabilityCard } from '@/components/VulnerabilityCard';
import { findClosestKiosk, UNAKOTI_NODE_85 } from '@/data/kiosks';
import { useRiskWebSocket } from '@/hooks/useRiskWebSocket';
import { useTelemetry } from '@/hooks/useTelemetry';
import { i18n } from '@/services/i18n';
import {
  escalateOfficialAlert,
  getFileExtension,
  updateCitizenLanguage,
  uploadMediaEvidence,
} from '@/services/telemetryApi';
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

  // Questionnaire & Uploads Modals State
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [pendingMediaType, setPendingMediaType] = useState<'photo' | 'audio' | null>(null);
  const [showUploadsModal, setShowUploadsModal] = useState(false);

  if (!hasHydrated) return null;
  // Redirect to login if neither citizen nor official session is active
  if (!phoneNumber && !employeeId) return <Redirect href={'/' as any} />;

  const isCitizen = userRole === 'Citizen';
  const isMdoner = userRole === 'MDoNER Employee';
  const isZonalOrDistrict = userRole === 'Zonal Admin' || userRole === 'District Admin';
  const activeIdentifier = (phoneNumber ? phoneNumber.replace(/\D/g, '') : '') || '9832041182';

  // Calculate nearest emergency kiosk for citizens
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

  // Step 1: Open Questionnaire when transmitting Photo
  const handleTriggerPhotoUpload = () => {
    if (!photoUri) return;
    setPendingMediaType('photo');
    setShowQuestionnaire(true);
  };

  // Step 1: Open Questionnaire when transmitting Audio
  const handleTriggerAudioUpload = () => {
    if (!voiceUri) return;
    setPendingMediaType('audio');
    setShowQuestionnaire(true);
  };

  // Step 2: Handle Questionnaire Submission & Ingestion with 5 Questions
  const handleQuestionnaireSubmit = async (questionnaire: QuestionnaireData) => {
    setShowQuestionnaire(false);

    if (pendingMediaType === 'photo' && photoUri) {
      setIsSendingPhoto(true);
      try {
        const coords = await fetchFreshCoordinates();
        const ext = getFileExtension(photoUri, 'PNG');
        const res = await uploadMediaEvidence(photoUri, activeIdentifier, ext, coords, questionnaire);

        if (res.status < 200 || res.status >= 300) throw new Error(`Upload failed: ${res.status}`);
        setPhotoUri(null);
        Alert.alert(
          'Evidence Transmitted',
          `Field photo [${ext}] and 5-point ground triage questionnaire dispatched successfully to backend command.`
        );
      } catch (err: any) {
        Alert.alert('Transmission Failed', err.message || 'Check network connection.');
      } finally {
        setIsSendingPhoto(false);
        setPendingMediaType(null);
      }
    } else if (pendingMediaType === 'audio' && voiceUri) {
      setIsSendingAudio(true);
      try {
        const coords = await fetchFreshCoordinates();
        const ext = getFileExtension(voiceUri, 'M4A');
        const res = await uploadMediaEvidence(voiceUri, activeIdentifier, ext, coords, questionnaire);

        if (res.status < 200 || res.status >= 300) throw new Error(`Upload failed: ${res.status}`);
        setVoiceUri(null);
        Alert.alert(
          'Acoustic Memo Dispatched',
          `Voice memo [${ext}] and 5-point ground assessment dispatched to backend command.`
        );
      } catch (err: any) {
        Alert.alert('Transmission Failed', err.message || 'Check network connection.');
      } finally {
        setIsSendingAudio(false);
        setPendingMediaType(null);
      }
    }
  };

  const handleOfficialEscalation = async () => {
    setEscalated(true);
    setRiskScore(85);
    // MDoNER targets Unakoti ADM5-Node 85 by default
    const targetKiosk = isMdoner ? UNAKOTI_NODE_85 : closestKiosk;

    try {
      await escalateOfficialAlert({
        employeeId,
        role: userRole,
        userName,
        department,
        kioskId: targetKiosk.id,
        kioskName: targetKiosk.name,
        district: targetKiosk.district,
        state: targetKiosk.state,
        latitude: targetKiosk.lat,
        longitude: targetKiosk.lng,
        message: `MDoNER CRITICAL ESCALATION: Emergency evacuation ordered by ${userRole} (${userName || employeeId}). Alert directed to ${targetKiosk.name} (${targetKiosk.id}), ${targetKiosk.district}, ${targetKiosk.state}.`,
        riskScore: 90,
      });
      Alert.alert(
        'CRITICAL ESCALATION BROADCASTED',
        `Official alert transmitted to ${targetKiosk.name} (${targetKiosk.district}, ${targetKiosk.state}). Emergency kiosk sirens and telemetry broadcast active.`
      );
    } catch (err: any) {
      console.warn('Official escalation network error:', err);
      Alert.alert(
        'CRITICAL ESCALATION TRIGGERED',
        `Official incident alert broadcasted locally by ${userRole} (${userName || employeeId}) targeted at ${targetKiosk.name}.`
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

        {/* ========================================================================= */}
        {/* ROLE-BASED NODE DISPLAY                                                    */}
        {/* ========================================================================= */}

        {/* 1. CITIZEN NODE DISPLAY: Closest Kiosk to their location + My Uploads */}
        {isCitizen && (
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

            <View className="bg-[#f8f9fa] p-2 border border-[#e9ecef] flex-row items-center justify-between mb-3">
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

            {/* Button for Citizens to View Only Their Own Past Uploads */}
            <TouchableOpacity
              onPress={() => setShowUploadsModal(true)}
              className="bg-[#1a1a1a] py-2.5 px-3 flex-row items-center justify-center gap-2 active:bg-[#333333]"
            >
              <Text className="text-xs">📁</Text>
              <Text className="text-white text-xs font-black uppercase tracking-wider">
                View My Incident Submissions
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 2. MDONER EMPLOYEE: Assigned Working Node Unakoti ADM5-Node 85 + Escalate Alert */}
        {isMdoner && (
          <View className="bg-white border border-[#e0e0e0] border-t-4 border-[#d93850] p-4 mb-4 shadow-sm">
            <View className="flex-row items-center justify-between pb-2 border-b border-[#e0e0e0]">
              <View>
                <Text className="text-[10px] font-black uppercase tracking-widest text-[#d93850]">
                  Assigned Operational Command Node
                </Text>
                <Text className="text-sm font-black text-[#1a1a1a] uppercase mt-0.5">
                  {userName || employeeId}
                </Text>
              </View>
              <View className="bg-[#1a1a1a] px-2 py-0.5">
                <Text className="text-[9px] font-black uppercase tracking-wider text-[#f6d274]">
                  MDoNER Official
                </Text>
              </View>
            </View>

            <View className="py-2.5">
              <Text className="text-sm font-black text-slate-900 uppercase">
                {UNAKOTI_NODE_85.name}
              </Text>
              <Text className="text-[11px] font-bold text-slate-600 mt-0.5">
                📍 {UNAKOTI_NODE_85.district}, {UNAKOTI_NODE_85.state} • {UNAKOTI_NODE_85.id}
              </Text>
              <Text className="text-[10px] font-mono text-slate-500 mt-0.5">
                GPS: {UNAKOTI_NODE_85.lat}°N, {UNAKOTI_NODE_85.lng}°E • {UNAKOTI_NODE_85.type}
              </Text>
            </View>

            <View className="pt-2 border-t border-[#f1f5f9] flex-row justify-between items-center">
              <View>
                <Text className="text-[10px] text-slate-500 font-bold uppercase">Status</Text>
                <Text className="text-xs font-bold text-emerald-700">● {UNAKOTI_NODE_85.status} ({UNAKOTI_NODE_85.sensorsActive} Sensors)</Text>
              </View>
              <TouchableOpacity
                onPress={handleOfficialEscalation}
                className="bg-[#d93850] px-3.5 py-2 active:bg-[#b8273d] flex-row items-center gap-1.5 shadow"
              >
                <Text className="text-white text-xs font-black uppercase tracking-wider">
                  {escalated ? '⚠️ Escalated' : '🚨 Escalate Alert'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 3. DISTRICT ADMIN & ZONAL OFFICER: Stations & Telemetry View Card */}
        {isZonalOrDistrict && (
          <StationsViewCard
            userRole={userRole}
            userDistrict={department}
          />
        )}

        {/* Dynamic Threat Vulnerability Index */}
        <VulnerabilityCard riskScore={effectiveRisk} />

        {/* Critical Emergency Advisory (Active when riskScore >= 85) */}
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
                5-Point Ground Questionnaire Ingestion
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
            onSendPhoto={handleTriggerPhotoUpload}
            isSending={isSendingPhoto}
          />

          <VoiceMemoCard
            voiceUri={voiceUri}
            onSetVoiceUri={setVoiceUri}
            onSendAudio={handleTriggerAudioUpload}
            isSending={isSendingAudio}
          />
        </View>
      </ScrollView>

      {/* 5-Question Ground Triage Questionnaire Modal */}
      <QuestionnaireModal
        visible={showQuestionnaire}
        mediaType={pendingMediaType || 'photo'}
        onClose={() => {
          setShowQuestionnaire(false);
          setPendingMediaType(null);
        }}
        onSubmit={handleQuestionnaireSubmit}
      />

      {/* Citizen Personal Uploads Modal */}
      <UserUploadsModal
        visible={showUploadsModal}
        phoneNumber={activeIdentifier}
        onClose={() => setShowUploadsModal(false)}
      />
    </SafeAreaView>
  );
}