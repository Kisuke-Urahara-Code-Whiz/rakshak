import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NE_KIOSKS, KioskNode } from '@/data/kiosks';

interface StationsViewCardProps {
  userRole?: string | null;
  userDistrict?: string | null;
}

export function StationsViewCard({ userRole, userDistrict }: StationsViewCardProps) {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState<KioskNode | null>(null);

  const isZonal = userRole === 'Zonal Admin';
  const isDistrict = userRole === 'District Admin';

  const filteredStations = NE_KIOSKS.filter((k) => {
    const matchesSearch =
      k.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      k.district.toLowerCase().includes(filterQuery.toLowerCase()) ||
      k.state.toLowerCase().includes(filterQuery.toLowerCase()) ||
      k.id.toLowerCase().includes(filterQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <View className="bg-white border border-[#e0e0e0] border-t-4 border-[#1a1a1a] p-4 mb-4 shadow-sm">
      {/* Header */}
      <View className="flex-row items-center justify-between pb-2.5 border-b border-[#e0e0e0] mb-3">
        <View>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-xs font-black text-[#1a1a1a] uppercase tracking-wider">
              Regional Telemetry Stations
            </Text>
            <View className="bg-[#1a1a1a] px-1.5 py-0.2">
              <Text className="text-[#f6d274] text-[9px] font-black uppercase">
                {userRole}
              </Text>
            </View>
          </View>
          <Text className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
            Command View • {filteredStations.length} Active Nodes
          </Text>
        </View>
        <View className="bg-emerald-50 border border-emerald-300 px-2 py-0.5">
          <Text className="text-[9px] font-bold text-emerald-800 uppercase">
            Live Link
          </Text>
        </View>
      </View>

      {/* Search / Filter bar */}
      <View className="mb-3">
        <TextInput
          value={filterQuery}
          onChangeText={setFilterQuery}
          placeholder="Filter stations by state, district, or node ID..."
          placeholderTextColor="#999999"
          className="bg-[#f4f6f8] border border-[#cbd5e1] px-3 py-2 text-xs text-[#333333] font-bold"
        />
      </View>

      {/* Station List */}
      <ScrollView
        horizontal={false}
        className="max-h-64"
        showsVerticalScrollIndicator
        nestedScrollEnabled
      >
        {filteredStations.map((station) => {
          const isSelected = selectedStation?.id === station.id;
          const isRiskHigh = station.riskLevel === 'High';

          return (
            <TouchableOpacity
              key={station.id}
              onPress={() => setSelectedStation(isSelected ? null : station)}
              className={`p-3 border mb-2 transition-all ${
                isSelected
                  ? 'bg-red-50 border-[#d93850]'
                  : 'bg-[#f8f9fa] border-[#e2e8f0]'
              }`}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center gap-1.5">
                  <View
                    className={`w-2 h-2 rounded-full ${
                      station.status === 'Operational' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  <Text className="text-xs font-black text-[#1a1a1a] uppercase">
                    {station.name}
                  </Text>
                </View>
                <View
                  className={`px-1.5 py-0.2 border ${
                    isRiskHigh
                      ? 'bg-red-100 border-red-300 text-red-800'
                      : 'bg-amber-100 border-amber-300 text-amber-800'
                  }`}
                >
                  <Text className="text-[9px] font-bold uppercase">
                    {station.riskLevel || 'Normal'}
                  </Text>
                </View>
              </View>

              <Text className="text-[10px] text-slate-600 font-bold">
                📍 {station.district}, {station.state} • {station.id}
              </Text>
              <Text className="text-[9px] font-mono text-slate-500 mt-0.5">
                GPS: {station.lat.toFixed(4)}° N, {station.lng.toFixed(4)}° E • {station.sensorsActive} Sensors Active
              </Text>

              {isSelected && (
                <View className="mt-2.5 pt-2 border-t border-[#cbd5e1]">
                  <Text className="text-[9px] font-black uppercase text-[#d93850] mb-1">
                    Telemetry Stream Snapshot:
                  </Text>
                  <View className="grid grid-cols-2 gap-1 bg-white p-2 border border-[#e2e8f0]">
                    <Text className="text-[10px] text-slate-700">
                      • Sensor Type: <Text className="font-bold">{station.type}</Text>
                    </Text>
                    <Text className="text-[10px] text-slate-700">
                      • Station Status: <Text className="font-bold text-emerald-700">{station.status}</Text>
                    </Text>
                    <Text className="text-[10px] text-slate-700">
                      • Sub-Division: <Text className="font-bold">{station.subDivision || station.district}</Text>
                    </Text>
                    <Text className="text-[10px] text-slate-700">
                      • Locality Block: <Text className="font-bold">{station.adm5 || 'Sector Command'}</Text>
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
