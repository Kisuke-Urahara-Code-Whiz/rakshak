import { useAppStore } from '@/stores/useAppStore';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import '../../global.css';

const { width } = Dimensions.get('window');

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { isLoading, setIsLoading } = useAppStore();

  useEffect(() => {
    // Hide native splash immediately
    SplashScreen.hideAsync().catch(() => {});

    // Hold the custom screen for 5 seconds, then flip Zustand state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        {/* --- TOP BRANDING (Clean Official Seal) --- */}
        <View className="flex-[3] bg-white items-center justify-center px-0">
          <Image
            source={require('../../assets/images/logo-nobg.png')}
            style={{ width: width * 0.96, height: width * 0.96 }}
            resizeMode="contain"
          />
        </View>

        {/* --- BOTTOM SECTION (DigiLocker Deep Blue Panel + Loader) --- */}
        <View className="flex-[1.2] bg-[#003366] pt-6 pb-8 px-6 rounded-t-[32px] items-center justify-between shadow-2xl">
          {/* Subtle Pull Indicator / Pill */}
          <View className="h-1 w-12 bg-white/30 rounded-full mb-2" />

          {/* Loader & Status Indicator */}
          <View className="items-center py-2">
            <ActivityIndicator size="small" color="#60a5fa" />
            <Text className="text-blue-100 text-xs mt-3 tracking-widest uppercase font-medium">
              Initializing Secure Services...
            </Text>
          </View>

          {/* Government Credential Badging */}
          <View className="items-center border-t border-blue-400/20 pt-4 w-full">
            <Text className="text-white text-sm font-semibold tracking-wide text-center">
              Ministry of Development of North Eastern Region
            </Text>
            <Text className="text-blue-200 text-[11px] mt-1 opacity-80 text-center tracking-wider">
              Official Incident & Alert Network
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Active App Entry Point
  return <Slot />;
}