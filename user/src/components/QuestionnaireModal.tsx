import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export interface QuestionnaireData {
  activityStatus: string;
  weatherCondition: string;
  warningIndicators: string[];
  infrastructureThreatened: string[];
  urgencyLevel: string;
  immediateEvacuationNeeded: boolean;
  additionalNotes: string;
}

interface QuestionnaireModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: QuestionnaireData) => void;
  mediaType: 'photo' | 'audio';
}

const QUESTION_1_OPTIONS = [
  'Active Landslide in Progress',
  'Fresh Ground / Road Fissures',
  'Falling Boulders & Slope Debris',
  'Slopeline Mud & Sediment Flow',
  'Precautionary Field Inspection',
];

const QUESTION_2_OPTIONS = [
  'Torrential Heavy Monsoon Downpour',
  'Continuous Moderate Rainfall',
  'Severe Slope Runoff & Flooding',
  'Cloudy / Damp Montane Fog',
  'Clear Skies / Dry Weather',
];

const QUESTION_3_OPTIONS = [
  'Residential Settlements & Homes',
  'Primary Highway & Access Corridor',
  'Power Lines & Telecom Towers',
  'Bridge, Culvert & Drain Network',
  'Hillside Farmland & Plantations',
];

const QUESTION_4_OPTIONS = [
  'Loud Rumbling / Grinding Sub-surface Sounds',
  'Trees, Posts & Fences Tilting Dangerously',
  'Sudden Rapid Outflow of Muddy Water',
  'Natural Water Spring Dried Up Abruptly',
  'None Observed Currently',
];

const QUESTION_5_OPTIONS = [
  { label: 'CRITICAL: Immediate Evacuation & SDRF Triage Needed', urgent: true, evac: true },
  { label: 'HIGH: Road Clearance & Emergency Teams Required', urgent: true, evac: false },
  { label: 'MODERATE: Heightened Monitoring / Precautionary Standby', urgent: false, evac: false },
  { label: 'LOW: Baseline Ground Surveillance Only', urgent: false, evac: false },
];

