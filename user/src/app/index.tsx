import { useAppStore } from '@/stores/useAppStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [phoneInput, setPhoneInput] = useState('');
  const { setPhoneNumber } = useAppStore();

  const handleEnter = () => {
    // Use the entered number or fall back to a default mock number
    const targetNumber = phoneInput.trim() || '9876543210';
    setPhoneNumber(targetNumber);

    // Navigate immediately to the home screen
    router.push('/home' as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-between"
      >
        <View className="px-6 pt-10 items-center">
          {/* DigiLocker Official Emblem */}
          <Image
            source={require('../../assets/images/logo-nobg.png')}
            style={{ width: width * 0.45, height: width * 0.45 }}
            resizeMode="contain"
            className="mb-8"
          />

          <Text className="text-2xl font-bold text-[#003366] text-center tracking-tight">
            Citizen Authentication
          </Text>
          <Text className="text-xs text-slate-500 text-center mt-1">
            Ministry of Development of North Eastern Region
          </Text>

          {/* Input Box */}
          <View className="w-full mt-10">
            <Text className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Mobile Number
            </Text>

            <View className="flex-row items-center border border-slate-300 rounded-xl px-4 py-3 bg-slate-50">
              <Text className="text-base font-bold text-slate-700 mr-2">+91</Text>
              <TextInput
                className="flex-1 text-base text-slate-900 font-semibold"
                placeholder="Enter 10-digit number"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                maxLength={10}
                value={phoneInput}
                onChangeText={setPhoneInput}
              />
            </View>
          </View>

          {/* Direct Enter Trigger */}
          <TouchableOpacity
            onPress={handleEnter}
            className="w-full bg-[#003366] py-3.5 rounded-xl mt-6 items-center justify-center active:opacity-90 shadow-md shadow-blue-900/20"
          >
            <Text className="text-white text-base font-bold tracking-wide">Enter</Text>
          </TouchableOpacity>
        </View>

        <View className="items-center pb-6">
          <Text className="text-[11px] text-slate-400">
            Protected under Government Disaster Management Protocol
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}