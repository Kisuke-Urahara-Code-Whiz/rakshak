import { Dimensions, Image, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

export function LoginBranding() {
  return (
    <View className="items-center">
      <View className="h-20 w-20 bg-white items-center justify-center p-2 mb-4 shadow-md">
        <Image
          source={require('../../assets/images/logo-nobg.png')}
          style={{ width: '100%', height: '100%' }}
          resizeMode="contain"
        />
      </View>

      <Text className="text-2xl font-black text-[#1a1a1a] text-center uppercase tracking-widest">
        RAKSHAK
      </Text>
      <Text className="text-xs font-bold text-[#d93850] text-center mt-1 uppercase tracking-wider">
        Ministry of Development of North Eastern Region
      </Text>
    </View>
  );
}