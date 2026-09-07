import { Text, TextInput, View } from 'react-native';

interface PhoneInputFieldProps {
  value: string;
  onChangeValue: (val: string) => void;
  disabled?: boolean;
}

export function PhoneInputField({ value, onChangeValue, disabled = false }: PhoneInputFieldProps) {
  return (
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