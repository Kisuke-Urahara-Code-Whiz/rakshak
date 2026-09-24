import { i18n } from '@/services/i18n';
import { getFormattedDateTime, loginAuth, sendHeartbeat } from '@/services/telemetryApi';
import { SupportedLanguage, UserRole, useAppStore } from '@/stores/useAppStore';
import * as Location from 'expo-location';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const ROLES: UserRole[] = ['Citizen', 'MDoNER Employee', 'Zonal Admin', 'District Admin'];

export default function LoginScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('Citizen');
  const [phoneInput, setPhoneInput] = useState('9832041182');
  const [employeeIdInput, setEmployeeIdInput] = useState('EMP-NER-001');
  const [passwordInput, setPasswordInput] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    phoneNumber,
    employeeId,
    userRole,
    setPhoneNumber,
    setSession,
    setLocation,
    hasHydrated,
    language,
    setLanguage,
    isLanguageConfigured,
    setIsLanguageConfigured,
  } = useAppStore();

  i18n.setLanguage(language);

  if (!hasHydrated) return null;
  // If already authenticated with active credentials
  if ((phoneNumber || employeeId) && isLanguageConfigured) {
    return <Redirect href={'/home' as any} />;
  }

  const handleRoleChange = (r: UserRole) => {
    setSelectedRole(r);
    setErrorMsg('');
    if (r === 'MDoNER Employee') setEmployeeIdInput('EMP-NER-001');
    else if (r === 'Zonal Admin') setEmployeeIdInput('ZONAL-SK-01');
    else if (r === 'District Admin') setEmployeeIdInput('DIST-SK-NORTH');
  };

  const handleLogin = async () => {
    setErrorMsg('');
    const isCitizen = selectedRole === 'Citizen';
    const identifier = isCitizen ? phoneInput.trim() : employeeIdInput.trim();

    if (isCitizen && (identifier.length !== 10 || !/^\d{10}$/.test(identifier))) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!isCitizen && !identifier) {
      setErrorMsg('Official ID is required.');
      return;
    }

    setLoading(true);

    let lat = 27.6328;
    let lon = 88.9482;

    // Request GPS location for node registration
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        lat = Number(loc.coords.latitude.toFixed(6));
        lon = Number(loc.coords.longitude.toFixed(6));
        setLocation({ latitude: lat, longitude: lon, accuracy: loc.coords.accuracy });
      }
    } catch (locErr) {
      console.warn('GPS query skipped in login:', locErr);
    }

    try {
      // 1. Authenticate against Java backend (/sql/auth/login)
      const response = await loginAuth(
        selectedRole,
        identifier,
        isCitizen ? undefined : passwordInput,
        lat,
        lon
      );

      if (response.data && response.data.status === 'SUCCESS') {
        const data = response.data;
        setSession({
          role: (data.role as UserRole) || selectedRole,
          identifier: data.identifier || identifier,
          name: data.name,
          department: data.department,
          token: data.token,
        });

        if (isCitizen && data.lang) {
          setLanguage(data.lang as SupportedLanguage);
        }

        router.replace('/home' as any);
        return;
      }
    } catch (apiErr: any) {
      console.warn('Backend login connection issue, evaluating fallback:', apiErr.message);
    }

    // 2. Client-side demo fallback for quick testing
    if (isCitizen || passwordInput === 'admin') {
      setSession({
        role: selectedRole,
        identifier,
        name: isCitizen ? `Civilian Node (+91 ${identifier})` : `Officer ${identifier}`,
        department: isCitizen ? 'Civilian Incident Network' : 'NER Geotechnical Command',
        token: 'LOCAL-SESSION-' + Date.now(),
      });

      if (isCitizen && !isLanguageConfigured) {
        router.replace('/select-language' as any);
      } else {
        router.replace('/home' as any);
      }
    } else {
      setErrorMsg("Invalid credentials. Use 'admin' for demo accounts.");
    }

    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1a1a1a]">
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Branding matching Admin */}
          <View className="items-center mb-6">
            <View className="h-20 w-20 bg-white items-center justify-center p-2 mb-3 shadow-lg">
              <Image
                source={require('../../assets/images/logo-nobg.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-3xl font-black uppercase tracking-widest text-white">
              RAKSHAK
            </Text>
            <Text className="text-[11px] font-bold uppercase tracking-widest text-[#f6d274] text-center mt-1 px-4">
              A NER Govt. Initiative • Landslide Detection & Risk Management
            </Text>
          </View>

          {/* Form Card with Admin Crimson Top Border */}
          <View className="bg-white p-6 shadow-2xl border-t-8 border-[#d93850]">
            <View className="mb-4 pb-3 border-b border-[#e0e0e0] flex-row justify-between items-center">
              <Text className="text-xs font-black uppercase tracking-wider text-[#333333]">
                Authentication Portal
              </Text>
              <Text className="text-[9px] font-mono font-bold bg-[#f4f6f8] text-[#d93850] px-1.5 py-0.5 border border-[#e0e0e0]">
                JAVA GATEWAY
              </Text>
            </View>

            {/* Role Switcher Pills */}
            <View className="flex-row flex-wrap gap-1.5 mb-5">
              {ROLES.map((r) => {
                const isSelected = selectedRole === r;
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => handleRoleChange(r)}
                    className={`flex-1 min-w-[45%] py-2.5 px-1 items-center border ${
                      isSelected
                        ? 'bg-[#d93850] border-[#d93850]'
                        : 'bg-white border-[#cccccc]'
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isSelected ? 'text-white' : 'text-[#666666]'
                      }`}
                    >
                      {r}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Error Message */}
            {errorMsg ? (
              <View className="mb-4 bg-red-50 border-l-4 border-[#d93850] p-2.5">
                <Text className="text-xs font-bold text-[#d93850]">{errorMsg}</Text>
              </View>
            ) : null}

            {/* Dynamic Inputs */}
            {selectedRole === 'Citizen' ? (
              <View className="mb-4">
                <Text className="text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1.5">
                  Citizen Mobile Number
                </Text>
                <View className="flex-row items-center border-2 border-[#e0e0e0] bg-[#f4f6f8] px-3 py-2.5">
                  <Text className="text-xs font-black text-[#333333] mr-2">+91</Text>
                  <TextInput
                    className="flex-1 text-sm font-mono text-[#333333] p-0 font-bold"
                    keyboardType="numeric"
                    maxLength={10}
                    placeholder="9832041182"
                    placeholderTextColor="#999999"
                    value={phoneInput}
                    onChangeText={(t) => setPhoneInput(t.replace(/[^0-9]/g, ''))}
                    editable={!loading}
                  />
                </View>
              </View>
            ) : (
              <View className="mb-4">
                <Text className="text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1.5">
                  {selectedRole} Official ID
                </Text>
                <TextInput
                  className="w-full border-2 border-[#e0e0e0] bg-[#f4f6f8] px-3 py-2.5 text-sm font-mono text-[#333333] font-bold"
                  placeholder="Enter Official ID (e.g. EMP-NER-001)"
                  placeholderTextColor="#999999"
                  value={employeeIdInput}
                  onChangeText={setEmployeeIdInput}
                  autoCapitalize="characters"
                  editable={!loading}
                />
              </View>
            )}

            {/* Password Input */}
            <View className="mb-5">
              <Text className="text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1.5">
                {selectedRole === 'Citizen' ? 'Access PIN / Verification' : 'Authorization Password'}
              </Text>
              <TextInput
                className="w-full border-2 border-[#e0e0e0] bg-[#f4f6f8] px-3 py-2.5 text-sm text-[#333333] font-bold"
                placeholder="••••••••"
                placeholderTextColor="#999999"
                secureTextEntry
                value={passwordInput}
                onChangeText={setPasswordInput}
                editable={!loading}
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="w-full bg-[#333333] py-3.5 items-center justify-center active:bg-[#1a1a1a]"
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white text-xs font-black uppercase tracking-widest">
                  Login as {selectedRole}
                </Text>
              )}
            </TouchableOpacity>

            {/* Demo Password Reminder */}
            <View className="mt-4 pt-3 border-t border-[#e0e0e0] items-center">
              <Text className="text-[9px] font-bold text-[#888888] uppercase tracking-wider">
                Demo Password: <Text className="text-[#d93850] font-mono font-bold">admin</Text>
              </Text>
            </View>
          </View>

          {/* Footer note */}
          <View className="items-center mt-6">
            <Text className="text-[10px] text-slate-500 uppercase tracking-widest text-center">
              National Disaster Management Authority Protocol
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}