export function QuestionnaireModal({
  visible,
  onClose,
  onSubmit,
  mediaType,
}: QuestionnaireModalProps) {
  const [q1, setQ1] = useState(QUESTION_1_OPTIONS[0]);
  const [q2, setQ2] = useState(QUESTION_2_OPTIONS[0]);
  const [q3, setQ3] = useState<string[]>([QUESTION_3_OPTIONS[0]]);
  const [q4, setQ4] = useState<string[]>([QUESTION_4_OPTIONS[0]]);
  const [q5, setQ5] = useState(QUESTION_5_OPTIONS[0]);
  const [notes, setNotes] = useState('');

  const toggleMultiSelect = (
    currentList: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    if (currentList.includes(value)) {
      if (currentList.length > 1) {
        setList(currentList.filter((item) => item !== value));
      }
    } else {
      setList([...currentList, value]);
    }
  };

  const handleSubmit = () => {
    const data: QuestionnaireData = {
      activityStatus: q1,
      weatherCondition: q2,
      warningIndicators: q4,
      infrastructureThreatened: q3,
      urgencyLevel: q5.urgent ? 'Critical' : 'Moderate',
      immediateEvacuationNeeded: q5.evac,
      additionalNotes: notes.trim() || 'Direct mobile evidence upload.',
    };
    onSubmit(data);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/75 justify-center items-center p-3">
        <View className="w-full max-w-xl bg-white border-t-4 border-[#d93850] shadow-2xl flex-1 my-4 max-h-[92%]">
          {/* Modal Header */}
          <View className="bg-[#1a1a1a] px-4 py-3 border-b border-[#e0e0e0] flex-row justify-between items-center">
            <View>
              <View className="flex-row items-center gap-1.5">
                <Text className="text-[#f6d274] font-black text-xs uppercase tracking-wider">
                  Ground Triage Assessment
                </Text>
                <View className="bg-[#d93850] px-1.5 py-0.2">
                  <Text className="text-white text-[9px] font-black uppercase">
                    5 Questions
                  </Text>
                </View>
              </View>
              <Text className="text-white font-black text-sm uppercase tracking-wide mt-0.5">
                {mediaType === 'photo' ? '📷 Photo Evidence Dossier' : '🎙️ Acoustic Memo Dossier'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Text className="text-white font-bold text-base">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Questionnaire Form ScrollView */}
          <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 20 }}>
            <Text className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-4">
              Please answer the following 5 questions to assist disaster response authorities in triaging your evidence.
            </Text>

            {/* Question 1 */}
            <View className="bg-[#f8f9fa] border border-[#e2e8f0] p-3.5 mb-3.5">
              <Text className="text-xs font-black text-[#1a1a1a] uppercase tracking-wider mb-2">
                1. Observed Slope / Ground Movement
              </Text>
              {QUESTION_1_OPTIONS.map((opt) => {
                const selected = q1 === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => setQ1(opt)}
                    className={`flex-row items-center p-2 mb-1.5 border ${
                      selected ? 'bg-red-50 border-[#d93850]' : 'bg-white border-[#e0e0e0]'
                    }`}
                  >
                    <View
                      className={`w-3.5 h-3.5 rounded-full mr-2.5 border items-center justify-center ${
                        selected ? 'border-[#d93850] bg-[#d93850]' : 'border-[#999999]'
                      }`}
                    >
                      {selected && <View className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </View>
                    <Text
                      className={`text-xs ${
                        selected ? 'font-black text-[#d93850]' : 'font-bold text-[#333333]'
                      }`}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Question 2 */}
            <View className="bg-[#f8f9fa] border border-[#e2e8f0] p-3.5 mb-3.5">
              <Text className="text-xs font-black text-[#1a1a1a] uppercase tracking-wider mb-2">
                2. Weather & Slopeline Rainfall
              </Text>
              {QUESTION_2_OPTIONS.map((opt) => {
                const selected = q2 === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => setQ2(opt)}
                    className={`flex-row items-center p-2 mb-1.5 border ${
                      selected ? 'bg-red-50 border-[#d93850]' : 'bg-white border-[#e0e0e0]'
                    }`}
                  >
                    <View
                      className={`w-3.5 h-3.5 rounded-full mr-2.5 border items-center justify-center ${
                        selected ? 'border-[#d93850] bg-[#d93850]' : 'border-[#999999]'
                      }`}
                    >
                      {selected && <View className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </View>
                    <Text
                      className={`text-xs ${
                        selected ? 'font-black text-[#d93850]' : 'font-bold text-[#333333]'
                      }`}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Question 3 */}
            <View className="bg-[#f8f9fa] border border-[#e2e8f0] p-3.5 mb-3.5">
              <Text className="text-xs font-black text-[#1a1a1a] uppercase tracking-wider mb-2">
                3. Infrastructure At Immediate Risk (Select All That Apply)
              </Text>
              {QUESTION_3_OPTIONS.map((opt) => {
                const selected = q3.includes(opt);
                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => toggleMultiSelect(q3, setQ3, opt)}
                    className={`flex-row items-center p-2 mb-1.5 border ${
                      selected ? 'bg-red-50 border-[#d93850]' : 'bg-white border-[#e0e0e0]'
                    }`}
                  >
                    <View
                      className={`w-3.5 h-3.5 mr-2.5 border items-center justify-center ${
                        selected ? 'border-[#d93850] bg-[#d93850]' : 'border-[#999999]'
                      }`}
                    >
                      {selected && <Text className="text-white text-[9px] font-black">✓</Text>}
                    </View>
                    <Text
                      className={`text-xs ${
                        selected ? 'font-black text-[#d93850]' : 'font-bold text-[#333333]'
                      }`}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Question 4 */}
            <View className="bg-[#f8f9fa] border border-[#e2e8f0] p-3.5 mb-3.5">
              <Text className="text-xs font-black text-[#1a1a1a] uppercase tracking-wider mb-2">
                4. Warning Signs / Acoustic Cues Heard
              </Text>
              {QUESTION_4_OPTIONS.map((opt) => {
                const selected = q4.includes(opt);
                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => toggleMultiSelect(q4, setQ4, opt)}
                    className={`flex-row items-center p-2 mb-1.5 border ${
                      selected ? 'bg-red-50 border-[#d93850]' : 'bg-white border-[#e0e0e0]'
                    }`}
                  >
                    <View
                      className={`w-3.5 h-3.5 mr-2.5 border items-center justify-center ${
                        selected ? 'border-[#d93850] bg-[#d93850]' : 'border-[#999999]'
                      }`}
                    >
                      {selected && <Text className="text-white text-[9px] font-black">✓</Text>}
                    </View>
                    <Text
                      className={`text-xs ${
                        selected ? 'font-black text-[#d93850]' : 'font-bold text-[#333333]'
                      }`}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Question 5 */}
            <View className="bg-[#f8f9fa] border border-[#e2e8f0] p-3.5 mb-3.5">
              <Text className="text-xs font-black text-[#1a1a1a] uppercase tracking-wider mb-2">
                5. Immediate Evacuation / SDRF Triage Needed?
              </Text>
              {QUESTION_5_OPTIONS.map((opt, idx) => {
                const selected = q5.label === opt.label;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setQ5(opt)}
                    className={`flex-row items-center p-2 mb-1.5 border ${
                      selected ? 'bg-red-50 border-[#d93850]' : 'bg-white border-[#e0e0e0]'
                    }`}
                  >
                    <View
                      className={`w-3.5 h-3.5 rounded-full mr-2.5 border items-center justify-center ${
                        selected ? 'border-[#d93850] bg-[#d93850]' : 'border-[#999999]'
                      }`}
                    >
                      {selected && <View className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </View>
                    <Text
                      className={`text-xs flex-1 ${
                        selected ? 'font-black text-[#d93850]' : 'font-bold text-[#333333]'
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Additional Field Notes */}
            <View className="bg-white border border-[#e2e8f0] p-3 mb-2">
              <Text className="text-[10px] font-black uppercase text-slate-500 mb-1.5">
                Additional Landmark / Locality Context
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="E.g., Near mile marker 14, hillside above bypass bridge..."
                placeholderTextColor="#999999"
                className="bg-[#f8f9fa] border border-[#cbd5e1] p-2.5 text-xs text-[#333333] font-bold"
                multiline
                numberOfLines={2}
              />
            </View>
          </ScrollView>

          {/* Modal Action Buttons */}
          <View className="bg-white p-3 border-t border-[#e0e0e0] flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-[#f4f6f8] border border-[#cbd5e1] py-3 items-center justify-center"
            >
              <Text className="text-[#333333] font-black text-xs uppercase tracking-wider">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              className="flex-1 bg-[#d93850] py-3 items-center justify-center active:bg-[#b8273d]"
            >
              <Text className="text-white font-black text-xs uppercase tracking-wider">
                Confirm & Transmit
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
