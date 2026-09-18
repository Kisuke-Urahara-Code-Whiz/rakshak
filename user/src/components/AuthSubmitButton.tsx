import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

interface AuthSubmitButtonProps {
  onPress: () => void;
  loading: boolean;
  title?: string;
}

export function AuthSubmitButton({ onPress, loading, title = 'Enter' }: AuthSubmitButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      className="w-full bg-[#333333] py-4 mt-6 items-center justify-center active:bg-[#1a1a1a] shadow-sm"
    >
      {loading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <Text className="text-white text-xs font-black uppercase tracking-widest">{title}</Text>
      )}
    </TouchableOpacity>
  );
}