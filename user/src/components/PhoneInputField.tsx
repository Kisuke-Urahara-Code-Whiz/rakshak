import { Text, TextInput, View } from 'react-native';

interface PhoneInputFieldProps {
  value: string;
  onChangeValue: (val: string) => void;
  disabled?: boolean;
}

export function PhoneInputField({ value, onChangeValue, disabled = false }: PhoneInputFieldProps) {
  return (
    <View className="w-full mt-6">
      <Text className="text-[10px] font-black text-[#666666] uppercase tracking-wider mb-2">
        Civilian Node Mobile Number
      </Text>

      <View className="flex-row items-center border-2 border-[#e0e0e0] bg-[#f4f6f8] px-4 py-3">
        <Text className="text-sm font-black text-[#333333] mr-2">+91</Text>
        <TextInput
          className="flex-1 text-sm text-[#333333] font-bold font-mono p-0"
          placeholder="Enter 10-digit number"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          maxLength={10}
          value={value}
          onChangeText={(text) => onChangeValue(text.replace(/[^0-9]/g, ''))}
          editable={!disabled}
        />
      </View>
    </View>
  );
}