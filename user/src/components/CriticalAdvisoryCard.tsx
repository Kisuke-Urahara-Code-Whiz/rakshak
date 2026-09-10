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
    <View className="bg-red-50/60 border border-red-600 rounded-xl p-3.5 mb-4 shadow-sm">
      {/* Official Alert Header */}
      <View className="flex-row items-center justify-between gap-2 pb-2.5 border-b border-red-200">
        <View className="flex-row items-center gap-1.5 flex-1 pr-1">
          <View className="w-2 h-2 rounded-full bg-red-600" />
          <Text
            className="text-red-900 font-black text-[11px] tracking-wide uppercase flex-1"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {i18n.t('advisory_header_alert')}
          </Text>
        </View>

        <View className="bg-red-700 px-2 py-0.5 rounded flex-shrink-0">
          <Text className="text-white text-[9px] font-mono font-bold tracking-wider uppercase">
            {i18n.t('advisory_level_badge')}
          </Text>
        </View>
      </View>

      {/* Primary Route Notice */}
      <View className="mt-2.5 bg-white border border-red-200 rounded-lg p-2.5">
        <Text className="text-red-800 text-[11px] font-bold uppercase tracking-wide mb-1">
          {i18n.t('advisory_blockage_title')}
        </Text>
        <Text className="text-slate-800 text-[11px] leading-4">
          {i18n.t('advisory_blockage_p1')}
          <Text className="font-bold text-red-700">{i18n.t('advisory_blockage_highlight')}</Text>
          {i18n.t('advisory_blockage_p2')}
        </Text>
      </View>

      {/* Directive / Remedial Action Plan */}
      <View className="mt-2.5">
        <Text className="text-slate-800 text-[10px] font-bold uppercase tracking-wider mb-1.5">
          {i18n.t('directive_title')}
        </Text>
        <View className="gap-1.5">
          <View className="flex-row items-start gap-1.5">
            <Text className="text-red-700 font-bold text-[11px] leading-4">1.</Text>
            <Text className="text-slate-700 text-[11px] leading-4 flex-1">
              {i18n.t('directive_step_1')}
            </Text>
          </View>
          <View className="flex-row items-start gap-1.5">
            <Text className="text-red-700 font-bold text-[11px] leading-4">2.</Text>
            <Text className="text-slate-700 text-[11px] leading-4 flex-1">
              {i18n.t('directive_step_2')}
            </Text>
          </View>
          <View className="flex-row items-start gap-1.5">
            <Text className="text-red-700 font-bold text-[11px] leading-4">3.</Text>
            <Text className="text-slate-700 text-[11px] leading-4 flex-1">
              {i18n.t('directive_step_3')}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer Authority Reference */}
      <View className="mt-2.5 pt-2 border-t border-red-200 flex-row justify-between items-center">
        <Text className="text-slate-500 text-[9px] font-mono uppercase">
          {i18n.t('advisory_ref_footer')}
        </Text>
        <Text className="text-red-700 text-[9px] font-bold uppercase tracking-wider">
          {i18n.t('advisory_execute_now')}
        </Text>
      </View>
    </View>
  );
}