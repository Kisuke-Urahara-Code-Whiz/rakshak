import { Dimensions, Image, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

export function LoginBranding() {
  return (
    <View className="items-center">
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
    </View>
  );
}