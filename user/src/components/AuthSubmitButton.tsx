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
      className="w-full bg-[#003366] py-3.5 rounded-xl mt-6 items-center justify-center active:opacity-90 shadow-md shadow-blue-900/20"
    >
      {loading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <Text className="text-white text-base font-bold tracking-wide">{title}</Text>
      )}
    </TouchableOpacity>
  );
}