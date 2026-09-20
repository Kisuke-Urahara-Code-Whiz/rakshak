import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_BASE_URL } from '@/configs/env';

interface UserUploadsModalProps {
  visible: boolean;
  onClose: () => void;
  phoneNumber?: string | null;
}

export function UserUploadsModal({ visible, onClose, phoneNumber }: UserUploadsModalProps) {
  const [uploads, setUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cleanNumber = (phoneNumber ? phoneNumber.replace(/\D/g, '') : '') || '9832041182';

  useEffect(() => {
    if (!visible) return;
    const fetchUserUploads = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/sql/uploads?number=${cleanNumber}`, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        });
        if (res.ok) {
          const json = await res.json();
          setUploads(Array.isArray(json) ? json : []);
        } else {
          setError(`Could not retrieve uploads (Status ${res.status})`);
        }
      } catch (err: any) {
        setError(err.message || 'Network error fetching user uploads');
      } finally {
        setLoading(false);
      }
    };

    fetchUserUploads();
  }, [visible, cleanNumber]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/75 justify-center items-center p-3">
        <View className="w-full max-w-xl bg-white border-t-4 border-[#d93850] shadow-2xl flex-1 my-4 max-h-[85%]">
          {/* Header */}
          <View className="bg-[#1a1a1a] px-4 py-3 border-b border-[#e0e0e0] flex-row justify-between items-center">
            <View>
              <Text className="text-white font-black text-sm uppercase tracking-wider">
                My Incident Submissions
              </Text>
              <Text className="text-[#f6d274] font-mono font-bold text-[10px] mt-0.5">
                Node: +91 {cleanNumber}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Text className="text-white font-bold text-base">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View className="flex-1 p-4 bg-[#f8fafc]">
            {loading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#d93850" />
                <Text className="text-xs font-bold text-slate-500 uppercase mt-3">
                  Retrieving your incident records...
                </Text>
              </View>
            ) : error ? (
              <View className="p-4 bg-red-50 border border-red-200">
                <Text className="text-xs font-bold text-red-700">{error}</Text>
              </View>
            ) : uploads.length === 0 ? (
              <View className="flex-1 items-center justify-center p-6 text-center">
                <Text className="text-3xl mb-2">📁</Text>
                <Text className="text-xs font-black uppercase text-slate-700">
                  No Submissions Recorded Yet
                </Text>
                <Text className="text-[11px] text-slate-500 text-center mt-1">
                  When you upload field photos or voice memos with GPS coordinates, your triage records will appear here.
                </Text>
              </View>
            ) : (
              <ScrollView className="flex-1" showsVerticalScrollIndicator>
                {uploads.map((item) => {
                  const isAudio = item.uploadType === 'audio';
                  const q = item.groundQuestionnaire || {};

                  return (
                    <View
                      key={item.id}
                      className="bg-white border border-[#e2e8f0] p-3 mb-3 shadow-sm"
                    >
                      <View className="flex-row items-center justify-between pb-2 border-b border-[#f1f5f9] mb-2">
                        <View className="flex-row items-center gap-1.5">
                          <View
                            className={`px-1.5 py-0.2 rounded ${
                              isAudio ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                            }`}
                          >
                            <Text className="text-[9px] font-black uppercase">
                              {isAudio ? '🎙️ Audio Memo' : '📷 Photo Evidence'}
                            </Text>
                          </View>
                          <Text className="text-xs font-mono font-bold text-slate-800">
                            {item.id}
                          </Text>
                        </View>
                        <View className="bg-slate-100 px-1.5 py-0.2">
                          <Text className="text-[9px] font-bold text-slate-600">
                            {item.relativeTime || 'Recorded'}
                          </Text>
                        </View>
                      </View>

                      <Text className="text-xs font-bold text-slate-800">
                        {item.fileName}
                      </Text>

                      {item.location?.coordinates && (
                        <Text className="text-[10px] font-mono text-slate-500 mt-0.5">
                          GPS: {item.location.coordinates.lat?.toFixed(4)}° N, {item.location.coordinates.lng?.toFixed(4)}° E
                        </Text>
                      )}

                      {/* Questionnaire Summary Pill */}
                      {q.activityStatus && (
                        <View className="mt-2 bg-[#f8f9fa] p-2 border border-[#e2e8f0]">
                          <Text className="text-[10px] font-black text-[#d93850] uppercase">
                            Ground Assessment:
                          </Text>
                          <Text className="text-[10px] font-bold text-slate-700 mt-0.5">
                            • Activity: {q.activityStatus}
                          </Text>
                          <Text className="text-[10px] font-bold text-slate-700">
                            • Weather: {q.weatherCondition}
                          </Text>
                          <Text className="text-[10px] font-bold text-slate-700">
                            • Urgency: {q.immediateEvacuationNeeded ? 'Immediate Evac Needed' : q.urgencyLevel || 'Moderate'}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Footer */}
          <View className="bg-white p-3 border-t border-[#e0e0e0]">
            <TouchableOpacity
              onPress={onClose}
              className="w-full bg-[#333333] py-2.5 items-center justify-center active:bg-[#1a1a1a]"
            >
              <Text className="text-white text-xs font-black uppercase tracking-wider">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
