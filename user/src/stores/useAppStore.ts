import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

interface AppState {
  isLoading: boolean;
  hasHydrated: boolean;
  setIsLoading: (loading: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;

  // Persisted User & Incident States
  phoneNumber: string | null;
  setPhoneNumber: (phone: string | null) => void;

  location: LocationCoordinates | null;
  setLocation: (loc: LocationCoordinates | null) => void;

  riskScore: number; // 0 to 100 percentage
  setRiskScore: (score: number) => void;

  photoUri: string | null;
  setPhotoUri: (uri: string | null) => void;

  voiceUri: string | null;
  setVoiceUri: (uri: string | null) => void;

  resetIncident: () => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isLoading: true,
      hasHydrated: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),

      // Restored back to default null
      phoneNumber: null,
      setPhoneNumber: (phone) => set({ phoneNumber: phone }),

      location: null,
      setLocation: (loc) => set({ location: loc }),

      riskScore: 78,
      setRiskScore: (score) => set({ riskScore: score }),

      photoUri: null,
      setPhotoUri: (uri) => set({ photoUri: uri }),

      voiceUri: null,
      setVoiceUri: (uri) => set({ voiceUri: uri }),

      resetIncident: () => set({ photoUri: null, voiceUri: null }),
      logout: () =>
        set({
          phoneNumber: null,
          photoUri: null,
          voiceUri: null,
          location: null,
        }),
    }),
    {
      name: 'rakshak-app-storage-v1', // Bumped key to purge the cached mock phone number
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        phoneNumber: state.phoneNumber,
        photoUri: state.photoUri,
        voiceUri: state.voiceUri,
        location: state.location,
        riskScore: state.riskScore,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);