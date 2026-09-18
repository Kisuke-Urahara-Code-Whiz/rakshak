import { i18n } from '@/services/i18n';
import { useAppStore } from '@/stores/useAppStore';
import { Text, View } from 'react-native';

interface CriticalAdvisoryCardProps {
  riskScore: number;
}

export function CriticalAdvisoryCard({ riskScore }: CriticalAdvisoryCardProps) {
  const language = useAppStore((state) => state.language);
  i18n.setLanguage(language);

  if (riskScore < 70) return null;

  return (
    <View className="bg-white border border-[#d93850] border-l-8 border-l-[#d93850] p-4 mb-4 shadow-md">
      {/* Official Alert Header */}
      <View className="flex-row items-center justify-between pb-2 border-b border-red-100">
        <View className="flex-row items-center gap-2 flex-1">
          <View className="w-2 h-2 rounded-full bg-[#d93850]" />
          <Text
            className="text-[#d93850] font-black text-xs tracking-wider uppercase flex-1"
            numberOfLines={1}
          >
            {i18n.t('advisory_header_alert')}
          </Text>
        </View>

        <View className="bg-[#d93850] px-2 py-0.5">
          <Text className="text-white text-[9px] font-mono font-black tracking-wider uppercase">
            {i18n.t('advisory_level_badge')}
          </Text>
        </View>
      </View>

      {/* Primary Route Notice */}
      <View className="mt-3 bg-[#fde8e8] border border-red-200 p-3">
        <Text className="text-[#d93850] text-xs font-black uppercase tracking-wider mb-1">
          {i18n.t('advisory_blockage_title')}
        </Text>
        <Text className="text-slate-800 text-xs leading-4">
          {i18n.t('advisory_blockage_p1')}
          <Text className="font-black text-[#d93850]"> {i18n.t('advisory_blockage_highlight')} </Text>
          {i18n.t('advisory_blockage_p2')}
        </Text>
      </View>

      {/* Action Plan */}
      <View className="mt-3">
        <Text className="text-[#1a1a1a] text-[10px] font-black uppercase tracking-wider mb-2">
          {i18n.t('directive_title')}
        </Text>
        <View className="gap-2">
          <View className="flex-row items-start gap-2 bg-[#f4f6f8] p-2 border border-[#e0e0e0]">
            <Text className="text-[#d93850] font-black text-xs">01.</Text>
            <Text className="text-slate-800 text-xs flex-1">
              {i18n.t('directive_step_1')}
            </Text>
          </View>
          <View className="flex-row items-start gap-2 bg-[#f4f6f8] p-2 border border-[#e0e0e0]">
            <Text className="text-[#d93850] font-black text-xs">02.</Text>
            <Text className="text-slate-800 text-xs flex-1">
              {i18n.t('directive_step_2')}
            </Text>
          </View>
          <View className="flex-row items-start gap-2 bg-[#f4f6f8] p-2 border border-[#e0e0e0]">
            <Text className="text-[#d93850] font-black text-xs">03.</Text>
            <Text className="text-slate-800 text-xs flex-1">
              {i18n.t('directive_step_3')}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer Authority Reference */}
      <View className="mt-3 pt-2 border-t border-[#e0e0e0] flex-row justify-between items-center">
        <Text className="text-slate-500 text-[9px] font-mono uppercase">
          {i18n.t('advisory_ref_footer')}
        </Text>
        <Text className="text-[#d93850] text-[9px] font-black uppercase tracking-wider">
          {i18n.t('advisory_execute_now')}
        </Text>
      </View>
    </View>
  );
}