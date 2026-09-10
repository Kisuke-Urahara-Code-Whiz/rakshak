import { Text, View } from 'react-native';

interface CriticalAdvisoryCardProps {
  riskScore: number;
}

export function CriticalAdvisoryCard({ riskScore }: CriticalAdvisoryCardProps) {
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
            PUBLIC SAFETY ADVISORY // ALERT
          </Text>
        </View>

        <View className="bg-red-700 px-2 py-0.5 rounded flex-shrink-0">
          <Text className="text-white text-[9px] font-mono font-bold tracking-wider uppercase">
            LEVEL-3 RESTRICTION
          </Text>
        </View>
      </View>

      {/* Primary Route Notice */}
      <View className="mt-2.5 bg-white border border-red-200 rounded-lg p-2.5">
        <Text className="text-red-800 text-[11px] font-bold uppercase tracking-wide mb-1">
          Sector Blockage & Route Diversion
        </Text>
        <Text className="text-slate-800 text-[11px] leading-4">
          Primary bridges, culverts, and connecting transit corridors in your immediate sector have been{' '}
          <Text className="font-bold text-red-700">BARRICADED / BLOCKED</Text> due to structural risk and flash debris accumulation. Avoid lower bypass roads and take authorized high-elevation arterial diversions only.
        </Text>
      </View>

      {/* Directive / Remedial Action Plan */}
      <View className="mt-2.5">
        <Text className="text-slate-800 text-[10px] font-bold uppercase tracking-wider mb-1.5">
          Mandatory Remedial Protocol (Civic Defense Directive):
        </Text>
        <View className="gap-1.5">
          <View className="flex-row items-start gap-1.5">
            <Text className="text-red-700 font-bold text-[11px] leading-4">1.</Text>
            <Text className="text-slate-700 text-[11px] leading-4 flex-1">
              Halt non-essential surface transit across culverts, retaining walls, and low-lying bridges.
            </Text>
          </View>
          <View className="flex-row items-start gap-1.5">
            <Text className="text-red-700 font-bold text-[11px] leading-4">2.</Text>
            <Text className="text-slate-700 text-[11px] leading-4 flex-1">
              Relocate immediately to designated higher-ground shelters away from natural drainage basins.
            </Text>
          </View>
          <View className="flex-row items-start gap-1.5">
            <Text className="text-red-700 font-bold text-[11px] leading-4">3.</Text>
            <Text className="text-slate-700 text-[11px] leading-4 flex-1">
              Maintain operational standby on official emergency channels and dispatch field incident reports below.
            </Text>
          </View>
        </View>
      </View>

      {/* Footer Authority Reference */}
      <View className="mt-2.5 pt-2 border-t border-red-200 flex-row justify-between items-center">
        <Text className="text-slate-500 text-[9px] font-mono uppercase">Ref: PROTOCOL-SDRF/SEC-9</Text>
        <Text className="text-red-700 text-[9px] font-bold uppercase tracking-wider">Execute Immediately</Text>
      </View>
    </View>
  );
}