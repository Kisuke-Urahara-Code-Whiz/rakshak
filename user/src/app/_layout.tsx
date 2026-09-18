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

    // Hold the custom official splash screen for 2.5 seconds, then reveal app
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

        {/* --- TOP BRANDING (Clean Official Govt Seal) --- */}
        <View className="flex-[3] bg-white items-center justify-center p-6">
          <Image
            source={require('../../assets/images/logo-nobg.png')}
            style={{ width: width * 0.55, height: width * 0.55 }}
            resizeMode="contain"
          />
          <Text className="text-3xl font-black uppercase tracking-widest text-[#1a1a1a] mt-4">
            RAKSHAK
          </Text>
          <Text className="text-[11px] font-bold uppercase tracking-widest text-[#d93850] text-center mt-1">
            Landslide Early Warning & Telemetry System
          </Text>
        </View>

        {/* --- BOTTOM SECTION (Admin Dark #1a1a1a Industrial Panel + Crimson Accent) --- */}
        <View className="flex-[1.4] bg-[#1a1a1a] pt-4 pb-8 px-6 border-t-4 border-[#d93850] items-center justify-between shadow-2xl">
          {/* Subtle Pull Indicator */}
          <View className="h-1 w-12 bg-white/20 rounded-full mb-1" />

          {/* Loader & Status Indicator */}
          <View className="items-center py-2">
            <ActivityIndicator size="small" color="#d93850" />
            <Text className="text-[#f6d274] text-xs mt-3 tracking-widest uppercase font-bold">
              Connecting to NER Disaster Gateway...
            </Text>
          </View>

          {/* Government Credential Badging */}
          <View className="items-center border-t border-white/10 pt-3 w-full">
            <Text className="text-white text-xs font-bold uppercase tracking-wider text-center">
              Ministry of Development of North Eastern Region
            </Text>
            <Text className="text-slate-400 text-[10px] mt-0.5 uppercase tracking-widest text-center">
              Civilian Alert & SDRF Field Operational Network
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Active App Entry Point
  return <Slot />;
}